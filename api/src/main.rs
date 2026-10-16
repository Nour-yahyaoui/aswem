mod config;
mod db;
mod error;
mod models;
mod ratelimit;
mod routes;

use actix_web::{middleware::DefaultHeaders, middleware::Logger, web, App, HttpServer};
use sqlx::PgPool;
use tracing_subscriber::EnvFilter;

use crate::{config::Config, ratelimit::Limiter};

/// Shared state available to every handler.
pub struct AppState {
    pub pool: PgPool,
    pub submit_token: String,
    pub limiter: Limiter,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    tracing_subscriber::fmt()
        .json()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .init();

    let cfg = Config::from_env().map_err(|e| std::io::Error::new(std::io::ErrorKind::InvalidInput, e))?;

    let pool = db::connect(&cfg.database_url)
        .await
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;
    db::migrate(&pool)
        .await
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?;

    let state = web::Data::new(AppState {
        pool,
        submit_token: cfg.submit_token.clone(),
        limiter: Limiter::new(cfg.submit_per_hour),
    });

    tracing::info!(port = cfg.port, "aswem api listening");

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .app_data(web::JsonConfig::default().limit(16 * 1024))
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
