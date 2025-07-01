# 🆓 Free AI API Setup Guide

This guide will help you set up free AI APIs for the chatbot functionality. The system supports multiple providers with automatic fallbacks.

## 🚀 Quick Setup (2 minutes)

### Step 1: Choose Your Free API Provider

#### Option 1: Groq API (Recommended - Best Performance)
- ✅ **100 requests/day FREE**
- ✅ **Lightning fast** responses (Llama 3 models)
- ✅ **No credit card** required
- ✅ **Easy signup**

**Setup:**
1. Visit: [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up with email (no payment info needed)
3. Click "Create API Key"
4. Copy your key (starts with `gsk_`)

#### Option 2: Cohere API (Alternative)
- ✅ **100 calls/month FREE**
- ✅ **Good quality** responses
- ✅ **Email signup only**

**Setup:**
1. Visit: [https://dashboard.cohere.ai/api-keys](https://dashboard.cohere.ai/api-keys)
2. Sign up with email
3. Generate API key
4. Copy your key

#### Option 3: Hugging Face API (Backup)
- ✅ **Free with rate limits**
- ✅ **Multiple models** available
- ✅ **No payment** required

**Setup:**
1. Visit: [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create account
3. Generate access token
4. Copy your token (starts with `hf_`)

### Step 2: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file and add your API key(s):**
   ```bash
   # Add at least one API key
   GROQ_API_KEY=gsk_your_actual_key_here
   COHERE_API_KEY=your_cohere_key_here
   HUGGING_FACE_API_KEY=hf_your_token_here
   ```

3. **Save the file**

### Step 3: Restart and Test

```bash
# Restart the development server
npm run dev
```

The chatbot will automatically detect available API keys and use them!

## 🎯 Smart Features

### ✅ **Multiple Provider Support**
- Tries Groq first (fastest)
- Falls back to Cohere if Groq fails
- Uses Hugging Face as final backup
- Always works with intelligent fallbacks

### ✅ **Automatic Failover**
- If one API is down, tries the next
- No interruption to user experience
- Logs which provider is being used

### ✅ **Context Awareness**
- Uses recent tech news for better responses
- Understands project-related questions
- Provides relevant code examples

### ✅ **Cost Optimization**
- All providers offer generous free tiers
- Smart request routing
- Efficient prompt engineering

## 🔧 API Comparison

| Provider | Free Limit | Speed | Quality | Signup |
|----------|------------|-------|---------|---------|
| **Groq** | 100/day | ⚡ Very Fast | 🌟 Excellent | Email only |
| **Cohere** | 100/month | 🚀 Fast | ⭐ Good | Email only |
| **Hugging Face** | Rate limited | 🐌 Slower | ⭐ Variable | Email only |

## 🛠️ Troubleshooting

### API Key Not Working?
1. Check if the key is correctly copied (no extra spaces)
2. Verify the key format:
   - Groq: starts with `gsk_`
   - Cohere: alphanumeric string
   - Hugging Face: starts with `hf_`
3. Restart the server after adding keys

### Rate Limits Exceeded?
- The system automatically switches to backup providers
- Consider getting keys from multiple providers
- Check the console logs to see which provider is active

### No Response from Chatbot?
1. Check if the backend server is running (`npm run dev`)
2. Look at browser console for errors
3. The system has intelligent fallbacks that always work

## 🎉 Benefits

- **💰 Completely Free** - No costs or subscriptions
- **🔒 No Credit Card** - Just email signup required
- **⚡ High Performance** - Especially with Groq
- **🛡️ Reliable** - Multiple fallback options
- **🔄 Auto-switching** - Seamless provider switching

## 📊 Usage Examples

Once configured, your AI assistant can:

- 🚀 **Generate project ideas** based on current tech trends
- 💻 **Provide code examples** for React, Node.js, APIs
- 🛠️ **Explain project setup** with step-by-step guides
- 📚 **Answer tech questions** about frameworks and tools
- 🔍 **Use news context** for relevant suggestions

## 🚀 Ready to Deploy?

The system works perfectly for local development and can be deployed to:
- Vercel
- Netlify
- Railway
- Heroku
- Any Node.js hosting platform

Just make sure to add your environment variables to your hosting platform!

---

**Need Help?** The chatbot works even without API keys using intelligent fallbacks, but adding at least one free API key will significantly improve the response quality and capabilities.