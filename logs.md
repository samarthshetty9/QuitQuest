# Logs — QuitQuest

Newest entry first. Prose, not a changelog — what was done, why, and what to
carry forward. See [architecture.md](architecture.md) for current-state
structure and [connections.md](connections.md) for external dependencies.

---

## 2026-09-22 (later) — Situational check-ins: drinking/cannabis cigarette tracking vs. personal baseline

Added a feature for the "when I drink I smoke a lot, when I'm high I smoke a
lot" case the user described: a new `alcohol`-sibling trigger `cannabis`, two
onboarding baseline questions ("how many do you usually smoke when
drinking/high"), a standalone quick-log flow (`/battle/checkin`, linked from
Home) to log a session's cigarette count anytime, and automatic hooks in the
existing craving-battle-resolved and slip flows so the same comparison
surfaces without a second manual log when the trigger is alcohol/cannabis.
Comparison copy ("2 smoked — down from your usual 4") lives in the new
`src/lib/domain/situational.ts`, kept deliberately non-judgmental for an
above-baseline count per the project's copy-tone rule.

**Design decision — `ContextCheckIn` is a new table, not a repurposed
`SlipEvent`.** A `SlipEvent` breaking the streak is unconditional on any
cigarette count per `computeStreaks` (any slip row = that calendar day isn't
smoke-free), so a "0 cigarettes while drinking" win could never be logged via
`SlipEvent` without wrongly breaking the streak. `ContextCheckIn` is purely
informational; whenever cigarettes were actually smoked (count > 0), the
logging action also creates a real `SlipEvent` so streak/lifetime stats keep
deriving correctly from the full event history — a `ContextCheckIn` alone
never touches streak accounting.

**Onboarding insertion:** added as new step 4 (after the smoking-baseline
step, before quit-history), pushing the old steps 4-9 to 5-10 and
`TOTAL_STEPS` 9→10. This was safe because the shared `ChromeHeader` renders
"Step {step} of {totalSteps}" dynamically — only `Step1Welcome.tsx`'s
standalone header (it doesn't use `ChromeHeader`) needed a literal text edit.

**Codex review caught a real dedupe bug before this shipped.** Ran an
independent Codex review (`codex exec --sandbox read-only`, no git history to
diff against since this repo has no commits yet, so full file contents were
reviewed instead of a diff) against the new engine/db code. It found that
`recordContextCheckIn`'s XP dedupe key was built from the freshly-generated
`checkIn.id` instead of the real-world event that triggered it — meaning a
double-click on "finish craving" or a retried slip submission would silently
create a second `ContextCheckIn` row and a second `context_checkin_good` XP
award every time, directly violating this project's own stated invariant
("dedupe key derived from the real-world event's own id, not a random one").
Fixed by threading a `sourceKey` (`battle:${cravingEventId}`,
`slip:${slipId}`) through to both the check-in's own `id` (so the write
upserts instead of duplicating — same fix pattern as the deterministic quest
IDs from the original build) and the XP dedupe key. Added
`src/lib/game/__tests__/engine.situational.test.ts` (first tests to exercise
`engine.ts` directly, previously untested as a layer) including a
call-it-twice test that pins this down. **Lesson:** when a new engine action
is triggered automatically from a UI hook rather than a single explicit user
button, double-firing is easier to hit than it looks (no submit-disable
guard) — always ask "what real-world id does this dedupe key actually derive
from" before shipping, not just "is there a dedupe key."

Codex also flagged two other real, smaller bugs, both fixed: `exportAllData`
hardcoded `schemaVersion: 1` even after the schema bumped to 2, and
`importAllData` skipped clearing any table missing from the import payload
(so restoring an old export could leave newer-schema data, like
`contextCheckIns`, mixed in instead of being replaced) — both fixed to use
the real `SCHEMA_VERSION` and to unconditionally clear every known table
before restoring. And a UX bug in the new onboarding step: a single toggle
button labeled "Doesn't apply" that stayed highlighted in its *default*
state looked already-selected, so clicking it (to confirm the default) would
silently set a baseline of 3 instead of leaving it unset — replaced with an
explicit two-button "This applies to me" / "Doesn't apply" pair.

**Rejected findings, with reasoning:**
- Codex flagged the multi-write sequences (slip + check-in + XP + craving
  update) as non-atomic across separate `await`s, and `repo.awardXp`'s
  dedupe-then-write as racy under concurrent calls. Both are accurate, but
  both are pre-existing characteristics of *every* XP-awarding and
  multi-table engine action in this codebase (e.g. `SlipFlow.submit()` already
  did a two-step `logSlip()` then `updateCravingEvent()` before this feature
  existed), not something this change introduced. Fixing it properly means
  wrapping every engine action in `db.transaction()` and replacing
  read-then-write dedupe with an atomic claim — a cross-cutting engine
  refactor out of scope for this feature. Left as-is, consistent with the
  rest of the app; worth revisiting if this ever needs to be a multi-tab or
  multi-device app (it's local-only IndexedDB today).
- Codex flagged `new Date()` in `OnboardingWizard.tsx` and `Date.now()` in
  `CravingFlow.tsx` as violating the "clock.ts is the only source of now"
  rule. Both are pre-existing code this feature didn't touch, and the rule in
  AGENTS.md is explicitly scoped to "domain, game, or repo code" — these are
  UI components, not that layer. Not a real violation; no change made.

## 2026-09-22 — Onboarding copy pass: pulled the user's live Stitch edits

The user connected the Stitch MCP directly (`mcp__stitch__*`, already available as
a tool in this session — no manual setup needed) and had made further edits to
all 9 onboarding screens inside the Stitch project itself (`projects/1296704631939885018`,
"Quit Smoking App Redesign") since the last redesign. Asked to "just use the
latest ones," so pulled each screen's current `code.html` via
`mcp__stitch__list_screens` + a direct `curl` of each `htmlCode.downloadUrl`,
diffed it against the previously-downloaded reference folder
(`~/Downloads/stitch_quit_smoking_app_redesign/`) to isolate exactly what
changed, and ported those changes into the existing `arcade/steps/*` components.

**What changed:** the user dialed back nearly all of the "gamer/arcade" jargon
across all 9 screens — "Quest Phase" → "Step X of 9", "Loot Vault" → plain
dollar amounts, "Tactical Blueprint"/"Armory Loadout"/"Willpower Multiplier"
badges and XP callouts removed, copy shortened and flattened throughout. This
lands much closer to the AGENTS.md copy-tone guideline ("calm, honest,
non-judgmental") than the original arcade-flavored draft did. Visual layout,
color tokens, and component structure were untouched — this was a content/copy
pass, not a redesign. Several screens also lost UI elements entirely (step 6's
custom-reason input, step 7's HUD SOS simulation card, step 4's tier badges),
which were removed from the corresponding components rather than left dead.
The primary CTA label is inconsistently "Continue" vs "Continue Quest" across
different steps in the user's edited screens (steps 2/5/6/8 say "Continue",
steps 3/4/7 say "Continue Quest", step 9 says "Start My Quest") — this looks
like generation variance rather than an intentional pattern, but per "use the
latest ones" it was reproduced exactly via a per-step `STEP_CTA_LABELS` map in
`OnboardingWizard.tsx` rather than normalized to one label.

**Trimmed options to match:** Step 5's trigger categories dropped from 5
options each to 4 (still valid `TriggerKey`s, just a smaller curated set).
Step 6 dropped from 8 reason drivers to 6 (dropped `smell`, `personal_promise`
— no longer selectable via onboarding, though still valid values elsewhere in
the app). Step 8's arsenal chips dropped `why_i_quit` and `hand_substitute`
in favor of `oral_substitute` getting its own dedicated chip (previously only
a "treatment" pill); updated `WizardState`'s default `arsenal` selection to
match what the new screen shows as pre-selected. **Lesson:** when porting a
design that trims options, check the wizard's default state — a default value
that used to be togglable can become "stuck on with no way to turn off" if the
UI to toggle it disappears but the default doesn't get updated too.

**E2E fallout:** `completeOnboarding` in `e2e/helpers.ts` needed the nickname
placeholder updated (`"Gamer tag (e.g. Phoenix, Sam)"` → `"Sam or nickname"`)
and the button-name lookups switched from a uniform `"Continue Quest"` to the
literal per-step sequence now used by the redesigned screens. All 47 unit
tests and 20 E2E tests (10 scenarios × 2 projects) pass; production build
stays fully static-prerendered.

## 2026-09-21 (later) — Onboarding redesign: "Midnight Arcade"

The user supplied a fully-specified design (`~/Downloads/stitch_quit_smoking_app_redesign/`,
9 screens as `code.html` + `screen.png` pairs plus a `DESIGN.md` design-system
spec) and asked for the onboarding flow to be rebuilt to match it exactly.
Rebuilt all 9 onboarding steps pixel-for-pixel against the reference HTML/PNGs:
a dark-only "cyberpunk arcade" aesthetic (Plus Jakarta Sans headings, Inter
body, Material Symbols Outlined icons, violet/emerald/cyan accent palette)
layered with real functional wiring into the existing onboarding data model —
none of it is static mockup copy; the "Yearly Wealth"/"Time Salvaged"
projections, XP/multiplier badges, and the final review screen all compute
live from actual form state.

**Scope discipline:** only the onboarding route was touched. The redesign
folder contained onboarding screens only, and the rest of the app (Home,
Battle, Journey, Progress, You) intentionally keeps its own existing design
system — confirmed this by completing onboarding end-to-end and landing
cleanly on the unchanged Home dashboard.

**Implementation approach:** added the reference design's full color/typography
token set as new `--ma-*`/`--color-ma-*`/`--text-ma-*` CSS custom properties
in `globals.css` (additive, no collisions with the existing `--accent`/`--bg`
app-wide tokens), loaded Inter + Plus Jakarta Sans via `next/font/google` and
Material Symbols Outlined via a `<link>` in the root layout `<head>`. New
components live under `src/components/onboarding/arcade/` (`Chrome.tsx` for
the shared fixed header/footer shell, `steps/Step1..9*.tsx` for each screen)
and `OnboardingWizard.tsx` was rewritten as the orchestrator — it still
produces the same `UserProfile`/`QuitAttempt`/reasons/coping-preferences/etc.
writes as before, just from richer/regrouped input state (e.g. "waking
urgency" bucket → `minutesToFirstCigarette` estimate, streak value+unit →
`longestPreviousQuitDays` in days).

**Bug found and fixed:** after finishing step 1 (which autofocuses its
nickname input), moving through later steps showed each new step's heading
with its top ~30px clipped under the fixed header. Root cause: the mobile
browser's focus-into-view behavior had scrolled the page down ~32px on step
1, and since step transitions are pure client-side state changes (not
navigations), that scroll offset persisted — the `fixed` header stayed
pinned at the real viewport top while the newly-mounted step's content
started 32px into the (still-scrolled) page, so it rendered partly behind
the header. Fixed with a `useEffect` that calls `window.scrollTo(0, 0)` on
every step change. **Lesson:** any multi-step flow that changes content via
local state rather than routing needs an explicit scroll reset on step
change — routing gets this for free (Next.js resets scroll on navigation),
plain state transitions do not.

**E2E fallout:** all 10 onboarding-dependent E2E scenarios broke on
selectors (nickname placeholder text changed from "Your name or nickname" to
"Gamer tag (e.g. Phoenix, Sam)"; the continue button's accessible name
changed from "Continue" to "Continue Quest"/"Initialize Quest"/"Start Quest"
depending on step). Updated `e2e/helpers.ts`'s `completeOnboarding` and one
direct reference in `10-export-import.spec.ts`; all 20 E2E tests (10
scenarios × 2 viewport projects) and all 47 unit tests pass again, and the
production build stays fully static-prerendered.

## 2026-09-21 — Initial build (greenfield → working V1)

Built QuitQuest from an empty repository per the full product spec: Next.js
16 + React 19 + TypeScript + Tailwind v4, Dexie/IndexedDB persistence, no
backend. Implemented onboarding, the craving battle system (intensity →
trigger → personalized recommendation → intervention → reassess →
resolve/chain/slip), five real distraction mini-games, slip logging with
compassionate copy, XP/levels/skill tree, daily+weekly quests, the journey
map with boss battles, achievements, a reward store, analytics with a
deterministic (no-AI) insights engine, and full export/import/reset. 47
Vitest unit tests and 20 Playwright E2E tests (10 scenarios × 2 viewport
projects) all pass; production build succeeds with every route
static-prerendered.

**Decisions worth remembering:**

- **Money saved / cigarettes avoided subtract slip cigarettes from the
  expected baseline**, rather than treating a slip day as fully "not
  smoke-free" for the money/cigarette math — but streak/lifetime-smoke-free-day
  math treats any calendar day containing a slip as not smoke-free. These are
  two different questions (financial estimate vs. streak accounting) and
  deliberately use slightly different slip-handling logic; don't try to unify
  them into one "slip adjustment" function.
- **XP events need a real, historical `createdAt`, not always "now."**
  Found via the demo-data seeder: `repo.awardXp` originally always stamped
  `nowISO()`, so seeding 20+ historical craving battles all landed their XP
  events on the same real-world day, instantly maxing out the
  anti-farming daily caps (`DAILY_XP_CAPS`) and silently zeroing out XP for
  a live interactive battle done right after loading the demo profile (showed
  +25 XP instead of the expected +55). Fixed by adding an optional `atISO`
  param to `awardXp` and having the seeder pass each event's own historical
  timestamp. **Lesson:** any future backdated/bulk data writer must pass an
  explicit timestamp to `awardXp`, not rely on the default.
- **Reward-goal unlocking needs an active sync point.** `syncRewardGoalUnlocks`
  existed in `engine.ts` from the start but nothing ever called it
  automatically, so a goal whose target was already exceeded stayed
  perpetually locked until some other code path happened to check it. Fixed
  by calling it from a `useEffect` inside `useGameData()` keyed on
  `stats.moneySaved`, so it's checked passively on every screen that reads
  game data. **Lesson:** a `sync*` function in `engine.ts` is inert until
  something calls it — grep for callers when adding one, don't assume wiring
  it into the data model is enough.
- **`ReasonForQuitting` was missing a `userId` field** in the original type
  definition, so both the onboarding wizard's and the demo seeder's writes
  silently produced rows the `userId`-indexed query in `repo.getReasons()`
  could never match — reasons always showed as empty on the You tab even
  though rows existed in the table. Root cause was the type just not
  matching the DB's indexed schema; TypeScript caught it immediately once the
  field was added to the interface, which then correctly flagged both
  call sites.
- **Dev/test clock must persist across page reloads.** The clock started as
  pure in-memory state; a Playwright test that advances the clock 10 days
  and then does `page.reload()` (to test "does the streak survive a
  refresh") got a clock reset back to real-time on reload, since a fresh
  page load re-runs all JS module initializers. Fixed by persisting
  offset/freeze state to `sessionStorage`, gated the same way as all other
  test-only behavior (`isTestControlAllowed()`, compiled out of production).
- **Quest generation needs deterministic IDs, not random ones.** Two
  concurrent `ensureTodayQuests()` calls (observed via React
  double-invocation in dev) each saw "no quests for today" and both
  inserted a fresh set with random IDs, producing 8 visible quests instead
  of 4. Switched quest IDs to a deterministic
  `q_${userId}_${date}_${key}` scheme so a duplicate generation call
  upserts the same rows via `bulkPut` instead of creating duplicates —
  makes the ensure-functions safe to call more than once, which they
  legitimately are (called on every app boot).
- **Playwright text/role locators are case-insensitive substring matches by
  default.** A "preparation mode shows no money-saved stats" assertion using
  `getByText("SAVED")` false-failed because a plain sentence
  ("...will start counting from your quit day") contains the substring
  "saved." Prefer structural assertions (exact match, or "this specific
  element doesn't exist") over loose substring checks when asserting
  *absence* of something.
- **A hidden desktop sidebar link and a visible mobile-nav link can share
  the same accessible name.** `AppShell` renders the desktop sidebar
  (`hidden lg:flex`) before the main content in DOM order; `.first()` on a
  `getByText(...)` locator picks DOM order, not visible order, so it
  reliably grabbed the *hidden* sidebar link on the mobile Playwright
  project and hung waiting for it to become visible. Added a
  `clickSosEntryPoint` test helper that scopes to `<main>` (where the
  always-visible Home CTA card lives at every viewport) instead of relying
  on `.first()`.

**Verified but with a caveat:** service worker registration could not be
confirmed inside the sandboxed browser-preview environment used for manual
QA during this session (registration throws a generic "unknown error
fetching the script," consistent with the preview's proxying breaking the
secure-context/same-origin assumptions service workers require). The
`/sw.js` logic itself is a standard, unremarkable network-first/cache-first
pattern; re-verify in a real deployed environment before depending on the
offline shell.
