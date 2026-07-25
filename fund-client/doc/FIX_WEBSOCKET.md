# 🔧 Fix WebSocket Connection Errors

## ❌ Current Error:

```
❌ WebSocket connection error: TransportError: websocket error
❌ Max reconnection attempts reached
```

## 🎯 Root Cause:

Your **backend server is NOT running**. The frontend tries to connect to the WebSocket at `http://localhost:3001`, but there's nothing there!

---

## ✅ Solution: Start Your Backend

### Step 1: Stop PostgreSQL 17 (Postgres.app)

**Run this command and enter your Mac password:**

```bash
sudo kill -9 264
```

### Step 2: Start Docker PostgreSQL

```bash
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
docker compose up -d postgres
```

Wait 10 seconds:

```bash
sleep 10
```

### Step 3: Verify Database is Running

```bash
docker ps | grep postgres
```

Should show: `crowdfunding-postgres` container running ✅

### Step 4: Start Backend Server

**Open a NEW terminal window** and run:

```bash
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
npm run start:dev
```

You should see:

```
[Nest] LOG [NestApplication] Nest application successfully started
```

**Keep this terminal open!**

---

## ✅ After Backend Starts:

### Your Frontend Console Should Show:

```
✅ Connected to WebSocket server
```

### No More Errors:

- ✅ No more WebSocket connection errors
- ✅ No more 404 errors for API endpoints
- ✅ Real-time updates will work

---

## 📊 Your Complete Setup:

```
Terminal 1: Frontend  → http://localhost:3001 ✅ (already running)
Terminal 2: Backend   → http://localhost:3001 ✅ (start this now!)
Docker:     Database  → localhost:5432       ✅ (will start)
```

---

## 🧪 Test Backend is Working:

After starting backend, test these endpoints:

```bash
# Test health
curl http://localhost:3001/api

# Test campaigns
curl http://localhost:3001/api/campaigns

# Test WebSocket (check browser console)
# Should see: "✅ Connected to WebSocket server"
```

---

## 🐛 Troubleshooting:

### Backend won't start - Database error?

```bash
# Make sure PostgreSQL is running:
docker ps | grep postgres

# If not, start it:
cd backend
docker compose up -d postgres
sleep 10
```

### Port 3001 already in use?

Your frontend is on 3001, backend should be on different port. Let me check backend config...

Actually, looking at the WebSocket code:

```typescript
const serverUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";
```

The backend runs on port **3001** (same as frontend for simplicity).

---

## 📝 Quick Commands (Copy & Paste):

```bash
# 1. Stop Postgres.app
sudo kill -9 264

# 2. Start Docker database
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
docker compose up -d postgres
sleep 10

# 3. Open NEW terminal and start backend
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
npm run start:dev
```

---

## ✅ Success Indicators:

**Backend terminal shows:**

```
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG WebSocket Gateway initialized
```

**Browser console shows:**

```
✅ Connected to WebSocket server
```

**No more errors!** 🎉

---

**Start with Step 1 and work through each step!**
