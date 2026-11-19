---
description: Rà soát và cập nhật tiến độ trong docs/CHECKLIST.md dựa trên code thực tế
allowed-tools: Read, Edit, Grep, Glob, Bash(git log:*), Bash(gh pr list:*)
---

1. Đọc `docs/CHECKLIST.md`.
2. Với mỗi hạng mục chưa tick, kiểm tra code/test/git log xem đã thực sự xong chưa (có code + có test + CI xanh). Chỉ tick khi có bằng chứng; ghi kèm `(PR #x)` hoặc commit hash nếu tìm được.
3. Cập nhật bảng "Tổng quan tiến độ" (số mục xong / tổng mỗi phase).
4. Báo cho người dùng: đã tick gì, phase hiện tại, 3 việc nên làm tiếp theo theo thứ tự ưu tiên.

$ARGUMENTS
