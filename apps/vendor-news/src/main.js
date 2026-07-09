// VENDOR APP — simulates a third-party product. It speaks ONLY standard FDC3
// (window.fdc3). We can't change how it integrates; the environment must
// provide a Desktop Agent for it to work.
const HEADLINES = {
    "AAPL": ["Apple unveils new chip roadmap", "iPhone demand steady in Q3"],
    "MSFT": ["Azure growth beats estimates", "Microsoft expands AI datacenters"],
    "VOD.L": ["Vodafone completes tower sale", "New CEO outlines turnaround"],
    "TSLA": ["Tesla margins under pressure", "Robotaxi pilot expands"]
};

function show(ticker) {
    const ul = document.getElementById("news");
    ul.innerHTML = "";
    (HEADLINES[ticker] ?? [`No news for ${ticker}`]).forEach((h) => {
        const li = document.createElement("li");
        li.textContent = h;
        ul.appendChild(li);
    });
}

async function init() {
    if (!window.fdc3) {
        console.warn("vendor-news: no FDC3 Desktop Agent found (window.fdc3 missing). Waiting for fdc3Ready...");
        await new Promise((resolve) => window.addEventListener("fdc3Ready", resolve, { once: true }));
    }
    await window.fdc3.joinUserChannel?.("fdc3.channel.1").catch(() => {});
    await window.fdc3.addContextListener("fdc3.instrument", (ctx) => show(ctx.id?.ticker));
    console.log("vendor-news: FDC3 wired");
}

init().catch(console.error);
