# FDC3 on io.Connect

Use when the client must comply with the FINOS FDC3 standard (common in capital markets) or integrate third-party apps that already program against `window.fdc3`. io.Connect implements FDC3 2.x on top of its native APIs — FDC3 user channels map to io channels, FDC3 intents map to io intents, `fdc3.open` maps to app management.

You can mix: some apps using native `io.*`, others `window.fdc3` — they interoperate, because it's the same machinery underneath.

## Wiring an app for FDC3

```bash
npm install @interopio/fdc3
```

```js
import "@interopio/fdc3";   // side-effect import: injects window.fdc3 once io is ready
import IOBrowser from "@interopio/browser";

const io = await IOBrowser({});
// window.fdc3 now available (after fdc3Ready)
```

Standard FDC3 code then works unmodified:

```js
import { getAgent } from "@finos/fdc3"; // third-party apps often use this
const fdc3 = await getAgent();

await fdc3.joinUserChannel("fdc3.channel.1");
await fdc3.broadcast({ type: "fdc3.instrument", id: { ticker: "AAPL" } });
fdc3.addContextListener("fdc3.instrument", (ctx) => showInstrument(ctx.id.ticker));

const resolution = await fdc3.raiseIntent("ViewChart", {
    type: "fdc3.instrument", id: { ticker: "AAPL" }
});
```

Third-party apps that only use `@finos/fdc3`'s `getAgent()` (FDC3 for Web / Web Connection Protocol) are supported via `@interopio/fdc3-web-bridge` on the platform side.

## Platform-side requirements

**1. Channel definitions need FDC3 metadata** — without it, FDC3 user channels won't line up with io channels:

```json
channels: {
    definitions: [
        { "name": "Red", "meta": { "color": "red",
            "fdc3": { "id": "fdc3.channel.1", "displayMetadata": { "name": "Channel 1", "glyph": "1" } } } }
    ]
}
```

**2. App definitions should carry FDC3-style intent declarations** so `findIntent`/`raiseIntent` can discover and start apps:

```json
{ "name": "chart", "details": { "url": "..." },
  "intents": [{ "name": "ViewChart", "contexts": ["fdc3.instrument"], "displayName": "View Chart" }] }
```

**3. Intent resolver UI** — enable it (platform: `browser.intentResolver: { enable: true }`; clients: `intentResolver: { enable: true }`) so users pick among multiple intent handlers, which FDC3 flows hit often.

## Deciding native vs FDC3 per app

- Client-internal apps, no compliance requirement → native `io.*` (richer: streams, workspaces, prefs).
- Apps that must also run on other FDC3 desktop agents, or third-party/vendor apps → FDC3.
- Context type names: follow the FDC3 context catalog (`fdc3.instrument`, `fdc3.contact`, ...) when FDC3 is anywhere in the mix, even in native apps — it keeps payloads translatable.
