---
description: Chạy toàn bộ lint, typecheck, test, build cho backend và frontend (giống CI)
allowed-tools: Bash(docker compose up:*), Bash(npm run *), Bash(npm test), Bash(npx prisma migrate deploy), Bash(git status:*)
---

Chạy kiểm tra giống hệt pipeline CI, báo cáo ngắn gọn.

1. `docker compose up -d --wait db-test` (đảm bảo DB test chạy).
2. Backend (`cd backend`): `DATABASE_URL=postgresql://postgres:postgres@localhost:5443/realestate_test npx prisma migrate deploy`, rồi `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
3. Frontend (`cd frontend`): `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
4. Báo kết quả dạng bảng: bước | backend | frontend (✅/❌). Với mỗi lỗi: file:dòng + nguyên nhân + cách sửa đề xuất.

Không tự sửa code trừ khi người dùng yêu cầu. $ARGUMENTS
