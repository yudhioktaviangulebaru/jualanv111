#!/usr/bin/env bash
#
# Deploy frontend ke VM tanpa build di VM.
# Image di-build di mesin ini (yang punya .env) → .env ter-bake ke bundle →
# dikirim ke VM via SSH → container di-restart. VM tidak perlu .env / Node.
#
set -euo pipefail

# ===== Sesuaikan dengan VM-mu =====
VM="user@IP_VM"                   # mis. yudhi@34.101.12.34
REMOTE_DIR="~/jualanapp/frontend" # lokasi docker-compose.yml di VM
IMAGE="jualanapp-frontend"
# ==================================

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "❌ .env tidak ada di $(pwd). Build butuh .env (VITE_*)."
  exit 1
fi

echo "==> 1/3 Build image (memakai .env lokal)…"
docker compose build

echo "==> 2/3 Kirim image ke $VM…"
docker save "$IMAGE" | gzip | ssh "$VM" 'gunzip | docker load'

echo "==> 3/3 Restart container di VM…"
ssh "$VM" "cd $REMOTE_DIR && docker compose up -d --force-recreate"

echo "✅ Selesai. Cek: https://jualan.yudhioktaviangule.web.id/login"
