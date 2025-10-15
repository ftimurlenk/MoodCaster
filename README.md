# MoodCaster — Premium Minimal UI (EN-only)

Generate a cast from Mood + Category using Groq and post via Farcaster Mini App SDK.

## Requirements
- Node 22.11.0+
- Groq API key

## Setup
```bash
npm i
cp .env.example .env.local
# put your GROQ_API_KEY in .env.local
# optional: set GROQ_MODEL_ID=llama-3.1-8b-instant (default) or llama-3.3-70b-versatile
npm run dev
```

- App: http://localhost:5173
- API health: http://localhost:3000/api/health
- API: proxied under /api from Vite

## Notes
- Fixed state sync bug by passing mood+category into generateCast(m,c)
- Validates inputs on server, returns error JSON
- Minimal-premium design: pills, soft gradients, subtle shadows
- English-only output enforced by prompt