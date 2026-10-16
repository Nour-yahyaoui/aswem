use actix_web::{web, HttpResponse};
use serde_json::json;

use crate::{error::ApiError, models::Governorate, AppState};

pub async fn health(state: web::Data<AppState>) -> Result<HttpResponse, ApiError> {
    sqlx::query("SELECT 1").execute(&state.pool).await?;
    Ok(HttpResponse::Ok().json(json!({ "status": "ok" })))
}

pub async fn governorates(state: web::Data<AppState>) -> Result<HttpResponse, ApiError> {
    let rows = sqlx::query_as::<_, Governorate>(
        "SELECT id, slug, name_ar, name_latin, lat, lng FROM governorates ORDER BY id",
    )
    .fetch_all(&state.pool)
    .await?;

    Ok(HttpResponse::Ok()
        .insert_header(("Cache-Control", "public, max-age=86400"))
        .json(rows))
}
