// Home page: pick a practice mode. Each card shows a live line of context so
// the page says something real rather than just being a menu.

import { DATA_URL } from "./config.js";
import { getEntries } from "./store.js";
import { QUESTIONS, questionIndexForToday } from "./questions.js";
import { initSettings } from "./settings.js";

// The key panel stays collapsed here — the home page shouldn't greet you with a
// settings form. The practice pages open it when a key is actually missing.
initSettings({ openWhenEmpty: false });

// --- La Liga card
(async () => {
  const meta = document.getElementById("matchMeta");
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const n = (data.matches ?? []).length;
    if (!n) {
      meta.textContent = "no matches yet";
      return;
    }
    const d = new Date(data.date + "T00:00:00");
    const when = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    meta.textContent = `${n} match${n === 1 ? "" : "es"} · ${when}`;
  } catch {
    meta.textContent = "results unavailable";
  }
})();

// --- Mi día card
document.getElementById("questionMeta").textContent =
  QUESTIONS[questionIndexForToday()].q;

// --- Mis frases card
const count = getEntries().length;
document.getElementById("entryMeta").textContent = count
  ? `${count} sentence${count === 1 ? "" : "s"} so far`
  : "nothing written yet";
