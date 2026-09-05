# RailCast AI

**Predicting Every Arrival, Before It Happens.**

A prototype web application for dynamically predicting the Expected Time of Arrival (ETA) of
Indian Railways coaching trains, comparing the current railway-reported ETA against an AI/ML
predicted ETA.

The app runs completely on realistic demo data out of the box and is architected so a real
Railway Live API → Backend → ML ETA Engine can be connected later without any frontend rewrite.

---

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + hand-built shadcn/ui-style primitives
- Lucide icons
- Recharts (Model Performance charts)
- Leaflet / OpenStreetMap (Operations Control network map)

## Project structure

```
app/
  page.tsx                    Landing page
  train/[number]/page.tsx     Train ETA dashboard
  operations/page.tsx         Operations Control dashboard
  performance/page.tsx        Model Performance page
  about/page.tsx
components/
  TrainSearch.tsx, ETAComparison.tsx, StationTimeline.tsx,
  StationETATable.tsx, PredictionFactors.tsx, ConfidenceRange.tsx,
  NetworkMap.tsx (+ NetworkMapLoader.tsx), MetricsChart.tsx, StatusBadge.tsx
  ui/                         Button, Card, Badge, Input, Table primitives
lib/
  dataProvider.ts             LIVE → DEMO fallback abstraction (the core contract)
  mockProvider.ts             Demo data provider
  apiProvider.ts              Future live API provider
  etaUtils.ts, types.ts, utils.ts, stationCoords.ts
data/
  mockTrains.ts                Realistic mock data for 4 demo trains
```

## Data modes

- **LIVE MODE** — attempts `NEXT_PUBLIC_API_BASE_URL` endpoints.
- **DEMO MODE** — automatic fallback if the backend is unavailable, times out, or returns an
  error/malformed response. The UI always shows a 🟢 LIVE DATA or 🟡 DEMO SIMULATION badge and
  never labels demo data as live.

Demo trains available: `12919`, `12952`, `12002`, `22436`.

---

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To build and run a production build locally:

```bash
npm run build
npm run start
```

## Connecting a real backend later

1. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` (see `.env.example`).
2. Implement these endpoints on your backend:
   - `GET /api/train/{trainNumber}`
   - `GET /api/train/{trainNumber}/eta`
   - `GET /api/train/{trainNumber}/route`
   - `GET /api/metrics`
3. That's it — `lib/apiProvider.ts` already calls these, and `lib/dataProvider.ts` will
   automatically prefer live data and fall back to demo data if anything fails.

Never put secret API keys in frontend code or in `NEXT_PUBLIC_*` variables — keep them on your
backend only.

---

## Push to GitHub

```bash
cd railcast-ai
git init
git add .
git commit -m "Initial commit: RailPulse AI prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploy to Vercel

**Option A — Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel        # first deploy (follow prompts, accept defaults for a Next.js app)
vercel --prod # promote to production
```

**Option B — Vercel dashboard**

1. Go to https://vercel.com/new and import the GitHub repository you just pushed.
2. Framework preset: Next.js (auto-detected).
3. Build command: `next build` (default). Output: `.next` (default).
4. If/when you have a live backend, add an environment variable in the Vercel project settings:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend.example.com`
5. Click **Deploy**.

The app will run fully in DEMO MODE on Vercel with no environment variables set.

---

## Notes

- All predictions, ranges, confidence values and Model Performance metrics shown in Demo
  Simulation mode are illustrative/demo values, clearly labeled as such, and are not derived from
  a live trained ML model.
- The app never claims the AI ETA is "more accurate" without evaluation metrics to support it.
- No login, payments, or chatbot are included per the project scope.
