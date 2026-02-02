#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

rm -rf package lambda.zip

# Build Linux-compatible wheels for Lambda (python3.11, x86_64)
python3 -m pip install \
  --platform manylinux2014_x86_64 \
  --implementation cp \
  --python-version 311 \
  --abi cp311 \
  --only-binary=:all: \
  -r requirements-prod.txt \
  -t package/

cp -r shared auth bookmarks tags users screenshot package/

(
  cd package
  zip -r ../lambda.zip .
)

echo "Built $ROOT_DIR/lambda.zip"
