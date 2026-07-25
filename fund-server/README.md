# FundFlow — Blockchain Crowdfunding Platform

A full-stack decentralized crowdfunding platform built with **Next.js**, **NestJS**, **PostgreSQL/Supabase**, **Ethereum smart contracts**, and **Google Gemini AI**. Creators launch campaigns, backers pledge via wallet, and the platform provides real-time updates, AI assistance, and role-based administration.

---

## Table of Contents

1. [What Is FundFlow?](#what-is-fundflow)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [User Journey (Start to End)](#user-journey-start-to-end)
6. [Frontend — All Pages & Routes](#frontend--all-pages--routes)
7. [Frontend — Key Components](#frontend--key-components)
8. [Frontend API Routes (BFF)](#frontend-api-routes-bff)
9. [Backend — NestJS Modules](#backend--nestjs-modules)
10. [Backend — REST API Reference](#backend--rest-api-reference)
11. [Authentication & Roles](#authentication--roles)
12. [Database Schema](#database-schema)
13. [Image Storage (Supabase)](#image-storage-supabase)
14. [Blockchain & Smart Contracts](#blockchain--smart-contracts)
15. [AI Features (Google Gemini)](#ai-features-google-gemini)
16. [WebSocket & Real-Time Updates](#websocket--real-time-updates)
17. [Internationalization (i18n)](#internationalization-i18n)
18. [Admin Dashboard & RBAC](#admin-dashboard--rbac)
19. [Environment Variables](#environment-variables)
20. [Local Development Setup](#local-development-setup)
21. [Deployment](#deployment)
22. [Security](#security)
23. [Troubleshooting](#troubleshooting)
24. [Roadmap](#roadmap)

---

## What Is FundFlow?

FundFlow is a **Crowdfunding 3.0** platform that combines:

- **Traditional web app** — user accounts, campaign CRUD, rewards, profiles, support
- **Blockchain layer** — Ethereum smart contracts for transparent fund collection, refunds, and withdrawals
- **AI layer** — Gemini-powered chat, campaign analysis, fraud detection, recommendations, and content generation
- **Real-time layer** — Socket.IO broadcasts for live funding stats and campaign updates

The platform serves three main user types:

| Role | Who | What they do |
|------|-----|--------------|
| **Backer** | Registered user | Browse campaigns, pledge funds, select rewards, track backed projects |
| **Creator** | Registered user | Create campaigns, set reward tiers, deploy smart contracts, manage funding |
| **Admin / Superadmin** | Platform staff | Manage users, moderate campaigns, view analytics (backend RBAC enforced) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (User)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│  Next.js    │   │  MetaMask    │   │  Socket.IO   │
│  fund-client│   │  (Ethereum)  │   │  (live stats)│
│  :3000      │   │              │   │              │
└──────┬──────┘   └──────┬───────┘   └──────┬───────┘
       │                 │                  │
       │  REST proxy     │  on-chain tx     │
       ▼                 ▼                  ▼
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│  NestJS     │   │  Smart       │   │  WebSocket   │
│  fund-server│   │  Contracts   │   │  Gateway     │
│  :3001/api  │   │  (Sepolia)   │   │              │
└──────┬──────┘   └──────────────┘   └──────────────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐   ┌──────────────┐
│ PostgreSQL  │   │  Supabase    │
│ (users,     │   │  Storage     │
│  campaigns, │   │  (images)    │
│  fundings)  │   │              │
└─────────────┘   └──────────────┘
```

**Monorepo layout:**

```
fund-fyp-main/
├── README.md                 ← this file
└── fund-fyp-main/
    ├── fund-client/          ← Next.js 14 frontend + Hardhat contracts
    └── fund-server/          ← NestJS 10 backend API
```

---

## Tech Stack

### Frontend (`fund-client`)

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 4, Radix UI, shadcn/ui |
| State | React Context (`use-auth`, `use-i18n`), React Hooks |
| HTTP | Axios (`lib/api.ts`) |
| WebSocket | Socket.IO Client |
| Blockchain | ethers.js v5, Hardhat, Solidity 0.8.19 |
| AI | Google Gemini (`@google/generative-ai`) |
| Themes | next-themes (dark/light mode) |

### Backend (`fund-server`)

| Category | Technology |
|----------|------------|
| Framework | NestJS 10 |
| ORM | TypeORM |
| Database | PostgreSQL 15 (Docker) or Supabase Postgres |
| Storage | Supabase Storage (campaign/reward images) |
| Auth | Passport.js + JWT, bcrypt password hashing |
| WebSocket | Socket.IO |
| Validation | class-validator, class-transformer |
| Docs | Swagger at `/api/docs` |

### Blockchain

| Item | Detail |
|------|--------|
| Contracts | `CrowdfundingFactory.sol`, `Campaign.sol` |
| Tooling | Hardhat |
| Networks | Hardhat local, Sepolia, Polygon, Mumbai |
| Wallet | MetaMask via `window.ethereum` |

---

## Project Structure

```
fund-fyp-main/
├── fund-client/
│   ├── app/                        # Next.js App Router pages
│   │   ├── page.tsx                # Home
│   │   ├── campaigns/              # Browse + detail
│   │   ├── create/                 # Campaign creation wizard
│   │   ├── dashboard/              # User dashboard
│   │   ├── login/ register/        # Auth pages
│   │   ├── profile/ settings/      # User account
│   │   ├── admin/                  # Admin panel
│   │   ├── support/ contact/       # Support & contact
│   │   ├── how-it-works/ about/    # Marketing pages
│   │   ├── blog/ careers/ docs/    # Content pages
│   │   └── api/                    # Next.js BFF routes (AI, proxy)
│   ├── components/                 # React components
│   │   ├── ui/                     # shadcn UI primitives
│   │   ├── wallet-connect.tsx      # MetaMask integration
│   │   ├── funding-flow.tsx        # Backing wizard
│   │   ├── ai-chat-assistant.tsx   # AI chat widget
│   │   └── ...
│   ├── contracts/                  # Solidity smart contracts
│   ├── hooks/                      # use-auth, use-campaigns, use-i18n
│   ├── lib/                        # api.ts, contracts.ts, websocket.ts
│   └── scripts/                    # Hardhat deploy scripts
│
└── fund-server/
    ├── src/
    │   ├── auth/                   # Login, register, JWT
    │   ├── users/                  # User CRUD + admin management
    │   ├── campaigns/              # Campaign + reward CRUD
    │   ├── funding/                # Pledge records
    │   ├── websocket/              # Socket.IO gateway
    │   ├── storage/                # Supabase image upload
    │   └── i18n/                   # Server-side translations
    ├── database/
    │   ├── init.sql                # Local Postgres schema
    │   ├── supabase-init.sql       # Supabase schema
    │   ├── seed.sql                # Sample data
    │   └── STORAGE.md              # Image storage docs
    └── scripts/                    # Migration, storage setup
```

---

## User Journey (Start to End)

### 1. Discover the Platform

1. User visits **Home** (`/`) — sees hero, featured campaigns, live platform stats, AI recommendations
2. Reads **How It Works** (`/how-it-works`) — learns about blockchain security and refund policy
3. Browses **Campaigns** (`/campaigns`) — search, filter by category/status, AI-powered search

### 2. Register & Connect Wallet

1. User clicks **Register** (`/register`) — provides name, email, password, optional wallet address
2. Account is created with role **`user`** (always enforced)
3. User clicks **Connect Wallet** in navigation — MetaMask prompts for connection
4. Wallet address is linked to profile via **Settings** (`/settings`)

### 3. Back a Campaign

1. User opens a campaign at `/campaigns/[id]`
2. Clicks **Back This Project** → funding flow opens
3. Enters amount, optionally selects a **reward tier**
4. Confirms transaction in MetaMask (on-chain) or records pledge via API
5. Funding record saved in `fundings` table with `transaction_hash`
6. WebSocket broadcasts `new-funding` and `campaign-updated` to all connected clients
7. User sees backed campaigns on **Dashboard** (`/dashboard`)

### 4. Create a Campaign

1. User navigates to **Create** (`/create`) — multi-step wizard:
   - **Step 1:** Basic info (title, category, goal, end date)
   - **Step 2:** Description & summary (AI can generate content)
   - **Step 3:** Upload campaign image → `POST /api/upload/image` → Supabase Storage
   - **Step 4:** Add reward tiers (title, min amount, delivery date, max backers)
   - **Step 5:** Review & launch
2. Optional: deploy smart contract via `CrowdfundingFactory.createCampaign()`
3. Campaign saved to database with `contract_address` and `image_url`
4. Campaign appears on browse page and creator's dashboard

### 5. Manage Account

- **Profile** (`/profile`) — view public profile
- **Settings** (`/settings`) — update name, bio, avatar, wallet, password, notifications
- **Dashboard** (`/dashboard`) — analytics, created campaigns, backed campaigns, campaign management

### 6. Get Support

- **Support Center** (`/support`) — FAQ, live chat UI, submit support ticket
- **AI Chat Assistant** — floating widget on all pages, powered by Gemini
- **Contact** (`/contact`) — contact form with email/chat/phone options

### 7. Admin Operations (Staff Only)

1. Superadmin created via `npm run create-superadmin` in fund-server
2. Superadmin creates admin accounts via API
3. Admin logs in and accesses **Admin Dashboard** (`/admin`)
4. Manages campaigns, users, moderation, analytics (UI uses mock data; backend RBAC is enforced)

---

## Frontend — All Pages & Routes

| Route | Page | Description | Auth Required |
|-------|------|-------------|---------------|
| `/` | Home | Hero, featured campaigns, live stats, AI recommendations, wallet connect | No |
| `/campaigns` | Browse | Search, filter, sort campaigns; AI search filter | No |
| `/campaigns/[id]` | Campaign Detail | Full campaign view, rewards, funding flow, progress bar | No |
| `/create` | Create Campaign | Multi-step wizard: info → content → image → rewards → launch | Yes |
| `/dashboard` | Dashboard | Created/backed campaigns, analytics, management tools | Yes + Wallet |
| `/login` | Login | Email/password login → JWT stored in localStorage | No |
| `/register` | Register | Public registration (always creates `user` role) | No |
| `/profile` | Profile | View/edit user profile | Yes |
| `/settings` | Settings | Account, password, wallet, notifications | Yes |
| `/admin` | Admin Panel | Platform overview, campaigns, users, moderation, analytics | Admin/Superadmin |
| `/support` | Support Center | FAQ, live chat, ticket submission | No |
| `/how-it-works` | How It Works | Platform explainer, blockchain security, refund policy | No |
| `/about` | About | Company/platform information | No |
| `/contact` | Contact | Contact form, email, chat, phone options | No |
| `/docs` | Documentation | In-app developer/user documentation | No |
| `/blog` | Blog | Blog posts and articles (marketing content) | No |
| `/careers` | Careers | Open positions, benefits, job applications | No |

---

## Frontend — Key Components

### Wallet & Blockchain

| Component | File | Purpose |
|-----------|------|---------|
| Wallet Connect | `wallet-connect.tsx` | MetaMask connect/disconnect, balance, chain switch |
| Wallet Guard | `wallet-guard.tsx` | Requires connected wallet before certain actions |
| Funding Flow | `funding-flow.tsx` | Multi-step backing wizard with MetaMask transaction |
| Funding Button | `funding-button.tsx` | Triggers funding flow from campaign detail |
| Reward Selector | `reward-selector.tsx` | Pick reward tier or custom pledge amount |
| Etherscan Link | `ui/etherscan-link.tsx` | Links to block explorer per network |

### Campaigns

| Component | File | Purpose |
|-----------|------|---------|
| Campaign Card | `campaign-card.tsx` | Campaign preview in grid/list |
| Campaign Form Steps | `campaign-form-steps.tsx` | Step indicators for create wizard |
| Campaign Management | `campaign-management.tsx` | Edit/pause/delete from dashboard |
| Start Campaign CTA | `start-campaign-cta.tsx` | Call-to-action button for creators |

### AI

| Component | File | Purpose |
|-----------|------|---------|
| AI Chat Assistant | `ai-chat-assistant.tsx` | Floating 24/7 support chatbot |
| AI Campaign Assistant | `ai-campaign-assistant.tsx` | Helps write campaign content during creation |
| AI Recommendations | `ai-campaign-recommendations.tsx` | Personalized campaign suggestions on home |
| AI Search Filter | `ai-search-filter.tsx` | Natural-language campaign search |

### Auth & Navigation

| Component | File | Purpose |
|-----------|------|---------|
| Auth Guard | `auth-guard.tsx` | Redirects unauthenticated users to login |
| Role Auth Guard | `role-auth-guard.tsx` | Restricts pages to admin/superadmin |
| User Navigation | `user-navigation.tsx` | Nav bar with user menu, logout |
| Language Switcher | `language-switcher.tsx` | Switch between en/es/fr |
| Theme Toggle | `theme-toggle.tsx` | Dark/light mode switch |

---

## Frontend API Routes (BFF)

Next.js API routes act as a Backend-for-Frontend layer, proxying to NestJS or calling Gemini directly.

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/chat-assistant` | POST | AI support chat |
| `/api/ai/campaign-analysis` | POST | Risk assessment and success prediction |
| `/api/ai/fraud-detection` | POST | Fraud/scam scoring |
| `/api/ai/campaign-recommendations` | POST | Personalized campaign suggestions |
| `/api/ai/content-generation` | POST | Generate titles, descriptions, summaries |
| `/api/campaigns` | GET, POST | List/create campaigns (proxies backend) |
| `/api/campaigns/[id]` | GET, PATCH, DELETE | Single campaign CRUD |
| `/api/campaigns/featured` | GET | Featured campaigns for home page |
| `/api/funding/stats` | GET | Platform-wide funding statistics |
| `/api/users/me` | GET | Current authenticated user |
| `/api/support` | POST | Submit support ticket |
| `/api/auth/change-password` | POST | Change user password |

---

## Backend — NestJS Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| **Auth** | `src/auth/` | Login, register, JWT issuance, logout, session tracking |
| **Users** | `src/users/` | User CRUD, admin creation, role management |
| **Campaigns** | `src/campaigns/` | Campaign CRUD, featured list, reward tiers |
| **Funding** | `src/funding/` | Pledge records, stats, WebSocket broadcasts |
| **WebSocket** | `src/websocket/` | Socket.IO gateway, rooms, live events |
| **Storage** | `src/storage/` | Image upload to Supabase Storage |
| **i18n** | `src/i18n/` | Global interceptor, translated API error messages |

**Swagger docs:** `http://localhost:3001/api/docs` (when backend is running)

---

## Backend — REST API Reference

All endpoints prefixed with `/api`.

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/login` | None | Login → returns JWT |
| POST | `/register` | None | Register (always creates `user` role) |
| GET | `/profile` | JWT | Get current user profile |
| POST | `/logout` | JWT | Invalidate session |
| POST | `/admin/create-user` | Admin+ | Create regular user account |

### Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | JWT | Create user |
| GET | `/` | JWT | List all users |
| GET | `/:id` | JWT | Get user by ID |
| PATCH | `/:id` | JWT | Update user (role excluded) |
| DELETE | `/:id` | JWT | Delete user |
| POST | `/admin/create` | Superadmin | Create admin/superadmin account |
| PATCH | `/:id/role` | Superadmin | Change user role |
| GET | `/admin/list` | Superadmin | List admin/superadmin users |

### Campaigns (`/api/campaigns`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | JWT | Create campaign |
| GET | `/` | None | List campaigns (filters: status, category, search, page, limit) |
| GET | `/featured` | None | Featured campaigns |
| GET | `/my-campaigns` | JWT | Current user's campaigns |
| GET | `/:id` | None | Get campaign by ID |
| PATCH | `/:id` | JWT | Update campaign |
| DELETE | `/:id` | JWT | Delete campaign |
| POST | `/:id/rewards` | JWT | Add reward tier to campaign |

### Funding (`/api/funding`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | JWT | Create funding/pledge record |
| GET | `/` | JWT | List all fundings |
| GET | `/stats` | None | Platform funding statistics |
| GET | `/my-fundings` | JWT | Current user's fundings |
| GET | `/campaign/:campaignId` | None | Fundings for a campaign |
| GET | `/:id` | JWT | Get funding by ID |
| PATCH | `/:id` | JWT | Update funding status |

### Upload (`/api/upload`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/image` | JWT | Upload image → Supabase Storage → returns public URL |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |

---

## Authentication & Roles

### JWT Flow

1. User logs in via `POST /api/auth/login` with email + password
2. Server returns JWT token (expires in 7 days by default)
3. Frontend stores token in `localStorage`
4. All authenticated requests send `Authorization: Bearer <token>`
5. JWT payload includes: `sub` (user ID), `email`, `role`

### Role Hierarchy

```
user  <  admin  <  superadmin
```

| Role | Permissions |
|------|-------------|
| **user** | Create campaigns, back projects, manage own profile |
| **admin** | All user permissions + create user accounts, access admin UI |
| **superadmin** | All admin permissions + create admins, change roles (max 3 superadmins) |

### Registration Rules

- Public registration (`POST /api/auth/register`) **always** creates `user` role
- Any `role` field in registration body is **ignored**
- Admin/superadmin accounts can **only** be created by superadmin via API or script

---

## Database Schema

PostgreSQL database with 4 main tables. Schema defined in `fund-server/database/init.sql` (local) and `supabase-init.sql` (Supabase).

### Enums

| Enum | Values |
|------|--------|
| `campaign_status` | `draft`, `active`, `funded`, `expired`, `cancelled` |
| `campaign_category` | `technology`, `creative`, `community`, `business`, `environment`, `health`, `education` |
| `funding_status` | `pending`, `confirmed`, `failed`, `refunded` |
| `user_role` | `user`, `admin`, `superadmin` |

### Tables

#### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| email | VARCHAR(255) | Unique, login identifier |
| name | VARCHAR(255) | Display name |
| password | VARCHAR(255) | bcrypt hashed |
| wallet_address | VARCHAR(255) | Optional Ethereum address |
| avatar | VARCHAR(500) | Profile image URL (Supabase Storage) |
| bio | TEXT | User biography |
| is_verified | BOOLEAN | Default false |
| role | user_role | Default `user` |
| created_at, updated_at | TIMESTAMP | Auto-managed |

#### `campaigns`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| title | VARCHAR(255) | |
| description | TEXT | Full campaign description |
| summary | TEXT | Short summary |
| goal_amount | DECIMAL(18,8) | Funding target |
| raised_amount | DECIMAL(18,8) | Default 0 |
| end_date | TIMESTAMP | Campaign deadline |
| status | campaign_status | Default `draft` |
| category | campaign_category | |
| image_url | VARCHAR(500) | Supabase Storage URL |
| video_url | VARCHAR(500) | Optional |
| contract_address | VARCHAR(255) | Deployed smart contract |
| backers_count | INTEGER | Default 0 |
| creator_id | UUID (FK → users) | |
| created_at, updated_at | TIMESTAMP | |

#### `rewards`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| title | VARCHAR(255) | Reward tier name |
| description | TEXT | |
| min_amount | DECIMAL(18,8) | Minimum pledge for this tier |
| delivery_date | TIMESTAMP | Estimated delivery |
| max_backers | INTEGER | Capacity limit |
| current_backers | INTEGER | Default 0 |
| image_url | VARCHAR(500) | Optional reward image |
| campaign_id | UUID (FK → campaigns) | |
| created_at, updated_at | TIMESTAMP | |

#### `fundings`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| amount | DECIMAL(18,8) | Pledge amount |
| transaction_hash | VARCHAR(255) | On-chain tx hash |
| status | funding_status | Default `pending` |
| message | TEXT | Optional backer message |
| backer_info | JSONB | Additional backer metadata |
| user_id | UUID (FK → users) | |
| campaign_id | UUID (FK → campaigns) | |
| reward_id | UUID (FK → rewards) | Optional |
| created_at, updated_at | TIMESTAMP | |

### Entity Relationships

```
users ──1:N──► campaigns (creator_id)
users ──1:N──► fundings (user_id)
campaigns ──1:N──► rewards (campaign_id)
campaigns ──1:N──► fundings (campaign_id)
rewards ──1:N──► fundings (reward_id)
```

> **Note:** There is no `handle` (username) field. Users are identified by `email` and `name`.

---

## Image Storage (Supabase)

Campaign and reward images are **not** stored in Postgres. Only URLs are saved in the database.

| Table | Column | Storage |
|-------|--------|---------|
| `campaigns` | `image_url` | Supabase Storage public URL |
| `rewards` | `image_url` | Supabase Storage public URL |
| `users` | `avatar` | Supabase Storage public URL |

**Upload flow:**

1. User picks image on Create Campaign page
2. Frontend calls `POST /api/upload/image` (multipart form)
3. NestJS uploads to Supabase Storage bucket `campaign-images`
4. Public URL returned and saved in `campaigns.image_url`

**Setup:**

```bash
cd fund-fyp-main/fund-server
npm run storage:setup      # Creates bucket (once)
npm run db:migrate:supabase # Creates Postgres tables (once)
```

---

## Blockchain & Smart Contracts

### Contracts (`fund-client/contracts/`)

**CrowdfundingFactory.sol**
- `createCampaign(title, description, goal, durationDays, category)` — deploys a new Campaign contract
- Tracks all deployed campaigns and creator mappings
- Emits `CampaignCreated` event

**Campaign.sol**
- `contribute()` — payable, accepts ETH pledges from backers
- `withdraw()` — creator withdraws funds after goal reached
- `refund()` — automatic refund if goal not met by deadline
- `cancel()` — creator cancels campaign
- Events: `ContributionMade`, `GoalReached`, `FundsWithdrawn`, `RefundIssued`

### Integration Flow

1. User connects MetaMask via `wallet-connect.tsx`
2. **Create campaign:** calls `factory.createCampaign()` → saves `contract_address` in DB
3. **Back campaign:** calls `campaign.contribute{value: amount}()` → saves `transaction_hash` in fundings
4. Explorer links generated via `lib/utils.ts` network map

### Deploy Contracts

```bash
cd fund-fyp-main/fund-client
npx hardhat run scripts/deploy.js --network sepolia
# Copy deployed factory address to NEXT_PUBLIC_FACTORY_ADDRESS in .env
```

### Supported Networks

| Network | Chain ID | Usage |
|---------|----------|-------|
| Hardhat Local | 31337 | Development |
| Sepolia | 11155111 | Testnet (default) |
| Polygon | 137 | Mainnet |
| Mumbai | 80001 | Polygon testnet |

---

## AI Features (Google Gemini)

AI is powered by **Google Gemini** (not OpenAI). Requires `GEMINI_API_KEY` in frontend `.env`. Without a key, routes return mock/fallback responses.

### AI Endpoints

| Endpoint | Input | Output |
|----------|-------|--------|
| `POST /api/ai/chat-assistant` | `{ message, conversationHistory }` | AI chat response |
| `POST /api/ai/campaign-analysis` | `{ title, description, goal, category, duration }` | Risk score, success prediction |
| `POST /api/ai/fraud-detection` | `{ campaignData, creatorData }` | Fraud risk score and flags |
| `POST /api/ai/campaign-recommendations` | `{ userAddress, backingHistory, preferences }` | Recommended campaigns |
| `POST /api/ai/content-generation` | `{ type, context }` | Generated title/description/summary |

### Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Add to `fund-client/.env`:
   ```env
   GEMINI_API_KEY=your-key-here
   ```

### Where AI Appears in the UI

- **Floating chat widget** — all pages (`ai-chat-assistant.tsx`)
- **Campaign creation** — AI generates titles and descriptions (`ai-campaign-assistant.tsx`)
- **Home page** — personalized recommendations (`ai-campaign-recommendations.tsx`)
- **Campaign browse** — natural language search (`ai-search-filter.tsx`)

---

## WebSocket & Real-Time Updates

### Server Events (broadcast from NestJS)

| Event | Trigger | Data |
|-------|---------|------|
| `campaign-updated` | Campaign PATCH | Updated campaign object |
| `new-funding` | Funding POST | New funding record |
| `campaign-status-changed` | Status change | Campaign ID + new status |
| `platform-stats-updated` | Any funding | Total raised, backer count |
| `global-notification` | Various | Platform-wide notifications |

### Client Usage

- Home page subscribes to `platform-stats-updated` for live counter
- Campaign detail pages can join `campaign-{id}` room for live updates
- Client singleton: `lib/websocket.ts` connects to `NEXT_PUBLIC_WS_URL`

### Configuration

```env
# fund-client/.env
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

---

## Internationalization (i18n)

### Supported Locales

| Code | Language |
|------|----------|
| `en` | English (default) |
| `es` | Spanish |
| `fr` | French |

### Client-Side

- Translation files: `fund-client/lib/i18n/translations/{en,es,fr}.json`
- Hook: `use-i18n.tsx` — provides `t(key)` function and `locale` state
- Locale persisted in `localStorage`
- Component: `language-switcher.tsx` in navigation
- API calls send `Accept-Language` header

### Server-Side

- Translation files: `fund-server/src/i18n/translations/{en,es,fr}.json`
- Global `I18nInterceptor` reads `Accept-Language` header
- API error messages returned in user's locale

> Campaign content (titles, descriptions) is **not** multi-locale in the database. Only UI strings and API messages are translated.

---

## Admin Dashboard & RBAC

### Role Management

| Action | Who Can Do It | Endpoint |
|--------|---------------|----------|
| Register | Anyone | `POST /api/auth/register` → always `user` |
| Create user account | Admin/Superadmin | `POST /api/auth/admin/create-user` → always `user` |
| Create admin account | Superadmin only | `POST /api/users/admin/create` |
| Change user role | Superadmin only | `PATCH /api/users/:id/role` |
| List admins | Superadmin only | `GET /api/users/admin/list` |

**Restrictions:**
- Maximum **3 superadmin** accounts enforced
- Role cannot be changed through regular user update endpoint
- All admin management endpoints require superadmin JWT

### Create Initial Superadmin

```bash
cd fund-fyp-main/fund-server
npm run create-superadmin
```

Interactive script prompts for 2–3 superadmin accounts.

### Admin UI (`/admin`)

Protected by `RoleAuthGuard` (requires `admin` or `superadmin` role).

| Tab | Content |
|-----|---------|
| Overview | Platform stats (total users, campaigns, funding) |
| Campaigns | Pending approvals, approve/reject actions |
| Users | User list, role management |
| Moderation | Flagged content review |
| Analytics | Charts and performance metrics |

> **Note:** Admin UI currently uses mock data for display. Backend RBAC is the source of truth for role enforcement.

---

## Environment Variables

### Frontend (`fund-client/.env`)

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001/api

# i18n
NEXT_PUBLIC_LANG_DEFAULT=en
NEXT_PUBLIC_LANG_FALLBACK=en

# Smart contracts (set after deployment)
NEXT_PUBLIC_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Hardhat / blockchain (for contract deploy only)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=
ETHERSCAN_API_KEY=
POLYGONSCAN_API_KEY=

# Supabase (optional — for client-side storage access)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (`fund-server/.env`)

```env
# Database — Option A: Local Docker Postgres
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=crowdfunding

# Database — Option B: Supabase
# DB_HOST=db.your-project.supabase.co
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=your-db-password
# DB_NAME=postgres
# DB_SSL=true

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# i18n
LANG_DEFAULT=en
LANG_FALLBACK=en

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_STORAGE_BUCKET=campaign-images
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- MetaMask browser extension (for wallet testing)
- PostgreSQL 15+ (via Docker) or Supabase account
- Google Gemini API key (optional, for AI features)

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd fund-fyp-main/fund-fyp-main

# Frontend
cd fund-client
cp .env.example .env
npm install

# Backend
cd ../fund-server
cp .env.example .env
npm install
```

### Step 2: Database Setup

**Option A — Docker (local Postgres):**

```bash
cd fund-fyp-main/fund-server
docker-compose up -d
# Postgres runs on host port 5433
# Schema auto-created from init.sql
```

**Option B — Supabase (cloud Postgres + Storage):**

```bash
cd fund-fyp-main/fund-server
# Configure DB_* and SUPABASE_* in .env
npm run db:migrate:supabase
npm run storage:setup
```

### Step 3: Create Superadmin

```bash
cd fund-fyp-main/fund-server
npm run create-superadmin
```

### Step 4: Start Servers

**Terminal 1 — Backend:**

```bash
cd fund-fyp-main/fund-server
npm run start:dev
# API: http://localhost:3001/api
# Swagger: http://localhost:3001/api/docs
```

**Terminal 2 — Frontend:**

```bash
cd fund-fyp-main/fund-client
npm run dev
# App: http://localhost:3000
```

### Step 5: Deploy Smart Contracts (Optional)

```bash
cd fund-fyp-main/fund-client
npx hardhat run scripts/deploy.js --network sepolia
# Set NEXT_PUBLIC_FACTORY_ADDRESS in fund-client/.env
```

### Verify Everything Works

| Check | URL |
|-------|-----|
| Home page loads | http://localhost:3000 |
| Campaigns browse | http://localhost:3000/campaigns |
| API health | http://localhost:3001/api/health |
| Swagger docs | http://localhost:3001/api/docs |
| Register & login | http://localhost:3000/register |
| Connect MetaMask | Click "Connect Wallet" in nav |
| Create campaign | http://localhost:3000/create |
| AI chat | Click chat icon (bottom-right) |

> Frontend can run standalone with mock data. Full persistence requires the backend running.

---

## Deployment

> **Full step-by-step guide:** see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) (Vercel + Railway/Render, env vars, CORS, checklist).

### Recommended Architecture

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | Vercel / Netlify | Next.js static + SSR |
| Backend | Railway / Render / VPS | NestJS with PM2 |
| Database | Supabase Postgres | Managed Postgres |
| Storage | Supabase Storage | Campaign images |
| Contracts | Sepolia / Polygon | Deploy via Hardhat |

### Steps

1. **Database:** Run `npm run db:migrate:supabase` against production Supabase
2. **Storage:** Run `npm run storage:setup` for production bucket
3. **Backend:** Deploy fund-server, set env vars, run `npm run start:prod`
4. **Frontend:** Deploy fund-client, set `NEXT_PUBLIC_API_URL` to production backend
5. **Contracts:** Deploy to target network, set `NEXT_PUBLIC_FACTORY_ADDRESS`
6. **Superadmin:** Run `npm run create-superadmin` against production DB

### CORS

Backend CORS is configured for `localhost:3000` and a placeholder production domain. Update in `fund-server/src/main.ts` for your domain.

---

## Security

| Area | Implementation |
|------|----------------|
| Passwords | bcrypt hashing (10 rounds) |
| Auth tokens | JWT with configurable expiry |
| API input | class-validator on all DTOs |
| Roles | Guard-based RBAC on all admin endpoints |
| Wallet | Non-custodial — users control private keys |
| Smart contracts | Refund on failed campaigns, creator withdrawal on success |
| CORS | Configured origin whitelist |
| Secrets | Never commit `.env` files; rotate Supabase keys for production |

---

## Troubleshooting

### Frontend won't start

```bash
cd fund-fyp-main/fund-client
rm -rf .next
npm run dev
```

### Backend can't connect to database

```bash
# Check Docker Postgres is running
docker ps

# Verify .env DB_HOST and DB_PORT match
# Local Docker uses port 5433, Supabase uses 5432
```

### Wallet connection fails

1. Ensure MetaMask extension is installed
2. Switch to correct network (Sepolia for testnet)
3. Refresh the page and retry

### AI features return mock data

1. Check `GEMINI_API_KEY` is set in `fund-client/.env`
2. Verify key is valid at [Google AI Studio](https://aistudio.google.com/apikey)
3. Check browser console for error messages

### Images not uploading

1. Verify Supabase credentials in `fund-server/.env`
2. Run `npm run storage:setup` to create the bucket
3. Ensure bucket is set to **public**

### WebSocket not connecting

1. Check `NEXT_PUBLIC_WS_URL=http://localhost:3001` in frontend `.env`
2. Ensure backend is running
3. Check browser console for CORS errors

---

## Roadmap

- [ ] Multi-chain support (Polygon, BSC, Arbitrum)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Social features (comments, shares, follows)
- [ ] Email notifications for campaign updates
- [ ] Campaign milestones with escrow releases
- [ ] KYC/AML integration
- [ ] User handles (unique usernames)
- [ ] Wire admin UI to backend APIs (currently mock data)
- [ ] Complete WebSocket `@SubscribeMessage` handlers

---

## License

MIT License

---

Built with Next.js, NestJS, Ethereum, Supabase, and Google Gemini AI.
