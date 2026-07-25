#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           🗄️  Database Setup - Quick Fix                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo "   Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running"
    echo ""
    echo "👉 Please start Docker Desktop:"
    echo "   1. Press Cmd+Space"
    echo "   2. Type 'Docker'"
    echo "   3. Press Enter"
    echo "   4. Wait for Docker to fully start (whale icon steady)"
    echo ""
    echo "Then run this script again!"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database (Postgres via docker-compose.yml → host port 5433)
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=crowdfunding

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# i18n
LANG_DEFAULT=en
LANG_FALLBACK=en
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🚀 Starting PostgreSQL database..."
docker compose up -d postgres

echo ""
echo "⏳ Waiting for database to initialize (10 seconds)..."
sleep 10

echo ""
echo "🔍 Checking database status..."
if docker ps | grep -q "crowdfunding-postgres"; then
    echo "✅ PostgreSQL is running!"
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ SETUP COMPLETE                            ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Database Info:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: crowdfunding"
    echo "   Username: postgres"
    echo "   Password: password"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. Stop your current backend (Ctrl+C)"
    echo "   2. Restart with: npm run start:dev"
    echo "   3. You should see no more database errors!"
    echo ""
    echo "🛑 To stop database: docker compose down"
    echo ""
else
    echo "❌ Failed to start PostgreSQL"
    echo "   Check Docker Desktop is running"
    echo "   View logs: docker logs crowdfunding-postgres"
fi

