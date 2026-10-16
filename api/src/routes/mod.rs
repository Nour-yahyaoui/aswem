pub mod meta;
pub mod prices;
pub mod products;

use actix_web::web;

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.route("/healthz", web::get().to(meta::health)).service(
        web::scope("/api/v1")
            .route("/health", web::get().to(meta::health))
            .route("/governorates", web::get().to(meta::governorates))
            .route("/products", web::get().to(products::list))
            .route("/products/{slug}", web::get().to(products::detail))
            .route("/products/{slug}/prices", web::get().to(prices::for_product))
            .route("/search", web::get().to(products::search))
            .route("/prices", web::post().to(prices::submit)),
    );
}
