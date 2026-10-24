# ReelPulse

**The daily pulse of Reels.** A responsive React dashboard for exploring trending Instagram and Facebook Reels by category, timeframe, and engagement.

ReelPulse ships with a fully self-contained curated dataset: 32 real Reels from public pages, generated SVG poster art, creator profiles, audio tracks, metrics for three timeframes, and an async data service.

It also ships a **live Facebook scrape stack**: serverless functions in `api/` that scrape tracked Facebook pages through Apify (or RapidAPI), cache a real-time snapshot, and serve it to the dashboard — see [Live Facebook scraping](#live-facebook-scraping-real-time-snapshots).

> **Two data modes.** The curated dataset is fully in-browser and needs no keys or network calls. The live Facebook mode scrapes public pages you configure on the server; scrape tokens never reach the browser. See [Live Facebook scraping](#live-facebook-scraping-real-time-snapshots).

---

## Highlights

- **Filtering and sorting**
  - All / Instagram / Facebook platform switcher
  - Today (24h), This Week, This Month timeframe selector, defaulting to Today
  - Most Views, Most Likes, Most Comments, and Engagement Rate sorting
  - Engagement Rate = `(likes + comments) / views`
  - All + 10 category filters, with counts
  - Instant search across creator handle and name, caption, hook, audio title/artist, category, and hashtags
- **Dashboard**
  - Four KPI cards: top viewed Reel, fastest-growing category, total tracked views, trending audio
  - Responsive 9:16 card grid: 4 columns on desktop, 2 on tablet, 1 on mobile
  - Rank badges with gold / silver / bronze treatments for the top three
  - Hover preview treatment, duration, platform badge, category pill, verified creator, caption, audio, metrics, and velocity
- **Reel detail modal**
  - Simulated 9:16 player with progress and play/pause
  - Full caption, hashtags, engagement chart, velocity, and creator details
  - "View original" link, previous/next Reel navigation, keyboard support
- **Admin / API settings**
  - Data-source selector with curated Demo, **Live Facebook scrape (server-side)**, RapidAPI, Apify, and Meta Graph
  - Auto-refresh preference (every 5–60 minutes for the live Facebook source), default timeframe
  - Manual synced scrape, normalized dataset export, workspace reset
- **Responsive shell**
  - Collapsible desktop sidebar
  - Five-item mobile bottom navigation with raised Sync action
  - Swipeable, scroll-into-view category pills
  - Mobile Explore sheet for categories and audio
  - Toast notifications, focus-trapped modals, skip link, and reduced-motion support

---

## Quick start

### Requirements

- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8)
- npm

### Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints, normally <http://localhost:5173>.

### Available scripts

| Command             | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start the Vite development server with HMR          |
| `npm run build`     | Type-check with `tsc -b` and build to `dist/`       |
| `npm run preview`   | Serve the production build locally                  |
| `npm run typecheck` | Run TypeScript without emitting files               |

The production build is a static single-page app and can be deployed to any static host. There is no client-side router, so no history-fallback rewrite is required.

---

## Tech stack

- **React 19** + **TypeScript 5.9** (strict)
- **Vite 8** with `@vitejs/plugin-react`
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **Lucide React** `0.468.0`, pinned exactly
- **Inter** and **Plus Jakarta Sans** via self-hosted Fontsource variable fonts
- No UI kit, router, chart library, animation library, or remote asset dependency

The theme, glass utilities, custom keyframes, and reduced-motion rules live in `src/index.css`.

---

## Project structure

```text
api/                           serverless functions (Vercel)
├─ _lib/
│  ├─ apify.ts                 Apify actor REST primitives (run + latest dataset)
│  ├─ rapidapi.ts              RapidAPI page-reels adapter
│  ├─ normalize.ts             scraped rows → normalized Reel
│  ├─ config.ts                env vars + request scope overrides
│  ├─ snapshot.ts              snapshot cache, TTL, background refresh
│  ├─ http.ts                  access key, body/query parsing
│  └─ parse.ts                 tolerant field digging for scraper shapes
├─ reels.ts                    GET/POST /api/reels  — snapshot endpoint
└─ refresh.ts                  POST /api/refresh — forced fresh scrape

src/
├─ App.tsx                     app state, filters, sync, provider wiring, polling
├─ main.tsx                    React root + ToastProvider
├─ index.css                   Tailwind theme, tokens, glass utilities, keyframes
├─ types.ts                    shared domain types and category/platform constants
├─ data/
│  ├─ reels.ts                 32 curated Reels with per-timeframe metrics
│  └─ categories.ts            category metadata, icons, accents, labels
├─ services/
│  ├─ dataService.ts           async query layer, cache, filtering, sorting, KPIs
│  ├─ settingsService.ts       localStorage settings/sync persistence and reset
│  └─ providers/
│     ├─ types.ts              ReelProvider seam and provider config types
│     ├─ demoProvider.ts       in-browser curated source
│     ├─ facebookProvider.ts   live provider → /api/reels + /api/refresh
│     ├─ rapidApiProvider.ts   live adapter (browser-direct, Instagram-oriented)
│     ├─ apifyProvider.ts      scaffolded live adapter
│     └─ metaProvider.ts       scaffolded live adapter
├─ hooks/                      dashboard fetch, debounce, focus trap, click-outside, storage
├─ components/
│  ├─ shell/                   sidebar, header, mobile nav, background effects
│  ├─ dashboard/               KPI cards, Reel cards/grid, posters, rank, sparkline
│  ├─ filters/                 platform switcher, timeframe, sort tabs, search, pills
│  ├─ overlay/                 Reel modal, admin modal, explore sheet, shared modal, chart
│  └─ ui/                      brand marks/icons, avatars, buttons, skeletons, toasts
└─ lib/
   ├─ classify.ts              caption/hashtag → category, hooked captions, hashtags
   ├─ formatting, constants, class-name helper
```

---

## Data flow

```text
FeedFilters
    │
    ▼
useDashboard (debounced search)
    │
    ├── fetchTrendingReels(filters) ──► activeProvider.fetchReels()
    ├── fetchDashboardSummary(query) ──► KPI aggregation
    └── fetchAudioLeaderboard(query) ──► audio ranking
                                             │
                                             ▼
                                   30-second dataset cache
```

The service layer keeps filtering, sorting, KPI aggregation, category counts, velocity averages, and audio ranking inside `dataService.ts`; components stay unaware of the data source.

Each Reel has a `metrics` object keyed by `today`, `week`, and `month`, so changing the timeframe updates the rankings, cards, KPIs, and modal data.

Search is accent-insensitive and token-based. It normalizes creator names/handles, hooks, captions, category labels, audio metadata, and hashtags. The `/` key focuses search from anywhere outside an input.

---

## Live Facebook scraping (real-time snapshots)

The **Live Facebook scrape** source turns ReelPulse into a real-data dashboard: tracked public Facebook pages are scraped server-side and served as a fresh snapshot.

### Architecture

```
Facebook pages
   │
   ▼  Apify actor (primary) or RapidAPI (secondary) — server-side only
/api/* serverless functions (Vercel)
   │   snapshot cache + TTL + background refresh + tolerant row mapping
   ▼
facebookProvider (browser) → GET/POST /api/reels → dataService → UI
```

- **`GET/POST /api/reels`** serves the snapshot instantly. When the snapshot is older than `SNAPSHOT_TTL_MINUTES` (default 5), the function serves the current one and refreshes in the background — a poll never blocks the UI.
- **`POST /api/refresh`** (the Sync button) starts a fresh scrape and waits up to ~45 s; if Facebook is slow, it returns the previous snapshot and the next poll picks up the result.
- Snapshots and age (`syncedAt`) are always reported honestly; when an upstream fails, the last good snapshot is served with a `stale` flag and a warning toast.

### Setup

1. Pick a Facebook Reels actor on the Apify Store (e.g. `dami_studio/facebook-reels-scraper`) and add your pages; or use the RapidAPI Facebook route.
2. Set env vars on Vercel (`Project → Settings → Environment Variables`) or in `.env` for local `vercel dev` — see `.env.example`:

| Variable | Purpose |
| --- | --- |
| `SCRAPE_VIA` | `apify` (default) or `rapidapi` |
| `APIFY_TOKEN` / `APIFY_ACTOR_ID` | Apify credentials + actor |
| `APIFY_ACTOR_INPUT` | Optional full actor input JSON (proxy config etc.) |
| `RAPIDAPI_KEY` / `RAPIDAPI_FACEBOOK_HOST` | RapidAPI credentials |
| `FB_PAGES` | Tracked pages — JSON array or newline/comma list (URLs or handles) |
| `RESULTS_LIMIT` | Reels per page per run (1–200, default 30) |
| `SNAPSHOT_TTL_MINUTES` | Snapshot freshness window (default 5) |
| `SNAPSHOT_ACCESS_KEY` | Optional shared secret; requests must send `x-reelpulse-key` |

3. Deploy (the functions ship with the repo) or run locally:

```bash
npx vercel dev      # functions + static on http://localhost:3000
npm run dev         # Vite UI on :5173, proxies /api/reels + /api/refresh to :3000
```

4. Admin → API sources → **Live Facebook scrape**, Save, then **Sync now** for the first scrape.

### Cadence and cost

The 5-minute auto-refresh is the default: polls only fire while a tab is visible, snapshots are served instantly, and consecutive polls reuse the cached snapshot. Because each refresh scrapes N pages × `RESULTS_LIMIT` reels, refresh more often than ~15 min only if you accept the credit burn (~100–150 reels/run at default settings). Prices for Facebook Reels actors are per-result — budget from the actor's pricing page.

### Honest caveats

- Unofficial scraping of Facebook violates Meta's ToS; this is for research/demo dashboards on public pages, at your own operational risk.
- Facebook itself rounds view/share counts ("65K"); reaction and comment counts are exact.
- `saves` is not exposed publicly → stays 0. Week/month timeframes extrapolate the daily snapshot (matching the RapidAPI adapter's approach).
- Category assignment is keyword-based from caption/hashtags (shared with the RapidAPI adapter).
- Scrape video URLs are temporary CDN links; when they expire the player falls back to the simulated preview and "View original" still points at the real permalink.

---

## Swapping in live data

The only contract a provider must satisfy is `src/services/providers/types.ts`:

```ts
export interface ReelProvider {
  id: string
  label: string
  isLive: boolean
  fetchReels(): Promise<Reel[]>
}
```

To connect a real source:

1. Implement `fetchReels()` in one of the adapter files.
2. Map each API row into the normalized `Reel` shape from `src/types.ts`, including all three metric timeframes.
3. Keep filtering and sorting out of the adapter; `dataService` handles that.
4. Register the provider once at startup, or in an effect when settings change:

```ts
import { setReelProvider } from './services/dataService'
import { createRapidApiProvider } from './services/providers/rapidApiProvider'

setReelProvider(
  createRapidApiProvider({
    apiKey: '...',
    host: '...',
  }),
)
```

`setReelProvider` invalidates the dataset cache automatically. If you change providers while the app is running, bump the dashboard refresh nonce (as the mock sync flow already does) so the feed refetches.

### Current state of the adapters

| Source | State |
| --- | --- |
| Demo (curated dataset) | Fully implemented, in-browser — the default. |
| **Live Facebook scrape** | Fully implemented via the `api/` serverless functions (Apify primary, RapidAPI secondary). |
| RapidAPI | Implemented; Instagram-oriented (`instagram-scraper-api2`), called browser-direct with a key from local settings. |
| Apify / Meta Graph | Intentionally scaffolded stubs; they throw `ProviderNotWiredError` until wired. |

Never call a provider that requires a secret directly from the browser. The live Facebook flow follows exactly that rule: credentials live in server env vars and the browser only ever talks to `/api/reels`.

---

## Persistence and sync

ReelPulse uses `localStorage`:

| Key                     | Contents                                      |
| ----------------------- | --------------------------------------------- |
| `reelpulse.settings.v1` | API source, credentials, Facebook scope (pages/via/refresh interval), auto-sync, timeframe |
| `reelpulse.sync.v1`     | Last sync timestamp and sync count            |
| `reelpulse.sidebar.v1`  | Desktop sidebar collapsed state               |

- The first run seeds a default "last synced" timestamp and sync count so the dashboard looks lived in.
- **Manual sync** invalidates the cache and pulls upstream data again. For the Live Facebook source it triggers a fresh server-side scrape (up to ~45 s, toast feedback included).
- **Auto-sync** is source-aware: once per app open for the 24-hour cadence, or every N minutes on a visible-tab polling loop for the Live Facebook source (server snapshots refresh in the background; the UI never blocks).
- **Reset workspace** is under Admin → Data. It requires a second click to confirm, clears all `reelpulse.*` keys, restores defaults, and reloads the page. Clearing site data in browser devtools has the same effect.
- To export the normalized demo dataset as JSON, use Admin → Data → Export.

Credentials are stored in plain text in `localStorage` for demonstration purposes only.

---

## Keyboard and accessibility

- `/` focuses the search field (when not already typing in an input).
- `Escape` closes modals and sheets; when search is focused, it clears the query.
- Left/right arrow keys navigate between Reels while the detail modal is open.
- Modals use a focus trap, restore focus, and set `aria-modal`/labelled headings.
- A "Skip to trending feed" link is the first focusable element.
- Feed counts are announced through a polite live region.
- Decorative poster art and icons are hidden from assistive technology; icon-only buttons have labels.
- Motion is reduced through `prefers-reduced-motion` rules.

---

## Data modes and limitations

**Curated dataset (default):**
- 32 real Reels from verified public creators with authentic links, tracks, and metrics — all in-browser, no keys needed.
- Poster thumbnails are generated in the browser. There are no video files; the "player" is a simulated interface.
- Rankings and KPIs are measured from this bundled dataset only.

**Live Facebook scrape:**
- Real public-page data with the caveats listed in [Live Facebook scraping](#live-facebook-scraping-real-time-snapshots).
- RapidAPI (browser-direct) keeps its key in local storage — acceptable only for personal use; prefer the server route.
- Unofficial scraping violates Meta's ToS.

**General:**
- Keys entered in Admin for browser-direct adapters are client-side only.
- There is no automated test suite. Validation is via strict TypeScript, a production build, and manual browser QA across desktop, tablet, and mobile breakpoints.

---

## License

This is a demo project. The fictional dataset and generated posters are part of the application; no real creator content is included.
