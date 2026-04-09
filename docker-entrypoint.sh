#!/bin/bash
set -e

# Ensure directory structure exists
mkdir -p .data
mkdir -p public/uploads

echo "Running database migrations..."
npx drizzle-kit migrate

echo "Starting application..."
exec node .output/server/index.mjs