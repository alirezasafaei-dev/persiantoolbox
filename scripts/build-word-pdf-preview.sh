#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo 'Usage: bash scripts/build-word-pdf-preview.sh <OpenDoc git checkout> <new output directory>' >&2
  exit 2
fi

revision=9177548903e1546f64061b914598a840e1cfa042
project=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
upstream=$(cd -- "$1" && pwd)
[[ $(rustc +1.96.0 --version) == 'rustc 1.96.0 '* ]]
[[ $(wasm-bindgen --version) == 'wasm-bindgen 0.2.129' ]]
git -C "$upstream" cat-file -e "$revision^{commit}"

mkdir -- "$2"
output=$(cd -- "$2" && pwd)
scratch=$(mktemp -d)
trap 'rm -rf -- "$scratch"' EXIT
git -C "$upstream" archive "$revision" | tar -xf - -C "$scratch"

(
  cd -- "$scratch"
  git apply --check "$project/docs/audits/fixtures/opendoc-word-preview.patch"
  git apply "$project/docs/audits/fixtures/opendoc-word-preview.patch"
  CARGO_PROFILE_RELEASE_OPT_LEVEL=z cargo +1.96.0 build --locked \
    --target-dir "$scratch/target" --target wasm32-unknown-unknown --release \
    -p opendoc-viewer --features wasm,core-fonts,pdf
  mkdir -p -- "$output/pkg"
  cp -r -- packages/opendoc-viewer/src "$output/src"
  cp -- packages/opendoc-viewer/{LICENSE,NOTICE,package.json} "$output/"
  cp -- "$(rustc +1.96.0 --print sysroot)/share/doc/rust/COPYRIGHT-library.html" "$output/RUST_STD_COPYRIGHT.html"
  cargo +1.96.0 tree --locked --target wasm32-unknown-unknown -p opendoc-viewer \
    --features wasm,core-fonts,pdf --edges normal --prefix none --format '{p}|{l}' > "$scratch/dependencies.txt"
  node "$project/scripts/collect-word-pdf-notices.mjs" "$scratch" \
    "${CARGO_HOME:-$HOME/.cargo}/registry/src" "$scratch/dependencies.txt" "$output/THIRD_PARTY_LICENSES.txt"
  wasm-bindgen "$scratch/target/wasm32-unknown-unknown/release/opendoc_viewer.wasm" \
    --target web --out-dir "$output/pkg" --out-name opendoc_viewer
)

echo "OpenDoc preview built at $output"
