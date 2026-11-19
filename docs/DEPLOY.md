# Server & CI/CD — NhàĐất

## 1. Tổng quan

```
 Dev push nhánh ──► Pull Request ──► CI: test BE + FE, build Docker (không push)
                                         │ xanh → merge vào main
                                         ▼
 main ──► CI: test BE + FE ──► build + push image lên GHCR (tag = git sha)
                                         │
                                         ▼
                        Thông tin phiên bản chờ duyệt (Summary)
                                         │
                              ⏸  CHỜ DUYỆT TAY  (Environment "production")
                                 người duyệt bấm Approve / Reject
                                         │ Approve
                                         ▼
          SSH (user deploy) ──► /opt/realestate/deploy.sh trên server:
             1. backup DB  2. docker compose pull  3. up -d (backend tự chạy migration)
             4. health check /api/health  5. lỗi → tự rollback về tag trước
                                         │
                                         ▼
                         Smoke test từ GitHub → http://206.189.146.98
```

| Thành phần | Giá trị |
|---|---|
| Server | `206.189.146.98` — DigitalOcean, Ubuntu 24.04, 1 vCPU, 1GB RAM + 2GB swap, 24GB disk |
| Thư mục app | `/opt/realestate` (owner `deploy`) |
| User CI | `deploy` (thuộc nhóm `docker`, đăng nhập bằng SSH key, không có mật khẩu) |
| Registry | `ghcr.io/khaitruong1301/realestate-backend`, `.../realestate-frontend` |
| Cổng mở | 22 (SSH), 80 (HTTP), 443 (dành cho HTTPS sau này) |
| Workflow | `.github/workflows/ci-cd.yml` |

## 2. Duyệt tay trước khi deploy (manual approval)

Mỗi lần có commit vào `main`, pipeline **tự chạy test và build**, nhưng **không tự deploy** — nó dừng ở job *Deploy · production (cần duyệt tay)* và chờ người duyệt.

### Cách duyệt

1. Vào tab **Actions** của repo → chọn lần chạy đang có biểu tượng ⏸ màu vàng (*Waiting*).
   GitHub cũng gửi email/notification cho người duyệt.
2. Đọc phần **Summary** → mục *"⏸ Chờ duyệt deploy lên production"*: commit, người push, danh sách commit, link so sánh thay đổi, cảnh báo nếu có migration DB.
3. Bấm nút **Review deployments** (thanh vàng phía trên sơ đồ job).
4. Tick **production** → ghi chú (tuỳ chọn) → **Approve and deploy** hoặc **Reject**.
5. Theo dõi job Deploy chạy từng bước: copy file → `deploy.sh` (backup, pull, up, health check) → smoke test. Xong sẽ có link **http://206.189.146.98** ngay trên sơ đồ.

Lịch sử ai duyệt, lúc nào, phiên bản nào: tab **Code → Environments → production** (hoặc `Settings → Environments`).

### Trước khi bấm Approve, tự hỏi

- [ ] Tất cả job test/build trước đó đều xanh?
- [ ] Danh sách commit đúng là thứ mình muốn lên production?
- [ ] Có migration DB? Đã đọc SQL, không có DROP/RENAME gây mất dữ liệu?
- [ ] Đang giờ ít người dùng (nếu thay đổi lớn)?

Nếu Reject hoặc để quá 30 ngày, lần chạy đó bị huỷ, production giữ nguyên phiên bản cũ. Có nhiều lần chạy cùng chờ duyệt thì GitHub chỉ giữ lần **mới nhất**.

### Cấu hình (đã làm sẵn, ghi lại để biết)

`Settings → Environments → production`:
- **Required reviewers**: `khaitruong1301` (thêm tối đa 6 người/team)
- **Deployment branches**: chỉ `main`
- Tuỳ chọn: *Wait timer* (chờ N phút sau khi duyệt), *Prevent self-review* (khi có ≥ 2 reviewer)

Tắt duyệt tay (deploy tự động hoàn toàn): bỏ Required reviewers trong environment, không cần sửa workflow.

## 3. Secrets & variables trên GitHub

`Settings → Secrets and variables → Actions`:

| Loại | Tên | Nội dung |
|---|---|---|
| Variable | `DEPLOY_HOST` | `206.189.146.98` |
| Variable | `DEPLOY_USER` | `deploy` |
| Secret | `DEPLOY_SSH_KEY` | private key `realestate_ci` (public key đã nằm trong `/home/deploy/.ssh/authorized_keys`) |
| Secret | `DEPLOY_KNOWN_HOSTS` | fingerprint SSH của server (chống giả mạo server) |
| Tự có | `GITHUB_TOKEN` | push/pull image GHCR |

Secret của **ứng dụng** (mật khẩu DB, JWT) **không** nằm trên GitHub — chỉ ở `/opt/realestate/.env` trên server (quyền 600, owner deploy), mẫu ở `.env.production.example`.

## 4. Thao tác thường dùng trên server

```bash
ssh deploy@206.189.146.98          # key: ~/.ssh/realestate_ci (CI) hoặc ~/.ssh/deploy_realestate (root)
cd /opt/realestate
C="docker compose -f docker-compose.prod.yml --env-file .env"

$C ps                               # trạng thái container
$C logs -f --tail=100 backend       # log backend
docker stats --no-stream            # RAM/CPU
cat .current_tag .previous_tag      # phiên bản đang chạy / trước đó
./rollback.sh                       # quay về phiên bản trước
./rollback.sh <git-sha>             # quay về phiên bản cụ thể
./backup-db.sh manual               # backup tay
$C exec db psql -U realestate       # vào psql
$C exec backend npx prisma db seed  # (không dùng trên prod thật) seed dữ liệu mẫu
```

Deploy lại thủ công không qua GitHub (khẩn cấp):
```bash
TAG=<git-sha-đầy-đủ> ./deploy.sh
```

## 5. Backup & restore

- `deploy.sh` tự backup trước **mỗi** lần deploy → `backups/realestate-<thời gian>-pre-deploy-<sha>.sql.gz`.
- Backup hằng ngày (chưa bật — Phase 0): `crontab -e` với user deploy:
  ```
  0 2 * * * /opt/realestate/backup-db.sh daily >> /opt/realestate/backups/cron.log 2>&1
  ```
- Backup cũ hơn 14 ngày tự xoá. **Backup đang nằm cùng server** → cần đẩy ra ngoài (Phase 4).
- Restore (⚠️ ghi đè dữ liệu hiện tại — backup trước):
  ```bash
  gunzip -c backups/<file>.sql.gz | docker compose -f docker-compose.prod.yml --env-file .env exec -T db psql -U realestate -d realestate
  ```

## 6. Bảo mật server — việc cần làm tay

Server hiện **vẫn cho phép đăng nhập root bằng mật khẩu** (mật khẩu đã từng được gửi qua chat). Nên làm ngay:

1. Kiểm tra đăng nhập bằng key OK: `ssh -i ~/.ssh/deploy_realestate root@206.189.146.98 'echo ok'`
2. Đổi mật khẩu root: `passwd` (giữ làm phương án dự phòng qua console DigitalOcean).
3. Tắt đăng nhập bằng mật khẩu:
   ```bash
   sudo tee /etc/ssh/sshd_config.d/99-hardening.conf <<'EOF'
   PasswordAuthentication no
   PermitRootLogin prohibit-password
   EOF
   sudo systemctl reload ssh
   ```
   Giữ phiên SSH hiện tại, mở **phiên mới** kiểm tra đăng nhập được rồi mới thoát.

## 7. Cài lại server từ đầu

```bash
scp infra/server/setup-server.sh root@<ip>:/root/
ssh root@<ip> "CI_PUBKEY='$(cat ~/.ssh/realestate_ci.pub)' bash /root/setup-server.sh"
# Tạo /opt/realestate/.env từ .env.production.example (sinh secret: openssl rand -base64 32)
# Cập nhật DEPLOY_HOST + DEPLOY_KNOWN_HOSTS (ssh-keyscan <ip>) trên GitHub, rồi chạy lại workflow.
```

## 8. Xử lý sự cố

| Triệu chứng | Kiểm tra |
|---|---|
| Job Deploy treo ở *Waiting* | Bình thường — đang chờ duyệt tay (mục 2) |
| `Permission denied (publickey)` | Secret `DEPLOY_SSH_KEY` sai / thiếu dòng cuối; `authorized_keys` của user deploy |
| `Host key verification failed` | Server cài lại → cập nhật `DEPLOY_KNOWN_HOSTS` |
| `denied` khi pull image | Package GHCR chưa liên kết repo; kiểm tra `permissions: packages: read` |
| Health check fail, đã rollback | Xem log backend trong output job; thường do migration lỗi hoặc thiếu biến `.env` |
| Server chậm / OOM | `free -h`, `docker stats`; 1GB RAM là rất sát — nâng droplet |
| CI fail "chưa tạo migration" | `cd backend && npm run db:migrate -- --name <ten>` rồi commit thư mục migration |
