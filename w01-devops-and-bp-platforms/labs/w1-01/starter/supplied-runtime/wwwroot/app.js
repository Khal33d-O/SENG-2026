// Supplied page script. It runs in the BROWSER, not in the API process.
// Pressing "Load board" sends GET /api/boards/<id> to the same origin that served this page.
const select = document.getElementById("board");
const statusLine = document.getElementById("status");
const body = document.getElementById("body");

document.getElementById("load").addEventListener("click", async () => {
  const path = "/api/boards/" + encodeURIComponent(select.value); // relative, same-origin path
  statusLine.textContent = "Requesting " + path + " ...";
  try {
    const response = await fetch(path);
    const text = await response.text();
    const release = response.headers.get("X-Lab-Release") || "(no release header)";
    const environment = response.headers.get("X-Lab-Environment") || "(no environment header)";
    statusLine.textContent = "HTTP " + response.status + " | " + release + " | " + environment;
    try { body.textContent = JSON.stringify(JSON.parse(text), null, 2); }
    catch { body.textContent = text; }
  } catch (error) {
    // No HTTP response at all (for example, the server is unreachable).
    statusLine.textContent = "No HTTP response: " + error.message;
    body.textContent = "(nothing received)";
  }
});
