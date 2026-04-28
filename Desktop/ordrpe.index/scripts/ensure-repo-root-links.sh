#!/usr/bin/env bash
# Recreates symlinks at the git repo root so Vercel serves the static bundle from
# Desktop/ordrpe.index/ordrpe/ (single source of truth). Safe to run after clone.

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THIS_PKG="$(cd "$SCRIPT_DIR/.." && pwd)"
ROOT="$(git -C "$THIS_PKG" rev-parse --show-toplevel)"
SITE_REL="Desktop/ordrpe.index/ordrpe"
SITE="$ROOT/$SITE_REL"

if [[ ! -f "$SITE/index.html" ]]; then
  echo >&2 "[ensure-repo-root-links] Missing $SITE/index.html — wrong repo layout?"
  exit 1
fi

cd "$ROOT"
for pair in \
  "Desktop/ordrpe.index/ordrpe/index.html:index.html" \
  "Desktop/ordrpe.index/ordrpe/instock.html:instock.html" \
  "Desktop/ordrpe.index/ordrpe/privacy.html:privacy.html" \
  "Desktop/ordrpe.index/ordrpe/refunds.html:refunds.html" \
  "Desktop/ordrpe.index/ordrpe/terms.html:terms.html" \
  "Desktop/ordrpe.index/ordrpe/site.webmanifest:site.webmanifest" \
  "Desktop/ordrpe.index/ordrpe/_redirects:_redirects"; do
  target="${pair%%:*}"
  name="${pair##*:}"
  ln -sf "$target" "$name"
done

ln -sfn "Desktop/ordrpe.index/ordrpe/images" images
ln -sfn "Desktop/ordrpe.index/ordrpe/assets" assets

echo "[ensure-repo-root-links] Repo root ($(basename "$ROOT")) → $SITE_REL"
readlink "$ROOT/index.html" || true
