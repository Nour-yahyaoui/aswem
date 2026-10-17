pub mod meta;
pub mod prices;
pub mod products;
pub mod reports;

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
            .route("/prices", web::post().to(prices::submit))
            .route("/products/{slug}/reports", web::get().to(reports::public_for_product))
            .route("/reports", web::post().to(reports::submit_report))
            .route("/admin/reports", web::get().to(reports::admin_list))
            .route("/admin/reports/{id}", web::post().to(reports::admin_review)),
    );
}
