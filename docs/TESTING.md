# Kiểm thử — NhàĐất

## 1. Các tầng test

| Tầng | Công cụ | Ở đâu | Chạy khi |
|---|---|---|---|
| Unit BE | Vitest | `backend/tests/unit/` | local + CI |
| Integration BE (API + DB thật) | Vitest + Supertest + Postgres | `backend/tests/integration/` | local + CI |
| Component FE | Vitest + Testing Library + jsdom | `frontend/src/**/*.test.tsx` | local + CI |
| Kiểm tra migration | `prisma migrate diff --exit-code` | CI job backend | CI |
| Build Docker | buildx | CI job docker | CI (cả PR) |
| Smoke test production | curl | CI job deploy | sau mỗi deploy |
| E2E | Playwright *(chưa có — Phase 1)* | `e2e/` | CI trước deploy |
| Test tay | checklist bên dưới | — | trước khi merge tính năng lớn / sau deploy |

## 2. Chạy test

```bash
docker compose up -d --wait db-test

cd backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5443/realestate_test npx prisma migrate deploy   # lần đầu / khi có migration mới
npm test                  # hoặc npm run test:coverage
npx vitest run tests/integration/properties.test.ts -t "lọc"   # chạy 1 file / 1 nhóm

cd ../frontend
npm test
```

DB test chạy trên tmpfs: `docker compose restart db-test` là sạch hoàn toàn (nhớ migrate lại).

## 3. Quy tắc viết test

- Mỗi endpoint mới: **thành công + 400 + 401 + 403 + 404** (case nào áp dụng).
- Mỗi bug sửa: thêm 1 test tái hiện bug trước, rồi mới sửa.
- Test độc lập, không phụ thuộc thứ tự: `beforeEach(resetDb)`.
- Không mock Prisma trong integration test — dùng DB thật để bắt lỗi SQL/constraint.
- FE: test hành vi người dùng thấy (text, role, label), không test state nội bộ.
- Mục tiêu coverage backend: ≥ 80% cho `src/modules/**`.

## 4. Checklist test tay (trước release / sau deploy)

Ghi kết quả vào PR hoặc issue release. Môi trường: ☐ local ☐ production http://206.189.146.98

### Trang chủ & tìm kiếm
- [ ] Trang chủ tải < 3s, hiển thị danh sách tin, đếm số kết quả đúng
- [ ] Lọc "Cho thuê" → chỉ hiện tin thuê, giá có "/tháng"
- [ ] Lọc loại BĐS (Căn hộ, Nhà phố, ...) đúng
- [ ] Lọc khoảng giá: giá từ > giá đến → báo lỗi, không crash
- [ ] Tìm từ khoá có dấu và không dấu ("phú nhuận", "Phu Nhuan"*)
- [ ] Sắp xếp giá tăng / giảm đúng thứ tự
- [ ] Phân trang: Trước/Sau, số trang đúng; nút bị disable ở trang đầu/cuối
- [ ] Copy URL có bộ lọc sang tab mới → giữ nguyên bộ lọc; nút Back trình duyệt hoạt động
- [ ] Không có kết quả → hiện thông báo thân thiện

\* tìm không dấu chưa hỗ trợ — Phase 3 (`unaccent`)

### Trang chi tiết
- [ ] Mở từ thẻ tin → URL dạng `/bat-dong-san/<slug>`
- [ ] Hiện đủ: ảnh, giá, diện tích, loại, phòng ngủ/tắm, địa chỉ, mô tả, môi giới
- [ ] Tiêu đề tab trình duyệt = tiêu đề tin
- [ ] Slug sai → "Tin đăng không tồn tại", có link về trang chủ
- [ ] F5 trên trang chi tiết không bị 404 (nginx SPA fallback)

### Form tư vấn
- [ ] Bỏ trống họ tên / SĐT → trình duyệt chặn
- [ ] SĐT sai định dạng (vd "123") → hiện lỗi từ server
- [ ] Gửi hợp lệ → "Đã gửi!"; kiểm tra bản ghi trong DB / API `/api/inquiries` (tài khoản agent)
- [ ] Nút bị disable khi đang gửi (không gửi trùng)

### API & bảo mật
- [ ] `GET /api/health` → `{"status":"ok","db":"up"}`
- [ ] Tạo tin không có token → 401; token USER → 403
- [ ] AGENT A không sửa/xoá được tin của AGENT B → 403
- [ ] Response user không bao giờ có `passwordHash`
- [ ] `limit=1000` → 400 (tối đa 50)
- [ ] Cổng 5432 và 4000 **không** truy cập được từ internet: `nc -zv 206.189.146.98 5432` phải fail

### Responsive & trình duyệt
- [ ] Mobile 375px: bộ lọc xuống dòng, lưới 1 cột, form tư vấn dưới nội dung
- [ ] Tablet 768px, desktop 1440px
- [ ] Chrome, Safari (iOS), Firefox

### Sau deploy production
- [ ] GitHub Actions xanh hết 5 job, có summary "Đã deploy <sha>"
- [ ] Trang chủ + 1 trang chi tiết mở được
- [ ] Gửi thử 1 yêu cầu tư vấn
- [ ] `ssh deploy@206.189.146.98 'ls -lt /opt/realestate/backups | head -3'` có bản backup pre-deploy
- [ ] `docker stats --no-stream` trên server: RAM mỗi container dưới giới hạn
