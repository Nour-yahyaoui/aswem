use actix_web::{web, HttpRequest, HttpResponse};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{
    error::ApiError,
    security::{client_ip, token_matches},
    AppState,
};

const REASONS: &[&str] = &["expired", "spoiled", "wrong_label", "other"];
const MAX_NOTE_CHARS: usize = 300;

#[derive(Deserialize)]
pub struct ReportSubmission {
    pub product_id: i32,
    pub governorate_id: i16,
    pub reason: String,
    pub note: Option<String>,
}

/// Public view of an approved report. The note and any place name are never shown publicly.
#[derive(Serialize, sqlx::FromRow)]
pub struct PublicReport {
    pub governorate_id: i16,
    pub reason: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct QueuedReport {
    pub id: i64,
    pub product_slug: String,
    pub product_name_latin: String,
    pub governorate_id: i16,
    pub reason: String,
    pub note: Option<String>,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Deserialize)]
pub struct AdminListQuery {
    pub status: Option<String>,
}

#[derive(Deserialize)]
pub struct ReviewDecision {
    pub decision: String,
}

const PUBLIC_REPORTS_SQL: &str = "
    SELECT governorate_id, reason, created_at
    FROM product_reports
    WHERE product_id = $1 AND status = 'approved' AND created_at >= now() - interval '30 days'
    ORDER BY created_at DESC
    LIMIT 20";

const QUEUE_SQL: &str = "
    SELECT r.id, p.slug AS product_slug, p.name_latin AS product_name_latin,
           r.governorate_id, r.reason, r.note, r.status, r.created_at
    FROM product_reports r
    JOIN products p ON p.id = r.product_id
    WHERE r.status = $1
    ORDER BY r.created_at
    LIMIT 100";

/// POST /api/v1/reports (server-to-server only, like price submissions)
pub async fn submit_report(
    req: HttpRequest,
    state: web::Data<AppState>,
    body: web::Json<ReportSubmission>,
) -> Result<HttpResponse, ApiError> {
    if !token_matches(&req, "x-aswem-token", &state.submit_token) {
        return Err(ApiError::Unauthorized);
    }
    if !state.report_limiter.check(&client_ip(&req)) {
        return Err(ApiError::TooManyRequests);
    }

    let input = body.into_inner();
    if !REASONS.contains(&input.reason.as_str()) {
        return Err(ApiError::BadRequest("unknown reason"));
    }
    let note = input
        .note
        .map(|n| n.trim().to_string())
        .filter(|n| !n.is_empty());
    if let Some(n) = &note {
        if n.chars().count() > MAX_NOTE_CHARS {
            return Err(ApiError::BadRequest("note is too long"));
        }
    }

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

    let id = sqlx::query_scalar::<_, i64>(
        "INSERT INTO product_reports (product_id, governorate_id, reason, note)
         VALUES ($1, $2, $3, $4)
         RETURNING id",
    )
    .bind(input.product_id)
    .bind(input.governorate_id)
    .bind(input.reason)
    .bind(note)
    .fetch_one(&state.pool)
    .await?;

    Ok(HttpResponse::Created().json(serde_json::json!({ "id": id, "status": "pending" })))
}

/// GET /api/v1/products/{slug}/reports: approved reports only
pub async fn public_for_product(
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> Result<HttpResponse, ApiError> {
    let product_id = sqlx::query_scalar::<_, i32>("SELECT id FROM products WHERE slug = $1")
        .bind(path.into_inner())
        .fetch_optional(&state.pool)
        .await?
        .ok_or(ApiError::NotFound("product not found"))?;

    let reports = sqlx::query_as::<_, PublicReport>(PUBLIC_REPORTS_SQL)
        .bind(product_id)
        .fetch_all(&state.pool)
        .await?;

    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "public, max-age=120"))
        .json(reports))
}

/// Admin routes are disabled entirely unless ADMIN_TOKEN is configured.
fn require_admin(req: &HttpRequest, state: &AppState) -> Result<(), ApiError> {
    let expected = state
        .admin_token
        .as_deref()
        .ok_or(ApiError::NotFound("not found"))?;
    if token_matches(req, "x-admin-token", expected) {
        Ok(())
    } else {
        Err(ApiError::Unauthorized)
    }
}

/// GET /api/v1/admin/reports?status=pending
pub async fn admin_list(
    req: HttpRequest,
    state: web::Data<AppState>,
    query: web::Query<AdminListQuery>,
) -> Result<HttpResponse, ApiError> {
    require_admin(&req, &state)?;

    let status = query.status.as_deref().unwrap_or("pending");
    if !matches!(status, "pending" | "approved" | "rejected") {
        return Err(ApiError::BadRequest("status must be pending, approved, or rejected"));
    }

    let reports = sqlx::query_as::<_, QueuedReport>(QUEUE_SQL)
        .bind(status)
        .fetch_all(&state.pool)
        .await?;

    Ok(HttpResponse::Ok().json(reports))
}

/// POST /api/v1/admin/reports/{id} with {"decision": "approved" | "rejected"}
pub async fn admin_review(
    req: HttpRequest,
    state: web::Data<AppState>,
    path: web::Path<i64>,
    body: web::Json<ReviewDecision>,
) -> Result<HttpResponse, ApiError> {
    require_admin(&req, &state)?;

    let status: &'static str = match body.decision.as_str() {
        "approved" => "approved",
        "rejected" => "rejected",
        _ => return Err(ApiError::BadRequest("decision must be approved or rejected")),
    };

    let id = sqlx::query_scalar::<_, i64>(
        "UPDATE product_reports
         SET status = $1, reviewed_at = now()
         WHERE id = $2 AND status = 'pending'
         RETURNING id",
    )
    .bind(status)
    .bind(path.into_inner())
    .fetch_optional(&state.pool)
    .await?
    .ok_or(ApiError::NotFound("report not found or already reviewed"))?;

    Ok(HttpResponse::Ok().json(serde_json::json!({ "id": id, "status": status })))
}
