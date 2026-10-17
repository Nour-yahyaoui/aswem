# Aswem · أسوام

Free, open-source community prices for Tunisia. People report what they pay for everyday products in each governorate, and Aswem shows medians, lows, and recent reports.

- **Web:** Next.js (App Router, Server Components, Server Actions), deployed on Vercel. Two languages: Tunisian Darija at `/ar` and French at `/fr`. Target URL: `aswem.vercel.app`, later `aswem.tn`.
- **API:** Actix Web (Rust) with SQLx, deployed on Render. Target URL: `aswem.onrender.app`.
- **Database:** Neon (serverless Postgres) with `pg_trgm` for fuzzy search.

## How it works

1. A visitor opens a product page to see the median, lowest, and recent prices per governorate.
2. Anyone can report a price: product, price in TND, governorate, and either a place name or their position (rounded to about 110 m).
3. The web server validates and forwards the report to the API with a shared secret, so the browser never sees the token.
4. The API rejects prices that are far from the recent median (more than 4x above or below) and rate-limits each client.

Prices are stored as integer millimes (1 TND = 1000 millimes) to avoid floating-point errors.


 
