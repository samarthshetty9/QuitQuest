# AGENTS.md

Shared instructions for coding agents (Claude, Codex, Antigravity) working in
this repo. Read this before implementing or reviewing.

## Project

**QuitQuest** — a local-first, offline-capable quit-smoking progression game.
Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4. Persistence is
Dexie (IndexedDB) only — no backend, no auth, no external APIs. See
[README.md](README.md) for the full picture, stack, and how to run
dev/tests/build.

## Architecture invariants — do not violate

- **`src/lib/time/clock.ts` is the only source of "now."** Never call
  `new Date()` / `Date.now()` directly in domain, game, or repo code — import
  `nowISO()` / `now()` from `clock.ts` (or accept a `now: Date` parameter, as
  the pure calculation functions in `src/lib/domain/` do). This is what makes
  streaks/quests/XP testable without waiting in real time.
- **`src/lib/db/repo.ts` is the only module that touches Dexie directly**
  (outside of `dexie-react-hooks` live queries in components for reactive
  reads). Don't call `getDB()` from a component to write data — add a repo
  function.
- **`src/lib/game/engine.ts` is the only place that mutates game state**
  (starts a battle, completes an intervention, logs a slip, awards XP,
  unlocks achievements/bosses). UI components call engine functions; they
  never hand-roll XP awards or achievement checks inline.
- **A slip resets the current streak only.** Level, lifetime XP, lifetime
  smoke-free days, and achievement unlocks must never decrease or be erased
  by a slip. `computeStreaks` derives everything from the full event history
  each time — don't introduce a cached counter that could drift from it.
- **XP awards are idempotent by `dedupeKey`** and some sources are
  daily-capped (`DAILY_XP_CAPS` in `src/lib/config/xp.ts`) to prevent
  farming. Any new XP-awarding action needs a dedupe key derived from the
  real-world event's own id, not a random one.
- **All tunable content lives in `src/lib/config/`** (XP amounts, level
  curve/titles, triggers, interventions + trigger-ranking rules,
  chapters/bosses, achievements, quest pool, skills, health/withdrawal
  content, support resources). Don't hardcode copy like XP numbers or trigger
  lists inline in components.
- **Health/medical content requires a source.** Anything added to
  `src/lib/config/health.ts` or `support.ts` must be paraphrased (never
  verbatim-copied) from a reputable source (WHO/CDC/NCI/Smokefree.gov/a
  national health authority) with that source recorded inline, and phrased as
  population-level information, never an individual guarantee or diagnosis.
- **Dev-only test hooks (`window.__quitquest_test__`, the debug panel) are
  gated by `isTestControlAllowed()`** (`NODE_ENV !== "production"`). Don't
  remove that gate or expose clock/data controls unconditionally.
- **Rebrand point:** the display name is `APP_NAME` in
  `src/lib/config/app.ts`. Don't hardcode "QuitQuest" elsewhere.

## Coding conventions

- Tailwind utility classes styled against CSS custom properties defined in
  `src/app/globals.css` (`--bg`, `--accent`, `--danger`, etc.) — not raw hex
  values in components, so light/dark theming stays centralized.
- No component library; UI primitives live in `src/components/ui/`.
- Copy tone: calm, honest, non-judgmental, never "FAILED"/"LOST" language for
  a slip. See the COPY STYLE section of the original product spec (in
  session history) if unsure.

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run test` — Vitest unit tests
- `npm run e2e` — Playwright E2E (needs `npx playwright install chromium`
  once; starts/reuses `npm run dev` automatically)
- `npm run build` — production build (must stay static-prerenderable; don't
  introduce a server-only data dependency)
- `npx tsc --noEmit` / `npx eslint .` — type-check / lint

## Safety constraints

- Never add analytics/ad trackers or any third-party script — this app's
  privacy promise ("your data stays on this device unless you export it") is
  load-bearing and stated to the user.
- Never make the app depend on network access for the craving/SOS flow.
- No gambling-style mechanics (loot boxes, paid boosts, real-money rewards).
- Don't add real medical claims, dosage guidance, or diagnostic language.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
