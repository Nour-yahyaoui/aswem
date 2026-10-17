use actix_web::HttpRequest;

/// Compares a request header against a secret in constant time, so timing reveals nothing.
/// Returns false when the header is missing.
pub fn token_matches(req: &HttpRequest, header: &str, expected: &str) -> bool {
    let provided = req
        .headers()
        .get(header)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    constant_time_eq(provided.as_bytes(), expected.as_bytes())
}

pub fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    a.iter().zip(b).fold(0u8, |acc, (x, y)| acc | (x ^ y)) == 0
}

/// Client address used for rate limiting. Only trusted when the request already carries the
/// server-to-server token, which the Next.js server sets from the real visitor address.
pub fn client_ip(req: &HttpRequest) -> String {
    req.headers()
        .get("x-client-ip")
        .and_then(|v| v.to_str().ok())
        .map(|v| v.trim().chars().take(64).collect::<String>())
        .filter(|v| !v.is_empty())
        .unwrap_or_else(|| "unknown".to_string())
}

#[cfg(test)]
mod tests {
    use super::constant_time_eq;

    #[test]
    fn equal_tokens_match() {
        assert!(constant_time_eq(b"secret-token", b"secret-token"));
    }

    #[test]
    fn different_tokens_do_not_match() {
        assert!(!constant_time_eq(b"secret-token", b"secret-tokeX"));
    }

    #[test]
    fn different_lengths_do_not_match() {
        assert!(!constant_time_eq(b"abc", b"abcd"));
        assert!(!constant_time_eq(b"", b"x"));
    }
}
