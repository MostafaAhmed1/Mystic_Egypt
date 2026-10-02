#!/usr/bin/env bash
# scripts/release.sh — SERVER-side release install (artifact-based deploy, Sept 2026).
#
# Takes the locally-built tarball produced by scripts/package-release.ps1, extracts
# it into /var/www/mysticegypt/releases/<tag>/app, builds the slim Docker image
# (Dockerfile.deploy — packaging ONLY, ~seconds, no compile), then swaps the
# running container with the EXACT prod run flags (see MANUAL_STEPS.md §5).
#
# Downtime: only the seconds of `docker rm -f` + `docker run`. The image is ready
# before the swap, and the previous image is kept as mystic-egypt-new:previous for
# instant rollback.
#
# Usage (run on the VPS, outlives ssh):
#   bash scripts/release.sh /tmp/mystic-egypt-<tag>.tar.gz
set -u

TARBALL="${1:-}"
if [ -z "$TARBALL" ] || [ ! -f "$TARBALL" ]; then
  echo "FATAL: tarball not found: ${TARBALL:-<none>}" >&2
  exit 1
fi

LOG=/tmp/mystic-release.log
STATUS=/tmp/mystic-release.status
PID_FILE=/tmp/mystic-release.pid
APP=/var/www/mysticegypt

log_status() { printf '%s  %s\n' "$(date -u +%H:%M:%S)" "$*" >> "$STATUS"; }

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  log_status "ALREADY_RUNNING pid=$(cat "$PID_FILE") — aborting"
  exit 1
fi

# run the whole flow detached; the caller polls the status file (never blocks ssh)
if [ "${DETACHED:-0}" != "1" ]; then
  exec setsid env DETACHED=1 bash "$0" "$TARBALL" > "$LOG" 2>&1 < /dev/null &
  echo "LAUNCHED pid=$!"
  exit 0
fi
echo $$ > "$PID_FILE"
trap 'rm -f "$PID_FILE"' EXIT

basename_only=$(basename "$TARBALL")
tag=${basename_only%.tar.gz}
tag=${tag#mystic-egypt-}
RELEASE_DIR="$APP/releases/$tag"
APP_DIR="$RELEASE_DIR/app"

log_status "PHASE=extract tag=$tag START"
# wipe first: same-tag redeploys must not keep stale files from the old bundle
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
tar -xzf "$TARBALL" -C "$APP_DIR"
cd "$APP_DIR" || { log_status "FATAL cannot cd $APP_DIR"; exit 1; }

# sanity — the bundle must look like a standalone Next build
for need in server.js .next/server .next/static public; do
  if [ ! -e "$need" ]; then
    log_status "FATAL bundle missing $need in $APP_DIR"; exit 1
  fi
done
# ensure empty uploads mountpoint exists so the bind mount is not root-owned
mkdir -p public/uploads/receipts public/uploads/tours public/uploads/stock

# host bind-mount source: the container app user (uid 1001) must own it, or every
# upload fails with EACCES (mkdir/write under data/uploads). Enforce each release.
HOST_UPLOADS="$APP/data/uploads"
mkdir -p "$HOST_UPLOADS/receipts" "$HOST_UPLOADS/tours" "$HOST_UPLOADS/stock"
chown -R 1001:1001 "$HOST_UPLOADS"
find "$HOST_UPLOADS" -type d -exec chmod 755 {} +
find "$HOST_UPLOADS" -type f -exec chmod 644 {} +

log_status "PHASE=build-image START (Dockerfile.deploy — packaging only)"
# keep the current image for instant rollback
docker tag mystic-egypt-new:latest mystic-egypt-new:previous >/dev/null 2>&1 || true
# -f points at the repo-root Dockerfile.deploy (absolute); the CONTEXT is the bundle
# dir ($APP_DIR has no .dockerignore, so .next/node_modules/ are NOT excluded —
# the repo-root .dockerignore would wrongly exclude them).
if ! docker build -f "$APP/Dockerfile.deploy" -t mystic-egypt-new:latest "$APP_DIR" >> "$LOG" 2>&1; then
  log_status "PHASE=build-image FAILED — see $LOG (tail: $(tail -n 3 "$LOG" | tr '\n' ' '))"
  exit 1
fi
log_status "PHASE=build-image DONE — new image mystic-egypt-new:latest"

log_status "PHASE=swap START (docker rm -f + docker run)"
docker rm -f mystic-egypt >/dev/null 2>&1
if ! docker run -d --name mystic-egypt --restart unless-stopped \
     -p 3100:3000 \
     --add-host host.docker.internal:host-gateway \
     --env-file /var/www/mysticegypt/.env.container \
     -v /var/www/mysticegypt/data/uploads:/app/public/uploads \
     mystic-egypt-new:latest >> "$LOG" 2>&1; then
  log_status "PHASE=swap FAILED — container may be down; previous image kept (docker tag previous)"
  exit 1
fi
log_status "PHASE=swap done — waiting 15s for app boot"
sleep 15

log_status "PHASE=verify"
for u in /en /en/tours /en/tours/fayoum; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "http://localhost:3100$u" || echo 000)
  log_status "  $u -> $code"
done

log_status "RELEASE_COMPLETE tag=$tag"
log_status "ROLLBACK: docker rm -f mystic-egypt && docker tag mystic-egypt-new:previous mystic-egypt-new:latest && docker run -d --name mystic-egypt --restart unless-stopped -p 3100:3000 --add-host host.docker.internal:host-gateway --env-file /var/www/mysticegypt/.env.container -v /var/www/mysticegypt/data/uploads:/app/public/uploads mystic-egypt-new:latest"