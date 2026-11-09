#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " Starting HeyGoodly Next.js 16 Frontend Locally..."
echo " Node: $(node -v)"
echo " API URL: http://127.0.0.1:8080"
echo " Portal: http://localhost:3000"
echo " ProCMS Admin: http://localhost:3000/admin/dashboard"
echo "=========================================================="

cd "$(dirname "$0")/../frontend"
exec npm run dev

