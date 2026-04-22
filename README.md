# TwinMind Live Suggestions

AI-powered live suggestions during conversations.

## Testing

The application includes a comprehensive test suite with 80%+ code coverage.

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in CI mode
npm run test:ci

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all
```

### Test Coverage

- Unit Tests: Store logic, utilities, hooks
- Component Tests: React components with mocking
- API Tests: Backend route handlers
- E2E Tests: Full user workflows with Playwright

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. (Optional) Create a `.env.local` file if you want to use server-side API key:
```bash
GROQ_API_KEY=your_groq_api_key_here
```

Alternatively, you can configure your API key in the UI Settings panel (recommended for local development).

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Click Settings to add your Groq API key, then click the microphone button to start recording and see live transcriptions.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page with 3-column layout
│   └── globals.css         # Global styles
├── components/
│   ├── TranscriptPanel.tsx # Microphone & transcript UI
│   ├── SuggestionsPanel.tsx # Live suggestions UI
│   └── ChatPanel.tsx       # Chat interface UI
└── store/                  # Zustand state management (to be implemented)
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Zustand (state management)
- Web Audio API (microphone capture)
- Groq AI (whisper-large-v3, gpt-oss-120b)

## Features

- 3-column responsive layout
- Dark theme (#0b0f14)
- Microphone recording controls
- Real-time transcription display
- AI-powered suggestions (auto-refresh every 30s)
- Interactive chat interface
- Independent scrolling panels
- Smooth hover animations

## Development Status

Currently implemented:
- ✅ Project structure
- ✅ UI layout and components
- ✅ Dark theme styling
- ✅ Responsive grid layout
- ✅ Microphone recording with Web Audio API
- ✅ Audio chunking (30-second intervals)
- ✅ Transcription API integration (Groq Whisper)
- ✅ Real-time transcript display with auto-scroll
- ✅ State management with Zustand
- ✅ Error handling (permissions, network, upload)
- ✅ Live AI suggestions system
- ✅ Auto-refresh suggestions every 30 seconds
- ✅ Manual suggestion refresh
- ✅ Context-aware suggestions from transcript
- ✅ Chat system with streaming responses
- ✅ Click suggestions to get detailed answers
- ✅ Chat history persistence during session
- ✅ Context-aware AI responses
- ✅ Comprehensive settings modal
- ✅ Customizable prompts and context windows
- ✅ Export functionality (JSON format)

All core features complete!

## Architecture

### Custom Hooks
- `useMicrophoneRecorder()` - Handles microphone capture, audio chunking, and upload
- Manages recording state, errors, and audio chunks
- Automatically processes chunks every 30 seconds
- `useSuggestions()` - Manages AI suggestion generation
- Auto-generates suggestions every 30 seconds
- Uses recent transcript context (last 5 entries)
- Handles manual refresh requests
- `useChat()` - Manages chat interactions
- Sends messages with transcript context
- Handles streaming responses from AI
- Updates messages in real-time as tokens arrive
- `useExport()` - Handles session data export
- Exports transcript, suggestions, and chat history
- Generates clean JSON with metadata and timestamps
- Downloads file with timestamped filename

### State Management (Zustand)
- `useTranscriptStore()` - Global transcript state
- Stores transcript entries with timestamps
- Handles loading and error states
- `useSettingsStore()` - Persisted settings (API keys)
- Stores Groq API key in localStorage
- Provides secure client-side key management
- `useSuggestionsStore()` - Suggestion batches state
- Stores suggestion batches with timestamps
- New batches appear at top, older ones below
- Tracks loading and error states
- `useChatStore()` - Chat message history
- Stores user and assistant messages
- Supports streaming message updates
- Persists during session

### API Routes
- `/api/transcribe` - Processes audio chunks with Groq Whisper API
- Accepts user-provided API key via header (x-groq-api-key)
- Validates API key format and permissions
- Implements timeout handling (30s)
- Returns formatted transcript with timestamp
- Comprehensive error handling:
  - Invalid/missing API key
  - Rate limiting
  - Request timeouts
  - File size validation (25MB max)
  - Network errors

- `/api/suggestions` - Generates AI suggestions from transcript
- Uses Groq llama-3.3-70b-versatile model
- Analyzes recent transcript context (last 5 entries)
- Returns exactly 3 suggestions per request
- Suggestion types:
  - question: Relevant questions to ask
  - talking_point: Useful points to bring up
  - answer: Possible answers to questions
  - fact_check: Verification of statements
  - clarification: Help clarify confusing points
- Each suggestion includes:
  - Type, title, and preview
  - Preview delivers immediate value
  - Context-aware and actionable

- `/api/chat` - Interactive chat with AI meeting copilot
- Uses Groq llama-3.3-70b-versatile model
- Streaming responses for real-time feedback
- Context-aware (includes last 10 transcript entries)
- Handles:
  - Direct user questions
  - Clicked suggestions (expanded explanations)
  - Follow-up conversations
- Acts as meeting companion providing:
  - Clarifications
  - Detailed explanations
  - Insights and context
  - Fact-checking
  - Action suggestions

### Error Handling
- Microphone permission denial
- Network interruptions
- Upload failures
- Multiple start/stop cycles

## Export Format

The export functionality generates a comprehensive JSON file containing all session data:

```json
{
  "metadata": {
    "exportedAt": "2024-01-15T10:30:00.000Z",
    "sessionDuration": "15m 30s",
    "totalTranscripts": 25,
    "totalSuggestionBatches": 5,
    "totalChatMessages": 8
  },
  "transcript": [
    {
      "timestamp": "00:30",
      "speaker": "user",
      "text": "discussing model latency",
      "createdAt": "2024-01-15T10:15:30.000Z"
    }
  ],
  "suggestions": [
    {
      "batchId": "batch-1234567890",
      "createdAt": "2024-01-15T10:16:00.000Z",
      "suggestions": [
        {
          "type": "question",
          "title": "Clarify latency requirements",
          "preview": "What are the specific latency targets..."
        }
      ]
    }
  ],
  "chat": [
    {
      "role": "user",
      "content": "Can you explain the latency issue?",
      "timestamp": "2024-01-15T10:17:00.000Z"
    },
    {
      "role": "assistant",
      "content": "Based on the conversation...",
      "timestamp": "2024-01-15T10:17:05.000Z"
    }
  ],
  "timestamps": {
    "firstTranscript": "2024-01-15T10:15:00.000Z",
    "lastTranscript": "2024-01-15T10:30:30.000Z",
    "firstSuggestion": "2024-01-15T10:16:00.000Z",
    "lastSuggestion": "2024-01-15T10:29:00.000Z",
    "firstChatMessage": "2024-01-15T10:17:00.000Z",
    "lastChatMessage": "2024-01-15T10:28:00.000Z"
  }
}
```

This format is designed for session evaluation and analysis.
