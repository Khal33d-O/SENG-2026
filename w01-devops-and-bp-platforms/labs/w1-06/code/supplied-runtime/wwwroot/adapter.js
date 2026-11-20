// Supplied browser adapter (runs in the BROWSER). Fixed request policy: fetch mode "same-origin".
// It resolves BROWSER_API_URL (read from /public-config) against this page's origin and shows what happened.
let config = null;
const show = (id, text) => { document.getElementById(id).textContent = text; };

async function loadConfig() {
  const response = await fetch("/public-config", { mode: "same-origin" });
  config = await response.json();
  show("label", config.publicLabel);
}

async function request(boardId) {
  if (!config) await loadConfig();
  let url = new URL(config.browserApiUrl, window.location.href);
  if (boardId === "missing") url = new URL(url.href.replace(/reference$/, "missing"));
  show("url", url.href);
  try {
    const response = await fetch(url.href, { mode: "same-origin" });
    show("status", "HTTP " + response.status);
    show("body", await response.text());
  } catch (error) {
    // No HTTP response reached this browser operation (policy rejection or connection failure).
    show("status", "No HTTP response (" + error.message + ")");
    show("body", "(nothing received)");
  }
}

document.getElementById("load").addEventListener("click", () => request("reference"));
document.getElementById("missing").addEventListener("click", () => request("missing"));
loadConfig().catch((error) => show("label", "configuration unavailable: " + error.message));
