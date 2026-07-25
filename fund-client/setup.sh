#!/bin/bash

# FundFlow Platform Setup Script
# This script helps you set up the development environment

echo "🚀 FundFlow Platform Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  IMPORTANT: Edit .env and add your OPENAI_API_KEY"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file..."
    cd backend
    cp .env.example .env
    cd ..
    echo "✅ backend/.env file created"
else
    echo "✅ backend/.env file already exists"
fi

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
npm install
echo "✅ Frontend dependencies installed"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..
echo "✅ Backend dependencies installed"

echo ""
echo "=========================="
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Edit .env and add your OPENAI_API_KEY"
echo "   Get one at: https://platform.openai.com/api-keys"
echo ""
echo "2. Start the frontend:"
echo "   npm run dev"
echo ""
echo "3. (Optional) Start the backend:"
echo "   cd backend && docker-compose up -d  # Start database"
echo "   npm run start:dev                   # Start backend"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - AI Setup: ./AI_SETUP.md"
echo "   - Main README: ./README.md"
echo ""
echo "Need help? Visit /support in the app!"
echo ""












