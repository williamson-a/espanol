// The API-key panel. It lives on the home page only — it's a set-once thing, so
// the practice pages get a small notice instead, and only when the key is
// missing.

import { getApiKey, setApiKey } from "./store.js";

// Renders into #keyNotice, or does nothing when a key is already saved.
export function renderKeyNotice() {
  const slot = document.getElementById("keyNotice");
  if (!slot || getApiKey()) return;

  const link = document.createElement("a");
  link.href = "index.html#settings";
  link.textContent = "Add it on the home page →";

  const box = document.createElement("p");
  box.className = "key-notice";
  box.append("No Anthropic API key saved, so corrections won't work. ", link);
  slot.replaceChildren(box);
}

export function initSettings({ openWhenEmpty = true } = {}) {
  const details = document.getElementById("settings");
  if (!details) return;

  const input = document.getElementById("apiKeyInput");
  const status = document.getElementById("keyStatus");

  const render = () => {
    const key = getApiKey();
    if (key) {
      status.className = "key-status set";
      status.textContent = `Key saved (…${key.slice(-4)}).`;
    } else {
      status.className = "key-status unset";
      status.textContent = "No key saved yet — add one to get corrections.";
      if (openWhenEmpty) details.open = true;
    }
  };

  document.getElementById("saveKey").addEventListener("click", () => {
    setApiKey(input.value);
    input.value = "";
    render();
  });
  document.getElementById("clearKey").addEventListener("click", () => {
    setApiKey("");
    render();
  });

  render();
}
