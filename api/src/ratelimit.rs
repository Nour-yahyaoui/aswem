use std::{
    collections::HashMap,
    sync::Mutex,
    time::{Duration, Instant},
};

/// Fixed-window, per-client limiter for write endpoints.
/// State is kept in memory, so limits are per instance. That is fine for a single Render
/// instance; move the counters to Postgres or Redis before scaling out.
pub struct Limiter {
    inner: Mutex<HashMap<String, (Instant, u32)>>,
    max: u32,
    window: Duration,
}

const MAX_TRACKED_KEYS: usize = 50_000;

impl Limiter {
    pub fn new(max_per_hour: u32) -> Self {
        Self {
            inner: Mutex::new(HashMap::new()),
            max: max_per_hour,
            window: Duration::from_secs(3600),
        }
    }

    /// Returns true if the request is allowed and records it.
    pub fn check(&self, key: &str) -> bool {
        let now = Instant::now();
        let mut map = match self.inner.lock() {
            Ok(guard) => guard,
            Err(poisoned) => poisoned.into_inner(),
        };

        // Bound memory: drop expired windows when the table grows large.
        if map.len() > MAX_TRACKED_KEYS {
            map.retain(|_, (start, _)| now.duration_since(*start) < self.window);
        }

        let entry = map.entry(key.to_string()).or_insert((now, 0));
        if now.duration_since(entry.0) >= self.window {
            *entry = (now, 0);
        }
        if entry.1 >= self.max {
            return false;
        }
        entry.1 += 1;
        true
    }
}
