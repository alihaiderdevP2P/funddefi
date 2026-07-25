# 🔧 Manual Database Fix - Quick Guide

## Current Situation

- PostgreSQL is running on port 5432 (Postgres.app)
- We need to stop it to use Docker instead
- Docker PostgreSQL has known credentials

---

## ✅ SOLUTION: Stop PostgreSQL and Start Docker (2 minutes)

### Option 1: Manually Quit Postgres.app

**Step 1:** Open Activity Monitor

```bash
# Press Cmd+Space, type "Activity Monitor", press Enter
```

**Step 2:** Find and Quit PostgreSQL

1. In Activity Monitor, search for "postgres"
2. Select all postgres processes
3. Click the ❌ (Stop) button
4. Choose "Force Quit"

**Step 3:** Start Docker PostgreSQL

```bash
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
docker compose up -d postgres
```

**Step 4:** Wait 10 seconds

```bash
sleep 10
```

**Step 5:** Restart Your Backend

```bash
# Go to the terminal where backend is running
# Press Ctrl+C
# Then run:
npm run start:dev
```

✅ **Done!** No more database errors.

---

### Option 2: Use Existing Postgres.app (Alternative)

If you want to keep using Postgres.app instead of Docker:

**Step 1:** Connect to PostgreSQL

```bash
psql postgres
```

**Step 2:** Create Database and User

```sql
CREATE DATABASE crowdfunding;
CREATE USER postgresuser WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE crowdfunding TO postgresuser;
\q
```

**Step 3:** Update Backend .env File

```bash
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgresuser
DB_PASSWORD=password
DB_NAME=crowdfunding
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
NODE_ENV=development
EOF
```

**Step 4:** Restart Backend

```bash
npm run start:dev
```

---

## 🎯 Recommended: Option 1 (Docker)

Docker is better because:

- ✅ Isolated from your system
- ✅ Easy to reset/restart
- ✅ Same setup across team members
- ✅ Can run multiple databases

---

## 🧪 Verify It Works

After following either option, check your backend terminal:

**✅ Success looks like:**

```
[Nest] LOG [TypeOrmModule] dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```

**❌ Error looks like:**

```
ERROR [TypeOrmModule] Unable to connect to the database
Error: password authentication failed
```

---

## 📊 Final Setup

After fixing:

```
✅ Frontend:  http://localhost:3000
✅ Backend:   http://localhost:3001
✅ Database:  localhost:5432 (Docker or Postgres.app)
```

---

## 💡 Pro Tip

**To prevent this in future:**

1. If using Docker: Keep Docker Desktop running
2. If using Postgres.app: Remember your password or use trust authentication

---

## 🆘 Still Having Issues?

Run this command to see what's on port 5432:

```bash
sudo lsof -i :5432
```

Then:

1. Note the PID (process ID) number
2. Kill it: `sudo kill -9 <PID>`
3. Try starting Docker again
