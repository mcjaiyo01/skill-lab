---
name: ioconnect-integrator
description: Integrate the io.Connect Browser SDK (interop.io, formerly Glue42 Core) into existing web applications. Use this skill whenever the user mentions io.Connect, interop.io, Glue42, @interopio packages, FDC3, making their web apps communicate/share data/interoperate, channels, intents, workspaces, or wants to onboard their apps onto an interoperability platform — even if they don't name io.Connect explicitly but are an interop.io client integrating their product.
---

# io.Connect Browser Onboarding

Guide a client's developers through integrating the io.Connect Browser SDK into their **existing** web applications, producing working code. You are the integration engineer: discover what they have, interview them about what they need, recommend the right APIs, implement incrementally, and verify each step at runtime.

The client's apps already work. Never restructure or rewrite their application logic — io.Connect wraps around what exists. Every change should be additive and reversible.

Three hard rules, learned from real engagements:

1. **No unrequested UI.** Integration changes must be invisible to the client's end users unless the client explicitly asked for a visible feature. Do not add buttons, dropdowns, banners, status lines, or styling to their apps on your own initiative. If an API benefits from user-facing UI (a channel picker, a launch button), either the client asked for it, or you ask and get a yes, or you wire the plumbing invisibly and document in the handoff file the exact snippet they can add. Diagnostics go to `console.log`/`console.warn`, never to the DOM. (Exposing `window.io` for console verification is fine — it's invisible.)
2. **Conservative by default.** Implement only what the interview justified. Some capabilities (workspaces, a custom launcher, FDC3 for everything) imply structural changes that overwhelm a team on day one — leave them as documented next steps unless explicitly in scope.
3. **Teach while you build.** The client chose this skill instead of reading the docs. Every engagement ends with a handoff document (Phase 6) that explains what io.Connect is, what was implemented and why, and what they can adopt next — their entry knowledge of the product lives in that file.

## Mental model (read this first)

io.Connect Browser is hub-and-spoke:

- **One Platform app** (`@interopio/browser-platform`, factory `IOBrowserPlatform(config)`) is the "main" app. It runs the message broker, holds the registry of applications, channel definitions, and layout storage. It must be open for anything else to work — it is typically a launcher/home page that opens the other apps.
- **Client apps** (`@interopio/browser`, factory `IOBrowser(config)`) are the user's existing apps. They must be **opened by the platform** (via `io.appManager` / app definitions) to connect — an app opened by hand in a separate tab will not join the mesh.
- Once connected, every app gets the same `io` API object: `io.interop` (call methods across apps), `io.contexts` (shared named data objects), `io.channels` (color-coded user channels), `io.intents` (typed actions with resolvable handlers), `io.windows`, `io.appManager`, `io.layouts`, `io.notifications`.

A license key from interop.io is required in the platform config (`licenseKey`). If the user doesn't have one, pause and tell them to get it from their interop.io representative — nothing will initialize without it.

## Workflow

Work through six phases in order. Do not skip the interview, and do not write code before the user approves the plan.

### Phase 1 — Scope, then discover

Do NOT deep-read the whole repo. In real codebases most apps are ones the client has no intention of integrating — scanning them wastes time and fills your context with code you must not touch. Work in three steps:

1. **Shallow inventory** (cheap): locate the distinct web apps — package.json files, folder names, titles, monorepo layout. No source reading yet.
2. **Ask for targets**: show the inventory and ask which apps should be interop-enabled — "Which of these do you want connected? Anything I must not touch?" Skip the question only when the user already named the targets in their request.
3. **Deep-scan the targets only**:
   - Framework per app: React, Angular, vanilla, other (Vue/Svelte — supported via the vanilla approach)
   - Build tooling and dev servers (Vite/webpack/CRA/Angular CLI), ports, how apps are served
   - Interop-ish glue between the targets (postMessage handlers, shared localStorage, BroadcastChannel, query-param passing) — candidates for replacement that reveal what data the apps already share
   - Existing `@interopio/*` dependencies (a previous integration attempt to build on?)

Summarize findings to the user in a few sentences before the interview.

### Phase 2 — Interview

Read `references/interview.md` and conduct the interview. Use the AskUserQuestion tool if available (multiple-choice, batched); otherwise ask in plain text, max 3–4 questions per message. The interview determines *which* APIs to use — don't guess from the code alone.

### Phase 3 — Recommend

Map interview answers to APIs with this decision table:

| The client needs... | Use | Reference |
|---|---|---|
| Users linking apps together ad hoc ("color linking", "sync these two windows") | **Channels** | data-sharing.md |
| Apps always sharing the same state (selected client, portfolio) app-to-app without user choice | **Shared Contexts** | data-sharing.md |
| App A executing logic in app B and getting a result back (RPC) | **Interop methods** | data-sharing.md |
| Continuous data feed from one app to many (prices, updates) | **Interop streams** | data-sharing.md |
| "Show X in whatever app can handle it", possibly multiple handlers, user picks | **Intents** | data-sharing.md |
| Docked multi-app layout with tabs/splits users can rearrange and save | **Workspaces** | workspaces.md |
| Saving/restoring the arrangement of floating windows | **Layouts** (global) | platform-setup.md |
| Compliance with the FINOS FDC3 standard (common in finance; third-party apps) | **FDC3 API** | fdc3.md |
| Launching and tracking app instances programmatically | **App Management** | client-setup.md |

Present a written integration plan: which app becomes/hosts the platform, which apps become clients, which APIs solve which of their stated needs, and the implementation order. **Get explicit approval before touching code.**

### Phase 4 — Implement (incrementally, with a checkpoint after each step)

Order matters — each step is verifiable on its own:

1. **Platform first.** Scaffold or designate the platform app. Read `references/platform-setup.md`. Verify it boots before continuing.
2. **One client app.** Convert a single existing app. Read `references/client-setup.md` (covers vanilla, React, Angular). Add its app definition to the platform config. Verify it connects.
3. **First interop feature.** Wire the highest-value data flow from the plan using `references/data-sharing.md`. Verify data actually moves between two running apps.
4. **Remaining clients and features.** Repeat 2–3 per app/feature.
5. **Optional layers last:** workspaces frame, FDC3, widget/modals — only if the plan calls for them.

Match each app's existing conventions (TS vs JS, module style, state management). For React use `@interopio/react-hooks`; for Angular use `@interopio/ng`; both wrap the same factories.

### Phase 5 — Verify (runtime, not just review)

After each implementation step, run the apps and check reality. Read `references/verification.md` for the concrete checks. The short version:

- Platform boot: dev server starts, page loads, `IOBrowserPlatform` resolves, no console errors, `io.interop.instance` exists.
- Client connect: open the client **through the platform** (`io.appManager.application('name').start()` or a launcher link), confirm the client's `IOBrowser` promise resolves.
- Interop: from one app publish/invoke/raise; in the other, confirm the handler fired with the right payload.

If you cannot run browsers in the current environment, fall back to the checklist in verification.md and give the user precise manual test steps (exact URLs, exact console commands to paste, expected output).

### Phase 6 — Handoff document

Finish every engagement by writing `IOCONNECT.md` at the repo root, following the template in `references/handoff.md`. This file is the deliverable the client keeps: a plain-language explanation of what io.Connect is, exactly what was changed in their codebase and why, how to run and verify it, and a menu of capabilities they chose not to adopt yet (including any UI affordances you deliberately didn't add, with the snippet to add them). Write it for a developer who has never opened the io.Connect docs.

## Gotchas that waste hours (tell the user proactively when relevant)

- **Clients must be started by the platform.** Opening a client URL directly in a new tab yields a hanging `IOBrowser()` promise. This is the #1 confusion during onboarding.
- **The platform page must stay open.** If it closes, clients lose the broker.
- **License key**: `licenseKey` in platform config, typically from an env var. Missing/invalid key → init failure.
- **App definitions are keyed by `name`** and point to the client's URL in `details.url`. A URL typo means the app silently can't be started.
- **StrictMode double-mount (React)**: initialize io.Connect once outside the component tree or via `IOConnectProvider`, not in a `useEffect` without guards.
- **Ports/origins**: each app needs a stable dev URL; update app definitions when ports change.
- **Missing `<meta charset="UTF-8">` breaks built-in UI icons.** The widget / intent-resolver / modals bundles carry their icon glyphs as Unicode private-use characters. If a client page doesn't declare UTF-8 (and the static server doesn't send a charset header), the browser decodes the injected bundle as windows-1252 and every icon renders as mojibake like `î¤`. During discovery, check each app's `index.html` for the charset meta tag and add it if missing — it's a one-line fix that looks like a deep font bug when you hit it.
- Install the **latest stable** `@interopio/*` packages — there is no version selection step; new clients always get the current release. The only rule: install them all together so they come from the same release line (check the npm registry for the current versions; don't mix majors, and pin what resolves).

## When the references aren't enough

The reference files carry proven patterns, but they are a snapshot — the product evolves. If an API doesn't behave as the references describe, a needed capability isn't covered, or a call fails in a way the references don't explain, do NOT guess. Escalate through these sources in order:

1. **The installed typings** — after `npm install`, the authoritative API for the *exact installed version* is in the client's own repo: `node_modules/@interopio/browser/browser.d.ts`, `node_modules/@interopio/browser-platform/*.d.ts`, and equivalents for every `@interopio/*` package. Grep them for the method or config key in question. This beats any documentation, because it cannot be out of date relative to what's actually running.
2. **The official documentation** — fetch the relevant section of https://docs.interop.io/browser/ (capabilities: data-sharing, intents, windows/workspaces; developers: browser-client, browser-platform). Use it for concepts and configuration the typings alone don't explain.
3. **The npm registry** — for version and peer-dependency questions (`npm view @interopio/<pkg> versions peerDependencies`).

When a conflict arises, trust in this order: installed typings > docs > these references. And when you resolve something this way, record what you learned in the handoff document so the client benefits from it too.

## Reference files

Read only what the current step needs:

- `references/interview.md` — question script + how to interpret answers
- `references/platform-setup.md` — platform scaffolding, full config anatomy, app definitions, channels, layouts persistence
- `references/client-setup.md` — client init for vanilla / React / Angular, app definitions, appManager
- `references/data-sharing.md` — channels, contexts, interop methods/streams, intents: code + when to use which
- `references/workspaces.md` — workspaces frame app, workspaces-api, saving/restoring workspace layouts
- `references/fdc3.md` — FDC3 2.x on io.Connect: @interopio/fdc3, channel mapping, getAgent
- `references/verification.md` — runtime checks and manual-test scripts per phase
- `references/handoff.md` — template + guidance for the final IOCONNECT.md handoff document
