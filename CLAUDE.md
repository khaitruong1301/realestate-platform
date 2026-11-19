# NhàĐất — Website bất động sản

Website mua bán / cho thuê bất động sản. Monorepo gồm frontend, backend, database PostgreSQL, CI/CD tự động deploy lên server khi merge vào `main`.

> Trả lời và viết comment bằng **tiếng Việt có dấu**. Tên biến, hàm, commit message type giữ tiếng Anh.

## Kiến trúc

```
Trình duyệt ──► nginx (container frontend, :80)
                 ├── /            → static SPA (React build)
                 └── /api/*       → backend:4000 (Express)
                                      └── PostgreSQL 16 (container db, không mở ra ngoài)
```

| Thư mục | Nội dung | Hướng dẫn riêng |
|---|---|---|
| `frontend/` | React 18 + Vite + TypeScript + React Router | [frontend/CLAUDE.md](frontend/CLAUDE.md) |
| `backend/` | Node 20 + Express + TypeScript + Prisma + Zod + JWT | [backend/CLAUDE.md](backend/CLAUDE.md) |
| `infra/` | `docker-compose.prod.yml`, script deploy/backup/rollback, script cài server | [docs/DEPLOY.md](docs/DEPLOY.md) |
| `.github/workflows/` | Pipeline CI/CD | [docs/DEPLOY.md](docs/DEPLOY.md) |
| `docs/` | `CHECKLIST.md` (tiến độ), `TESTING.md` (kiểm thử), `DEPLOY.md` (server) | |

## Lệnh hay dùng

```bash
# Lần đầu
docker compose up -d                       # Postgres dev (:5442) + Postgres test (:5443)
cd backend && cp .env.example .env && npm install && npm run db:deploy && npm run db:seed
cd frontend && npm install

# Chạy dev (2 terminal)
cd backend && npm run dev                  # http://localhost:4000/api/health
cd frontend && npm run dev                 # http://localhost:5173 (proxy /api → :4000)

# Kiểm tra trước khi commit (chạy ở CẢ backend/ và frontend/)
npm run lint && npm run typecheck && npm test
```

Backend test cần DB test đang chạy (`docker compose up -d db-test`). Tài khoản seed: `agent@realestate.local` / `Password123!` (AGENT), `admin@realestate.local` (ADMIN).

> Cổng 5432/5433 trên máy dev đã bị dự án khác chiếm, nên dự án này dùng **5442 / 5443**.

## Quy trình làm việc (bắt buộc)

1. Mở `docs/CHECKLIST.md`, chọn hạng mục tiếp theo. Tạo nhánh `feature/<ten-ngan>` hoặc `fix/<ten-ngan>` từ `main`.
2. Viết code **kèm test** (backend: Vitest + Supertest với DB thật; frontend: Vitest + Testing Library).
3. Đổi `backend/prisma/schema.prisma` → **luôn** tạo migration: `cd backend && npm run db:migrate -- --name <mo_ta>`. CI sẽ fail nếu quên.
4. Chạy `lint + typecheck + test` ở thư mục đã sửa. Không commit khi còn đỏ.
5. Commit theo Conventional Commits: `feat(backend): ...`, `fix(frontend): ...`, `test: ...`, `chore(ci): ...`, `docs: ...`.
6. Push và mở PR vào `main` → CI chạy. Merge khi xanh → tự deploy production.
7. Tick hạng mục trong `docs/CHECKLIST.md` (ghi kèm số PR).

## Quy tắc quan trọng

- **Không bao giờ** commit `.env`, mật khẩu, private key, token. Secret production chỉ nằm ở `/opt/realestate/.env` trên server và GitHub Secrets.
- **Không** push thẳng / force push lên `main`. Không sửa migration đã merge — tạo migration mới.
- **Không** chạy lệnh làm thay đổi production (ssh vào server, `docker compose down`, xoá volume, restore DB) khi chưa được người dùng xác nhận rõ ràng.
- Mọi input từ client phải validate bằng Zod ở backend. Không tin dữ liệu từ frontend.
- Giá tiền là **VND, số nguyên** (`Decimal(15,0)`), diện tích m² (`Decimal(10,2)`); API trả về dạng `number`.
- Lỗi API thống nhất dạng `{ "error": { "message": string, "details"?: object } }`.
- Server production chỉ có **1 CPU / 1GB RAM (+2GB swap)**: không build image trên server, giữ giới hạn memory trong compose, tránh query nặng không có index/phân trang.

## Production

- Server: `206.189.146.98` (Ubuntu 24.04, Docker). App tại http://206.189.146.98
- Deploy tự động bằng GitHub Actions khi merge vào `main` (xem `docs/DEPLOY.md`).
- Rollback nhanh: `ssh deploy@206.189.146.98 'cd /opt/realestate && ./rollback.sh'`

## Slash command của dự án (`.claude/commands/`)

`/check` chạy toàn bộ lint/typecheck/test · `/feature <mô tả>` làm tính năng theo quy trình · `/migration <mô tả>` đổi schema DB an toàn · `/deploy-status` xem trạng thái CI/CD và server · `/checklist` cập nhật tiến độ.
