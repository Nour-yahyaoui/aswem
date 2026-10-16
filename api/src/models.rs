use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Serialize, sqlx::FromRow)]
pub struct Governorate {
    pub id: i16,
    pub slug: String,
    pub name_ar: String,
    pub name_latin: String,
    pub lat: f64,
    pub lng: f64,
}

#[derive(Serialize, sqlx::FromRow)]
pub struct Product {
    pub id: i32,
    pub slug: String,
    pub name_ar: String,
    pub name_latin: String,
    pub category: String,
}

/// Price statistics for one governorate over the last 30 days.
#[derive(Serialize, sqlx::FromRow)]
pub struct GovStat {
    pub governorate_id: i16,
    pub samples: i64,
    pub min_millimes: i32,
    pub median_millimes: f64,
    pub max_millimes: i32,
    pub last_seen: DateTime<Utc>,
}

/// A public price report. Exact coordinates are never exposed.
#[derive(Serialize, sqlx::FromRow)]
pub struct PriceView {
    pub id: i64,
    pub governorate_id: i16,
    pub price_millimes: i32,
    pub address: Option<String>,
    pub created_at: DateTime<Utc>,
}

/// Body of POST /api/v1/prices. Prices are integers in millimes (1 TND = 1000 millimes).
#[derive(Deserialize, Clone)]
pub struct PriceSubmission {
    pub product_id: i32,
    pub governorate_id: i16,
    pub price_millimes: i32,
    pub address: Option<String>,
    pub lat: Option<f64>,
    pub lng: Option<f64>,
}
