// Headless-style service app. It owns two capabilities that other apps need
// but currently CANNOT reach, because nothing connects the apps:
//
// 1. getQuote(ticker, qty) — authoritative quote calculation (other apps
//    duplicate this logic today; it should be callable remotely).
// 2. A live price tick generator — ticks are only logged locally; other apps
//    (watchlist, details, order entry) would all want this feed.

const BASE = { "AAPL": 227.5, "MSFT": 415.2, "VOD.L": 0.72, "TSLA": 244.9 };

export function getQuote(ticker, qty) {
    const base = BASE[ticker];
    if (base === undefined) throw new Error(`Unknown ticker: ${ticker}`);
    const spread = base * 0.001;
    const commission = Math.max(1, qty * 0.005);
    return { ticker, qty, price: +(base + spread).toFixed(4), commission: +commission.toFixed(2) };
}

const log = document.getElementById("log");

// Live ticks — currently trapped inside this app.
setInterval(() => {
    const tickers = Object.keys(BASE);
    const ticker = tickers[Math.floor(Math.random() * tickers.length)];
    BASE[ticker] = +(BASE[ticker] * (1 + (Math.random() - 0.5) * 0.002)).toFixed(4);
    const tick = { ticker, price: BASE[ticker], ts: Date.now() };
    log.textContent = `${JSON.stringify(tick)}\n${log.textContent}`.slice(0, 2000);
}, 1500);
