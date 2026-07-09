# Workspaces

Workspaces give users a single window with docked, tabbed, resizable app panes, arranged in a tree: **Frame → Workspace → rows/columns → groups (tab strips) → windows (apps)**. Users rearrange by drag & drop and save named workspace layouts.

Only add workspaces when the client confirmed they want docked multi-app layouts (interview Q4). It requires one extra app: the **Frame**.

## 1. The Frame app

The frame is a separate small app that hosts the workspaces UI. Two ways to get one:

**React frame:**

```bash
npm install @interopio/workspaces-ui-react
```

```tsx
import Workspaces from "@interopio/workspaces-ui-react";
import "@interopio/workspaces-ui-react/dist/styles/workspaces.css";

const App = () => <Workspaces />;   // components prop allows full customization later
```

The frame app itself initializes as a normal client (`IOBrowser` via `IOConnectProvider`). Start with zero customization; the `components` prop (custom tabs, header, popups) is a later refinement.

**Web-components frame (vanilla):** use `@interopio/workspaces-ui-web-components` and its `<workspaces-element>` if the client avoids React.

## 2. Platform wiring

```js
// platform config
import IOWorkspaces from "@interopio/workspaces-api";

{
    workspaces: { src: "http://localhost:4101" },   // URL where the frame app is served
    browser: { libraries: [IOWorkspaces] },
    applications: {
        local: [
            { name: "orders", details: { url: "..." },
              customProperties: { "includeInWorkspaces": true } }  // shows in "add app" popup
        ]
    }
}
```

## 3. Clients that use the workspaces API

Any app that creates/manipulates workspaces needs the library:

```js
import IOWorkspaces from "@interopio/workspaces-api";
const io = await IOBrowser({ libraries: [IOWorkspaces] });
```

## 4. Common operations

```js
// build a workspace programmatically (e.g., "open my trading view" button):
await io.workspaces.createWorkspace({
    children: [{
        type: "row",
        children: [
            { type: "group", children: [{ type: "window", appName: "orders" }] },
            { type: "group", children: [{ type: "window", appName: "customers" }] }
        ]
    }],
    config: { title: "Trading View" }
});

// restore a saved workspace layout by name:
await io.workspaces.restoreWorkspace("Trading View");

// inside a workspace window — am I in a workspace? what's its shared context?
const myWorkspace = await io.workspaces.getMyWorkspace();
await myWorkspace?.setContext({ customerId: "C42" });
myWorkspace?.onContextUpdated((ctx) => { ... });
```

Workspace context is a handy scoping mechanism: apps in the *same workspace* share it, so two copies of the same workspace (two clients' portfolios) don't leak into each other — something global contexts/channels don't give you.

Saving is usually user-driven via the frame's Save button; layouts persist wherever the platform's `layouts` store points (idb/rest — see platform-setup.md).

## Verification specifics

- Frame app URL loads standalone with an empty frame (it will wait for the platform — that's fine).
- From the platform: `io.workspaces.createWorkspace(...)` opens a frame window with both apps docked.
- Drag a tab, save the workspace, reload the frame, `restoreWorkspace(name)` brings it back.
