// index page: render today's matches and run the write → correct → save loop.

import { DATA_URL } from "./config.js";
import { getApiKey, addEntry } from "./store.js";
import { initSettings } from "./settings.js";
import { correctSentence } from "./anthropic.js";

const el = (tag, props = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const k of kids) node.append(k);
  return node;
};


/* ---------- match rendering ---------- */

function sentenceItem({ es, en }) {
  const li = el(
    "li",
    {},
    el("span", { className: "tap", textContent: "tap" }),
    el("div", { className: "es", textContent: es }),
    el("div", { className: "en", textContent: en })
  );
  li.addEventListener("click", () => li.classList.toggle("revealed"));
  return li;
}

function wordChip({ es, en }) {
  return el(
    "span",
    { className: "chip" },
    el("b", { textContent: es }),
    el("span", { textContent: ` — ${en}` })
  );
}

function practiceBlock(match) {
  const textarea = el("textarea", {
    placeholder: "Escribe una frase sobre este resultado…",
  });
  const submit = el("button", { textContent: "Get feedback" });
  const status = el("span", { className: "status" });
  const feedback = el("div", { className: "feedback", hidden: true });

  const scoreline = `${match.home} ${match.score.home}–${match.score.away} ${match.away}`;

  async function run() {
    const sentence = textarea.value.trim();
    if (!sentence) return;
    const apiKey = getApiKey();
    if (!apiKey) {
      status.className = "status error";
      status.textContent = "Add your API key in Settings first.";
      return;
    }

    submit.disabled = true;
    status.className = "status";
    status.textContent = "Checking…";
    feedback.hidden = true;

    try {
      const result = await correctSentence({
        apiKey,
        context: `Match: ${scoreline}`,
        sentence,
      });

      feedback.replaceChildren(
        el(
          "p",
          { className: "line" },
          el("span", { className: "label", textContent: "You wrote" }),
          el("span", { textContent: result.original })
        ),
        el(
          "p",
          { className: "line" },
          el("span", { className: "label", textContent: "Corrected" }),
          el("span", { className: "corrected", textContent: result.corrected })
        ),
        el(
          "p",
          { className: "line" },
          el("span", { className: "label", textContent: "Note" }),
          el("span", { className: "note", textContent: result.note })
        )
      );
      feedback.hidden = false;
      status.textContent = "";

      addEntry({
        kind: "match",
        contextLabel: scoreline,
        matchId: match.id,
        matchLabel: scoreline, // kept so entries saved before "Mi día" still render
        matchDate: match.__date,
        original: result.original,
        corrected: result.corrected,
        note: result.note,
      });
    } catch (err) {
      status.className = "status error";
      status.textContent = err.message;
    } finally {
      submit.disabled = false;
    }
  }

  submit.addEventListener("click", run);
  textarea.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
  });

  return el(
    "div",
    { className: "practice" },
    el("label", { textContent: "Your sentence about this result" }),
    textarea,
    el("div", { className: "actions" }, submit, status),
    feedback
  );
}

function matchCard(match) {
  const card = el("section", { className: "match" });
  card.append(
    el(
      "h2",
      {},
      `${match.home} `,
      el("span", {
        className: "score",
        textContent: `${match.score.home}–${match.score.away}`,
      }),
      ` ${match.away}`
    ),
    el(
      "ul",
      { className: "sentences" },
      ...match.sentences.map(sentenceItem)
    ),
    el("div", { className: "wordbank" }, ...match.wordBank.map(wordChip)),
    practiceBlock(match)
  );
  return card;
}

/* ---------- boot ---------- */

async function main() {
  initSettings();

  const container = document.getElementById("matches");
  let data;
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    data = await res.json();
  } catch (err) {
    container.append(
      el("p", { className: "empty", textContent: `Could not load ${DATA_URL}: ${err.message}` })
    );
    return;
  }

  const sub = document.getElementById("subtitle");
  if (data.date) {
    const d = new Date(data.date + "T00:00:00");
    sub.textContent = `${data.competition || "La Liga"} — ${d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })}`;
  }

  const matches = data.matches || [];
  if (matches.length === 0) {
    container.append(el("p", { className: "empty", textContent: "No matches for this date." }));
    return;
  }
  for (const m of matches) {
    m.__date = data.date;
    container.append(matchCard(m));
  }
}

main();
