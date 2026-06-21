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

## Environments
Controlled by `NODE_ENV` (default `development`):

| | development | production |
|---|---|---|
| Required keys | optional (errors on use) | **required at startup** — won't boot without them |
| Test page (`GET /`) | served | disabled |
| Error responses | full message | generic for 5xx; 4xx still detailed |
| `trust proxy` | off | on |

In production, set real env vars in the host dashboard (e.g. Render) — never
commit a `.env`. `staging` is supported as a value but unused for now.

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
