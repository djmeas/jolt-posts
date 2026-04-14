#!/bin/bash
set -e

# Ensure directory structure exists
mkdir -p .data
mkdir -p public/uploads

echo "Running database migrations..."
npx drizzle-kit migrate

echo "Initializing admin user..."
node scripts/init-admin.mjs

echo "Starting application..."
exec node .output/server/index.mjs