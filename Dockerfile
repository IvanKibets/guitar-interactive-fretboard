# 1. Build React
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# 2. Caddy (HTTPS)
FROM caddy:2-alpine
COPY --from=build /app/build /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
