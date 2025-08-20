# Valorant Stats Hub — Full Starter

Modern Next.js + Tailwind + Recharts app with API routes ready for Riot integration.
**No secrets are committed**. Use environment variables for your API key.

## Dev

```bash
pnpm i # or npm i / yarn
pnpm dev
```

## Configure Riot API

Create `.env.local`:

```
RIOT_API_KEY=YOUR_KEY_HERE
```

Then replace the mock responses in `app/api/riot/*/route.ts` with real Riot endpoints
(using `process.env.RIOT_API_KEY` for the header/token). Keep outputs in these shapes:
- `summary`: `{ kd:number, hs:number, winRate:number, matches:number }`
- `trends`: `{ kd:[{t,kd}], hs:[{t,hs}], win:[{t,win}] }`

## Legal

Unofficial fan project. Not endorsed by Riot Games. Valorant © Riot Games.
