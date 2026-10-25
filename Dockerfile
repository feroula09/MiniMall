# syntax=docker/dockerfile:1

# Prisma 引擎需要 openssl；build 與 runner 用同一個 base，產生的引擎才會相符
FROM node:24-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate \
  && npm run build \
  && rm -rf .next/cache

# 執行期仍需要 prisma CLI（migrate）與 tsx（第一次啟動的 seed），所以保留完整 node_modules
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/app/data/minimall.db
COPY --from=build /app ./
RUN mkdir -p data storage/uploads .next/cache \
  && chown -R node:node data storage .next/cache \
  && chmod +x docker-entrypoint.sh
USER node
VOLUME ["/app/data", "/app/storage"]
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
