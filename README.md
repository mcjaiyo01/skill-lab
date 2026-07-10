# ioconnect-skill-lab

A playground for testing the **ioconnect-integrator** skill (installed locally in `.claude/skills/`). Six deliberately simple apps that together create the need for every capability the skill can implement. No real UI — just enough functionality to give the skill something to integrate.

## The scenario

ACME Trading has six small web apps that don't talk to each other. Traders juggle browser tabs, copy tickers by hand, and the two apps that *do* communicate use a fragile `BroadcastChannel` hack.

## The apps

| App | Port | Framework | Pain point → skill capability it exercises |
|---|---|---|---|
| `watchlist` | 4101 | vanilla 
| `instrument-details` | 4102 | React
| `pricing-service` | 4103 | vanilla 
| `order-entry` | 4104 | vanilla 
| `orders-blotter` | 4105 | React
| `vendor-news` | 4106 | vanilla

Traders also want the watchlist, details, and news apps docked in one window with a saveable arrangement (**workspaces + layouts**).

## Running the apps

```bash
npm install            # from the repo root (npm workspaces)
npm run dev -w watchlist   # and similarly for each app
```

Put a real io.Connect license key in `.env` (`VITE_LICENSE_KEY`) before integrating.