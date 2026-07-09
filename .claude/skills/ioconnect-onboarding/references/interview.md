# Onboarding Interview

Goal: learn what the discovery scan cannot tell you — the *business* data flows and user workflows. Keep it short; ask only questions whose answers change what you build. Skip anything already answered by the codebase or by the user's initial message.

## Core questions (almost always ask)

**1. Which app should be the entry point?**
"When your users start their day, which app do they open first?" That app (or a small new launcher page) becomes/hosts the platform. If no natural candidate exists, recommend scaffolding a minimal launcher — a page with buttons that start the other apps.

**2. What should the apps share?**
"Give me 2–3 concrete examples of information that should flow between apps. E.g., 'when a user picks a customer in App A, App B should show that customer's orders.'"
Capture for each flow: source app, target app(s), the data shape, and the trigger (user click? automatic?).

**3. Who controls the linking?**
"Should users choose which windows are linked together (e.g., pick a color channel per window), or should the apps always stay in sync automatically?"
- User chooses → **Channels**
- Always in sync → **Shared Contexts**
- One-off commands with a reply → **Interop methods**
- "Open/show X wherever appropriate" → **Intents**

**4. Window management ambitions?**
"Do you want apps docked together in one window with tabs and splits the user can rearrange and save (→ Workspaces), or are separate browser windows fine (→ plain window management + optional Layouts)?"

## Conditional questions

**5. FDC3** (ask if finance domain, or third-party apps are involved): "Do you need to comply with the FDC3 standard, or integrate third-party apps that already speak FDC3?" If yes → fdc3.md; define channels with FDC3 metadata from day one.

**6. Persistence** (ask if layouts/workspaces are in scope): "Should saved layouts/preferences survive across browsers and machines (→ REST store you host, or io.Manager), or is per-browser storage fine (→ IndexedDB/session)?" Default for a first integration: `idb`.

**7. Rollout order** (ask if >3 apps): "Which two apps, if connected, would deliver the most value? We'll start there." Never integrate everything at once.

**8. License key**: "Do you have your io.Connect license key available (from your interop.io representative)? We'll put it in an env var, never in source."

**9. UI affordances** (ask whenever the plan involves channels, launching, or anything user-visible): "Some features have a user-facing side — e.g. a channel picker so users choose what's linked, or launch buttons. Should I add any visible UI to your apps, or keep all changes invisible and give you ready-made snippets to add yourself?" Default when unanswered: **invisible** — wire the plumbing, put the snippets in the handoff document.

## Interpreting answers → plan

Write the plan as: platform choice, client conversion order, one row per data flow with the chosen API, optional layers (workspaces/FDC3/notifications), and the verification approach. Keep it under a page. Ask for approval.

Red flags to address in the plan:
- All apps are routes of a single SPA → interop still works (each route opened as a separate window/app), but discuss whether they want multi-window at all.
- Existing postMessage/BroadcastChannel glue → plan its replacement explicitly, flow by flow; don't leave two parallel mechanisms.
- No clear "first app users open" → scaffold the minimal launcher; do not force one of their apps to be the platform if it's sometimes not open.
