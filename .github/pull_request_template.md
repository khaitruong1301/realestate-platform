## Mô tả thay đổi
<!-- Làm gì, vì sao. Link issue: Closes #... -->

## Loại thay đổi
- [ ] Tính năng mới
- [ ] Sửa lỗi
- [ ] Refactor / chore
- [ ] Thay đổi DB (có migration)

## Checklist trước khi merge
- [ ] Đã chạy `npm run lint && npm run typecheck && npm test` ở `backend/` và `frontend/`
- [ ] Có test cho logic mới / bug vừa sửa
- [ ] Đổi `schema.prisma` → đã tạo migration (`npm run db:migrate -- --name ...`)
- [ ] Không commit secret / file `.env`
- [ ] Đã cập nhật `docs/CHECKLIST.md` nếu xong một hạng mục
- [ ] Đã test tay theo `docs/TESTING.md` (phần liên quan)

## Ảnh chụp / video (nếu đổi UI)
