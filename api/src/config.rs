use std::env;

/// Runtime configuration, read once at startup from environment variables.
#[derive(Clone)]
pub struct Config {
    pub database_url: String,
    pub submit_token: String,
    pub port: u16,
    pub submit_per_hour: u32,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let database_url =
            env::var("DATABASE_URL").map_err(|_| "DATABASE_URL is required".to_string())?;

        let submit_token =
            env::var("SUBMIT_TOKEN").map_err(|_| "SUBMIT_TOKEN is required".to_string())?;
        if submit_token.len() < 32 {
            return Err("SUBMIT_TOKEN must be at least 32 characters".to_string());
        }

        // Render injects PORT automatically; 10000 is the usual default there.
        let port = match env::var("PORT") {
            Ok(v) => v.parse::<u16>().map_err(|_| "PORT must be a number".to_string())?,
            Err(_) => 10000,
        };

        let submit_per_hour = match env::var("SUBMIT_PER_HOUR") {
            Ok(v) => v
                .parse::<u32>()
                .map_err(|_| "SUBMIT_PER_HOUR must be a number".to_string())?,
            Err(_) => 10,
        };

        Ok(Self {
            database_url,
            submit_token,
            port,
            submit_per_hour,
        })
    }
}
