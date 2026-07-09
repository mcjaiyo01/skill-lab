# Verification — runtime checks per phase

Verify with running apps whenever the environment allows (start dev servers, drive a browser if browser tools are available, or read dev-server/console output). When you can't run a browser, give the user exact manual steps: URLs to open, snippets to paste in DevTools, and the expected output. Never declare a phase done without one or the other.

During onboarding, expose `window.io` in every app — it makes every check below a one-liner in DevTools. (Remove or gate it before production if the client cares.)

## Phase: platform boots

1. Start the platform dev server; page loads with no console errors.
2. `IOBrowserPlatform(...)` resolved (log "platform ready" after the await — check it appears).
3. Console checks:

```js
io.interop.instance.application   // → platform app name (e.g. "platform")
io.appManager.applications().map(a => a.name)  // → all defined apps listed
await io.channels.list()          // → your channel definitions
```

Common failures: missing/invalid `licenseKey` (init rejects — read the error), malformed app definition (check the validation error naming the offending field).

## Phase: client connects

1. From the platform page/console: `await io.appManager.application("orders").start()` → new window opens.
2. In the **new window's** console: `io.interop.instance.application` → "orders". If `IOBrowser()` never resolved: the window was almost certainly opened outside the platform (direct tab) — re-test via `start()`; then check the app definition URL matches exactly (port, path).
3. Back on the platform: `io.appManager.application("orders").instances.length` → 1.

## Phase: data flows

Test each wired flow with both apps open, from the consoles:

```js
// channels — in window A:
await io.channels.join("Red"); await io.channels.publish({ test: 1 });
// in window B (also joined to Red): subscriber callback logged { test: 1 }?

// contexts — in A:
await io.contexts.update("myco.selectedClient", { id: "C42" });
// B's subscription fired with { id: "C42" }?

// interop — in A:
(await io.interop.invoke("MyCo.Pricing.GetQuote", { symbol: "TEST" })).returned
// → expected shape? Also check io.interop.methods().map(m => m.name) includes it.

// intents — in A:
await io.intents.raise({ intent: "ShowOrder", context: { type: "myco.order", data: { orderId: "TEST-1" } } });
// handler app came to front / logged the context? Closed handler app auto-started?
```

Then verify through the **real UI**, not just consoles: click the actual button/row in app A, watch app B update. The console checks isolate the plumbing; the UI check proves the app code is wired to it.

## Phase: workspaces / FDC3 (if in scope)

See the verification sections of workspaces.md and fdc3.md. Minimal FDC3 smoke test: `await window.fdc3.getInfo()` returns provider info; broadcast on a user channel in one app, context listener fires in the other.

## Wrap-up checklist (end of engagement)

- [ ] Every flow from the approved plan demonstrated end to end
- [ ] Apps still work standalone-gracefully: when not opened via the platform, app functionality unaffected and a `console.warn` (not a visible banner — no unrequested UI) explains why interop is off; use a short timeout/race around `IOBrowser()` rather than letting it hang silently
- [ ] No visible UI was added to any app unless the client explicitly approved it
- [ ] License key in env config, not committed
- [ ] All `@interopio/*` versions aligned (latest stable release line)
- [ ] Old glue (postMessage etc.) removed for migrated flows
- [ ] `IOCONNECT.md` handoff document written (see handoff.md)
