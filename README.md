# QuitQuest

A quit-smoking app that's actually a game — not a counter with badges bolted on.
Real-world progress toward not smoking (cravings survived, honest logging, time
smoke-free, money saved) drives an RPG-style progression system: XP, levels,
titles, a skill tree, a chapter-based journey map, boss battles, achievements,
and collections. The game layer exists to make evidence-informed cessation
behaviours engaging, not to replace them.

> Rebranding: the display name lives in one place —
> [`src/lib/config/app.ts`](src/lib/config/app.ts) (`APP_NAME`). Nothing else
> hardcodes "QuitQuest".

## Product principles

- **Local-first, private by default.** All data lives in the browser
  (IndexedDB via Dexie). No accounts, no server, no API keys, no third-party
  trackers. Works fully offline once loaded.
- **The craving flow is the product.** From tapping "I WANT TO SMOKE" to a
  recommended coping tool takes three taps, no long form. Nothing about an
  urgent craving depends on the network.
- **Evidence-informed, not medical.** Health/withdrawal/treatment content is
  centralized in [`src/lib/config/health.ts`](src/lib/config/health.ts) and
  [`src/lib/config/support.ts`](src/lib/config/support.ts), paraphrased from
  WHO/CDC/NCI/Smokefree.gov, with sources attached. The app never diagnoses,
  prescribes, or claims a specific medical outcome.
- **A slip is data, not a failure state.** Logging a cigarette never resets
  Level, lifetime XP, achievements, or historical stats — only the *current*
  streak. Copy never says "failed" or "lost."
- **Personalization is honest.** Coping-tool rankings only claim to reflect
  *your own* logged history once there's enough of it (3+ samples), and are
  never phrased as universal/medical superiority.
- **No gambling mechanics.** No loot boxes, no monetized emergencies, no paid
  boosts.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling (custom design tokens in
  [`src/app/globals.css`](src/app/globals.css), no component library —
  everything is hand-built for the premium-dark-first look)
- **Dexie** (IndexedDB wrapper) for persistence, **dexie-react-hooks** for
  reactive live queries
- **Recharts** for analytics charts
- **Zod**-ready domain layer (validation can be added at the repo boundary
  without touching UI)
- **date-fns** for date math
- **lucide-react** for icons
- **Vitest** + **Testing Library** for unit/integration tests
- **Playwright** for end-to-end tests (Chromium + a mobile viewport project)

## Local setup

```bash
npm install
```

## Run the development server

```bash
npm run dev
```

Open http://localhost:3000. On first load you'll go through onboarding. Use
the **dev debug panel** (bug icon, top-right, dev builds only) to:

- advance the app's internal clock by a day/hour (so streaks, quests, and
  smoke-free-day XP roll over without waiting in real time)
- load a realistic **demo profile** (17-day-old quit, ~28 seeded craving
  battles across triggers, one historical slip, reward goals, IF-THEN plans —
  enough data to see every dashboard populated)
- award test XP, log a test slip, or reset all local data

The debug panel and its underlying `window.__quitquest_test__` hooks are
compiled out of production builds entirely (gated on `NODE_ENV`).

## Run unit tests

```bash
npm run test          # single run
npm run test:watch    # watch mode
```

47 tests across money/cigarettes-avoided calculations, streak logic (including
same-day and multi-slip scenarios), XP/leveling, quest generation, achievement
unlock rules, coping-tool personalization, insight generation, and a
Dexie-backed repository layer (XP dedupe/anti-farming caps, export/import
round-trips) using `fake-indexeddb`.

## Run end-to-end tests

```bash
npx playwright install chromium   # first time only
npm run e2e
```

Runs against `npm run dev` (Playwright starts/reuses it automatically). Covers
onboarding → persistence, a full craving battle to defeat, a craving that
*doesn't* resolve on the first try (verifies the app never falsely claims
victory), a slip that preserves Level/XP/history, coping-tool personalization
surfacing the user's own better-performing tool, a reward goal unlocking,
future-quit-date preparation mode, mid-session offline resilience, mobile
layout/touch-target checks, and a full export → reset → import round-trip.

E2E tests drive the same dev-only clock/data hooks as the debug panel via
`window.__quitquest_test__`, exposed by
[`src/components/dev/TestHooks.tsx`](src/components/dev/TestHooks.tsx).

## Build for production

```bash
npm run build
npm start
```

All routes prerender as static shells (the app is a client-rendered SPA over
static HTML — there's no server-side data dependency to break).

## Data storage & privacy

Everything lives in one IndexedDB database (`quitquest`, see
[`src/lib/db/db.ts`](src/lib/db/db.ts)) behind a repository layer
([`src/lib/db/repo.ts`](src/lib/db/repo.ts)) that the rest of the app talks
to exclusively — no component queries IndexedDB directly except through
`dexie-react-hooks` live queries for reactive reads. That boundary is what
would let a future cloud-sync/auth layer be introduced without rewriting
product code.

From the **You** tab:

- **Export** — downloads a complete JSON snapshot of every table.
- **Import** — restores from that JSON (replaces all local data).
- **Reset** — permanently deletes all local data, with confirmation.

"Your quit data stays on this device unless you export it" is true: there are
no analytics scripts, no ad trackers, and no network calls other than loading
the app's own static assets.

## PWA / offline behaviour

- [`public/manifest.webmanifest`](public/manifest.webmanifest) makes the app
  installable (standalone display, dark theme color, SVG icons — see
  [`public/icons/`](public/icons/); placeholder art, swap for real brand
  icons before shipping).
- [`public/sw.js`](public/sw.js) is a hand-written service worker
  (network-first for navigations with a cached-shell fallback, cache-first
  for static assets) registered only in production builds via
  [`ServiceWorkerRegister`](src/components/shared/ServiceWorkerRegister.tsx).
  Because every product feature already runs against local IndexedDB, the
  craving flow, breathing exercises, timers, and distraction games all work
  offline once the shell is cached — network is never in the critical path
  for a craving emergency.

## Demo mode

`window.__quitquest_test__.loadDemoProfile()` (or the debug panel button)
seeds: a 12-cigarettes/day, ₹360/pack profile quit 17 days ago; ~28 craving
battles spread across triggers and times of day, including a deliberately
lopsided stress-trigger sample (walking works much better than the tap game)
so the personalization engine has something real to surface; one historical
slip with a completed reflection; two reward goals (one already crossable);
two IF-THEN plans. It never silently merges with a real onboarded profile —
loading it overwrites the current profile, same as import does.

## Project structure

```
src/
  app/                    routes (App Router) — thin pages, logic lives below
    onboarding/           9-step onboarding wizard
    battle/sos/           the craving battle flow
    battle/slip/          the "I smoked" reflection flow
    journey/ progress/ you/
  components/
    battle/                craving flow orchestrator + per-intervention UIs
      interventions/       delay, breathing, water, move, urge-surf, talk-back,
                            why-i-quit, environment, social, substitutes
      games/                5 distraction mini-games (tap, memory, puzzle,
                            visual search, trivia) — instant, offline, no ads
    home/ journey (inline in app/journey) / onboarding/ nav/ ui/ dev/
  lib/
    domain/                 pure calculation/logic modules + their unit tests
      calculations.ts       money saved, cigarettes avoided, time saved
      streak.ts              current/best streak, lifetime smoke-free days
      xp.ts, personalization.ts, insights.ts, achievements.ts, quests.ts
    config/                  all tunable content in one place — XP amounts,
                            level curve/titles, triggers, interventions +
                            trigger→recommendation rules, chapters/bosses,
                            achievements, quest pool, skills, health content,
                            support resources, reasons for quitting
    game/
      engine.ts              the only place that mutates game state — every
                            action (start a battle, complete an intervention,
                            log a slip, unlock an achievement) goes through here
      stats.ts                aggregates everything a screen needs in one call
    db/
      db.ts                   Dexie schema
      repo.ts                  CRUD + XP-award dedupe/anti-farming + export/import
    time/clock.ts             the ONLY place `Date.now()`-equivalent logic
                            lives; a dev/test clock that can be advanced or
                            frozen, persisted to sessionStorage in dev so
                            Playwright can time-travel across page reloads
    dev/seed.ts               demo profile generator
e2e/                          Playwright specs, one per required scenario
```

## How the game calculations work

- **Money saved** = `(cigarettesPerDayBaseline / cigarettesPerPack) *
  pricePerPack` × elapsed days since the quit date, minus what was actually
  spent on any logged slip cigarettes. Never negative.
- **Cigarettes avoided** = expected cigarettes at baseline rate over elapsed
  time, minus cigarettes actually logged via slips. Never negative, always
  labeled as an estimate.
- **Streaks** are derived from the full event history every time (quit
  date(s) + every slip timestamp), never from a cached counter — see
  [`computeStreaks`](src/lib/domain/streak.ts). A slip resets only the
  *current* streak segment; best streak, lifetime smoke-free days, and total
  XP are computed independently and never decrease from a slip.
- **XP/Levels** use an accelerating curve (100 levels, title milestones at
  1/5/10/20/30/50/75/100 — see [`config/xp.ts`](src/lib/config/xp.ts)).
  Every XP award carries a dedupe key so the same real-world event can never
  award XP twice, and repetitive sources (e.g. finishing a coping action) are
  capped per day to prevent farming.
- **Personalization**: once a coping tool has 3+ logged before/after
  intensity pairs for a given trigger, its average reduction ranks it against
  the deterministic default ordering; the UI always labels this
  "worked well for you before," never a universal claim. See
  [`rankInterventionsForTrigger`](src/lib/domain/personalization.ts).
- **Insights** (Progress tab) are template-filled from the same logged data,
  each gated on its own minimum sample size — no insight is ever generated
  from a single data point.

## Medical-content disclaimer

QuitQuest provides general, population-level educational information about
smoking cessation, paraphrased from WHO, CDC, the National Cancer Institute,
and Smokefree.gov (sources are attached inline in the app and in
[`src/lib/config/health.ts`](src/lib/config/health.ts)). It does not diagnose
conditions, does not prescribe or recommend medication or dosages, and is not
a substitute for professional medical care. India's National Tobacco
Quitline number (1800-11-2356) was verified against WHO India and India's
Ministry of Health and Family Welfare (NTCP) at implementation time — see
[`src/lib/config/support.ts`](src/lib/config/support.ts); re-verify before
relying on it long-term, as official numbers can change.

## Intentionally deferred / simplified for V1

- **PWA icons are placeholder SVG art**, not final brand assets, and are not
  provided as raster PNGs (some install surfaces prefer PNG maskable icons).
- **Notifications** are modeled in Settings (opt-in toggle, stored) but no
  actual browser Notification/Push scheduling is wired up yet.
- **Photos on reward goals** — the data model supports an image field;
  there's no upload UI yet.
- **Season 2-4 content shift** (fitness/sleep/productivity quests over time)
  is not implemented; only Season 1-equivalent quest content exists.
- **Collections beyond "Trigger Mastery" and "Smoke-Free Firsts"** are
  scoped down to Trigger Mastery only.
- **The service worker's offline shell** could not be verified inside this
  sandboxed preview environment (service worker registration is blocked by
  the preview proxy); the underlying approach (cache app shell, everything
  else runs against local IndexedDB regardless of network) is standard and
  should be re-verified in a real deployed environment before relying on it.

## Definition of done — status

Onboarding, craving battle (intensity → trigger → recommendation →
intervention → reassess → resolve/chain/slip), money/cigarette/time
calculations, slip logging with compassionate copy and preserved
Level/XP/history, IndexedDB persistence with export/import/reset,
trigger-specific + personalized coping recommendations, XP/levels, daily +
weekly quests, the journey map with boss battles, analytics (frequency,
intensity trend, trigger distribution, time-of-day heatmap, intervention
effectiveness, insights), achievements, the reward store, and mobile-polished
responsive UX are all implemented and covered by passing unit + E2E tests. See
"Intentionally deferred" above for the secondary/cosmetic gaps.
