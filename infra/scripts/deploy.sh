#!/usr/bin/env bash
# Deploy 1 phiên bản lên server. Được GitHub Actions gọi qua SSH (user deploy).
# Dùng: TAG=<git-sha> GHCR_USER=... GHCR_TOKEN=... ./deploy.sh
# Tự động: backup DB -> pull image -> up -> health check -> rollback nếu lỗi.
set -euo pipefail
cd /opt/realestate

: "${TAG:?Thiếu TAG}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env"
HEALTH_URL="http://localhost/api/health"

[ -f .env ] || { echo "❌ Thiếu /opt/realestate/.env (xem docs/DEPLOY.md)"; exit 1; }

if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null
fi

PREV_TAG="$(cat .current_tag 2>/dev/null || echo '')"
echo "==> Deploy TAG=$TAG (trước đó: ${PREV_TAG:-chưa có})"

# 1. Backup DB trước khi deploy (nếu DB đang chạy)
if [ -n "$($COMPOSE ps -q --status running db 2>/dev/null)" ]; then
  ./backup-db.sh "pre-deploy-${TAG:0:7}" || echo "⚠️  Backup lỗi, vẫn tiếp tục"
fi

# 2. Pull + khởi động phiên bản mới
export TAG
$COMPOSE pull backend frontend
$COMPOSE up -d --remove-orphans

# 3. Health check (tối đa ~120s; backend chạy migration lúc khởi động)
for i in $(seq 1 40); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "✅ Health check OK sau $((i * 3))s"
    echo "$TAG" > .current_tag
    if [ -n "$PREV_TAG" ] && [ "$PREV_TAG" != "$TAG" ]; then echo "$PREV_TAG" > .previous_tag; fi
    docker image prune -af --filter "until=168h" >/dev/null || true
    $COMPOSE ps
    exit 0
  fi
  sleep 3
done

# 4. Lỗi -> rollback về TAG trước
echo "❌ Health check thất bại. Log backend:"
$COMPOSE logs --tail=80 backend || true
if [ -n "$PREV_TAG" ]; then
  echo "↩️  Rollback về $PREV_TAG"
  TAG="$PREV_TAG" $COMPOSE up -d
fi
exit 1
