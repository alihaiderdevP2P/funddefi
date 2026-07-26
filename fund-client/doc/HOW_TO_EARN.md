# FundFlow — How the Software Earns Money

Step-by-step guide to **platform earnings**: how FundFlow takes a **5% success fee** when a campaign withdraws funds.

---

## 1. Simple idea (1 minute)

| Who | Gets |
|-----|------|
| **Creator** | **95%** of raised ETH when they withdraw |
| **You (platform)** | **5%** sent automatically to your **treasury wallet** |
| **Backers (failed campaign)** | **100%** refund — platform takes **no fee** on refunds |

**Example**

- Campaign raises **10 ETH** and reaches its goal  
- Creator clicks **Withdraw** after the deadline  
- Creator receives **9.5 ETH**  
- Your treasury receives **0.5 ETH** ← this is your software earning  

Fee = `amount × 500 / 10000` (500 basis points = **5%**).

---

## 2. Money flow (whole path)

```
Backer pledges ETH
        ↓
Campaign smart contract (escrow holds funds)
        ↓
Goal reached + deadline passed
        ↓
Creator clicks Withdraw in Dashboard
        ↓
withdrawFunds() on contract
        ↓
    ┌───────────────────────┐
    │ 5%  → Platform treasury │  ← YOUR EARNING
    │ 95% → Creator wallet    │
    └───────────────────────┘
```

**Important:** You do **not** earn when someone only pledges. You earn when the creator **successfully withdraws** after a funded campaign.

---

## 3. What must be true to earn

1. Factory deployed with fee config (`feeBps = 500`, `feeRecipient = your treasury`)
2. Campaign created **from that factory** (new factory address in `.env`)
3. Campaign has a real `contractAddress` on-chain
4. Goal reached on-chain (`goalReached = true`)
5. Deadline passed
6. Creator calls **Withdraw** (UI or directly on contract)
7. Funds not already withdrawn

Old campaigns from the **previous** factory (no fee split) pay **100% to creator** — no platform cut.

---

## 4. Step-by-step setup (platform owner)

### Step 1 — Set fee + treasury in env

In `fund-client/.env`:

```env
NEXT_PUBLIC_PLATFORM_FEE_BPS=500
PLATFORM_FEE_BPS=500
NEXT_PUBLIC_PLATFORM_TREASURY_ADDRESS=0xYourTreasuryWallet
PLATFORM_TREASURY_ADDRESS=0xYourTreasuryWallet
```

In `fund-server/.env` (admin estimate):

```env
PLATFORM_FEE_BPS=500
```

Use a wallet you control. On testnet this can be the deployer; on mainnet prefer a dedicated / multisig wallet.

### Step 2 — Compile contracts

```bash
cd fund-client
npx hardhat compile
```

### Step 3 — Deploy factory (Sepolia example)

```bash
cd fund-client
npx hardhat run scripts/deploy.js --network sepolia
```

Deploy script reads treasury + fee from env. If treasury is empty, it uses the **deployer** address.

### Step 4 — Save the new factory address

After deploy, set:

```env
NEXT_PUBLIC_FACTORY_ADDRESS=0xYourNewFactoryAddress
```

Restart Next.js so the client picks up env changes.

### Step 5 — Current Sepolia deployment (reference)

| Item | Value |
|------|--------|
| Factory | `0x7920319bfa450D260B8c65A08fFdA48063A8842F` |
| Treasury | `0xb3e5EcC1c217A9622a0B2500404119DB8c44057F` |
| Fee | 500 bps (**5%**) |
| Network | Sepolia |

(Update this table if you redeploy.)

---

## 5. Step-by-step: earn on a live campaign

### Step A — Creator launches campaign

1. Creator creates campaign in the app (approved / active).
2. Campaign is created on-chain via **CrowdfundingFactory** (`createCampaign`).
3. DB stores `contractAddress` for that campaign.

### Step B — Backers fund

1. Backers pledge ETH through the funding UI.
2. ETH goes into the **Campaign** contract escrow (not to you yet).
3. `totalRaised` increases; when `totalRaised >= goal`, `goalReached` becomes true.

### Step C — Campaign ends successfully

1. Deadline passes (`block.timestamp >= deadline`).
2. Goal was reached.
3. Creator opens **Dashboard → Campaign Management**.
4. When eligible, **Withdraw** button appears.

### Step D — Withdraw (this is when you earn)

1. Creator opens **Withdraw**.
2. UI shows:
   - Gross raised  
   - Platform fee (5%)  
   - Creator net (95%)  
3. Creator confirms in MetaMask → `withdrawFunds()`.
4. Contract sends:
   - **5%** → `feeRecipient` (treasury)  
   - **95%** → creator  
5. Events: `PlatformFeePaid`, `FundsWithdrawn`.
6. App may mark campaign status as `funded`.

### Step E — Check your earning

1. Open your treasury wallet on [Sepolia Etherscan](https://sepolia.etherscan.io/).
2. Look for incoming ETH from the campaign contract.
3. Or check the tx for `PlatformFeePaid`.

Admin dashboard shows **estimated** fees (`total funding × fee bps`). On-chain treasury balance is the **real** earning.

---

## 6. Where this lives in the codebase

| Piece | Path |
|-------|------|
| Fee split on withdraw | `fund-client/contracts/Campaign.sol` → `withdrawFunds()` |
| Fee config for new campaigns | `fund-client/contracts/CrowdfundingFactory.sol` |
| Deploy script | `fund-client/scripts/deploy.js` |
| Fee helpers (UI) | `fund-client/lib/platform-fees.ts` |
| Contract calls | `fund-client/lib/contracts.ts`, `smart-contract-service.ts` |
| Withdraw UI | `fund-client/components/withdraw-funds-dialog.tsx` |
| Dashboard button | `fund-client/components/campaign-management.tsx` |
| Admin fee estimate | `fund-server/src/admin/admin.service.ts` |

---

## 7. Change the fee later

- **Future campaigns only:** factory owner calls `setFeeConfig(newTreasury, newBps)` (max **1000** bps = 10%).
- **Already deployed campaigns:** fee is fixed in that campaign contract (immutable for that campaign).
- Keep UI env (`NEXT_PUBLIC_PLATFORM_FEE_BPS`) in sync with what you deploy / set on the factory.

---

## 8. What does *not* earn money (yet)

These are **not** implemented as paid products:

- Stripe / card payments  
- Creator Pro subscription  
- Featured listing checkout  
- Automatic fee on every pledge (fee is on **successful withdraw** only)

Optional later ideas: featured ads, Creator Pro (AI), B2B white-label.

---

## 9. Checklist — “Am I earning?”

- [ ] Treasury address is a wallet you own  
- [ ] `NEXT_PUBLIC_FACTORY_ADDRESS` is the **new** fee-aware factory  
- [ ] New campaigns have `contractAddress` from that factory  
- [ ] At least one campaign reached goal + ended  
- [ ] Creator withdrew via UI (or contract)  
- [ ] Treasury balance increased by ~5% of that withdraw  

---

## 10. Short Urdu summary

**Software kaise kamati hai:** jab campaign successful ho aur creator **Withdraw** kare, smart contract khud **5%** aapke treasury wallet mein bhej deta hai, **95%** creator ko. Pledge ke waqt aapko paisa nahi milta — sirf successful withdraw pe milta hai. Naye factory se bane campaigns pe yeh fee lagti hai; purani (legacy) campaigns pe fee nahi kaatti.

---

*Last updated: Jul 2026 — matches on-chain 5% success fee + withdraw UI rollout.*
