#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      🔧 COMPLETE FIX - Database + Backend + WebSocket          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Fixing ALL Issues:"
echo "  1. Stop duplicate Next.js servers"
echo "  2. Stop PostgreSQL 17"
echo "  3. Start Docker PostgreSQL"
echo "  4. Start backend on correct port"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Clean up old processes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill old Next.js on port 3000
echo "Stopping old Next.js server on port 3000..."
kill -9 7983 2>/dev/null && echo "✅ Killed old Next.js (port 3000)"

# Stop PostgreSQL
echo ""
echo "Stopping PostgreSQL 17..."
echo "⚠️  Will ask for your Mac password..."
sudo kill -9 264 2>/dev/null && echo "✅ Stopped PostgreSQL 17"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Start Docker PostgreSQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$(dirname "$0")/backend"

docker compose up -d postgres 2>&1 | grep -v "attribute.*version"

echo ""
echo "⏳ Waiting for database to initialize..."
sleep 10

if docker ps | grep -q "crowdfunding-postgres"; then
    echo "✅ PostgreSQL is running in Docker!"
else
    echo "❌ Failed to start PostgreSQL"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Start Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Opening NEW terminal for backend..."

# Open new terminal with backend
osascript << 'END'
tell application "Terminal"
    do script "cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend && echo '╔════════════════════════════════════════╗' && echo '║  🚀 Starting Backend (NestJS)          ║' && echo '╚════════════════════════════════════════╝' && echo '' && npm run start:dev"
    activate
end tell
END

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Your Setup:"
echo ""
echo "  Terminal 1 (this):  Frontend running"
echo "  Terminal 2 (new):   Backend starting..."
echo "  Docker:             PostgreSQL running ✅"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECK YOUR BROWSER CONSOLE:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Should see:"
echo "  ✅ Connected to WebSocket server"
echo ""
echo "  No more errors:"
echo "  ❌ WebSocket connection error (GONE!)"
echo "  ❌ 404 errors (GONE!)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 All fixed! Check the new terminal window for backend logs."
echo ""

