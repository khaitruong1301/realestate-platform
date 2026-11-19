---
description: Xem trạng thái pipeline CI/CD gần nhất và sức khoẻ server production
allowed-tools: Bash(gh run list:*), Bash(gh run view:*), Bash(curl -fsS http://206.189.146.98/api/health), Bash(git log:*)
---

1. `gh run list --workflow=ci-cd.yml --limit 5` — liệt kê 5 lần chạy gần nhất (nhánh, commit, trạng thái, thời gian).
2. Nếu lần gần nhất trên `main` bị fail: `gh run view <id> --log-failed`, tóm tắt job/step lỗi và nguyên nhân khả dĩ, đề xuất cách sửa.
3. `curl -fsS http://206.189.146.98/api/health` — kiểm tra production đang sống và DB up.
4. So sánh commit đang chạy production (job deploy thành công gần nhất) với `git log origin/main -1`.

Báo cáo ngắn: CI ✅/❌, production ✅/❌, phiên bản đang chạy, việc cần làm.
Chỉ ssh vào server khi người dùng đồng ý (xem log: `ssh deploy@206.189.146.98 'cd /opt/realestate && docker compose -f docker-compose.prod.yml logs --tail=100 backend'`).
