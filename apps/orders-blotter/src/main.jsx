import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

// The blotter also tracks the active account ON ITS OWN — see order-entry for
// the drift problem. It also has no way to receive orders placed in
// order-entry, and no way to be "summoned" to show a specific order.
function App() {
    const [account] = useState("ACC-DEFAULT");
    const [orders, setOrders] = useState([]);
    const [highlighted, setHighlighted] = useState(null);

    // Exposed so future integration code can push orders / highlight one.
    window.blotter = {
        addOrder: (order) => setOrders((prev) => [...prev, order]),
        showOrder: (orderId) => setHighlighted(orderId)
    };

    return (
        <div>
            <h1>Orders — {account}</h1>
            {orders.length === 0 && <p>No orders yet.</p>}
            <ul>
                {orders.map((o) => (
                    <li key={o.id} style={{ fontWeight: o.id === highlighted ? "bold" : "normal" }}>
                        {o.id} {o.ticker} x{o.qty} @ {o.price} [{o.status}]
                    </li>
                ))}
            </ul>
        </div>
    );
}

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
