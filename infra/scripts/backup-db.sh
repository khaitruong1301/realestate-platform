#!/usr/bin/env bash
# Backup PostgreSQL ra /opt/realestate/backups, tự xoá bản cũ hơn 14 ngày.
# Dùng: ./backup-db.sh [nhãn]   (cron hằng ngày: xem docs/DEPLOY.md)
# Restore: gunzip -c backups/<file>.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U realestate -d realestate
set -euo pipefail
cd /opt/realestate
set -a; . ./.env; set +a
LABEL="${1:-daily}"
FILE="backups/realestate-$(date +%Y%m%d-%H%M%S)-${LABEL}.sql.gz"
docker compose -f docker-compose.prod.yml --env-file .env exec -T db \
  pg_dump -U "${POSTGRES_USER:-realestate}" -d "${POSTGRES_DB:-realestate}" --no-owner | gzip > "$FILE"
echo "✅ Backup: $FILE ($(du -h "$FILE" | cut -f1))"
find /opt/realestate/backups -maxdepth 1 -name 'realestate-*.sql.gz' -mtime +14 -delete
