#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${OUT_DIR:-$ROOT_DIR/.deploy/cloudflare-pages}"

cd "$ROOT_DIR"

node --check app.js
for json_file in data/*.json; do
  python3 -m json.tool "$json_file" >/dev/null
done

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cp index.html app.js styles.css _headers "$OUT_DIR/"
cp -R assets data public "$OUT_DIR/"

find "$OUT_DIR" -name ".DS_Store" -delete

printf "Prepared Cloudflare Pages bundle: %s\n" "$OUT_DIR"
du -sh "$OUT_DIR"
