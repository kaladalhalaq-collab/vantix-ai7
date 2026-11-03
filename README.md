# VANTIΧ AI (core build)
Next.js 15 + TypeScript + Tailwind + Framer Motion + React Three Fiber + Supabase.

## Run
1. `npm install` then `cp .env.example .env.local` and fill it in.
2. Supabase: create a project, run `supabase/migrations/001_init.sql` in the SQL editor, copy URL, anon key and service-role key. Grant points manually: `update profiles set points=500, daily_limit=10 where id='<uuid>'`.
3. AI: set `GEMINI_API_KEY`+`GEMINI_MODEL` and/or `ANTHROPIC_API_KEY`+`CLAUDE_MODEL` (use vision-capable model ids from each provider's docs).
4. Market data: `TWELVEDATA_API_KEY`. n8n: `N8N_ANALYSIS_LOG_WEBHOOK`.
5. `npm run dev`; verify with `npm run build`.

## Deploy
Push to GitHub, import the repo in Vercel, add the same environment variables, deploy.

## 3D background
`components/3d`: tiers off/low/high chosen from reduced-motion, WebGL support, pointer type, CPU/memory. Canvas loads lazily after idle, pauses when the tab is hidden, and a CSS gradient is always painted underneath, so nothing shifts and the site works without WebGL.

## Status
Done: layout, RTL/EN toggle, mobile nav, 3D background, analysis studio, secure analyze API (auth, validation, magic-byte check, atomic points, refund), markets API, SQL schema.
Not yet built: login pages, dashboard/ticker UI, news, academy, signals, history, profile, subscriptions/redeem codes, admin, Telegram, n8n workflow JSON, Vercel-ready auth callback.
