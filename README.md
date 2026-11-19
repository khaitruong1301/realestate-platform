# NhàĐất — Website bất động sản

[![CI/CD](https://github.com/khaitruong1301/realestate-platform/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/khaitruong1301/realestate-platform/actions/workflows/ci-cd.yml)

Website mua bán / cho thuê bất động sản: React + Vite (FE), Node.js Express + Prisma (BE), PostgreSQL 16, Docker, CI/CD GitHub Actions có **bước duyệt tay** trước khi deploy.

**Production:** http://206.189.146.98

## Bắt đầu nhanh

```bash
docker compose up -d                                   # Postgres dev :5442, test :5443
cd backend  && cp .env.example .env && npm install && npm run db:deploy && npm run db:seed && npm run dev
cd frontend && npm install && npm run dev              # http://localhost:5173
```

## Tài liệu

| File | Nội dung |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Kiến trúc, lệnh, quy trình làm việc (dành cho dev và Claude Code) |
| [docs/CHECKLIST.md](docs/CHECKLIST.md) | Tiến độ dự án theo phase |
| [docs/TESTING.md](docs/TESTING.md) | Chiến lược test + checklist test tay |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Server, CI/CD, duyệt deploy, backup, rollback, sự cố |

## Quy trình

`feature/*` → Pull Request (CI test) → merge `main` → CI test + build image → **⏸ duyệt tay** → deploy → smoke test.
