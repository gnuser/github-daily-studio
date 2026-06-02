#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/.deploy/cloudflare-pages}"

"$ROOT_DIR/scripts/prepare-pages.sh"

cd "$ROOT_DIR"

COMMIT_MESSAGE="${CF_DEPLOY_MESSAGE:-$(git log -1 --pretty=%s 2>/dev/null || echo "Manual deploy")}"

args=(
  deploy
  --config wrangler.jsonc
)

if [[ -n "$COMMIT_MESSAGE" ]]; then
  args+=(--message "$COMMIT_MESSAGE")
fi

npx wrangler "${args[@]}"
