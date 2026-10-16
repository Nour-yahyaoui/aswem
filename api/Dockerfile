# syntax=docker/dockerfile:1
FROM rust:1.85-slim-bookworm AS build
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends pkg-config ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml Cargo.lock* ./
COPY src ./src
COPY migrations ./migrations
# Requires Cargo.lock to be committed (run `cargo generate-lockfile` once in api/).
RUN cargo build --release --locked

FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/target/release/aswem-api /usr/local/bin/aswem-api
ENV RUST_LOG=info
USER nobody
EXPOSE 10000
CMD ["aswem-api"]
