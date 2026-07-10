# Platform Setup

The platform is the main app: message broker + app registry + config hub. It's usually a launcher/home page. Install (latest stable):

```bash
npm install @interopio/browser-platform
# add per feature, only if used:
npm install @interopio/workspaces-api @interopio/modals-api
```

## Minimal platform (vanilla JS/TS)

```js
import IOBrowserPlatform from "@interopio/browser-platform";

const platformConfig = {
    licenseKey: import.meta.env.VITE_LICENSE_KEY, // or process.env.LICENSE_KEY — never hardcode
    applications: {
        local: [
            {
                name: "orders",                    // unique id, used by appManager/intents
                title: "Orders",
                type: "window",
                details: { url: "http://localhost:4101" }
            },
            {
                name: "customers",
                title: "Customers",
                type: "window",
                details: { url: "http://localhost:4102" }
            }
        ]
    },
    channels: {
        definitions: [
            { name: "Red",   meta: { color: "red" } },
            { name: "Green", meta: { color: "green" } },
            { name: "Blue",  meta: { color: "blue" } }
        ]
    },
    layouts: { mode: "idb" },   // per-browser persistence; see "Layouts persistence" below
    user: { id: "dev-user" }    // replace with real user id in production
};

const { io, platform } = await IOBrowserPlatform(platformConfig);
window.io = io; // the platform app is ALSO a client — full io API available here
```

The platform page then launches clients, e.g.:

```js
document.getElementById("open-orders").onclick = async () => {
    await io.appManager.application("orders").start();
};
```

## React platform

```tsx
import { IOConnectProvider } from "@interopio/react-hooks";
import IOBrowserPlatform from "@interopio/browser-platform";

root.render(
    <IOConnectProvider settings={{
        browserPlatform: { config: platformConfig, factory: IOBrowserPlatform }
    }}>
        <App />
    </IOConnectProvider>
);
// inside components: const io = useContext(IOConnectContext); or useIOConnect((io) => {...})
```

Keep `platformConfig` in a module (or JSON) outside the component tree so StrictMode re-renders don't re-init.

## Angular platform

```ts
// app.config.ts (Angular standalone)
import { provideIoConnect, IOConnectStore } from "@interopio/ng";
import IOBrowserPlatform from "@interopio/browser-platform";

export const appConfig: ApplicationConfig = {
    providers: [
        provideIoConnect({
            browserPlatform: { factory: IOBrowserPlatform, config: platformConfig }
        })
    ]
};
// access via: constructor(private store: IOConnectStore) { const io = store.getIOConnect(); }
```

For NgModule apps use `IOConnectNg.forRoot({...})` instead of `provideIoConnect`. Note: check that the installed `@interopio/ng` major supports the app's Angular major (see the package's peer dependencies on npm) — older Angular versions may need an earlier `@interopio/ng` line, which uses `IOConnectNg.forRoot` only.

## Config anatomy (add sections only as needed)

| Key | Purpose |
|---|---|
| `licenseKey` | Required. From interop.io. Env var. |
| `applications.local` | App definitions — every client app the platform can start. |
| `channels.definitions` | Named color channels. Add `meta.fdc3: { id, displayMetadata }` per channel if FDC3 is in scope (see fdc3.md). |
| `layouts` | `{ mode: "idb" }` (per browser), `{ mode: "session" }` (per tab session), or `{ mode: "rest", rest: { url } }` (server you host — cross-machine persistence). |
| `workspaces` | `{ src: "<url of the workspaces frame app>" }` — only with workspaces (see workspaces.md). |
| `browser.libraries` | Client-side libraries the *platform app itself* loads, e.g. `[IOWorkspaces, IOModals]`. |
| `browser.intentResolver` / `browser.widget` / `browser.modals` | Enable built-in UI pieces for the platform app. |
| `applicationPreferences.store` | Where `io.prefs` persists (`rest` for server-side). |
| `user` | Identifies the user (affects stored layouts/prefs). |

### App definition fields that matter

```json
{
    "name": "orders",
    "title": "Orders",
    "type": "window",
    "details": {
        "url": "http://localhost:4101",
        "width": 800, "height": 600,
        "left": 100, "top": 100
    },
    "intents": [
        { "name": "ShowOrder", "contexts": ["app.order"] }
    ],
    "customProperties": { "includeInWorkspaces": true }
}
```

`intents` here is how the platform knows an app *can* handle an intent even when it isn't running (it will be started on raise). `includeInWorkspaces` makes the app appear in the workspaces "add application" popup.

## Scaffolding a new launcher (when no existing app fits)

Create the smallest possible Vite app: one `index.html` with a button per client app + the platform init above. Do not build a fancy launcher unless asked — the point is integration, not UI. (interop.io also ships a prebuilt Home App — `@interopio/home-ui-react` — mention it if the client wants a polished launcher without building one.)

## Production notes (mention, don't implement unless asked)

- Serve every app over HTTPS from stable origins; update `details.url` accordingly.
- Move layouts/prefs to a `rest` store or io.Manager for cross-machine persistence.
- Config can be served remotely from io.Manager (`remote config`) instead of being hardcoded.
