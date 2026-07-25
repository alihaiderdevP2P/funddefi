# AI Integration Setup Guide

This guide will help you set up AI features for the FundFlow crowdfunding platform.

## 🚀 Quick Start

### 1. Get Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy your API key (starts with `sk-`)

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Configure Backend

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

The backend `.env` should already exist with the JWT_SECRET.

### 4. Restart Servers

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend (optional, if using full backend)
cd backend
npm run start:dev
```

## 🤖 AI Features Available

### 1. **AI Chat Assistant**

- **Endpoint**: `/api/ai/chat-assistant`
- **Purpose**: Help users with platform questions
- **Usage**: Real-time chat support

### 2. **Campaign Analysis**

- **Endpoint**: `/api/ai/campaign-analysis`
- **Purpose**: Analyze campaign viability and risk
- **Features**:
  - Risk score calculation
  - Success probability prediction
  - Actionable recommendations
  - Market analysis

### 3. **Fraud Detection**

- **Endpoint**: `/api/ai/fraud-detection`
- **Purpose**: Detect potential fraud in campaigns
- **Features**:
  - Risk level assessment
  - Suspicious pattern detection
  - Manual review flags
  - Security recommendations

### 4. **Campaign Recommendations**

- **Endpoint**: `/api/ai/campaign-recommendations`
- **Purpose**: Personalized campaign suggestions
- **Features**:
  - Match score calculation
  - User interest profiling
  - Category-based filtering

### 5. **Content Generation**

- **Endpoint**: `/api/ai/content-generation`
- **Purpose**: Generate campaign content
- **Types**:
  - Campaign descriptions
  - Campaign titles
  - Reward tier descriptions

## 📊 AI Model Configuration

You can customize the AI behavior by modifying these environment variables:

```env
# Model Selection
NEXT_PUBLIC_AI_MODEL=gpt-4-turbo-preview
# Options: gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo

# Response Length
NEXT_PUBLIC_AI_MAX_TOKENS=2000
# Higher = longer responses (max 4096 for GPT-4)

# Creativity Level
NEXT_PUBLIC_AI_TEMPERATURE=0.7
# Range: 0.0 (focused) to 1.0 (creative)
```

## 🔧 Feature Flags

Enable or disable AI features:

```env
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_AI_ANALYSIS=true
NEXT_PUBLIC_ENABLE_FRAUD_DETECTION=true
NEXT_PUBLIC_ENABLE_AI_RECOMMENDATIONS=true
```

## 💰 Cost Management

### OpenAI Pricing (as of 2024):

- **GPT-4 Turbo**: $0.01/1K input tokens, $0.03/1K output tokens
- **GPT-3.5 Turbo**: $0.0005/1K input tokens, $0.0015/1K output tokens

### Tips to Reduce Costs:

1. Use GPT-3.5 Turbo for simple tasks
2. Set lower `maxTokens` limits
3. Implement caching for repeated queries
4. Add rate limiting per user
5. Monitor usage in OpenAI dashboard

## 🛡️ Security Best Practices

1. **Never commit `.env` files** to version control
2. **Rotate API keys** regularly
3. **Set usage limits** in OpenAI dashboard
4. **Monitor API usage** for unusual patterns
5. **Use environment-specific keys** (dev, staging, prod)

## 🧪 Testing AI Features

### Test Chat Assistant:

```bash
curl -X POST http://localhost:3000/api/ai/chat-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I create a campaign?",
    "conversationHistory": []
  }'
```

### Test Campaign Analysis:

```bash
curl -X POST http://localhost:3000/api/ai/campaign-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Solar Power Bank",
    "description": "Portable solar charging solution",
    "goal": 50000,
    "category": "technology",
    "duration": 30
  }'
```

## 🐛 Troubleshooting

### Issue: "AI service not configured"

**Solution**: Make sure `OPENAI_API_KEY` is set in your `.env` file

### Issue: "Invalid API key"

**Solution**:

1. Check your API key is correct
2. Ensure it starts with `sk-`
3. Verify your OpenAI account has billing enabled

### Issue: Rate limit exceeded

**Solution**:

1. Check your OpenAI usage limits
2. Add usage limits in your code
3. Implement request throttling

### Issue: Model not found

**Solution**: Update `NEXT_PUBLIC_AI_MODEL` to a valid model name

## 📚 Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [AI SDK Models](https://sdk.vercel.ai/providers)

## 🎯 Next Steps

1. ✅ Set up OpenAI API key
2. ✅ Test each AI endpoint
3. 🔄 Implement rate limiting
4. 🔄 Add response caching
5. 🔄 Monitor usage and costs
6. 🔄 Add error handling for each feature

---

**Need Help?** Visit `/support` or check our documentation at `/docs`







