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
python3 - "$OUT_DIR" <<'PYBUILD'
from pathlib import Path
import hashlib,sys
p=Path(sys.argv[1]);html=(p/'index.html').read_text()
for name in ['app.js','styles.css']:
 data=(p/name).read_bytes(); stem,ext=name.rsplit('.',1)
 versioned=f'{stem}-{hashlib.sha256(data).hexdigest()[:12]}.{ext}'
 (p/versioned).write_bytes(data)
 html=html.replace('./'+name,'./'+versioned)
(p/'index.html').write_text(html)
PYBUILD
mkdir -p "$OUT_DIR/data"
cp data/roblox-*.json data/ai-*.json data/github-*.json "$OUT_DIR/data/"

find "$OUT_DIR" -name ".DS_Store" -delete

printf "Prepared Cloudflare Pages bundle: %s\n" "$OUT_DIR"
du -sh "$OUT_DIR"
