-- Aswem schema v1
-- Keep tables narrow: every column is paid for on hundreds of thousands of rows.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE governorates (
    id          SMALLINT PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name_ar     TEXT NOT NULL,
    name_latin  TEXT NOT NULL,
    lat         DOUBLE PRECISION NOT NULL,
    lng         DOUBLE PRECISION NOT NULL
);

CREATE TABLE products (
    id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name_ar     TEXT NOT NULL,
    name_latin  TEXT NOT NULL,
    category    TEXT NOT NULL,
    aliases     TEXT NOT NULL DEFAULT ''
);

-- Trigram index used by search. The expression must match the one in the search query.
CREATE INDEX products_search_trgm
    ON products USING gin ((name_ar || ' ' || name_latin || ' ' || aliases) gin_trgm_ops);

CREATE INDEX products_category ON products (category);

CREATE TABLE prices (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id      INTEGER NOT NULL REFERENCES products (id),
    governorate_id  SMALLINT NOT NULL REFERENCES governorates (id),
    price_millimes  INTEGER NOT NULL CHECK (price_millimes BETWEEN 100 AND 10000000),
    address         TEXT CHECK (char_length(address) <= 120),
    lat             DOUBLE PRECISION,
    lng             DOUBLE PRECISION,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK ((lat IS NULL) = (lng IS NULL))
);

-- Product pages and outlier checks read by product and time.
CREATE INDEX prices_product_created ON prices (product_id, created_at DESC);
CREATE INDEX prices_product_gov_created ON prices (product_id, governorate_id, created_at DESC);
