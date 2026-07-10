# Onboarding Interview

Goal: learn what the discovery scan cannot tell you — the *business* data flows and user workflows. The client knows what they want their apps to DO; they do not know io.Connect's APIs. So every question must be phrased in behavior terms, never in product terms ("should the other app open by itself?", not "do you want intents?"). You translate answers into APIs; they never need to.

Three rules for asking:

1. **Confirm, don't interrogate.** You ran discovery first — use it. A question grounded in their code ("I see the watchlist writes the selection to localStorage and orders polls it — should selecting an instrument always update orders, or only when the user links the two windows?") is far easier for a non-expert to answer than an open-ended one. Prefer proposing something concrete they can correct.
2. **Only ask what changes what you build.** Skip anything already answered by the codebase or their initial message. Environment/deployment/security questions are noise at this stage.
3. **Batch.** 3–4 questions per message (or one AskUserQuestion call). Full interview should be ~10–12 interactions max across two rounds.

## Round 1 — the shape of things (always)

**1. The always-open app (platform host).** Explain the stakes BEFORE asking, so the client understands what their answer decides: "One app will act as the hub — it runs the communication between all the others and has to stay open the whole session; if it closes, the other apps disconnect. Is there an app or start page your users genuinely keep open all day? Would anything break for them if someone closed it at lunch?"

If the client names an app but hesitates on the "closed at lunch" test, or no clear candidate exists, default to scaffolding a minimal launcher page — one tiny extra app beats a business app doubling as the broker.

**2. The flows.** "Give me the 2–3 most valuable examples of information that should move between apps — e.g. 'when a user picks a customer in App A, App B should show that customer's orders'." Seed this with discovery findings: name the flows their existing glue (postMessage/localStorage/BroadcastChannel) already carries and ask which to keep. Just collect the list here; the drill-down comes next.

**3. Window ambitions.** "Docked together in one window with tabs and splits the user can rearrange and save, or separate browser windows?" → Workspaces vs plain windows + optional Layouts.

## Round 2 — drill-down per flow (the part that picks the API)

For EACH flow from question 2, walk this probe matrix. Every probe is a behavior question the client can answer without knowing any API; each answer eliminates options from the decision table in SKILL.md.

| Probe (ask in their app names) | Answer → implication |
|---|---|
| "Does this happen when the user clicks something, or does it flow continuously?" | click/event → context, method, or intent; continuous feed → **stream** |
| "Does the sending app need an answer back, or is it fire-and-forget?" | needs a reply → **interop method (RPC)**; fire-and-forget → context/channel/stream |
| "Should the receiving apps ALWAYS follow this, or should the user choose which windows are linked?" | always → **shared context**; user chooses → **channels** |
| "If the receiving app isn't open, what should happen — nothing, or should it open by itself and show the data?" | open itself → **intent** (declared in the app definition so the platform can start it) |
| "Can a user have two copies of the same app open with DIFFERENT data (two clients, two portfolios)?" | yes → channels or workspace-scoped context, NOT a global context |

Two or three probes usually settle a flow — stop as soon as the API is unambiguous. Present the drill-down as confirmations where discovery lets you ("clicking a trade row currently just logs a TODO — I assume the chart should react instantly and there's no reply needed, correct?").

## Round 2 — conditionals (ask only when triggered)

**FDC3** (finance domain, or third-party/vendor apps present): "Do you need to comply with the FDC3 standard, or run third-party apps that already expect `window.fdc3`?" If yes → fdc3.md; give channels FDC3 metadata from day one. If they decline, record it in the handoff as a documented follow-up — do not implement it anyway.

**Persistence** (layouts/workspaces in scope): "Should saved layouts survive across browsers and machines (→ REST store you host, or io.Manager), or is per-browser fine for now (→ `idb`)?" Default: `idb`.

**Rollout order** (>3 apps): "Which two apps, if connected, would deliver the most value? We'll start there." Never integrate everything at once.

**License key:** "Do you have your io.Connect license key (from your interop.io representative)? We'll put it in an env var, never in source."

**UI affordances** (whenever the plan involves channels, launching, or anything user-visible): "Some features have a user-facing side — e.g. a channel picker so users choose what's linked. Should I add visible UI to your apps, or keep every change invisible and give you ready-made snippets?" Default when unanswered: **invisible**. If they want a channel picker, see data-sharing.md for the widget-vs-custom trade-off and be explicit about which you chose.

## Closing question — always ask, highest value per word

**"Describe the demo you'd show your boss when this works — step by step, what do you click and what happens?"**

Their answer IS the acceptance scenario: it drives the Phase 5 verification script and the "How to verify" section of the handoff, in their own words. If a step in their demo needs a capability no flow covered, you just found a missing requirement — cheaper now than after implementation.

## Interpreting answers → plan

Write the plan as: platform choice, client conversion order, one row per data flow with the chosen API **and the probe answer that chose it**, optional layers (workspaces/FDC3/notifications), the demo scenario as acceptance criteria, and the verification approach. Keep it under a page. Ask for approval.

Red flags to address in the plan:
- All apps are routes of a single SPA → interop still works (each route opened as a separate window/app), but discuss whether they want multi-window at all.
- Existing postMessage/BroadcastChannel glue → plan its replacement explicitly, flow by flow; don't leave two parallel mechanisms.
- No app that reliably stays open all day → scaffold the minimal launcher; do not force one of their apps to be the platform if it's sometimes closed.
- A flow whose probes contradict each other (e.g. "always in sync" + "two copies with different data") → surface the contradiction to the client before choosing; usually it means workspace-scoped context.
