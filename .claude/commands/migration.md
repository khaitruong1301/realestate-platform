---
description: Thay đổi schema database an toàn (Prisma migration) và kiểm tra ảnh hưởng production
argument-hint: <mô tả thay đổi, vd "thêm cột views vào Property">
---

Thay đổi DB: **$ARGUMENTS**

1. Sửa `backend/prisma/schema.prisma`. Chạy `npx prisma format` và `npx prisma validate`.
2. Đánh giá rủi ro với dữ liệu production **trước khi** tạo migration, báo cho người dùng:
   - Thêm cột NOT NULL vào bảng có dữ liệu → phải có `@default` hoặc làm 2 bước (nullable → backfill → NOT NULL).
   - Đổi tên cột/bảng → Prisma sẽ DROP + ADD (mất dữ liệu!). Phải sửa SQL thành `ALTER ... RENAME`.
   - Xoá cột/bảng → xác nhận với người dùng.
   - Thêm index trên bảng lớn → cân nhắc `CREATE INDEX CONCURRENTLY` (sửa tay SQL).
3. `cd backend && npm run db:migrate -- --name <snake_case_mo_ta>` (DB dev cổng 5442).
4. Mở file `prisma/migrations/<timestamp>_<ten>/migration.sql` vừa tạo, đọc và giải thích SQL cho người dùng.
5. Cập nhật code dùng model, `tests/helpers.ts` (TRUNCATE nếu thêm bảng), seed nếu cần.
6. Áp migration vào DB test và chạy test: `DATABASE_URL=postgresql://postgres:postgres@localhost:5443/realestate_test npx prisma migrate deploy && npm test`.
7. Nhắc: migration chạy tự động khi container backend khởi động trên production; `deploy.sh` backup DB trước mỗi lần deploy. Migration **không** tự rollback.

KHÔNG dùng `prisma db push` hay `prisma migrate reset` trên bất kỳ DB nào ngoài dev.
