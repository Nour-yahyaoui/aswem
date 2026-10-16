use std::{str::FromStr, time::Duration};

use sqlx::{
    migrate::MigrateError,
    postgres::{PgConnectOptions, PgPoolOptions},
    PgPool,
};

/// Connects to Postgres (Neon). Neon's pooled endpoint runs PgBouncer in transaction mode,
/// which does not support server-side prepared statement caching, so we disable it.
pub async fn connect(database_url: &str) -> Result<PgPool, sqlx::Error> {
    let options = PgConnectOptions::from_str(database_url)?.statement_cache_capacity(0);

    PgPoolOptions::new()
        .max_connections(10)
        .min_connections(1)
        .acquire_timeout(Duration::from_secs(10))
        .idle_timeout(Duration::from_secs(300))
        .connect_with(options)
        .await
}

pub async fn migrate(pool: &PgPool) -> Result<(), MigrateError> {
    sqlx::migrate!("./migrations").run(pool).await
}
