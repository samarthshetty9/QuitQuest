# Connections — QuitQuest

External integrations and dependencies only. Internal code structure belongs
in [architecture.md](architecture.md).

## External services

**None.** This is intentional and load-bearing for the product's privacy
promise. QuitQuest has no backend, no database service, no auth provider, no
analytics/tracking script, and makes no network calls other than loading its
own static assets (and, in production, registering its own service worker
from `/sw.js`).

## Data sources cited in-app (informational content, not live integrations)

Health/withdrawal/treatment copy in `src/lib/config/health.ts` and support
hotline numbers in `src/lib/config/support.ts` are paraphrased from, and
attribute:

- WHO (World Health Organization) — general cessation info, India tobacco
  quitline confirmation (who.int/india)
- CDC (U.S. Centers for Disease Control and Prevention)
- National Cancer Institute
- Smokefree.gov
- India's Ministry of Health and Family Welfare / National Tobacco Control
  Programme (ntcp.mohfw.gov.in) — source for the India National Tobacco
  Quitline number, 1800-11-2356, verified via web search 2026-09-21 against
  who.int/india and ntcp.mohfw.gov.in at implementation time. Re-verify
  before long-term reliance; official numbers can change.

These are static, hand-maintained strings — there is no live API call to any
of these sources. If the app ever adds a "check for updated health content"
feature, it would be a new integration and belongs here.

## Source repository

GitHub: https://github.com/samarthshetty9/QuitQuest (`origin`, default branch
`main`). No CI/Actions configured yet.

## Design source

Google Stitch project "Quit Smoking App Redesign"
(`projects/1296704631939885018`) holds the onboarding screen designs
("Midnight Arcade" design system). Accessible via the Stitch MCP tools; the
onboarding components in `src/components/onboarding/arcade/` are ported from
those screens' HTML by hand — there's no automated sync, so re-pull and
re-port after design edits there.

## Deploy pipeline

None configured yet. The app is a standard Next.js app
(`npm run build` → `npm start`, or any static/Node hosting that supports
Next.js) — no deploy target has been chosen or wired up in this repo.

## Future integration point (not built)

README's "Future AI architecture" section (product spec) anticipates a
future AI Quit Companion that would receive structured context (current
quit day, active craving, trigger, similar past cravings, effective coping
methods, reasons for quitting, IF-THEN plans) from the existing domain layer.
No AI/LLM integration exists in this build — the repository/domain layer
(`src/lib/db/repo.ts`, `src/lib/domain/*`) was kept clean specifically so
that hook could be added later without a rewrite.
