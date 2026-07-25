#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔧 Complete Setup Fix - All Issues                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Current Issues:"
echo "  1. ❌ Backend not running (database connection failed)"
echo "  2. ❌ AI quota exceeded (needs billing)"
echo "  3. ℹ️  Port conflicts (frontend on 3001 instead of 3000)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Stop PostgreSQL 17 (Postgres.app)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Try to quit Postgres.app
osascript -e 'quit app "PostgreSQL 17"' 2>/dev/null
sleep 2

if netstat -an | grep -q "5432.*LISTEN"; then
    echo "⚠️  Port 5432 still in use - Opening Activity Monitor for you..."
    echo ""
    echo "👉 Please do this:"
    echo "   1. In Activity Monitor, search: postgres"
    echo "   2. Select all postgres processes"
    echo "   3. Click ❌ (Force Quit)"
    echo ""
    
    open -a "Activity Monitor"
    read -p "Press Enter after stopping PostgreSQL..."
    
    sleep 2
    if netstat -an | grep -q "5432.*LISTEN"; then
        echo "❌ Port 5432 still in use. Please stop PostgreSQL manually."
        echo ""
        echo "Run this to find the process:"
        echo "  sudo lsof -i :5432"
        echo ""
        echo "Then kill it:"
        echo "  sudo kill -9 <PID>"
        exit 1
    fi
fi

echo "✅ Port 5432 is free!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Start Docker PostgreSQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend

echo "🚀 Starting PostgreSQL in Docker..."
docker compose up -d postgres 2>&1 | grep -v "attribute.*version"

echo ""
echo "⏳ Waiting for database to initialize (10 seconds)..."
sleep 10

if docker ps | grep -q "crowdfunding-postgres"; then
    echo "✅ PostgreSQL Docker container is running!"
else
    echo "❌ Failed to start PostgreSQL"
    echo ""
    echo "Please check:"
    echo "  1. Docker Desktop is running"
    echo "  2. Run: docker logs crowdfunding-postgres"
    exit 1
fi

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Start Backend (NestJS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📝 Backend will start in a NEW terminal window..."
echo ""
echo "Run this command in a NEW terminal:"
echo ""
echo "  cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend"
echo "  npm run start:dev"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Database Fixed:"
echo "   PostgreSQL running on port 5432 (Docker)"
echo ""
echo "⚠️  Still TODO:"
echo "   1. Start backend in new terminal (see command above)"
echo "   2. Add OpenAI billing: https://platform.openai.com/account/billing"
echo ""
echo "📊 Your Setup After Complete Fix:"
echo ""
echo "   Terminal 1: Frontend  → http://localhost:3001 ✅ (running)"
echo "   Terminal 2: Backend   → http://localhost:3001 ⏳ (start it!)"  
echo "   Docker:     Database  → localhost:5432       ✅ (running)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Press Enter to open new terminal for backend..."

# Open new terminal with backend command
osascript << 'END'
tell application "Terminal"
    do script "cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend && echo '╔════════════════════════════════════════╗' && echo '║  Starting Backend (NestJS)...          ║' && echo '╚════════════════════════════════════════╝' && echo '' && npm run start:dev"
    activate
end tell
END

echo ""
echo "✅ New terminal opened for backend!"
echo ""
echo "🎉 Setup Complete! Your backend should start without database errors."
echo ""
echo "⚠️  About the AI Error:"
echo "   The AI quota error will persist until you add billing to OpenAI."
echo "   Visit: https://platform.openai.com/account/billing"
echo "   Add payment method and $5 minimum credits."
echo ""

