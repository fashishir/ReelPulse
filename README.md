# ReelPulse

**The daily pulse of Reels.** A responsive React dashboard for exploring trending Instagram and Facebook Reels by category, timeframe, and engagement.

ReelPulse ships with a fully self-contained demo dataset: 32 fictional Reels, generated SVG poster art, creator profiles, audio tracks, metrics for three timeframes, and an async data service. No API keys, network calls, or remote media are needed to run it.

> **Demo only.** Every creator, caption, audio track, metric, and poster is fictional. The player is a simulation, and "View original" links point to platform discovery pages rather than real Reels. See [Demo data and limitations](#demo-data-and-limitations).

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
  - Data-source selector with demo, RapidAPI, Apify, and Meta Graph stubs
  - Auto-sync preference, default timeframe, credential fields
  - Manual mock sync, normalized dataset export, workspace reset
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
src/
├─ App.tsx                     app state, filters, sync, modal/nav orchestration
├─ main.tsx                    React root + ToastProvider
├─ index.css                   Tailwind theme, tokens, glass utilities, keyframes
├─ types.ts                    shared domain types and category/platform constants
├─ data/
│  ├─ reels.ts                 32 fictional Reels with per-timeframe metrics
│  └─ categories.ts            category metadata, icons, accents, labels
├─ services/
│  ├─ dataService.ts           async query layer, cache, filtering, sorting, KPIs
│  ├─ settingsService.ts       localStorage settings/sync persistence and reset
│  └─ providers/
│     ├─ types.ts              ReelProvider seam and provider config types
│     ├─ demoProvider.ts       in-memory demo source (currently active)
│     ├─ rapidApiProvider.ts   scaffolded live adapter
│     ├─ apifyProvider.ts      scaffolded live adapter
│     └─ metaProvider.ts       scaffolded live adapter
├─ hooks/                      dashboard fetch, debounce, focus trap, click-outside, storage
├─ components/
│  ├─ shell/                   sidebar, header, mobile nav, background effects
│  ├─ dashboard/               KPI cards, Reel cards/grid, posters, rank, sparkline
│  ├─ filters/                 platform switcher, timeframe, sort tabs, search, pills
│  ├─ overlay/                 Reel modal, admin modal, explore sheet, shared modal, chart
│  └─ ui/                      brand marks/icons, avatars, buttons, skeletons, toasts
└─ lib/                        formatting, constants, class-name helper
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

The service layer simulates approximately 280 ms of latency so loading, refreshing, and empty states are exercised. Filtering, sorting, KPI aggregation, category counts, velocity averages, and audio ranking all run inside `dataService.ts`; components stay unaware of the data source.

Each Reel has a `metrics` object keyed by `today`, `week`, and `month`, so changing the timeframe updates the rankings, cards, KPIs, and modal data.

Search is accent-insensitive and token-based. It normalizes creator names/handles, hooks, captions, category labels, audio metadata, and hashtags. The `/` key focuses search from anywhere outside an input.

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

The source selector in Admin / API settings persists your choice and credentials, but **the demo provider remains active**. The RapidAPI, Apify, and Meta adapters are intentionally scaffolded and throw `ProviderNotWiredError` until request/response mapping is added. This is stated in the admin UI as well.

For production, never call a provider that requires a secret directly from the browser. Route credentials through a server or serverless proxy, then fetch normalized data from your own endpoint.

---

## Persistence and sync

ReelPulse uses `localStorage`:

| Key                     | Contents                                      |
| ----------------------- | --------------------------------------------- |
| `reelpulse.settings.v1` | API source, credentials, auto-sync, timeframe |
| `reelpulse.sync.v1`     | Last sync timestamp and sync count            |
| `reelpulse.sidebar.v1`  | Desktop sidebar collapsed state               |

- The first run seeds a demo "last synced" timestamp and sync count so the dashboard looks lived in.
- **Manual sync** in Admin → Sync is simulated: it waits briefly, invalidates the cache, refetches the demo dataset, updates the timestamp, and increments the count.
- **Auto-sync** is evaluated once per app open. It runs only when auto-sync is enabled and the stored last sync is at least 24 hours old. It is not a background scheduler; scheduling stops when the tab closes.
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

## Demo data and limitations

- All 32 Reels, creators, handles, captions, hashtags, audio tracks, view counts, and engagement metrics are fictional.
- Poster thumbnails are deterministic SVGs generated in the browser. There are no video files; the "player" is a simulated interface.
- "View original" links go to platform discovery URLs, not real Reel permalinks.
- Metrics and velocity are illustrative, not measured from any platform.
- Live API adapters are stubs and do not make network requests.
- Keys entered in Admin are client-side only. Do not use this storage approach for real credentials.
- There is no automated test suite. Validation is via strict TypeScript, a production build, and manual browser QA across desktop, tablet, and mobile breakpoints.

---

## License

This is a demo project. The fictional dataset and generated posters are part of the application; no real creator content is included.
