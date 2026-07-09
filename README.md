# ioconnect-skill-lab

A playground for testing the **ioconnect-onboarding** skill (installed locally in `.claude/skills/`). Six deliberately simple apps that together create the need for every capability the skill can implement. No real UI — just enough functionality to give the skill something to integrate.

## The scenario

ACME Trading has six small web apps that don't talk to each other. Traders juggle browser tabs, copy tickers by hand, and the two apps that *do* communicate use a fragile `BroadcastChannel` hack.

## The apps

| App | Port | Framework | Pain point → skill capability it exercises |
|---|---|---|---|
| `watchlist` | 4101 | vanilla | Opened first every morning (**platform candidate**); pushes selection via BroadcastChannel (**legacy glue → channels migration**) |
| `instrument-details` | 4102 | React | Listens to the same BroadcastChannel (**channels**, React binding via `@interopio/react-hooks`) |
| `pricing-service` | 4103 | vanilla | Owns `getQuote()` that others can't call (**interop methods/RPC**); generates price ticks trapped locally (**interop streams**) |
| `order-entry` | 4104 | vanilla | Has a stale duplicated copy of `getQuote()` (**RPC migration**); hardcodes the active account (**shared contexts**); TODO: "show this order in the blotter even if closed" (**intents**) |
| `orders-blotter` | 4105 | React | Also hardcodes the account (**shared contexts**); needs to receive orders and be summoned (**intent handler**, auto-start via app definition) |
| `vendor-news` | 4106 | vanilla | Third-party style app that speaks ONLY `window.fdc3` (**FDC3 compliance**) |

Traders also want the watchlist, details, and news apps docked in one window with a saveable arrangement (**workspaces + layouts**).

## Running the apps

```bash
npm install            # from the repo root (npm workspaces)
npm run dev -w watchlist   # and similarly for each app
```

Put a real io.Connect license key in `.env` (`VITE_LICENSE_KEY`) before integrating.

## Answer sheet: interview answers that unlock everything

When the skill interviews you and you want **full coverage**, answer along these lines:

1. **Entry point:** traders open the *watchlist* first every day. (But we're fine with a scaffolded launcher if that's cleaner.)
2. **Data flows:** selecting an instrument in the watchlist should update instrument-details AND vendor-news; order-entry should get quotes from pricing-service instead of its local copy; price ticks from pricing-service should reach the watchlist and details live; orders placed in order-entry should appear in the blotter.
3. **Linking:** users should choose which windows are linked by picking a color channel (watchlist ↔ details ↔ news). The active *account*, however, must always be in sync everywhere — no user choice.
4. **Windows:** we want watchlist + details + news docked in one window, rearrangeable and saveable. Blotter and order-entry can stay floating.
5. **FDC3:** yes — mandatory. vendor-news can't be modified and expects `window.fdc3`.
6. **Persistence:** per-browser is fine for now.
7. **Rollout:** start with watchlist + instrument-details.
8. **License key:** in `.env` as `VITE_LICENSE_KEY`.
9. **UI affordances:** yes, users need a way to pick channels — the built-in widget is fine.

## What "success" looks like

After the skill runs with the answers above, you should be able to check off: BroadcastChannel gone, channels linking the three market-data apps, `acme.activeAccount` shared context, `Acme.Pricing.GetQuote` interop method (duplicate deleted), a price stream, a `ShowOrder` intent that auto-starts the blotter, a workspaces frame with a saveable "Trading" layout, `window.fdc3` working inside vendor-news, and an `IOCONNECT.md` at the root explaining all of it.
