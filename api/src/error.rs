use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde_json::json;

/// All errors the API can return. Messages are fixed strings so internal details never leak.
#[derive(Debug)]
pub enum ApiError {
    BadRequest(&'static str),
    NotFound(&'static str),
    Unauthorized,
    TooManyRequests,
    Internal,
}

impl ApiError {
    fn message(&self) -> &'static str {
        match self {
            Self::BadRequest(m) => m,
            Self::NotFound(m) => m,
            Self::Unauthorized => "unauthorized",
            Self::TooManyRequests => "too many submissions, try again later",
            Self::Internal => "internal error",
        }
    }
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(self.message())
    }
}

impl ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::BadRequest(_) => StatusCode::BAD_REQUEST,
            Self::NotFound(_) => StatusCode::NOT_FOUND,
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
            Self::TooManyRequests => StatusCode::TOO_MANY_REQUESTS,
            Self::Internal => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code()).json(json!({ "error": self.message() }))
    }
}

impl From<sqlx::Error> for ApiError {
    fn from(err: sqlx::Error) -> Self {
        // Log the real error server-side; the client only ever sees a generic message.
        tracing::error!(error = %err, "database error");
        ApiError::Internal
    }
}
