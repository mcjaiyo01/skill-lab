# Data Sharing — choosing and wiring the right API

Four mechanisms, one rule of thumb: **who decides what's connected to what?**

| Mechanism | Coupling decided by | Cardinality | Reply? | Typical phrase from client |
|---|---|---|---|---|
| Channels | the **user** (picks a color per window) | many↔many per channel | no | "let users link windows together" |
| Shared Contexts | the **developers** (fixed names) | many↔many | no | "these apps should always show the same client" |
| Interop methods | the **caller** (targets a method) | 1→1 (or targeted) | **yes** | "App A asks App B to calculate/do X" |
| Intents | the **platform/user** (resolves handler) | 1→best handler | yes | "show this order in whatever can display it" |

Channels are actually shared contexts underneath, with user-facing selection UI on top. Prefer channels when a human should control linking; contexts when the linkage is a product decision.

## Channels

Definitions live in the platform config (platform-setup.md). In clients:

```js
// publisher (e.g., a grid app): publish the selection to whatever channel this window is on
await io.channels.publish({ customerId: "C42", name: "ACME Corp" });

// consumer (e.g., a detail app): react to data on the current channel, incl. channel switches
io.channels.subscribe((data, context, updaterId) => {
    if (data?.customerId) showCustomer(data.customerId);
});

// programmatic control (the widget/workspaces UI can also do this for the user):
await io.channels.join("Red");
await io.channels.leave();
io.channels.my();              // current channel name
await io.channels.list();      // all channel contexts
```

Users need *some* way to pick a channel — but adding it is a UI change, so it requires the client's explicit OK (interview Q9). Two options, and be transparent about the trade-off rather than silently picking one:

- **Built-in widget** (preferred when feasible): official UI, zero custom code to maintain. But it is not just a flag — the platform config must also serve the widget's `sources` (bundle/styles/fonts URLs, `browser.widget` + `widget` sections), which means hosting those static assets somewhere. In a mature setup that's the right answer.
- **Minimal custom picker** (a small dropdown calling `join`/`leave`): acceptable when the widget's asset-hosting step is real friction (early dev stage, no static hosting yet). If you go this way, say so explicitly — tell the client you chose a temporary picker over the official widget and why, and put the widget migration snippet in the handoff's "not added yet" section so the custom picker is understood as a stepping stone, not the end state.

Only build UI directly into their apps when they said yes (Q9); otherwise deliver the picker as a handoff snippet.

## Shared Contexts

```js
// writer
await io.contexts.update("selectedClient", { id: "C42", name: "ACME Corp" }); // merges keys
await io.contexts.set("selectedClient", { id: "C42" });                       // replaces whole object

// reader
const unsubscribe = await io.contexts.subscribe("selectedClient", (ctx) => {
    showCustomer(ctx.id);
});
```

Contexts are named, global, and lazily created. Use `update` for cooperative merging (multiple writers), `set` to own the whole object. Namespace context names (`"myco.selectedClient"`) to avoid collisions.

## Interop methods (RPC)

```js
// App B — offer capability. Register early (at startup), name with a namespace:
await io.interop.register("MyCo.Pricing.GetQuote", async ({ symbol }) => {
    return { symbol, price: await priceFor(symbol) };
});

// App A — call it:
const { returned } = await io.interop.invoke("MyCo.Pricing.GetQuote", { symbol: "AAPL" });
console.log(returned.price);
```

`invoke` targets the "best" server by default; pass a target argument for `"all"` or a specific instance. Check availability with `io.interop.methods()` and react to servers appearing via `io.interop.serverMethodAdded(...)`.

### Streams (one→many continuous data)

```js
// producer
const stream = await io.interop.createStream("MyCo.Prices.Stream");
setInterval(() => stream.push({ symbol: "AAPL", price: rand() }), 1000);

// consumer
const subscription = await io.interop.subscribe("MyCo.Prices.Stream");
subscription.onData(({ data }) => updateTicker(data));
```

Use a stream instead of clients polling an interop method, and instead of pushing frequent updates through a context (contexts persist every write; streams don't).

## Intents

Declare which apps handle which intents in their **app definitions** (platform config) so the platform can start a closed app to handle a raise:

```json
{ "name": "orders", "details": { "url": "..." },
  "intents": [{ "name": "ShowOrder", "contexts": ["myco.order"] }] }
```

```js
// handler app — register at startup:
io.intents.register("ShowOrder", (context) => {
    displayOrder(context.data.orderId);
});

// caller app:
await io.intents.raise({
    intent: "ShowOrder",
    context: { type: "myco.order", data: { orderId: "O-1001" } }
});
```

If several apps handle the same intent, enable the built-in resolver UI (`browser.intentResolver: { enable: true }` in platform config, `intentResolver: { enable: true }` in clients) so users pick. Intents are also the io.Connect concept that FDC3 intents map onto directly (see fdc3.md).

## Migrating existing glue

When discovery found postMessage/BroadcastChannel/localStorage signaling, replace flow-by-flow: identify the payload → pick the mechanism from the table above → wire both sides → delete the old path in the same PR. Never leave both mechanisms carrying the same flow.
