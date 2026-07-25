# ⚡ Quick Start Guide - FundFlow Platform

Get your FundFlow platform running in **5 minutes**!

## 🎯 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] MetaMask browser extension (for testing)
- [ ] OpenAI API key (for AI features)

## 🚀 Setup Steps

### Step 1: Install Dependencies (2 minutes)

```bash
# Option A: Use automated setup script
chmod +x setup.sh
./setup.sh

# Option B: Manual installation
npm install
cd backend && npm install && cd ..
```

### Step 2: Configure API Keys (1 minute)

**Get Your OpenAI API Key:**

1. Visit https://platform.openai.com/api-keys
2. Sign up/Login
3. Click "Create new secret key"
4. Copy the key

**Add to .env file:**

```bash
# Edit .env file
echo "OPENAI_API_KEY=sk-your-key-here" >> .env
```

Or manually edit `.env` and add:

```env
OPENAI_API_KEY=sk-your-actual-api-key
```

### Step 3: Start the Application (1 minute)

```bash
# Start frontend
npm run dev
```

**That's it!** Open http://localhost:3000 🎉

## 🎮 What You Can Do Now

### ✅ Without Backend (Mock Data)

- ✅ Browse 6 sample campaigns
- ✅ View campaign details
- ✅ Connect MetaMask wallet
- ✅ Access support center with live chat
- ✅ Use AI features (with OpenAI key)
- ✅ Explore all pages

### ✅ With Backend (Full Features)

Start backend in a new terminal:

```bash
cd backend
docker-compose up -d  # Start PostgreSQL
npm run start:dev     # Start NestJS backend
```

Then update `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🧪 Test AI Features

### 1. Chat Assistant

Go to any page and look for the AI chat widget (if implemented in UI)

Or test via API:

```bash
curl -X POST http://localhost:3000/api/ai/chat-assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I create a campaign?"}'
```

### 2. Campaign Analysis

Create a campaign and get AI analysis on viability and success probability

### 3. Content Generation

Use AI to generate campaign titles and descriptions

### 4. Fraud Detection

Automatically scan campaigns for suspicious patterns

## 📱 Key Pages

| Page      | URL                             | Description          |
| --------- | ------------------------------- | -------------------- |
| Home      | http://localhost:3000           | Landing page         |
| Campaigns | http://localhost:3000/campaigns | Browse all campaigns |
| Create    | http://localhost:3000/create    | Start a campaign     |
| Support   | http://localhost:3000/support   | Help center          |
| Dashboard | http://localhost:3000/dashboard | User dashboard       |
| Admin     | http://localhost:3000/admin     | Admin panel          |

## 🎨 Features to Try

### 1. Wallet Connection

- Click "Connect Wallet"
- Approve MetaMask connection
- View wallet details
- Click "View on Explorer" to see on Etherscan

### 2. Support Center

- Visit `/support`
- Try **Live Chat** (opens chat modal)
- Try **Email Support** (opens email client)
- Try **Phone Support** (opens phone dialer)
- **Submit a ticket** and get a unique ticket ID

### 3. Browse Campaigns

- Visit `/campaigns`
- Use search and filters
- View campaign details
- Check funding progress

## 🛠️ Troubleshooting

### Issue: Page shows "0 campaigns"

**Solution**: Check that the mock API route exists at `app/api/campaigns/route.ts`

### Issue: AI features not working

**Solution**:

1. Ensure `OPENAI_API_KEY` is in `.env`
2. Check console for errors
3. Verify OpenAI billing is enabled

### Issue: MetaMask not connecting

**Solution**:

1. Install MetaMask extension
2. Create or import wallet
3. Refresh the page

### Issue: Backend won't start

**Solution**:

1. Ensure PostgreSQL is running (`docker-compose up -d`)
2. Check `backend/.env` has `JWT_SECRET`
3. Run `npm run build` in backend folder

## 🎓 Learning Path

### Beginner

1. ✅ Browse campaigns
2. ✅ Connect wallet
3. ✅ Use support features

### Intermediate

4. ✅ Create a campaign
5. ✅ Test AI chat assistant
6. ✅ Analyze campaign with AI

### Advanced

7. ✅ Deploy smart contracts
8. ✅ Set up full backend
9. ✅ Customize AI prompts
10. ✅ Add new features

## 📞 Need Help?

- **In-App Support**: http://localhost:3000/support
- **Live Chat**: Click "Start Chat" in support page
- **Email**: support@fundflow.io
- **Discord**: https://discord.gg/fundflow

## 🎉 You're Ready!

Your platform is now running with:

- ✅ Mock campaign data
- ✅ Wallet connection
- ✅ Support center (email, chat, tickets)
- ✅ AI integration (with OpenAI key)
- ✅ Beautiful UI

**Next**: Start exploring at http://localhost:3000 🚀







