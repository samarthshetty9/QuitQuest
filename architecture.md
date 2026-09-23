# Architecture — QuitQuest

Orientation doc for a new session. See [AGENTS.md](AGENTS.md) for hard
invariants agents must not violate, and [README.md](README.md) for
setup/run/test commands and product framing.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4
(custom tokens, no component library) · Dexie (IndexedDB) ·
dexie-react-hooks · Recharts · date-fns · lucide-react · Vitest + Testing
Library · Playwright.

Client-rendered SPA over statically-prerendered route shells. No server, no
database, no API routes, no auth. Everything runs in the browser against
IndexedDB.

## Routing / entry points

```
/                    Home dashboard (ActiveHome or PreparationHome depending
                      on whether the quit date is in the future)
/onboarding          10-step onboarding wizard (gates all other routes until
                      complete — see AppShell's redirect effect)
/battle              Battle hub: arsenal + trigger intelligence summary
/battle/sos          The craving battle flow (CravingFlow, a client-side
                      state machine — intensity → trigger → recommend →
                      intervention → reassess → resolve/chain/complete)
/battle/slip         The "I smoked" reflection flow (standalone or reached
                      from within a battle via "I smoked")
/battle/checkin      Standalone situational quick-log ("I'm drinking / I'm
                      high, how many did I smoke") — see ContextCheckIn below
/journey             Chapter map, skill tree, achievements, collections
/progress            Analytics (charts, heatmap, insights)
/you                 Profile, reasons, reward store, IF-THEN plans, support
                      contacts, settings, data export/import/reset, health info
```

`src/app/layout.tsx` wraps everything in `Providers` (boots daily/weekly
quest generation, smoke-free-day XP sync, achievement sync on mount; applies
theme/reduced-motion from settings) → `AppShell` (nav + onboarding gate + SOS
FAB) → `ServiceWorkerRegister` + `TestHooks` (both production/dev gated).

## Layers (data flows top to bottom; each only talks to the layer below)

```
components/ (app/*, components/*)
    ↓ calls
lib/game/engine.ts    — the only place that mutates game state
lib/game/stats.ts     — aggregates read-model for a screen in one call
    ↓ calls
lib/db/repo.ts        — the only module that touches Dexie directly (writes)
    ↓ wraps
lib/db/db.ts           — Dexie schema/instance (versioned: `.version(1)` then
                          `.version(SCHEMA_VERSION)` additive — keep every
                          past version's `.stores()` call when bumping again,
                          Dexie needs the full chain to migrate an existing
                          local user's DB forward)
lib/domain/*.ts        — pure functions (money, streak, xp, personalization,
                          insights, achievements, quests) — no I/O, fully
                          unit-testable, take explicit `now`/data as params
lib/config/*.ts        — all tunable content (XP amounts, level curve,
                          triggers, interventions + ranking rules, chapters,
                          achievements, quests, skills, health/support copy)
lib/time/clock.ts      — the only source of "now" anywhere in the app
```

Components read via `dexie-react-hooks`' `useLiveQuery` directly (reactive,
auto-updates on any write anywhere) — that's the one exception to "components
don't touch Dexie," since it's read-only and reactive rather than a mutation.
The central `useGameData()` hook (`src/hooks/useGameData.ts`) composes all
the live queries + `computeGameStats` into one object most screens consume.

## Key components

- `CravingFlow` (`components/battle/CravingFlow.tsx`) — the core interactive
  system. Local step-machine state; each step transition calls an
  `engine.ts` function to persist. `InterventionRunner` dispatches to one of
  ~12 per-category UI components (`components/battle/interventions/*`),
  including a `DistractionRouter` for 5 mini-games
  (`components/battle/games/*`).
- `SlipFlow` (`components/battle/SlipFlow.tsx`) — details → reflection →
  compassionate summary. Reused from both the in-battle "I smoked" escape
  hatch and the standalone `/battle/slip` route.
- `OnboardingWizard` (`components/onboarding/OnboardingWizard.tsx`) —
  10-step wizard, writes the full initial profile/attempt/reasons/prefs in one
  `finish()` call. Visual design is a dedicated dark "Midnight Arcade" theme
  (its own color/typography tokens, prefixed `--ma-*`/`text-ma-*` in
  `globals.css`, additive to the app-wide tokens — no other route uses them).
  Shared chrome (`components/onboarding/arcade/Chrome.tsx`) + one component
  per step (`components/onboarding/arcade/steps/Step1..9*.tsx`). Step
  transitions are local state, not routing, so the wizard resets
  `window.scrollTo(0, 0)` on every step change — see logs.md for why.
- `ContextCheckInFlow` (`components/battle/ContextCheckInFlow.tsx`) — quick
  log for a drinking/cannabis session's cigarette count against the user's
  own baseline (`UserProfile.cigsWhenDrinkingBaseline` /
  `cigsWhenHighBaseline`, set in onboarding step 4). Writes a
  `ContextCheckIn` row (`lib/domain/situational.ts` has the
  baseline-comparison logic + copy) — purely informational, never affects the
  streak on its own. `engine.logContextCheckIn` (count > 0 path) and the
  `alcohol`/`cannabis`-trigger hooks inside `finishCravingBattle`/`logSlip`
  all funnel through one `recordContextCheckIn` helper keyed by a stable
  `sourceKey` (the craving/slip id, not a fresh random id) so retries stay
  idempotent — see logs.md for the bug this fixed.
- `AppShell` (`components/nav/AppShell.tsx`) — desktop sidebar / mobile
  bottom nav + floating SOS button; also owns the "no profile → redirect to
  /onboarding" gate (uses a `"loading"` sentinel from `useLiveQuery` to avoid
  a premature-redirect race — see the comment there before changing it).
- `DebugPanel` / `TestHooks` (`components/dev/*`) — dev-only. Debug panel is
  a floating UI; TestHooks exposes the same controls on `window` for
  Playwright. Both gated by `isTestControlAllowed()`.

## State management

No global client state library. State is: (1) Dexie/IndexedDB as the single
source of truth, read reactively via `useLiveQuery`; (2) local `useState` for
in-progress UI flows (onboarding wizard, craving battle step machine) that
get persisted to Dexie at each meaningful transition, not held only in
memory.

## Time handling

`clock.ts` wraps `Date.now()`. In dev/test builds (`NODE_ENV !== "production"`)
its offset/freeze state persists to `sessionStorage` so Playwright can
advance the clock and then assert persistence across a page reload — this is
load-bearing for the E2E slip/streak/reward-goal tests; don't make the clock
purely in-memory again without re-checking those tests.

## Known constraints

- Service worker registration could not be verified inside the sandboxed
  preview environment used during development (proxy blocks SW fetch); logic
  is standard (network-first navigations, cache-first static assets,
  app-shell fallback) and should be spot-checked in a real deployment.
- No image upload for reward goals yet (field exists in the data model,
  `RewardGoal.imageDataUrl`, unused by any UI).
- Notification *preference* is stored (`AppSettings.notificationsEnabled`)
  but no actual browser Notification/Push scheduling is implemented.

See [logs.md](logs.md) for the reasoning behind specific non-obvious
decisions and bugs found/fixed during the initial build.
