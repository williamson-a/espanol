// The API-key panel, shared by every page that has one.

import { getApiKey, setApiKey } from "./store.js";

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
