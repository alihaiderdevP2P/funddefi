# 🚀 FundFlow - Blockchain Crowdfunding Platform

A decentralized crowdfunding platform built with Next.js, NestJS, and Ethereum smart contracts, powered by AI.

## ✨ Features

### 🎯 Core Features

- ✅ **Blockchain Integration** - Ethereum smart contracts for transparent fundraising
- ✅ **Campaign Management** - Create, manage, and discover campaigns
- ✅ **Wallet Connection** - MetaMask, WalletConnect, Coinbase Wallet support
- ✅ **Real-time Updates** - WebSocket integration for live funding updates
- ✅ **Smart Contract Service** - Automated fund distribution and refunds

### 🤖 AI-Powered Features

- ✅ **AI Chat Assistant** - 24/7 intelligent support chatbot
- ✅ **Campaign Analysis** - AI-powered risk assessment and success prediction
- ✅ **Fraud Detection** - Automated fraud and scam detection
- ✅ **Campaign Recommendations** - Personalized campaign suggestions
- ✅ **Content Generation** - AI-generated campaign descriptions and titles

### 💼 Platform Features

- ✅ **Multi-tier Rewards** - Backer reward management system
- ✅ **User Profiles** - Creator and backer profiles
- ✅ **Admin Dashboard** - Platform administration panel
- ✅ **Support Center** - Live chat, email, and ticket system
- ✅ **Analytics** - Campaign performance tracking

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Components**: Radix UI + shadcn/ui
- **Blockchain**: ethers.js v5
- **AI**: Vercel AI SDK + OpenAI
- **State**: React Hooks + Context API
- **WebSocket**: Socket.IO Client

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL + TypeORM
- **Authentication**: Passport.js + JWT
- **WebSocket**: Socket.IO
- **Validation**: class-validator + class-transformer

### Blockchain

- **Smart Contracts**: Solidity
- **Development**: Hardhat
- **Network**: Ethereum (Sepolia Testnet)

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (or Docker)
- MetaMask browser extension
- OpenAI API key (for AI features)

### 1. Clone Repository

```bash
git clone <repository-url>
cd crowdfunding-platform-backend
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Configuration

#### Frontend (.env)

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required for AI features
OPENAI_API_KEY=sk-your-openai-api-key-here

# Blockchain configuration
NEXT_PUBLIC_FACTORY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Optional configurations
NEXT_PUBLIC_AI_MODEL=gpt-4-turbo-preview
NEXT_PUBLIC_SUPPORT_EMAIL=support@fundflow.io
```

#### Backend (backend/.env)

```bash
cd backend
cp .env.example .env
```

The backend `.env` file is already created with default values.

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
cd backend
docker-compose up -d
```

This will:

- Start PostgreSQL container
- Create database and tables
- Seed sample data

#### Option B: Local PostgreSQL

```bash
# Create database
createdb crowdfunding

# Run migrations
cd backend
npm run migration:run
```

### 5. Start Development Servers

#### Terminal 1 - Frontend

```bash
npm run dev
```

Frontend runs on: **http://localhost:3000**

#### Terminal 2 - Backend (Optional)

```bash
cd backend
npm run start:dev
```

Backend runs on: **http://localhost:3001**

> **Note**: Frontend works with mock data by default. Backend is optional for full database integration.

## 🎮 Usage

### Access the Platform

1. **Home Page**: http://localhost:3000
2. **Browse Campaigns**: http://localhost:3000/campaigns
3. **Create Campaign**: http://localhost:3000/create
4. **Support**: http://localhost:3000/support
5. **Dashboard**: http://localhost:3000/dashboard

### Connect Your Wallet

1. Click "Connect Wallet" in the navigation
2. Select MetaMask (or your preferred wallet)
3. Approve the connection
4. View your wallet details by clicking your address

### Create a Campaign

1. Click "Launch Campaign" or "Start Campaign"
2. Fill in campaign details
3. Add rewards (optional)
4. Connect wallet to deploy smart contract
5. Submit campaign

### Back a Campaign

1. Browse campaigns at `/campaigns`
2. Click on a campaign card
3. Click "Back This Project"
4. Enter funding amount
5. Select reward tier (optional)
6. Confirm transaction in MetaMask

## 🤖 AI Features Setup

### Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the key (starts with `sk-`)
5. Add to `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

### Available AI Endpoints

#### 1. Chat Assistant

```bash
POST /api/ai/chat-assistant
Body: { "message": "Your question", "conversationHistory": [] }
```

#### 2. Campaign Analysis

```bash
POST /api/ai/campaign-analysis
Body: { "title": "...", "description": "...", "goal": 50000, "category": "technology", "duration": 30 }
```

#### 3. Fraud Detection

```bash
POST /api/ai/fraud-detection
Body: { "campaignData": {...}, "creatorData": {...} }
```

#### 4. Campaign Recommendations

```bash
POST /api/ai/campaign-recommendations
Body: { "userAddress": "0x...", "backingHistory": [], "preferences": {} }
```

#### 5. Content Generation

```bash
POST /api/ai/content-generation
Body: { "type": "campaign-description", "context": {...} }
```

See [AI_SETUP.md](./AI_SETUP.md) for detailed AI configuration.

## 📁 Project Structure

```
crowdfunding-platform-backend/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── ai/              # AI endpoints
│   │   ├── campaigns/       # Campaign API
│   │   └── support/         # Support ticket API
│   ├── campaigns/           # Campaign pages
│   ├── create/              # Campaign creation
│   ├── dashboard/           # User dashboard
│   └── support/             # Support center
├── backend/                  # NestJS Backend
│   ├── src/
│   │   ├── auth/            # Authentication
│   │   ├── campaigns/       # Campaign module
│   │   ├── funding/         # Funding module
│   │   ├── users/           # User module
│   │   └── websocket/       # WebSocket module
│   └── database/            # SQL scripts
├── components/              # React components
│   ├── ui/                  # UI components (shadcn)
│   └── ...                  # Feature components
├── contracts/               # Solidity smart contracts
├── hooks/                   # React hooks
├── lib/                     # Utilities
│   ├── api.ts              # API client
│   ├── contracts.ts        # Contract service
│   └── smart-contract-service.ts
└── scripts/                 # Deployment scripts
```

## 🔐 Security

- **Smart Contracts**: Audited for security vulnerabilities
- **Authentication**: JWT-based with secure password hashing
- **API Security**: CORS, rate limiting, input validation
- **Wallet**: Non-custodial, users control their keys
- **AI**: API key encryption and usage monitoring

## 🐛 Troubleshooting

### Frontend won't start

```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Backend errors

```bash
# Check if PostgreSQL is running
docker ps

# Restart backend
cd backend
npm run start:dev
```

### Wallet connection issues

1. Ensure MetaMask is installed
2. Switch to correct network (Ethereum or Sepolia)
3. Refresh the page

### AI not working

1. Check `OPENAI_API_KEY` in `.env`
2. Verify billing is enabled on OpenAI account
3. Check console for error messages

## 📚 Documentation

- [AI Setup Guide](./AI_SETUP.md) - Detailed AI configuration
- [Smart Contracts](./contracts/) - Contract documentation
- [API Documentation](http://localhost:3001/api/docs) - Swagger docs (when backend running)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Live Chat**: Available at `/support`
- **Email**: support@fundflow.io
- **Discord**: https://discord.gg/fundflow
- **Documentation**: `/docs`

## 🎯 Roadmap

- [ ] Multi-chain support (Polygon, BSC, Arbitrum)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Social features (comments, shares)
- [ ] Email notifications
- [ ] Campaign milestones
- [ ] Escrow services
- [ ] KYC/AML integration

---

Built with ❤️ using Next.js, NestJS, Ethereum, and AI

