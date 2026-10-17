use actix_web::{web, HttpRequest, HttpResponse};

use crate::{
    error::ApiError,
    models::{GovStat, PriceSubmission, PriceView},
    security::{client_ip, token_matches},
    AppState,
};

const MIN_PRICE_MILLIMES: i32 = 100; // 0.100 TND
const MAX_PRICE_MILLIMES: i32 = 10_000_000; // 10,000 TND
const MAX_ADDRESS_CHARS: usize = 120;
const OUTLIER_MIN_SAMPLES: i64 = 5;
const OUTLIER_FACTOR: f64 = 4.0;

const STATS_SQL: &str = "
    SELECT governorate_id,
           COUNT(*)                                   AS samples,
           MIN(price_millimes)                        AS min_millimes,
           percentile_cont(0.5) WITHIN GROUP (ORDER BY price_millimes)::float8 AS median_millimes,
           MAX(price_millimes)                        AS max_millimes,
           MAX(created_at)                            AS last_seen
    FROM prices
    WHERE product_id = $1 AND created_at >= now() - interval '30 days'
    GROUP BY governorate_id
    ORDER BY median_millimes";

const RECENT_SQL: &str = "
    SELECT id, governorate_id, price_millimes, address, created_at
    FROM prices
    WHERE product_id = $1
    ORDER BY created_at DESC
    LIMIT 20";

const OUTLIER_SQL: &str = "
    SELECT COUNT(*),
           percentile_cont(0.5) WITHIN GROUP (ORDER BY price_millimes)::float8
    FROM prices
    WHERE product_id = $1 AND governorate_id = $2 AND created_at >= now() - interval '30 days'";

/// GET /api/v1/products/{slug}/prices
pub async fn for_product(
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> Result<HttpResponse, ApiError> {
    let slug = path.into_inner();

    let product_id = sqlx::query_scalar::<_, i32>("SELECT id FROM products WHERE slug = $1")
        .bind(&slug)
        .fetch_optional(&state.pool)
        .await?
        .ok_or(ApiError::NotFound("product not found"))?;

    let by_governorate = sqlx::query_as::<_, GovStat>(STATS_SQL)
        .bind(product_id)
        .fetch_all(&state.pool)
        .await?;

    let recent = sqlx::query_as::<_, PriceView>(RECENT_SQL)
        .bind(product_id)
        .fetch_all(&state.pool)
        .await?;

    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "public, max-age=120, stale-while-revalidate=600"))
        .json(serde_json::json!({
            "product_slug": slug,
            "by_governorate": by_governorate,
            "recent": recent,
        })))
}

/// POST /api/v1/prices
/// Only the Next.js server can call this. It sends the shared token and the real client IP.
pub async fn submit(
    req: HttpRequest,
    state: web::Data<AppState>,
    body: web::Json<PriceSubmission>,
) -> Result<HttpResponse, ApiError> {
    if !token_matches(&req, "x-aswem-token", &state.submit_token) {
        return Err(ApiError::Unauthorized);
    }
    if !state.limiter.check(&client_ip(&req)) {
        return Err(ApiError::TooManyRequests);
    }

    let input = validate(body.into_inner())?;

    let exists = sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM governorates WHERE id = $1)
            AND EXISTS(SELECT 1 FROM products WHERE id = $2)",
    )
    .bind(input.governorate_id)
    .bind(input.product_id)
    .fetch_one(&state.pool)
    .await?;
    if !exists {
        return Err(ApiError::BadRequest("unknown product or governorate"));
    }

    // Reject prices far from the recent median for this product and governorate.
    let (samples, median) = sqlx::query_as::<_, (i64, Option<f64>)>(OUTLIER_SQL)
        .bind(input.product_id)
        .bind(input.governorate_id)
        .fetch_one(&state.pool)
        .await?;
    if let Some(median) = median {
        if samples >= OUTLIER_MIN_SAMPLES {
            let price = f64::from(input.price_millimes);
            if price > median * OUTLIER_FACTOR || price * OUTLIER_FACTOR < median {
                return Err(ApiError::BadRequest(
                    "this price looks unusual for this product, please double-check it",
                ));
            }
        }
    }

    let id = sqlx::query_scalar::<_, i64>(
        "INSERT INTO prices (product_id, governorate_id, price_millimes, address, lat, lng)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id",
    )
    .bind(input.product_id)
    .bind(input.governorate_id)
    .bind(input.price_millimes)
    .bind(input.address.clone())
    .bind(input.lat)
    .bind(input.lng)
    .fetch_one(&state.pool)
    .await?;

    Ok(HttpResponse::Created().json(serde_json::json!({ "id": id })))
}

/// Checks and normalizes a submission. Returns the cleaned version.
fn validate(mut s: PriceSubmission) -> Result<PriceSubmission, ApiError> {
    if !(MIN_PRICE_MILLIMES..=MAX_PRICE_MILLIMES).contains(&s.price_millimes) {
        return Err(ApiError::BadRequest("price is outside the allowed range"));
    }

    s.address = s
        .address
        .map(|a| a.trim().to_string())
        .filter(|a| !a.is_empty());
    if let Some(address) = &s.address {
        if address.chars().count() > MAX_ADDRESS_CHARS {
            return Err(ApiError::BadRequest("address is too long"));
        }
    }

    match (s.lat, s.lng) {
        (Some(lat), Some(lng)) => {
            // Bounding box of Tunisia, with a margin.
            if !(30.0..=38.0).contains(&lat) || !(7.0..=12.0).contains(&lng) {
                return Err(ApiError::BadRequest("location must be inside Tunisia"));
            }
            // About 110 m precision is enough for a store or neighbourhood.
            s.lat = Some(round3(lat));
            s.lng = Some(round3(lng));
        }
        (None, None) => {}
        _ => return Err(ApiError::BadRequest("latitude and longitude must be sent together")),
    }

    if s.address.is_none() && s.lat.is_none() {
        return Err(ApiError::BadRequest("add a place name or share your position"));
    }

    Ok(s)
}

fn round3(value: f64) -> f64 {
    (value * 1000.0).round() / 1000.0
}

#[cfg(test)]
mod tests {
    use super::validate;
    use crate::models::PriceSubmission;

    fn base() -> PriceSubmission {
        PriceSubmission {
            product_id: 1,
            governorate_id: 13,
            price_millimes: 3500,
            address: Some("  Carrefour Monastir  ".to_string()),
            lat: None,
            lng: None,
        }
    }

    #[test]
    fn accepts_and_trims_a_place_name() {
        let ok = validate(base()).expect("valid submission");
        assert_eq!(ok.address.as_deref(), Some("Carrefour Monastir"));
    }

    #[test]
    fn rejects_out_of_range_prices() {
        let mut low = base();
        low.price_millimes = 99;
        assert!(validate(low).is_err());

        let mut high = base();
        high.price_millimes = 10_000_001;
        assert!(validate(high).is_err());
    }

    #[test]
    fn requires_a_place_or_a_position() {
        let mut none = base();
        none.address = Some("   ".to_string());
        assert!(validate(none).is_err());
    }

    #[test]
    fn rejects_half_a_position() {
        let mut half = base();
        half.lat = Some(35.8);
        assert!(validate(half).is_err());
    }

    #[test]
    fn rounds_positions_and_rejects_points_outside_tunisia() {
        let mut inside = base();
        inside.lat = Some(35.78123);
        inside.lng = Some(10.83456);
        let ok = validate(inside).expect("inside Tunisia");
        assert_eq!(ok.lat, Some(35.781));
        assert_eq!(ok.lng, Some(10.835));

        let mut outside = base();
        outside.lat = Some(48.85);
        outside.lng = Some(2.35);
        assert!(validate(outside).is_err());
    }
}
