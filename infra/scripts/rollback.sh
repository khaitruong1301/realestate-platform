#!/usr/bin/env bash
# Quay về phiên bản trước (hoặc TAG chỉ định). Chạy trên server với user deploy.
# Dùng: ./rollback.sh            -> về .previous_tag
#       ./rollback.sh <git-sha>  -> về sha chỉ định
set -euo pipefail
cd /opt/realestate
TARGET="${1:-$(cat .previous_tag 2>/dev/null || true)}"
[ -n "$TARGET" ] || { echo "Không có TAG để rollback"; exit 1; }
echo "↩️  Rollback về $TARGET"
TAG="$TARGET" docker compose -f docker-compose.prod.yml --env-file .env up -d
cp .current_tag .previous_tag 2>/dev/null || true
echo "$TARGET" > .current_tag
echo "Lưu ý: migration DB KHÔNG tự đảo ngược. Nếu cần, restore từ backups/."
