# Client Setup

Converting an existing app into an io.Connect client is deliberately small: install one package, initialize once at startup, keep the `io` object accessible. Do not touch the app's business logic in this step.

```bash
npm install @interopio/browser
```

**Critical:** a client connects only when its window was **opened by the platform** (via app definition + `io.appManager.application("name").start()`, an intent, a channel link, or a workspace). Opened directly in a tab, `IOBrowser()` never resolves. Always test through the platform.

## Vanilla JS/TS

```js
import IOBrowser from "@interopio/browser";

const io = await IOBrowser({
    // libraries: [IOWorkspaces, IOModals],  // only if this app uses those features
});
window.io = io; // convenient for console verification during onboarding
```

Call this once, as early as possible (entry module), before app code that uses `io`. If the app has an existing async bootstrap, initialize io.Connect first and pass/expose `io` through whatever pattern the app already uses (DI container, module export, context).

## React

```tsx
import { IOConnectProvider, useIOConnect } from "@interopio/react-hooks";
import IOBrowser from "@interopio/browser";

root.render(
    <IOConnectProvider settings={{ browser: { config: {}, factory: IOBrowser } }}>
        <App />
    </IOConnectProvider>
);
```

Inside components:

```tsx
import { useContext } from "react";
import { IOConnectContext } from "@interopio/react-hooks";

const io = useContext(IOConnectContext); // null until ready — guard for it

// or run a callback once io is ready:
useIOConnect(async (io) => {
    await io.interop.register("MyApp.Ping", () => "pong");
}, []);
```

`IOConnectProvider` handles StrictMode double-mounting; don't call `IOBrowser()` inside `useEffect` yourself.

## Angular

```ts
// app.config.ts
import { provideIoConnect, IOConnectStore } from "@interopio/ng";
import IOBrowser from "@interopio/browser";

export const appConfig: ApplicationConfig = {
    providers: [
        provideIoConnect({ browser: { factory: IOBrowser, config: {} } })
    ]
};
```

```ts
@Injectable({ providedIn: "root" })
export class IoService {
    readonly io = this.store.getIOConnect();
    constructor(private readonly store: IOConnectStore) {}
}
```

For NgModule apps: `IOConnectNg.forRoot({ browser: { factory: IOBrowser, config: {} } })`. Use `holdInit: true` if the app must control when initialization blocks bootstrap. Check `@interopio/ng` peer dependencies against the app's Angular major — older Angular may require an earlier `@interopio/ng` line (which has `IOConnectNg.forRoot` only, no `provideIoConnect`).

## Other frameworks (Vue, Svelte, etc.)

Use the vanilla pattern in the app's entry point and expose `io` via the framework's idiomatic sharing mechanism (Vue `provide/inject`, Svelte stores).

## Registering the app with the platform

Every client needs an app definition in the platform's `applications.local` (see platform-setup.md). Minimum:

```json
{ "name": "orders", "title": "Orders", "type": "window", "details": { "url": "http://localhost:4101" } }
```

## Useful client APIs right after connecting

```js
io.windows.my();                                   // this window
await io.appManager.application("customers").start({ context: { customerId: 42 } });
io.appManager.myInstance.getContext();             // startup context passed by the opener
io.windows.my().onContextUpdated((ctx) => { ... });
```

Passing startup context at `start()` and reading it in the opened app is often the first "wow, it works" moment — cheap to wire, easy to verify.
