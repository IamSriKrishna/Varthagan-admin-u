#!/bin/bash
set -e

echo "=== Testing Docker Build Context ==="

echo "1. Checking files in the current directory:"
ls -la

echo -e "\n2. Checking for package-lock.json:"
if [ -f package-lock.json ]; then
  echo "package-lock.json exists"
  echo "First few lines of package-lock.json:"
  head -n 5 package-lock.json
else
  echo "ERROR: package-lock.json does not exist in the current directory"
  exit 1
fi

echo -e "\n3. Running npm ci..."
npm ci --no-audit --prefer-offline

echo -e "\n=== Build Context Test Completed Successfully ==="
