# babe_get_this_apis

Backend API for **Babe, Get This** — turns a voice note into a structured shopping list.

Flow: `audio → Whisper (Groq) → text → Claude Haiku → structured items`.

## Stack
- Node + Express (ESM) — written in **TypeScript**
- Groq (Whisper) for speech-to-text
- Claude Haiku 4.5 for parsing text → items
- Stateless (no database) — the Android app persists the result in Room

## Setup
```bash
npm install
cp .env.example .env   # then fill in your keys
npm run dev            # tsx watch — runs src/*.ts directly, auto-reload, http://localhost:4827
```

## Scripts
- `npm run dev` — run from source via `tsx` (no build step, hot reload)
- `npm run typecheck` — `tsc --noEmit`, just check types
- `npm run build` — compile `src/*.ts` → `dist/*.js`
- `npm start` — run the compiled output (`dist/server.js`); used in deploy

## Endpoints
- `GET /health` → `{ "status": "ok" }`
- `POST /transcribe` — multipart form-data, field `audio` (a voice recording)
  → `{ "transcript": "...", "items": [{ "name", "quantity", "unit" }] }`

Test once it's running:
```bash
curl http://localhost:4827/health
curl -F "audio=@/path/to/voice-note.m4a" http://localhost:4827/transcribe
```

## Architecture
Layered, mirroring the app's MVVM + Repository pattern:
- `routes/` — map URL → controller
- `controllers/` — HTTP layer (like a ViewModel); no business logic
- `services/` — talk to Groq / Claude (like Repositories)
- `dtos/` — request/response shapes (DTOs), named per feature
- `config/` — env vars
- `middleware/` — upload + error handling

## Deploy
Render (free tier), reached via `api.<domain>` pointed from Hostinger DNS.
Build command: `npm install && npm run build` · Start command: `npm start`.
