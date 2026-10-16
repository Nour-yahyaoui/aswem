use actix_web::{web, HttpResponse};
use serde::Deserialize;

use crate::{error::ApiError, models::Product, AppState};

/// Search matches the trigram index in migration 0001. Keep the expression identical.
const SEARCH_SQL: &str = "
    SELECT id, slug, name_ar, name_latin, category
    FROM products
    WHERE (name_ar || ' ' || name_latin || ' ' || aliases) ILIKE '%' || $1::text || '%'
       OR similarity(name_ar || ' ' || name_latin || ' ' || aliases, $2::text) > 0.2
    ORDER BY similarity(name_ar || ' ' || name_latin || ' ' || aliases, $2::text) DESC,
             name_latin
    LIMIT $3";

#[derive(Deserialize)]
pub struct ListQuery {
    pub category: Option<String>,
}

#[derive(Deserialize)]
pub struct SearchQuery {
    pub q: String,
    pub limit: Option<i64>,
}

pub async fn list(
    state: web::Data<AppState>,
    query: web::Query<ListQuery>,
) -> Result<HttpResponse, ApiError> {
    let products = sqlx::query_as::<_, Product>(
        "SELECT id, slug, name_ar, name_latin, category
         FROM products
         WHERE ($1::text IS NULL OR category = $1)
         ORDER BY name_latin
         LIMIT 500",
    )
    .bind(query.category.as_deref())
    .fetch_all(&state.pool)
    .await?;

    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "public, max-age=300"))
        .json(products))
}

pub async fn detail(
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> Result<HttpResponse, ApiError> {
    let product = sqlx::query_as::<_, Product>(
        "SELECT id, slug, name_ar, name_latin, category FROM products WHERE slug = $1",
    )
    .bind(path.into_inner())
    .fetch_optional(&state.pool)
    .await?
    .ok_or(ApiError::NotFound("product not found"))?;

    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "public, max-age=300"))
        .json(product))
}

pub async fn search(
    state: web::Data<AppState>,
    query: web::Query<SearchQuery>,
) -> Result<HttpResponse, ApiError> {
    let q = query.q.trim();
    if q.is_empty() || q.chars().count() > 80 {
        return Err(ApiError::BadRequest("query must be 1 to 80 characters"));
    }
    let limit = query.limit.unwrap_or(20).clamp(1, 50);
    let pattern = escape_like(q);

    let products = sqlx::query_as::<_, Product>(SEARCH_SQL)
        .bind(pattern)
        .bind(q)
        .bind(limit)
        .fetch_all(&state.pool)
        .await?;

    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "public, max-age=60"))
        .json(products))
}

/// Escapes LIKE wildcards so user input is matched literally.
fn escape_like(input: &str) -> String {
    let mut out = String::with_capacity(input.len());
    for c in input.chars() {
        if matches!(c, '\\' | '%' | '_') {
            out.push('\\');
        }
        out.push(c);
    }
    out
}
