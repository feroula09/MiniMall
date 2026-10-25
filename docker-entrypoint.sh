#!/bin/sh
set -e

DATA_DIR=/app/data
mkdir -p "$DATA_DIR" /app/storage/uploads

# 沒有傳入 SESSION_SECRET 時，產生一組存在 volume 裡，重啟後登入狀態仍有效
if [ -z "$SESSION_SECRET" ]; then
  SECRET_FILE="$DATA_DIR/.session_secret"
  if [ ! -s "$SECRET_FILE" ]; then
    node -e "process.stdout.write(require('crypto').randomBytes(32).toString('base64url'))" > "$SECRET_FILE"
    chmod 600 "$SECRET_FILE"
  fi
  SESSION_SECRET="$(cat "$SECRET_FILE")"
  export SESSION_SECRET
fi

./node_modules/.bin/prisma migrate deploy

# seed 會清空資料庫，只在第一次成功之前執行
SEED_MARKER="$DATA_DIR/.seeded"
if [ ! -f "$SEED_MARKER" ]; then
  ./node_modules/.bin/tsx prisma/seed.ts
  touch "$SEED_MARKER"
fi

exec ./node_modules/.bin/next start
