# AI Notetaker 🎤📝

An intelligent audio-to-text transcription application that converts spoken audio into clean, readable text using advanced AI technology.

## Features

- **🎤 Audio Upload**: Drag & drop or select audio files (MP3, WAV, M4A, MP4, WebM)
- **🧠 AI Processing**: Real-time integration with Alle AI API for accurate transcription
- **📄 Clean Output**: Get formatted, readable transcriptions with metadata
- **💾 Download & Copy**: Save transcriptions as text files or copy to clipboard
- **🎨 Beautiful UI**: Modern, responsive design with dark mode support
- **⚡ Fast Processing**: Direct API communication with automatic error handling
- **🔍 API Health Check**: Real-time status monitoring of Alle AI connection

## How It Works

1. **🎤 User Uploads Audio** - Record or select an audio file and upload it
2. **📥 App Receives the Audio** - The app validates and prepares the file
3. **🧠 AI Processes the Audio** - Direct API call to Alle AI for transcription
4. **✍️ Transcription is Generated** - AI returns the written version with metadata
5. **📄 User Sees the Notes** - Clean, readable transcription is displayed immediately

## Real Alle AI Integration

This application is now configured for **production use** with the Alle AI API. All demo/mock functionality has been removed.

### Setup Requirements

1. **Get Alle AI API Credentials**
   - Sign up at [Alle AI](https://alle-ai.com)
   - Generate your API key
   - Note your API endpoint

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```bash
   ALLE_AI_API_KEY=sk-your-actual-api-key-here
   ALLE_AI_ENDPOINT=https://api.alle-ai.com
   ```

3. **API Health Check**
   - The app automatically checks API connectivity
   - Green status = ready to transcribe
   - Red status = check your credentials

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Integration**: Real Alle AI API (production ready)
- **File Handling**: Direct file upload to API
- **Health Monitoring**: API status checking

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Alle AI API credentials

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ai-notetaker
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

```bash
cp .env.example .env.local
# Edit .env.local with your Alle AI credentials
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## File Structure

```text
├── app/
│   ├── api/transcribe/route.ts    # API endpoint for audio processing
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main application page
│   └── globals.css               # Global styles
├── components/
│   ├── audio-uploader.tsx        # Audio file upload component
│   └── transcription-viewer.tsx  # Transcription display component
└── lib/
    └── utils.ts                  # Utility functions
```

## Production Deployment

### Environment Configuration

Set these environment variables in your production environment:

```bash
ALLE_AI_API_KEY=your_production_api_key
ALLE_AI_ENDPOINT=https://api.alle-ai.com
ALLE_AI_VERSION=v1
MAX_FILE_SIZE_MB=50
SUPPORTED_FORMATS=mp3,wav,m4a,mp4,webm
DEMO_MODE=false
```

### Error Handling

The application includes comprehensive error handling:

- **API Connection**: Automatic status checking
- **File Validation**: Size and format verification
- **Timeout Handling**: Configurable request timeouts
- **User Feedback**: Clear error messages and status indicators

### Monitoring

- API health checks at `/api/health/alle-ai`
- Real-time connection status in UI
- Detailed error logging
- Performance metrics tracking

## Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav)
- M4A (.m4a)
- Maximum file size: 50MB

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Deployment

Deploy easily on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or build for production:

```bash
npm run build
npm start
```
