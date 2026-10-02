#!/usr/bin/env bash
# deploy.sh — codified Mystic Egypt production deploy (runbook: MANUAL_STEPS.md §6/§7).
# Safety: never loops in the client shell — run this detached; poll /tmp/deploy.status.
set -u

LOG=/tmp/mystic-build.log
PID_FILE=/tmp/mystic-build.pid
STATUS=/tmp/mystic-deploy.status
RUN_FOREVER="docker run -d --name mystic-egypt --restart unless-stopped -p 3100:3000 --add-host host.docker.internal:host-gateway --env-file /var/www/mysticegypt/.env.container -v /var/www/mysticegypt/data/uploads:/app/public/uploads mystic-egypt-new:latest"

log_status() {
  printf '%s  %s\n' "$(date -u +%H:%M:%S)" "$*" > "$STATUS"
}

cleanup() {
  rm -f "$PID_FILE"
}
trap cleanup EXIT

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  log_status "ALREADY_RUNNING pid=$(cat "$PID_FILE") — aborting; remove $PID_FILE to force"
  exit 1
fi

log_status "PHASE=build START $(date -u +%Y-%m-%dT%H:%M:%SZ)"

cd /var/www/mysticegypt || { log_status "FATAL cannot cd /var/www/mysticegypt"; exit 1; }

docker build -t mystic-egypt-new . > "$LOG" 2>&1 &
BUILD_PID=$!
echo "$BUILD_PID" > "$PID_FILE"
log_status "PHASE=build RUNNING pid=$BUILD_PID (started $(date -u +%H:%M:%SZ))"

while kill -0 "$BUILD_PID" 2>/dev/null; do
  sleep 30
done
wait "$BUILD_PID"; RC=$?

rm -f "$PID_FILE"

if [ "$RC" -ne 0 ]; then
  log_status "PHASE=build FAILED rc=$RC — see $LOG (tail: $(tail -n 3 "$LOG" | tr '\n' ' '))"
  exit 1
fi
if ! grep -q "Successfully tagged" "$LOG"; then
  log_status "PHASE=build FAILED no 'Successfully tagged' in $LOG"
  exit 1
fi

log_status "PHASE=build DONE (~$(grep -c 'Step' "$LOG") steps; image mystic-egypt-new:latest)"
log_status "PHASE=recreate starting"

docker rm -f mystic-egypt >/dev/null 2>&1
if ! docker run -d --name mystic-egypt --restart unless-stopped -p 3100:3000 \
     --add-host host.docker.internal:host-gateway \
     --env-file /var/www/mysticegypt/.env.container \
     -v /var/www/mysticegypt/data/uploads:/app/public/uploads \
     mystic-egypt-new:latest; then
  log_status "PHASE=recreate FAILED — container may be down; see docker logs"
  exit 1
fi

log_status "PHASE=recreate done — waiting 15s for app boot"
sleep 15

for u in /en /en/tours /en/tours/fayoum; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "http://localhost:3100$u" || echo 000)
  log_status "PHASE=verify $u -> $code"
done

log_status "DEPLOY_COMPLETE $(date -u +%Y-%m-%dT%H:%M:%SZ)"