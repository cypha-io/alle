# Quick Setup Guide for AI Notetaker

## 🚀 Get Started in 3 Steps

### Step 1: Get Your Alle AI Credentials

1. **Sign up at Alle AI**
   - Visit [https://alle-ai.com](https://alle-ai.com)
   - Create your account
   - Navigate to API settings

2. **Generate API Key**
   - Create a new API key
   - Copy your API key (starts with `sk-`)
   - Note your API endpoint URL

### Step 2: Configure the Application

1. **Copy Environment File**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your credentials:**
   ```bash
   # Replace with your actual Alle AI credentials
   ALLE_AI_API_KEY=sk-your-actual-api-key-here
   ALLE_AI_ENDPOINT=https://api.alle-ai.com
   ALLE_AI_VERSION=v1
   
   # Application settings (optional)
   MAX_FILE_SIZE_MB=50
   SUPPORTED_FORMATS=mp3,wav,m4a,mp4,webm
   DEMO_MODE=false
   
   # Next.js configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Advanced settings (optional)
   ALLE_AI_TIMEOUT=30000
   ALLE_AI_LANGUAGE=auto
   ```

### Step 3: Test the Connection

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Check the status:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Look for "Alle AI Status: Connected" (green)
   - If red, check your API credentials

3. **Upload a test file:**
   - Use any audio file (MP3, WAV, M4A, MP4, WebM)
   - Maximum size: 50MB
   - Watch for real-time transcription

## ✅ Verification Checklist

- [ ] Alle AI account created
- [ ] API key obtained
- [ ] `.env.local` file configured
- [ ] Application showing "Connected" status
- [ ] Test transcription completed successfully

## 🔧 Troubleshooting

### "Disconnected" Status
- Verify your API key is correct
- Check that ALLE_AI_ENDPOINT matches your provider
- Ensure your API key has transcription permissions

### Upload Errors
- Check file size (must be under 50MB)
- Verify file format (MP3, WAV, M4A, MP4, WebM)
- Ensure stable internet connection

### Processing Timeouts
- Try with shorter audio files
- Check your internet connection
- Increase ALLE_AI_TIMEOUT in `.env.local`

## 🌟 Ready to Use!

Once you see the green "Connected" status, your AI Notetaker is ready to convert audio to text with professional accuracy!

For support, check the main README.md or visit the Alle AI documentation.
