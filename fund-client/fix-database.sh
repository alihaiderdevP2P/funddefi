#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           🔧 Database Fix - Interactive Guide                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "⚠️  PostgreSQL is already running on port 5432"
echo "   We need to stop it to use Docker PostgreSQL instead."
echo ""

echo "📋 Steps:"
echo "  1. I'll open Activity Monitor for you"
echo "  2. Search for 'postgres' in Activity Monitor"
echo "  3. Select all postgres processes and click ❌ (Stop)"
echo "  4. Choose 'Force Quit'"
echo "  5. Come back here and press Enter"
echo ""

read -p "Press Enter to open Activity Monitor..." 

# Open Activity Monitor
open -a "Activity Monitor"

echo ""
echo "✋ Now in Activity Monitor:"
echo "   1. Use the search box (top right) - type: postgres"
echo "   2. Select all postgres processes"  
echo "   3. Click the ❌ button (top left)"
echo "   4. Click 'Force Quit'"
echo ""

read -p "Done stopping PostgreSQL? Press Enter to continue..."

echo ""
echo "🔄 Checking if port 5432 is free..."
sleep 2

if netstat -an | grep -q "5432.*LISTEN"; then
    echo "❌ Port 5432 is still in use"
    echo ""
    echo "Please try again or run this command manually:"
    echo "  sudo lsof -i :5432"
    echo ""
    echo "Then kill the process with:"
    echo "  sudo kill -9 <PID>"
    exit 1
fi

echo "✅ Port 5432 is free!"
echo ""

cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend

echo "🚀 Starting Docker PostgreSQL..."
docker compose up -d postgres 2>&1 | grep -v "attribute.*version"

echo ""
echo "⏳ Waiting for database to initialize..."
sleep 10

echo ""
echo "🔍 Checking database status..."
if docker ps | grep -q "crowdfunding-postgres"; then
    echo "✅ PostgreSQL is running in Docker!"
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                  ✅ DATABASE SETUP COMPLETE!                   ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Go to your backend terminal"
    echo "  2. Press Ctrl+C to stop it"
    echo "  3. Run: npm run start:dev"
    echo "  4. ✅ You should see no more database errors!"
    echo ""
    echo "🎉 Your setup:"
    echo "  ✅ Frontend:  http://localhost:3000"
    echo "  ✅ Backend:   http://localhost:3001"
    echo "  ✅ Database:  localhost:5432 (Docker)"
    echo ""
else
    echo "❌ Failed to start PostgreSQL Docker container"
    echo ""
    echo "Please check:"
    echo "  1. Docker Desktop is running"
    echo "  2. Port 5432 is free: netstat -an | grep 5432"
    echo ""
fi

