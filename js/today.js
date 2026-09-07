// index page: render today's matches and run the write → correct → save loop.

import { DATA_URL } from "./config.js";
import { getApiKey, addEntry } from "./store.js";
import { renderKeyNotice } from "./settings.js";
import { correctSentence } from "./anthropic.js";
import { micButton, attachDictation } from "./speech.js";

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

// `onAnswered` opens the example sentences once you've submitted your own, so
// they act as a model to compare against rather than something to copy.
function practiceBlock(match, onAnswered) {
  const textarea = el("textarea", {
    placeholder: "Escribe una frase sobre este resultado…",
  });
  const submit = el("button", { textContent: "Get feedback" });
  const status = el("span", { className: "status" });
  const feedback = el("div", { className: "feedback", hidden: true });

  // null when the browser has no speech recognition — then there's just no button
  const mic = micButton();
  let spoken = false;
  if (mic) {
    attachDictation({
      button: mic,
      textarea,
      status,
      onSpoken: () => {
        spoken = true;
      },
    });
    // typing over a transcript means it is no longer purely spoken
    textarea.addEventListener("keydown", () => {
      spoken = false;
    });
  }

  const scoreline = `${match.home} ${match.score.home}–${match.score.away} ${match.away}`;

  async function run() {
    const sentence = textarea.value.trim();
    if (!sentence) return;
    const apiKey = getApiKey();
    if (!apiKey) {
      status.className = "status error";
      status.textContent = "No API key — add one on the home page.";
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
        spoken,
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
      onAnswered?.();

      addEntry({
        kind: "match",
        contextLabel: scoreline,
        spoken,
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
    el("div", { className: "actions" }, submit, ...(mic ? [mic] : []), status),
    feedback
  );
}

function matchCard(match) {
  const card = el("section", { className: "match" });

  // Collapsed by default: seeing three finished sentences before you write
  // turns the exercise into copying. Open it if you're stuck — and it opens
  // itself once you've submitted, so you can compare.
  const examples = el(
    "details",
    { className: "examples" },
    el("summary", { textContent: "Ver 3 frases de ejemplo" }),
    el("ul", { className: "sentences" }, ...match.sentences.map(sentenceItem))
  );

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
    el("div", { className: "wordbank" }, ...match.wordBank.map(wordChip)),
    practiceBlock(match, () => {
      examples.open = true;
    }),
    examples
  );
  return card;
}

/* ---------- boot ---------- */

async function main() {
  renderKeyNotice();

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
