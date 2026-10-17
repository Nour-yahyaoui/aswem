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

## Repository layout

```
api/          Rust API (Actix Web, SQLx, migrations)
web/          Next.js frontend (App Router, Tailwind CSS)
render.yaml   Render Blueprint for the API
.github/      CI workflows
```

## Environment variables

**API (Render)**

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon pooled connection string, with `sslmode=require` |
| `SUBMIT_TOKEN` | yes | Any non-empty secret. Must equal the web value |
| `PORT` | no | Set by Render automatically |
| `SUBMIT_PER_HOUR` | no | Default `10` submissions per client per hour |
| `ADMIN_TOKEN` | no | Enables the moderation endpoints under `/api/v1/admin`. Leave unset to disable them |
| `RUST_LOG` | no | Default `info` |

**Web (Vercel)**

| Variable | Required | Notes |
| --- | --- | --- |
| `API_URL` | yes | `https://aswem.onrender.app`, no trailing slash. Server-only |
| `SUBMIT_TOKEN` | yes | Same value as the API. Server-only |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://aswem.vercel.app`, or `https://aswem.tn` later |

Generate a token with `openssl rand -base64 48`.

## Local development

Requires Node 20.9+, Rust 1.90+, and a Postgres database (a free Neon project works).

```bash
# API
cd api
cargo generate-lockfile          # first time only; commit Cargo.lock
DATABASE_URL="postgres://..." SUBMIT_TOKEN="$(openssl rand -base64 48)" PORT=10000 cargo run

# Web
cd web
cp .env.example .env.local       # set API_URL=http://localhost:10000 for local work
npm ci
npm run dev
```

## Deployment

- **Database:** create a Neon project. Use the pooled connection string for `DATABASE_URL`. Migrations run automatically when the API starts.
- **API:** create a Render Web Service from this repo (or apply `render.yaml`). Health check: `/healthz`.
- **Web:** create a Vercel project with **Root Directory** set to `web`. Add the web variables above.

## Tests and checks

```bash
# API (Rust 1.90+)
cd api
cargo fmt --check
cargo clippy --all-targets --locked -- -D warnings
cargo test --locked
cargo audit

# Web (Node 20.9+)
cd web
npm run typecheck
npm run lint
npm test                          # Vitest: formatting, geo, client IP, API fallback, translations
npm run build                     # needs API_URL and SUBMIT_TOKEN; the API may be unreachable
npm audit --omit=dev
```

CI (`.github/workflows/ci.yml`) runs all of the above on every push and pull request.

## Architecture

- **Web (`web/`):** Next.js App Router on Vercel. Every public page lives under `app/[lang]/` (`ar` default, `fr`). `middleware.ts` redirects `/` by `Accept-Language`. Pages are statically cached for 5 minutes and fall back to an empty state if the API is down. Security headers and the CSP are in `next.config.ts`.
- **API (`api/`):** Actix Web on Render. Postgres via sqlx with static SQL only. Migrations run at startup. Writes (prices, reports) need `X-Aswem-Token` and are rate limited per client IP. Admin routes exist only when `ADMIN_TOKEN` is set. Rate limits are in memory, so they are per instance.
- **Status (`/status`):** shows the API and database health (`/healthz`) with latency, and a browser speed test against the web server.
- **Shopping list (`/list`):** the list is stored in the browser only. The advisor compares the observed medians per governorate and adds a trip cost. The rules (cost per km, maximum distance, minimum saving) are in `web/lib/advisor.ts` as `ADVISOR_RULES`. They are assumptions, and the page explains them to users.
- **Database (Neon):** governorates and products are reference data (seeded). Prices and reports are user data. Prices are stored as integer millimes. Positions are rounded to 3 decimals.

## Moderation

Problem reports (expired, spoiled, wrong label) are hidden until a moderator approves them. With `ADMIN_TOKEN` set, moderators can:

```bash
# list pending reports
curl -H "X-Admin-Token: $ADMIN_TOKEN" "https://aswem.onrender.com/api/v1/admin/reports?status=pending"

# approve or reject report 42
curl -X POST -H "X-Admin-Token: $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"decision":"approved"}' "https://aswem.onrender.com/api/v1/admin/reports/42"
```

## Production checklist

- [ ] **Render:** set `ADMIN_TOKEN` (generate with `openssl rand -base64 48`), then redeploy. Confirm `https://aswem.onrender.com/healthz` returns OK.
- [ ] **Render:** `DATABASE_URL` must not contain `channel_binding=require`. Neon's pooled URL is fine without it.
- [ ] **Vercel (Production):** set `API_URL=https://aswem.onrender.com` and `SUBMIT_TOKEN` (same value as Render), then redeploy.
- [ ] **Domain:** when `aswem.tn` is live, update `NEXT_PUBLIC_SITE_URL` (sitemap, canonical links, OpenGraph) and submit the sitemap in Google Search Console.
- [ ] **Monitoring:** check `cargo audit` and `npm audit` results in CI each week. Review pending reports regularly.
- [ ] **Backups:** confirm Neon point-in-time restore is enabled for the project.

## Data and privacy

- No accounts. No photos are uploaded or stored.
- Exact coordinates are rounded and never shown publicly. Only the governorate, the place name, the price, and the date are public.
- Reports are community estimates, not official price data.

## License

MIT. See [LICENSE](LICENSE).

Built by [Nour Yahyaoui](https://github.com/Nour-yahyaoui).
