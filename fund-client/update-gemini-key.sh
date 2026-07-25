#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🔑 Update Gemini API Key                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Steps:"
echo "  1. Get FREE API key: https://aistudio.google.com/app/apikey"
echo "  2. Copy your key (starts with AIza...)"
echo "  3. Paste it when prompted below"
echo ""

read -p "Enter your Gemini API key: " GEMINI_KEY

if [[ ! $GEMINI_KEY =~ ^AIza ]]; then
    echo "❌ Invalid key! Gemini keys should start with 'AIza'"
    exit 1
fi

cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend

cat > .env << EOF
# Google Gemini Configuration (FREE!)
GEMINI_API_KEY=$GEMINI_KEY

# AI Model Configuration
NEXT_PUBLIC_AI_MODEL=gemini-pro
NEXT_PUBLIC_AI_MAX_TOKENS=2000
NEXT_PUBLIC_AI_TEMPERATURE=0.7

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_AI_ANALYSIS=true
NEXT_PUBLIC_ENABLE_FRAUD_DETECTION=true
NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS=true
EOF

echo ""
echo "✅ .env file updated with your Gemini API key!"
echo ""
echo "🔄 Now restart your frontend:"
echo "   1. Press Ctrl+C in the terminal running frontend"
echo "   2. Run: npm run dev"
echo ""
echo "🧪 Test AI:"
echo "   curl -X POST http://localhost:3000/api/ai/chat-assistant \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"message\": \"Hello!\"}'"
echo ""

