#!/bin/sh
set -e
echo "==> Chạy migration (prisma migrate deploy)"
npx prisma migrate deploy
echo "==> Khởi động API"
exec node dist/server.js
