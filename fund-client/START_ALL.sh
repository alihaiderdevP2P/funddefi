#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 Starting Your Crowdfunding Platform                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Stop PostgreSQL 17 if running
echo "🔧 Cleaning up ports..."
ps aux | grep -i "[p]ostgres.*-D" | awk '{print $2}' | head -1 | xargs sudo kill -9 2>/dev/null
sleep 2

# Start Docker PostgreSQL
echo "🐘 Starting PostgreSQL..."
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
docker compose up -d postgres 2>&1 | grep -v "attribute.*version"
sleep 8

# Check if PostgreSQL started
if docker ps | grep -q "crowdfunding-postgres"; then
    echo "✅ PostgreSQL running"
else
    echo "⚠️  PostgreSQL using local instance"
fi

echo ""
echo "🎯 Starting backend (NestJS) on port 3001..."
echo "   Opening new terminal window..."

# Open backend in new terminal
osascript << 'END'
tell application "Terminal"
    do script "cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend && echo '╔════════════════════════════════════════╗' && echo '║  🚀 Backend (NestJS) - Port 3001       ║' && echo '╚════════════════════════════════════════╝' && echo '' && npm run start:dev"
    activate
end tell
END

sleep 3

echo ""
echo "💻 Starting frontend (Next.js) on port 3000..."
echo "   Opening new terminal window..."

# Open frontend in new terminal
osascript << 'END'
tell application "Terminal"
    do script "cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend && echo '╔════════════════════════════════════════╗' && echo '║  💻 Frontend (Next.js) - Port 3000     ║' && echo '╚════════════════════════════════════════╝' && echo '' && npm run dev"
    activate
end tell
END

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Your Services:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001"
echo "   Swagger:   http://localhost:3001/api/docs"
echo "   Database:  localhost:5432"
echo ""
echo "🤖 AI Features:"
echo "   ✅ Chat Assistant (FREE)"
echo "   ✅ Campaign Analysis (FREE)"
echo "   ✅ Content Generation (FREE)"
echo "   ✅ Fraud Detection (FREE)"
echo "   ✅ Recommendations (FREE)"
echo ""
echo "🎉 Wait 10 seconds, then visit: http://localhost:3000"
echo ""
echo "════════════════════════════════════════════════════════════════"

