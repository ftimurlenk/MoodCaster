# MoodCaster — Tasks Edition (EN-only)

Generate a cast from Mood + Category using Groq and post via Farcaster Mini App SDK.
Includes a **Tasks** tab with daily check-in, generate, post, and 3-cast bonus, tracked in localStorage.

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
- Fixed state sync by passing mood+category into generateCast(m,c)
- Tasks saved per device via localStorage
- Minimal/premium design with tabs and badges
- English-only output enforced by prompt