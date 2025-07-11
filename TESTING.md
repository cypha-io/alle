# Testing Guide for AI Notetaker

## Quick Test Without Audio Files

The AI Notetaker includes a demo mode that works with any audio file format. You can test it with:

### Option 1: Use Any MP3 File
- Download any short MP3 file from the internet
- Or use a voice recording from your phone
- Upload it to test the transcription feature

### Option 2: Record Audio Directly
1. Use your computer's built-in voice recorder
2. Record a short message (30-60 seconds)
3. Save as MP3, WAV, or M4A format
4. Upload to the AI Notetaker

### Option 3: Text-to-Speech for Testing
1. Use online TTS services like:
   - [Natural Readers](https://www.naturalreaders.com/)
   - [TTSMaker](https://ttsmaker.com/)
   - [Eleven Labs](https://elevenlabs.io/) (free tier)
2. Convert this sample text to audio:

```
"Welcome to the AI Notetaker demonstration. This application converts spoken audio into clean, readable text using artificial intelligence. The system supports multiple audio formats and provides accurate transcriptions for meetings, lectures, and voice notes."
```

## Sample Test Scenarios

### 1. Meeting Transcription Test
Upload audio containing:
- Multiple speakers discussing project updates
- Technical terms and business language
- Questions and answers format

### 2. Lecture Transcription Test
Upload audio containing:
- Educational content with technical vocabulary
- Longer speaking segments
- Academic terminology

### 3. Personal Voice Note Test
Upload audio containing:
- Casual speech patterns
- Personal reminders or ideas
- Informal language

## Expected Results

The demo AI returns one of four sample transcriptions:
1. **Welcome Demo**: General introduction to AI Notetaker
2. **Business Meeting**: Quarterly review discussion
3. **Technical Demo**: System capabilities overview
4. **Student Project**: Academic project planning

Each transcription includes:
- **Confidence Score**: 89-97% accuracy simulation
- **Language**: English (EN)
- **Duration**: 38-72 seconds simulation
- **Word Count**: Displayed below transcription
- **Copy/Download**: Full functionality

## Performance Expectations

- **Upload**: Instant file validation
- **Processing**: 2-3 seconds simulation
- **Response**: Clean, formatted text
- **File Cleanup**: Automatic deletion after processing

## Troubleshooting

### File Upload Issues
- **Max Size**: 50MB limit
- **Formats**: MP3, WAV, M4A only
- **Network**: Check internet connection

### Processing Errors
- Refresh the page and try again
- Check browser console for detailed errors
- Ensure file isn't corrupted

### Display Issues
- Try different browsers (Chrome, Firefox, Safari)
- Check if JavaScript is enabled
- Clear browser cache if needed

## Feature Testing Checklist

- [ ] Drag and drop file upload
- [ ] Click to browse file upload
- [ ] File type validation
- [ ] File size validation
- [ ] Processing animation
- [ ] Transcription display
- [ ] Copy to clipboard
- [ ] Download as text file
- [ ] Clear transcription
- [ ] Responsive design (mobile/desktop)
- [ ] Dark mode compatibility
- [ ] Error handling

## Real AI Integration

To connect with actual Alle AI:

1. **Get API Credentials**
   ```bash
   ALLE_AI_API_KEY=your_api_key
   ALLE_AI_ENDPOINT=https://api.alle-ai.com
   ```

2. **Update Environment**
   ```bash
   cp .env.example .env.local
   # Add your credentials
   ```

3. **Replace Mock Service**
   - Edit `/lib/alle-ai.ts`
   - Uncomment production code
   - Remove demo implementation

The application is designed to seamlessly switch from demo mode to production with minimal code changes.
