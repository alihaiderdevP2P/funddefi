# 🚀 FundFlow — Crowdfunding 3.0

<div align="center">

### A full-stack blockchain crowdfunding platform for the modern web and mobile.

**Next.js 14 · NestJS · Flutter · Ethereum · PostgreSQL · Google Gemini AI**

<br />

[🌐 **Live App**](https://funddefi-client-six.vercel.app/)
[💼 **LinkedIn**](https://www.linkedin.com/in/ali-haider-1496a4413/) · [🐙 **GitHub**](https://github.com/alihaiderdevP2P/funddefi)

</div>

---

## ✨ Overview

FundFlow is a **Crowdfunding 3.0** platform that lets creators launch campaigns, backers pledge funds through a connected wallet, and admins moderate the marketplace — with on-chain transparency, AI assistance, and live funding updates.

The product ships as a **monorepo** with three clients talking to one API:

| App | Role |
|-----|------|
| **fund-client** | Next.js web experience for recruiters, creators, and backers |
| **fund-server** | NestJS REST + WebSocket API with JWT, RBAC, and Supabase storage |
| **fund-app** | Flutter Android / iOS app using the same `/api/v1` backend |

The platform is designed to feel like a modern product — not just a demo — while remaining practical to run locally, deploy, and extend.

---

## 🌟 Highlights

| Feature | Description |
|---------|-------------|
| ⛓️ **On-chain Crowdfunding** | Ethereum smart contracts for campaign creation, ETH pledges, withdrawals, and automatic refunds when a goal is missed. |
| 🤖 **Gemini AI Copilot** | Chat support, campaign analysis, fraud scoring, content generation, and personalized recommendations. |
| 📱 **Native Mobile App** | Flutter client for Android and iOS with the same user journey as the web app. |
| 👛 **Wallet-First Backing** | MetaMask connection, network switching, and on-chain contribution flow with explorer links. |
| 🎁 **Reward Tiers** | Multi-tier rewards with minimum pledges, delivery dates, backer caps, and campaign images. |
| 📡 **Live Funding Stats** | Socket.IO broadcasts for new pledges, campaign updates, and platform-wide counters. |
| 🌍 **Bilingual-Ready i18n** | English, Spanish, and French on both client and server — no heavy i18n framework required. |
| 🛡️ **Role-Based Admin** | `user` · `admin` · `superadmin` with JWT guards, Swagger role docs, and a dedicated admin panel. |
| 🖼️ **Supabase Storage** | Campaign, reward, and avatar images uploaded through the API and stored as public URLs. |
| ⚡ **Production Ready** | Dockerfiles, Vercel-friendly frontend, Swagger docs, CI, and security-minded auth defaults. |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Web** | [Next.js 14](https://nextjs.org/) (App Router), React 18, TypeScript |
| **UI** | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI, shadcn/ui |
| **Mobile** | [Flutter](https://flutter.dev/) 3.4+, Dart, Provider, go_router |
| **API** | [NestJS 10](https://nestjs.com/), TypeORM, Passport + JWT |
| **Database** | PostgreSQL 15 / [Supabase](https://supabase.com/) |
| **Storage** | Supabase Storage (`campaign-images`) |
| **Blockchain** | Solidity 0.8, Hardhat, ethers.js v5, MetaMask |
| **AI** | [Google Gemini](https://ai.google.dev/) (`@google/generative-ai`) |
| **Realtime** | Socket.IO |
| **Docs** | Swagger at `/docs` |
| **Deploy** | Vercel · Docker · Railway / Render |
| **Package Managers** | npm (web + API) · pub (mobile) |

---

## 🎨 Platform Experience

FundFlow is built as a product experience, not a single landing page.

### 🌐 Web (`fund-client`)

Creators and backers can:

* Browse featured campaigns with live platform stats
* Search and filter by category or status
* Open a campaign, pick a reward, and pledge from MetaMask
* Launch a campaign through a multi-step wizard
* Manage created and backed projects from the dashboard
* Chat with the Gemini assistant from any page
* Switch language and light / dark theme

### 📱 Mobile (`fund-app`)

The Flutter app covers the same journey on Android and iOS:

* Home, explore, campaign detail, and backing flow
* Create-campaign wizard with image upload
* Secure JWT storage, profile, settings, and notifications
* Admin tools for `admin` / `superadmin` accounts
* Support, blog, careers, docs, and contact screens

### 🧠 API (`fund-server`)

The NestJS backend is the source of truth:

* REST under `/api/v1`
* JWT auth and role guards
* Campaigns, rewards, funding, users, blog, careers, support, contact, notifications
* Image upload to Supabase
* Socket.IO gateway for live events
* Role-split Swagger: `/docs`, `/docs/user`, `/docs/admin`, `/docs/superadmin`

---

## ⛓️ Blockchain Layer

Smart contracts live in `fund-client/contracts/`.

### CrowdfundingFactory.sol

* `createCampaign(...)` deploys a new campaign contract
* Tracks creator mappings and emitted `CampaignCreated` events

### Campaign.sol

* `contribute()` — payable ETH pledges
* `withdraw()` — creator withdraws after the goal is reached
* `refund()` — backers recover funds if the goal is missed
* `cancel()` — creator cancels an active campaign

### Supported networks

| Network | Chain ID | Usage |
|---------|----------|-------|
| Hardhat Local | `31337` | Development |
| Sepolia | `11155111` | Default testnet |
| Polygon | `137` | Mainnet |
| Mumbai | `80001` | Polygon testnet |

---

## 🤖 AI Features

AI is powered by **Google Gemini**. Without `GEMINI_API_KEY`, routes fall back to mock responses so the UI still works.

| Capability | Where it shows up |
|------------|-------------------|
| 24/7 chat assistant | Floating widget on every web page |
| Content generation | Campaign create wizard |
| Risk / success analysis | Campaign analysis API |
| Fraud scoring | Campaign + creator checks |
| Recommendations | Home page suggestions |
| Natural-language search | Campaign browse |

Get a key from [Google AI Studio](https://aistudio.google.com/apikey) and add it to `fund-client/.env`.

---

## 👥 Roles

```text
user  <  admin  <  superadmin
```

| Role | What they can do |
|------|------------------|
| **Backer / Creator (`user`)** | Register, launch campaigns, pledge, manage profile |
| **Admin** | Moderate campaigns, manage users, open the admin UI |
| **Superadmin** | Create admins, change roles (max 3 superadmins) |

Public registration **always** creates a `user`. Admin accounts are created only by a superadmin or the `create-superadmin` script.

---

## 📁 Project Structure

```text
funddefi/
│
├── fund-client/                 # Next.js web app + Hardhat contracts
│   ├── app/                     # App Router pages & BFF AI routes
│   ├── components/              # UI, wallet, funding, AI widgets
│   ├── contracts/               # Campaign.sol, CrowdfundingFactory.sol
│   ├── hooks/                   # auth, campaigns, i18n
│   ├── lib/                     # API client, contracts, websocket
│   └── scripts/                 # Hardhat deploy
│
├── fund-server/                 # NestJS API
│   ├── src/
│   │   ├── auth/ users/ campaigns/ funding/
│   │   ├── storage/ websocket/ notifications/ i18n/
│   │   ├── blog/ careers/ support/ contact/
│   │   └── scripts/create-superadmin.ts
│   └── database/                # SQL migrations & seeds
│
├── fund-app/                    # Flutter Android / iOS
│   ├── lib/
│   │   ├── screens/             # home, campaigns, create, admin, …
│   │   ├── providers/           # auth, campaigns, copilot
│   │   ├── models/              # campaign, reward, user
│   │   └── widgets/             # shared UI kit
│   └── pubspec.yaml
│
├── .github/workflows/ci.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js 18+** and **npm 10+**
* **Flutter 3.4+** (mobile only)
* **MetaMask** (wallet testing)
* **PostgreSQL 15+** via Docker **or** a Supabase project
* **Google Gemini API key** (optional, for live AI)

### 1. Clone the Repository

```bash
git clone https://github.com/alihaiderdevP2P/funddefi.git
cd funddefi
```

### 2. Backend

```bash
cd fund-server
cp .env.example .env   # or create .env from the template below
npm install
```

**Database — Docker:**

```bash
docker-compose up -d
```

**Database — Supabase:**

```bash
npm run db:migrate:supabase
npm run storage:setup
```

Create the first superadmin:

```bash
npm run create-superadmin
```

Start the API:

```bash
npm run start:dev
```

| Check | URL |
|-------|-----|
| API | http://localhost:3001/api/v1 |
| Health | http://localhost:3001/api/v1/health |
| Swagger | http://localhost:3001/docs |

### 3. Web App

```bash
cd fund-client
cp .env.example .env
npm install
npm run dev
```

Visit:

```text
http://localhost:3000
```

### 4. Mobile App (optional)

```bash
cd fund-app
cp .env.example .env
flutter pub get
flutter run
```

Point `API_BASE_URL` at `http://localhost:3001/api/v1` (use your machine IP on a physical device).

### 5. Deploy Contracts (optional)

```bash
cd fund-client
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the factory address into `NEXT_PUBLIC_FACTORY_ADDRESS`.

---

## 🔐 Environment Variables

### `fund-client/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_LANG_DEFAULT=en
NEXT_PUBLIC_LANG_FALLBACK=en
NEXT_PUBLIC_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### `fund-server/.env`

```env
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=crowdfunding

JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development

LANG_DEFAULT=en
LANG_FALLBACK=en

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_STORAGE_BUCKET=campaign-images
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Never commit real secrets. Rotate any key that has been shared in chat or screenshots.

---

## 🏗️ Build for Production

### Web

```bash
cd fund-client
npm run build
npm start
```

### API

```bash
cd fund-server
npm run build
npm run start:prod
```

### Mobile

```bash
cd fund-app
flutter build apk          # Android
flutter build appbundle    # Play Store
flutter build ipa          # iOS (macOS)
```

---

## 🐳 Docker

Each service includes a production Dockerfile.

```bash
# API
cd fund-server
docker build -t fundflow-api .
docker run -p 3001:3001 fundflow-api

# Web
cd fund-client
docker build -t fundflow-web .
docker run -p 3000:3000 fundflow-web
```

---

## ☁️ Deployment

| Service | Recommended platform |
|---------|----------------------|
| **Web** | [Vercel](https://vercel.com/) — set `NEXT_PUBLIC_API_URL` to the live API |
| **API** | Railway / Render / Fly.io / any Docker host |
| **Database + Storage** | Supabase |
| **Contracts** | Sepolia or Polygon via Hardhat |
| **Mobile** | Google Play (AAB) · Apple App Store / TestFlight (IPA) |

Live web client:

**[funddefi-client-six.vercel.app](https://funddefi-client-six.vercel.app/)**

CORS origins are configured in `fund-server/src/main.ts` (`CORS_ORIGINS` or the default localhost + Vercel list).

---

## ⚡ Performance

* Next.js App Router with lazy-loaded campaign media
* Flutter cached network images and shimmer placeholders
* Socket.IO rooms so clients only receive relevant live events
* Standalone / Docker production builds for the API
* WebGL-free web UI so the product stays fast on recruiter laptops and phones

---

## 🔐 Security

* bcrypt password hashing
* JWT sessions with configurable expiry
* class-validator on every DTO
* Guard-based RBAC for admin and superadmin routes
* Non-custodial wallets — users keep their keys
* Contract refunds when a campaign fails
* CORS origin whitelist
* Secrets stay in `.env` and are never committed

---

## 🗺️ Roadmap

- [ ] Multi-chain support (Arbitrum, Base, BSC)
- [ ] Campaign milestones with escrow releases
- [ ] Email notifications for pledges and updates
- [ ] Unique user handles
- [ ] KYC / AML hooks
- [ ] Wire remaining admin UI charts to live APIs

---

## 📄 License

This project is available under the **MIT License**.

---

# 👨‍💻 About Me

## Ali Haider

**Full-Stack / Frontend Developer**

I build modern, interactive products with **React, Next.js, TypeScript, NestJS, Flutter, Ethereum, and Tailwind CSS** — combining solid engineering with a product-quality user experience.

### 🌐 Portfolio

**[ali-haider-portfolio-dev-mu.vercel.app](https://ali-haider-portfolio-dev-mu.vercel.app/)**

### 💼 LinkedIn

**[linkedin.com/in/ali-haider-1496a4413](https://www.linkedin.com/in/ali-haider-1496a4413/)**

### 🐙 GitHub

**[github.com/AliHaiderRoy](https://github.com/AliHaiderRoy/)** · **[github.com/alihaiderdevP2P](https://github.com/alihaiderdevP2P/funddefi)**

---

## 🤝 Connect With Me

Interested in collaborating, discussing a project, or connecting?

**🌐 Portfolio**
[Visit my portfolio →](https://ali-haider-portfolio-dev-mu.vercel.app/)

**💼 LinkedIn**
[Connect with me →](https://www.linkedin.com/in/ali-haider-1496a4413/)

**🐙 GitHub**
[View this repository →](https://github.com/alihaiderdevP2P/funddefi)

---

<div align="center">

### ⭐ If you like this project, consider giving it a star!

**Built with ❤️ by Ali Haider**

[🌐 Portfolio](https://ali-haider-portfolio-dev-mu.vercel.app/) · [💼 LinkedIn](https://www.linkedin.com/in/ali-haider-1496a4413/) · [🐙 GitHub](https://github.com/alihaiderdevP2P/funddefi)

</div>
