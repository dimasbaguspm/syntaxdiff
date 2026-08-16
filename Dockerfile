# syntax=docker/dockerfile:1

# --- Build stage ---------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# Pin pnpm to the version that generated the lockfile (10.x). `corepack enable`
# alone would pull the latest (11.x), whose supply-chain policy
# (MINIMUM_RELEASE_AGE) rejects recently-published lockfile entries.
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate && pnpm install --frozen-lockfile

COPY . .

# Injected at build time by CI (hardcoded defaults for local builds).
ARG VITE_APP_VERSION=Nightly
ARG VITE_SITE_URL=https://syntaxdiff.dimasbaguspm.dev
ARG VITE_OTEL_COLLECTOR_URL=https://otel.dimasbaguspm.dev
ARG VITE_UMAMI_WEBSITE_ID=9e7aa418-ae25-409b-8cf0-994a99593f02
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_SITE_URL=$VITE_SITE_URL
ENV VITE_OTEL_COLLECTOR_URL=$VITE_OTEL_COLLECTOR_URL
ENV VITE_UMAMI_WEBSITE_ID=$VITE_UMAMI_WEBSITE_ID

RUN pnpm build

# --- Serve stage ---------------------------------------------------------
FROM nginx:1.27-alpine

# SPA nginx config (no separate file in the repo)
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback — any non-asset path serves index.html (covers /diff/:id)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Hashed build assets: cache aggressively
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Favicon
    location = /favicon.svg {
        add_header Cache-Control "public, max-age=86400";
        try_files $uri =404;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        application/javascript
        application/json
        image/svg+xml
        image/x-icon;
}
EOF

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/public/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
