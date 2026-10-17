mod config;
mod db;
mod error;
mod models;
mod ratelimit;
mod routes;
mod security;

use actix_web::{
    error::{InternalError, JsonPayloadError},
    middleware::{DefaultHeaders, Logger},
    web, App, HttpRequest, HttpResponse, HttpServer,
};
use sqlx::PgPool;
use tracing_subscriber::EnvFilter;

use crate::{config::Config, ratelimit::Limiter};

/// JSON body limits. Malformed or oversized bodies get the same JSON error format as the rest of the API.
fn json_config() -> web::JsonConfig {
    web::JsonConfig::default()
        .limit(16 * 1024)
        .error_handler(|err: JsonPayloadError, _req: &HttpRequest| {
            let response = HttpResponse::BadRequest()
                .json(serde_json::json!({ "error": "invalid request body" }));
            InternalError::from_response(err, response).into()
        })
}

/// Shared state available to every handler.
pub struct AppState {
    pub pool: PgPool,
    pub submit_token: String,
    pub admin_token: Option<String>,
    pub limiter: Limiter,
    pub report_limiter: Limiter,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt()
        .json()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .init();

    let cfg = Config::from_env().map_err(std::io::Error::other)?;

    let pool = db::connect(&cfg.database_url).await.map_err(std::io::Error::other)?;
    db::migrate(&pool).await.map_err(std::io::Error::other)?;

    let state = web::Data::new(AppState {
        pool,
        submit_token: cfg.submit_token.clone(),
        admin_token: cfg.admin_token.clone(),
        limiter: Limiter::new(cfg.submit_per_hour),
        report_limiter: Limiter::new(cfg.submit_per_hour),
    });

    tracing::info!(port = cfg.port, "aswem api listening");

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .app_data(json_config())
            .wrap(Logger::default())
            .wrap(
                DefaultHeaders::new()
                    .add(("X-Content-Type-Options", "nosniff"))
                    .add(("Referrer-Policy", "strict-origin-when-cross-origin"))
                    .add(("X-Frame-Options", "DENY")),
            )
            .configure(routes::configure)
    })
    .bind(("0.0.0.0", cfg.port))?
    .run()
    .await
}
