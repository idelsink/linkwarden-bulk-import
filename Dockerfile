# Build stage
FROM ghcr.io/jdx/mise:2025.9.17 AS builder
WORKDIR /app
COPY mise.toml ./
RUN mise trust && mise install
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM docker.io/library/nginx:1.29.1-alpine

# Add metadata labels
LABEL org.opencontainers.image.title="Linkwarden Bulk Import"
LABEL org.opencontainers.image.description="A simple web-based tool for bulk importing URLs into linkwarden"
LABEL org.opencontainers.image.authors="Ingmar Delsink"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/idelsink/linkwarden-bulk-import"
LABEL org.opencontainers.image.documentation="https://github.com/idelsink/linkwarden-bulk-import#readme"

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
