// The Watchlist is the app traders open first every morning.
const instruments = [
    { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
    { ticker: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ" },
    { ticker: "VOD.L", name: "Vodafone Group", exchange: "LSE" },
    { ticker: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" }
];

// Legacy glue: we push the selection to other apps via BroadcastChannel.
// It only works between same-origin tabs and has no discovery/replay — needs replacing.
const bc = new BroadcastChannel("acme-selection");

const ul = document.getElementById("instruments");
instruments.forEach((inst) => {
    const li = document.createElement("li");
    li.textContent = `${inst.ticker} — ${inst.name} (${inst.exchange})`;
    li.style.cursor = "pointer";
    li.onclick = () => selectInstrument(inst);
    ul.appendChild(li);
});

function selectInstrument(instrument) {
    bc.postMessage({ kind: "instrument-selected", instrument });
}
