#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="${CF_PAGES_PROJECT:-github-daily-studio}"
BRANCH_NAME="${CF_PAGES_BRANCH:-master}"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/.deploy/cloudflare-pages}"

"$ROOT_DIR/scripts/prepare-pages.sh"

cd "$ROOT_DIR"

COMMIT_HASH="${CF_PAGES_COMMIT_HASH:-$(git rev-parse HEAD 2>/dev/null || true)}"
COMMIT_MESSAGE="${CF_PAGES_COMMIT_MESSAGE:-$(git log -1 --pretty=%s 2>/dev/null || echo "Manual deploy")}"

args=(
  pages deploy "$OUT_DIR"
  --project-name "$PROJECT_NAME"
  --branch "$BRANCH_NAME"
)

if [[ -n "$COMMIT_HASH" ]]; then
  args+=(--commit-hash "$COMMIT_HASH")
fi

if [[ -n "$COMMIT_MESSAGE" ]]; then
  args+=(--commit-message "$COMMIT_MESSAGE")
fi

npx wrangler "${args[@]}"
