# 🔑 How to Get Bearer Token - Complete Guide

## What is a Bearer Token?

A Bearer token (JWT - JSON Web Token) is used to authenticate API requests. Many endpoints require this token to verify you're logged in.

---

## 🚀 Method 1: Using API (Quick Test)

### Step 1: Check Backend is Running

First, make sure your backend is running:

```bash
curl http://localhost:3001/api
```

Should return a response (not 404) ✅

---

### Step 2: Register a New User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "walletAddress": "0x1234567890123456789012345678901234567890"
  }'
```

**Response will include:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

**Copy the `access_token` value** - that's your Bearer token! ✅

---

### Step 3: Login (If Already Registered)

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

### Step 4: Use the Token in API Requests

**Format:**

```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Example with real token:**

```bash
# Replace YOUR_TOKEN with the actual access_token you got
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🌐 Method 2: Using Swagger UI (Visual Interface)

### Step 1: Open Swagger

Visit: http://localhost:3001/api/docs

### Step 2: Register/Login

1. Find **"auth"** section
2. Click on **POST /auth/register** (or **POST /auth/login**)
3. Click **"Try it out"**
4. Fill in the request body:
   ```json
   {
     "email": "test@example.com",
     "name": "Test User",
     "password": "password123"
   }
   ```
5. Click **"Execute"**
6. **Copy the `access_token`** from the response

### Step 3: Authorize in Swagger

1. Click the **🔓 Authorize** button (top right)
2. Paste your token in the **Value** field
3. Click **Authorize**
4. Click **Close**

Now you can test all protected endpoints! ✅

---

## 🧪 Test Protected Endpoints

### Get Your Profile

```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Your Campaigns

```bash
curl -X GET http://localhost:3001/campaigns/my-campaigns \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create a Campaign

```bash
curl -X POST http://localhost:3001/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Test Campaign",
    "description": "This is a test campaign",
    "summary": "Test summary",
    "goalAmount": 10,
    "endDate": "2025-12-31T00:00:00Z",
    "category": "technology",
    "imageUrl": "https://example.com/image.jpg"
  }'
```

---

## 📋 Quick Reference

### Register New User:

```bash
POST http://localhost:3001/auth/register
Body: { email, name, password, walletAddress }
Returns: { access_token, user }
```

### Login Existing User:

```bash
POST http://localhost:3001/auth/login
Body: { email, password }
Returns: { access_token, user }
```

### Use Token:

```bash
Authorization: Bearer <your_access_token>
```

---

## 💡 Token Info

**What the token contains:**

- User ID
- User email
- Expiration time (default: 1 day)

**Token format:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Parts:**

1. Header (algorithm)
2. Payload (user data)
3. Signature (verification)

---

## 🔐 Security Tips

1. **Don't share your token** - It's like a password
2. **Tokens expire** - Get a new one by logging in again
3. **Store securely** - Use localStorage or secure cookies
4. **HTTPS only** in production

---

## 🐛 Troubleshooting

### Error: "Unauthorized"

**Cause:** Token is invalid or expired

**Solution:**

1. Login again to get a new token
2. Make sure you're using `Bearer` prefix
3. Check token has no extra spaces

### Error: "Invalid credentials"

**Cause:** Wrong email/password

**Solution:**

1. Check email and password are correct
2. Register if you haven't yet

### Error: "User already exists"

**Cause:** Email is already registered

**Solution:**
Use the **login** endpoint instead of register

---

## 📚 Example Workflow

```bash
# 1. Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","name":"John","password":"pass123","walletAddress":"0xABC"}'

# Response: { "access_token": "eyJhbG...", ... }

# 2. Save the token
TOKEN="eyJhbG..."

# 3. Use it in requests
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# 4. Create a campaign
curl -X POST http://localhost:3001/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Campaign","description":"Test",...}'
```

---

## ✅ Quick Test

**One-liner to get token:**

```bash
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep -o '"access_token":"[^"]*"' \
  | cut -d'"' -f4
```

This will output just the token value! 🎉

---

**Need help?** See the Swagger UI at http://localhost:3001/api/docs for interactive testing!
