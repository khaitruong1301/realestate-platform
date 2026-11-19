# Checklist dự án NhàĐất

Quy ước: `[x]` xong (có code + test + CI xanh) · `[ ]` chưa làm · `[~]` đang làm. Ghi số PR khi tick, vd `(PR #12)`.
Cập nhật bằng lệnh `/checklist` trong Claude Code.

## Tổng quan tiến độ

| Phase | Nội dung | Tiến độ |
|---|---|---|
| 0 | Nền tảng: repo, server, Docker, CI/CD | 16/25 |
| 1 | MVP: xem & tìm kiếm tin đăng | 8/12 |
| 2 | Tài khoản & quản lý tin đăng | 2/12 |
| 3 | Ảnh, bản đồ, SEO | 0/10 |
| 4 | Vận hành production | 0/11 |

---

## Phase 0 — Nền tảng

### Repo & môi trường dev
- [x] Monorepo `frontend/` + `backend/` + `infra/` + `docs/`
- [x] `CLAUDE.md` gốc + `backend/CLAUDE.md` + `frontend/CLAUDE.md`
- [x] `.claude/` — settings (quyền), slash commands, subagents
- [x] `docker-compose.yml` dev: Postgres dev (5442) + Postgres test (5443, tmpfs)
- [x] ESLint + TypeScript strict cho BE và FE
- [x] Seed dữ liệu mẫu (`npm run db:seed`)

### Server 206.189.146.98
- [x] Đăng nhập bằng SSH key (key riêng cho dự án)
- [x] Swap 2GB (server 1GB RAM)
- [x] Docker Engine + Compose plugin
- [x] UFW firewall: chỉ mở 22, 80, 443
- [x] fail2ban chống brute-force SSH
- [x] Tự động cập nhật bản vá bảo mật (unattended-upgrades)
- [x] User `deploy` (nhóm docker) cho CI, thư mục `/opt/realestate`
- [x] File `/opt/realestate/.env` với secret ngẫu nhiên
- [ ] **Tắt đăng nhập SSH bằng mật khẩu + đổi mật khẩu root** (làm tay, xem DEPLOY.md §6)
- [ ] Cron backup DB hằng ngày (xem DEPLOY.md §5)

### CI/CD (GitHub Actions) — repo: github.com/khaitruong1301/realestate-platform
- [x] Repo public, variables `DEPLOY_HOST`/`DEPLOY_USER`, secret `DEPLOY_KNOWN_HOSTS`
- [x] Environment `production` có Required reviewer (duyệt tay), chỉ cho nhánh `main`
- [ ] Secret `DEPLOY_SSH_KEY` (bạn tự thêm — xem DEPLOY.md §3)
- [~] Job test backend (Postgres service, lint, typecheck, kiểm tra quên migration, test + coverage, build)
- [~] Job test frontend (lint, typecheck, test, build)
- [~] Build image Docker, push GHCR khi merge `main`
- [~] Job "Thông tin phiên bản chờ duyệt" + dừng chờ Approve
- [~] Deploy qua SSH: backup DB → pull → up → health check → tự rollback
- [~] Smoke test sau deploy

## Phase 1 — MVP: xem & tìm kiếm

- [x] DB schema: User, Property, PropertyImage, Inquiry + index
- [x] API danh sách tin: lọc (từ khoá, thành phố, quận, loại, hình thức, giá, diện tích, phòng ngủ), sắp xếp, phân trang
- [x] API chi tiết tin theo id hoặc slug
- [x] API gửi yêu cầu tư vấn (inquiry)
- [x] Trang chủ: bộ lọc + lưới tin + phân trang, bộ lọc lưu trên URL
- [x] Trang chi tiết: ảnh, thông tin, mô tả, môi giới, form tư vấn
- [x] Trang 404
- [x] Unit + integration test BE (23 test), component test FE (16 test)
- [ ] Rate limit cho API public (`express-rate-limit`), đặc biệt inquiry & login
- [ ] Danh sách tỉnh/thành, quận/huyện chuẩn (dropdown thay vì gõ tay)
- [ ] Trạng thái loading dạng skeleton, ảnh lỗi fallback
- [ ] Test E2E (Playwright): tìm kiếm → xem chi tiết → gửi tư vấn

## Phase 2 — Tài khoản & quản lý tin

- [x] API đăng ký / đăng nhập / `me` (JWT, bcrypt)
- [x] API tạo / sửa / xoá tin (phân quyền AGENT/ADMIN, chủ tin)
- [ ] FE: trang đăng ký, đăng nhập, đăng xuất, AuthContext, route cần đăng nhập
- [ ] FE: "Tin của tôi" — danh sách tin của môi giới
- [ ] FE: form đăng / sửa tin (validate phía client)
- [ ] FE: quản lý yêu cầu tư vấn, đánh dấu đã xử lý (API `PATCH /inquiries/:id`)
- [ ] Yêu thích tin đăng (model Favorite + API + nút tim)
- [ ] Nâng cấp USER → AGENT (admin duyệt)
- [ ] Trang admin: duyệt/ẩn tin, quản lý user
- [ ] Refresh token hoặc httpOnly cookie thay vì localStorage
- [ ] Quên mật khẩu qua email
- [ ] Ghi log hành động quan trọng (audit log)

## Phase 3 — Ảnh, bản đồ, SEO

- [ ] Upload ảnh (S3 / DigitalOcean Spaces / Cloudinary), resize + nén
- [ ] Gallery ảnh có lightbox
- [ ] Bản đồ vị trí (Leaflet + OpenStreetMap) trên trang chi tiết
- [ ] Tìm theo bản đồ / bán kính
- [ ] Full-text search tiếng Việt (Postgres `unaccent` + `pg_trgm`)
- [ ] SEO: meta title/description động, Open Graph, `sitemap.xml`, `robots.txt`
- [ ] Cân nhắc SSR/prerender (Next.js hoặc prerender trang chi tiết)
- [ ] Tin tương tự trên trang chi tiết
- [ ] Đếm lượt xem tin
- [ ] Lighthouse ≥ 90 (performance, a11y, SEO)

## Phase 4 — Vận hành production

- [ ] Tên miền + HTTPS (Caddy hoặc certbot), redirect HTTP → HTTPS
- [ ] Cập nhật `CORS_ORIGIN` theo domain
- [ ] Cron backup DB hằng ngày + đẩy bản backup ra ngoài server (Spaces/S3)
- [ ] Diễn tập restore DB từ backup (ghi lại thời gian)
- [ ] Giám sát uptime (UptimeRobot / BetterStack) gọi `/api/health`
- [ ] Log tập trung / giữ log (Docker log đã giới hạn 10MB×3)
- [ ] Theo dõi lỗi (Sentry) cho BE và FE
- [ ] Môi trường staging (nhánh `develop` → server staging)
- [ ] GitHub branch protection cho `main`: bắt buộc PR + CI xanh
- [ ] Nâng server lên ≥ 2GB RAM khi có traffic thật
- [ ] Kiểm thử tải (k6) cho API danh sách
