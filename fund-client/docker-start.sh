#!/bin/bash

# FundFlow Platform - Docker Start Script
# This script starts all services using Docker Compose

echo "🚀 Starting FundFlow Platform with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cat > .env << EOF
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Gemini API Key (optional, for AI features)
GEMINI_API_KEY=

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=crowdfunding

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Node Environment
NODE_ENV=production
EOF
    echo "✅ Created .env file. You can edit it to configure your setup."
    echo ""
fi

# Parse command line arguments
MODE="production"
if [ "$1" = "dev" ] || [ "$1" = "development" ]; then
    MODE="development"
fi

# Start services based on mode
if [ "$MODE" = "development" ]; then
    echo "🔧 Starting in DEVELOPMENT mode (with hot-reload)..."
    docker-compose -f docker-compose.dev.yml up -d --build
else
    echo "🏭 Starting in PRODUCTION mode (optimized build)..."
    docker-compose up -d --build
fi

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ FundFlow Platform is starting!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001/api"
echo "   Database:  localhost:5433"
echo ""
echo "📝 Useful commands:"
echo "   View logs:       docker-compose logs -f"
echo "   Stop services:   docker-compose down"
echo "   Restart:         docker-compose restart"
echo ""
echo "📚 For more information, see DOCKER_SETUP.md"

