---
description: Làm một tính năng mới theo đúng quy trình dự án (nhánh, code, test, checklist)
argument-hint: <mô tả tính năng, vd "yêu thích tin đăng">
---

Tính năng cần làm: **$ARGUMENTS**

Thực hiện theo thứ tự, dừng lại hỏi nếu yêu cầu chưa rõ:

1. **Hiểu bối cảnh**: đọc `CLAUDE.md`, `docs/CHECKLIST.md`, và CLAUDE.md của thư mục liên quan. Tìm hạng mục tương ứng trong checklist.
2. **Lên kế hoạch ngắn** (hiển thị cho người dùng): thay đổi DB, API endpoint (method, path, quyền, body, response), màn hình FE, danh sách test case. Chờ người dùng đồng ý nếu có thay đổi DB.
3. **Tạo nhánh**: `git checkout -b feature/<ten-ngan-khong-dau>` từ `main`.
4. **Backend** (nếu có): schema → migration (`npm run db:migrate -- --name ...`) → module `schema/service/routes` → mount ở `app.ts` → integration test (thành công, 400, 401, 403, 404).
5. **Frontend** (nếu có): cập nhật `api/types.ts` + `api/*.ts` → component/page → test với Testing Library (đủ trạng thái loading / lỗi / rỗng).
6. **Kiểm tra**: chạy như lệnh `/check`. Sửa đến khi xanh hết.
7. **Checklist**: tick hạng mục trong `docs/CHECKLIST.md`; bổ sung case test tay vào `docs/TESTING.md` nếu cần.
8. **Commit** theo Conventional Commits (có thể nhiều commit nhỏ). Hỏi người dùng trước khi `git push` / mở PR.

Cuối cùng tóm tắt: file đã đổi, endpoint mới, số test thêm, việc còn lại.
