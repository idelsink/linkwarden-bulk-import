import "@picocss/pico";
import "./styles/picocss-modifications.css";
import "./styles/app.css";

const elBaseUrl = document.getElementById("baseUrl");
const elApiKey = document.getElementById("apiKey");

// Load saved settings on page load
window.onload = () => {
  const elSaveSettings = document.getElementById("saveSettings");
  const elBulkImport = document.getElementById("bulkImport");

  elSaveSettings.addEventListener("click", saveSettings);
  elBulkImport.addEventListener("click", bulkImport);
  elBaseUrl.value = localStorage.getItem("linkwardenBaseUrl") || "";
  elApiKey.value = localStorage.getItem("linkwardenApiKey") || "";
};

function saveSettings() {
  localStorage.setItem("linkwardenBaseUrl", elBaseUrl.value.trim());
  localStorage.setItem("linkwardenApiKey", elApiKey.value.trim());
  alert("Settings saved!");
}

async function bulkImport() {
  const elTextarea = document.getElementById("urls");

  const baseUrl = elBaseUrl.value.trim();
  const apiKey = elApiKey.value.trim();
  const urls = elTextarea.value
    .split("\n")
    .map((u) => u.trim())
    .filter((u) => u);

  if (!baseUrl || !apiKey) {
    alert("Please set the Linkwarden URL and Access Token first.");
    return;
  }

  const elStatus = document.getElementById("status");
  const elProgress = document.getElementById("progress");

  elStatus.innerHTML = "Starting import...<br>";

  for (const [i, url] of urls.entries()) {
    try {
      elProgress.max = urls.length;
      const res = await fetch(`${baseUrl}/api/v1/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        elStatus.innerHTML += `<div class="ok">✅ Added: ${url}</div>`;
      } else {
        const text = await res.text();
        elStatus.innerHTML += `<div class="fail">❌ Failed: ${url} (status ${res.status}) - ${text}</div>`;
      }
    } catch (err) {
      elStatus.innerHTML += `<div class="fail">❌ Error: ${url} (${err.message})</div>`;
    } finally {
      elProgress.value = i + 1;
    }
  }

  elStatus.innerHTML += "<br>Import finished.";
}
