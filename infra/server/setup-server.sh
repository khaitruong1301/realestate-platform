#!/usr/bin/env bash
# Cài đặt server Ubuntu 24.04 cho dự án bất động sản (chạy 1 lần với quyền root).
# Idempotent: chạy lại nhiều lần không sao.
# Dùng: CI_PUBKEY="ssh-ed25519 AAAA..." bash setup-server.sh
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
APP_DIR=/opt/realestate
DEPLOY_USER=deploy

echo "==> [1/8] Swap 2GB (server chỉ 1GB RAM)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10 && echo 'vm.swappiness=10' > /etc/sysctl.d/99-swap.conf
fi

echo "==> [2/8] Cập nhật hệ thống + gói cơ bản"
apt-get update -y
apt-get upgrade -y -o Dpkg::Options::="--force-confold"
apt-get install -y ca-certificates curl gnupg git ufw fail2ban unattended-upgrades htop jq

echo "==> [3/8] Docker Engine + Compose plugin (repo chính thức)"
if ! command -v docker >/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'JSON'
{ "log-driver": "json-file", "log-opts": { "max-size": "10m", "max-file": "3" } }
JSON
systemctl enable --now docker && systemctl restart docker

echo "==> [4/8] User deploy (dùng cho GitHub Actions)"
id -u $DEPLOY_USER >/dev/null 2>&1 || adduser --disabled-password --gecos "" $DEPLOY_USER
usermod -aG docker $DEPLOY_USER
install -d -m 700 -o $DEPLOY_USER -g $DEPLOY_USER /home/$DEPLOY_USER/.ssh
touch /home/$DEPLOY_USER/.ssh/authorized_keys
if [ -n "${CI_PUBKEY:-}" ] && ! grep -qF "$CI_PUBKEY" /home/$DEPLOY_USER/.ssh/authorized_keys; then
  echo "$CI_PUBKEY" >> /home/$DEPLOY_USER/.ssh/authorized_keys
fi
chown $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh/authorized_keys && chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys

echo "==> [5/8] Thư mục ứng dụng $APP_DIR"
install -d -m 750 -o $DEPLOY_USER -g $DEPLOY_USER $APP_DIR $APP_DIR/backups

echo "==> [6/8] Firewall UFW: chỉ mở 22, 80, 443"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> [7/8] fail2ban (chống brute-force SSH) + tự cập nhật bảo mật"
cat > /etc/fail2ban/jail.local <<'JAIL'
[sshd]
enabled = true
maxretry = 5
findtime = 10m
bantime = 1h
JAIL
systemctl enable --now fail2ban && systemctl restart fail2ban
dpkg-reconfigure -f noninteractive unattended-upgrades

echo "==> [8/8] Tắt SSH bằng mật khẩu (chỉ khi root đã có SSH key, tránh tự khoá mình)"
if [ -s /root/.ssh/authorized_keys ]; then
  # Tên 00- để được đọc TRƯỚC 50-cloud-init.conf (sshd lấy giá trị đầu tiên)
  printf '%s\n' "PasswordAuthentication no" "KbdInteractiveAuthentication no" "PermitRootLogin prohibit-password" \
    > /etc/ssh/sshd_config.d/00-hardening.conf
  sshd -t && systemctl reload ssh
  sshd -T | grep -iE '^(passwordauthentication|permitrootlogin) '
else
  echo "⚠️  /root/.ssh/authorized_keys trống -> GIỮ đăng nhập mật khẩu. Thêm key rồi chạy lại script."
fi

echo "==> XONG"
docker --version; docker compose version; ufw status | head -8; free -h | grep -i swap
