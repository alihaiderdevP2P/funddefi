# 🤖 Enable AI Features - Step by Step

Your AI integration is **ready to use** - you just need to add your OpenAI API key!

## ⚡ Quick Fix (2 minutes)

### Step 1: Get Your Free OpenAI API Key

1. **Visit**: https://platform.openai.com/api-keys
2. **Click**: "Sign up" (if you don't have an account)
3. **Complete**: Registration (takes 1 minute)
4. **Click**: "+ Create new secret key"
5. **Name it**: "FundFlow Development"
6. **Copy**: Your API key (starts with `sk-`)

> 💡 **Free Trial**: New accounts get $5 in free credits - plenty for testing!

### Step 2: Add API Key to .env File

**Option A: Quick Command** (Mac/Linux)

```bash
# Replace YOUR_KEY_HERE with your actual API key
echo 'OPENAI_API_KEY=sk-proj-your-actual-key-here' > .env.local
```

**Option B: Manual Edit**

1. Open `.env` file in your editor
2. Find this line:
   ```
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
   ```
3. Replace `YOUR_OPENAI_API_KEY_HERE` with your actual key:
   ```
   OPENAI_API_KEY=sk-proj-abc123xyz...
   ```
4. Save the file

### Step 3: Restart the Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test AI Features

**Try the Chat Assistant:**

```bash
curl -X POST http://localhost:3000/api/ai/chat-assistant \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I create a campaign?"}'
```

You should see a response instead of the error!

## ✅ Verification Checklist

Check these to confirm AI is working:

- [ ] `.env` file exists in root directory
- [ ] `OPENAI_API_KEY` line starts with `sk-`
- [ ] No spaces around the `=` sign
- [ ] Server has been restarted
- [ ] No error in terminal about "OPENAI_API_KEY"

## 🎯 All AI Features Now Available

Once configured, these features work automatically:

### 1. **AI Chat Assistant**

- Real-time support chatbot
- Context-aware responses
- Available 24/7

### 2. **Campaign Analysis**

- Risk assessment
- Success probability
- Market analysis
- Recommendations

### 3. **Fraud Detection**

- Scam detection
- Risk scoring
- Pattern analysis
- Manual review flags

### 4. **Campaign Recommendations**

- Personalized suggestions
- Match scoring
- User profiling

### 5. **Content Generation**

- Campaign descriptions
- Catchy titles
- Reward tier descriptions

## 🐛 Troubleshooting

### Error: "AI service not configured"

**Cause**: OpenAI API key not found or invalid

**Solution**:

```bash
# Check if .env exists
ls -la .env

# Check if key is set
grep OPENAI_API_KEY .env

# Should show: OPENAI_API_KEY=sk-...
# If it shows: OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
# Then you need to add your actual key!
```

### Error: "Invalid API key"

**Cause**: API key is incorrect

**Solutions**:

1. Key must start with `sk-` or `sk-proj-`
2. Copy the entire key (very long string)
3. No extra spaces or quotes
4. Key is from https://platform.openai.com/api-keys

### Error: "Insufficient quota"

**Cause**: You've used all your free credits

**Solutions**:

1. Add billing info at https://platform.openai.com/account/billing
2. Credits start at $5 minimum
3. Set usage limits to control costs

### Error: "Model not found: gpt-5"

**Cause**: Invalid model name in code (I had gpt-5 instead of gpt-4)

**Solution**: Already fixed! All endpoints now use `gpt-4-turbo-preview`

## 💰 Cost Estimate

For testing/development with GPT-4 Turbo:

- **Chat message**: ~$0.01-0.02 per conversation
- **Campaign analysis**: ~$0.02-0.05 per analysis
- **Content generation**: ~$0.01-0.03 per generation

**$5 free credit = ~250-500 AI operations** (plenty for development!)

## 🔐 Security Tips

1. ✅ Never commit `.env` to git (already in `.gitignore`)
2. ✅ Use different keys for dev/production
3. ✅ Set monthly spending limits in OpenAI dashboard
4. ✅ Rotate keys regularly
5. ✅ Monitor usage at https://platform.openai.com/usage

## 📞 Still Having Issues?

1. **Check terminal output** for detailed error messages
2. **Visit** http://localhost:3000/support
3. **Use Live Chat** for instant help
4. **Submit a ticket** with error details

---

## 🎉 Once Configured

Your AI features will automatically work in:

- ✅ Chat assistant at `/support`
- ✅ Campaign creation wizard at `/create`
- ✅ All AI-powered features

**Ready to try it?** Just add your API key and restart! 🚀







