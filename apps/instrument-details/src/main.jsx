import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const FUNDAMENTALS = {
    "AAPL": { pe: 34.1, marketCap: "3.4T", sector: "Technology" },
    "MSFT": { pe: 36.8, marketCap: "3.1T", sector: "Technology" },
    "VOD.L": { pe: 11.2, marketCap: "24B", sector: "Telecom" },
    "TSLA": { pe: 62.4, marketCap: "780B", sector: "Automotive" }
};

function App() {
    const [instrument, setInstrument] = useState(null);

    // Legacy glue: listen for selections broadcast by the Watchlist tab.
    useEffect(() => {
        const bc = new BroadcastChannel("acme-selection");
        bc.onmessage = (e) => {
            if (e.data?.kind === "instrument-selected") setInstrument(e.data.instrument);
        };
        return () => bc.close();
    }, []);

    if (!instrument) return <p>No instrument selected.</p>;
    const f = FUNDAMENTALS[instrument.ticker] ?? {};
    return (
        <div>
            <h1>{instrument.ticker}</h1>
            <p>{instrument.name} — {instrument.exchange}</p>
            <p>P/E: {f.pe} | Market cap: {f.marketCap} | Sector: {f.sector}</p>
        </div>
    );
}

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
