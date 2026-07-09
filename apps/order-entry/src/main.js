// Order entry for the ACTIVE ACCOUNT. Each app tracks the active account on
// its own (here it's hardcoded) — the blotter does the same. They drift apart
// constantly; the business wants every app to always agree on the account.
let activeAccount = "ACC-DEFAULT";

// DUPLICATED LOGIC: this is a stale copy of pricing-service's getQuote().
// It has already diverged once (wrong commission floor caused a P&L incident).
function getQuoteLocal(ticker, qty) {
    const BASE = { "AAPL": 227.5, "MSFT": 415.2, "VOD.L": 0.72, "TSLA": 244.9 };
    const base = BASE[ticker] ?? 100;
    return { ticker, qty, price: base, commission: qty * 0.005 };
}

const out = document.getElementById("out");
const orders = [];

document.getElementById("quote").onclick = () => {
    const q = getQuoteLocal(tickerEl().value, +qtyEl().value);
    out.textContent = JSON.stringify(q, null, 2);
};

document.getElementById("place").onclick = () => {
    const q = getQuoteLocal(tickerEl().value, +qtyEl().value);
    const order = { id: `O-${Date.now()}`, account: activeAccount, ...q, status: "NEW" };
    orders.push(order);
    out.textContent = `Placed: ${JSON.stringify(order, null, 2)}`;
    // TODO: the blotter should show this order immediately, and clicking an
    // order anywhere in the suite should bring it up in the blotter — even if
    // the blotter isn't open yet. No way to do that today.
};

const tickerEl = () => document.getElementById("ticker");
const qtyEl = () => document.getElementById("qty");
