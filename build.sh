#!/bin/bash
set -e

cd /workspaces/etchat

echo "=== Environment Check ==="
echo "Node: $(node --version)"
echo "NPM: $(npm --version)"
echo "PWD: $(pwd)"

echo ""
echo "=== Installing Dependencies ==="
npm install

echo ""
echo "=== Building Web Assets ==="
npm run build

echo ""
echo "=== Build Complete ==="
ls -lh dist/
