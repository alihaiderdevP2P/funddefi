# 🗄️ Database Setup Guide - Fix PostgreSQL Connection Error

## ⚠️ Current Issue

```
Error: password authentication failed for user "postgres"
```

Your NestJS backend needs PostgreSQL database to run. Here are two easy options:

---

## ✅ Option 1: Use Docker (RECOMMENDED - 2 minutes)

### Step 1: Start Docker Desktop

```bash
# Open Docker Desktop application
# On Mac: Press Cmd+Space, type "Docker", press Enter
# Wait for Docker to fully start (whale icon in menu bar should be steady)
```

### Step 2: Start PostgreSQL Database

```bash
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
docker compose up -d postgres
```

### Step 3: Verify Database is Running

```bash
docker ps
# Should show: crowdfunding-postgres container running
```

### Step 4: Create Backend .env File

```bash
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=crowdfunding

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3001
NODE_ENV=development
EOF
```

### Step 5: Restart Backend

```bash
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
npm run start:dev
```

**That's it!** ✅ Database should connect successfully.

---

## 🔄 Option 2: Use PostgreSQL Without Docker

If you don't want to use Docker, install PostgreSQL locally:

### Step 1: Install PostgreSQL

```bash
# Using Homebrew (if you have it)
brew install postgresql@15

# Or download from: https://postgresapp.com/
```

### Step 2: Start PostgreSQL

```bash
# Using Homebrew
brew services start postgresql@15

# Or if using Postgres.app, just open it
```

### Step 3: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# In psql, run these commands:
CREATE DATABASE crowdfunding;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE crowdfunding TO postgres;
\q
```

### Step 4: Create Backend .env File

```bash
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=crowdfunding

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3001
NODE_ENV=development
EOF
```

### Step 5: Restart Backend

```bash
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
npm run start:dev
```

---

## 🧪 Verify Everything Works

### 1. Check Database Connection

```bash
# Should see: "LOG [InstanceLoader] TypeOrmModule dependencies initialized"
# No more "password authentication failed" errors
```

### 2. Check Backend API

```bash
curl http://localhost:3001/health
# or
curl http://localhost:3001/api
```

### 3. Check what's running

```bash
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# PostgreSQL: localhost:5432
```

---

## 🐛 Troubleshooting

### Error: "Docker is not running"

**Solution:** Open Docker Desktop application and wait for it to fully start

### Error: "Port 5432 already in use"

**Solution:** You have another PostgreSQL running

```bash
# Stop it:
lsof -i :5432
# Kill the process or:
brew services stop postgresql
```

### Error: "Cannot connect to database"

**Solution:** Wait 10 seconds for PostgreSQL to fully initialize

```bash
# Check if PostgreSQL is ready:
docker logs crowdfunding-postgres
```

### Backend still showing errors?

```bash
# Stop backend
# Ctrl+C in the terminal

# Make sure .env file exists in backend folder
ls -la /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend/.env

# Restart
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
npm run start:dev
```

---

## 📊 Database Credentials (Default)

| Setting  | Value        |
| -------- | ------------ |
| Host     | localhost    |
| Port     | 5432         |
| Username | postgres     |
| Password | password     |
| Database | crowdfunding |

---

## 🎯 Quick Start (If you have Docker Desktop running)

Just run these commands:

```bash
# 1. Start PostgreSQL
cd /Users/alimuhammadi/Desktop/BlockChain/crowdfunding-platform-backend/backend
docker compose up -d postgres

# 2. Wait 10 seconds
sleep 10

# 3. Create .env file (if not exists)
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=crowdfunding
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3001
NODE_ENV=development
EOF

# 4. Restart backend
npm run start:dev
```

Done! ✅

---

## 📝 What Your Setup Should Look Like

```
Terminal 1: Frontend (Next.js)
├── Port: 3000
└── Status: ✅ Running

Terminal 2: Backend (NestJS)
├── Port: 3001
└── Status: ✅ Running (after database fix)

Docker: PostgreSQL Database
├── Port: 5432
└── Status: ✅ Running
```

---

## 💡 Pro Tips

1. **Use Docker** - It's cleaner and easier to manage
2. **Docker Desktop** must be running before `docker compose` commands
3. **Wait 10 seconds** after starting PostgreSQL before starting backend
4. **Keep Docker running** - Stop it with `docker compose down` when done

---

## ✅ Success Checklist

After setup, you should see:

- [ ] Docker Desktop is running (if using Docker)
- [ ] `docker ps` shows `crowdfunding-postgres` container
- [ ] Backend .env file exists with database credentials
- [ ] Backend starts without "password authentication failed" error
- [ ] Backend shows: `LOG [InstanceLoader] TypeOrmModule dependencies initialized`
- [ ] No database retry errors

---

**Need help?** The error was happening because the backend was trying to connect to PostgreSQL, but no database was running. Option 1 (Docker) is the easiest fix!
