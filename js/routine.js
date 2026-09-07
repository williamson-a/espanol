// "Mi día" page: answer a daily-routine question in the present tense.

import { QUESTIONS, questionIndexForToday } from "./questions.js";
import { getApiKey, setApiKey, addEntry } from "./store.js";
import { correctSentence } from "./anthropic.js";

const el = (tag, props = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const k of kids) node.append(k);
  return node;
};

/* ---------- settings / api key ---------- */

function initSettings() {
  const input = document.getElementById("apiKeyInput");
  const status = document.getElementById("keyStatus");
  const details = document.getElementById("settings");

  const render = () => {
    const key = getApiKey();
    if (key) {
      status.className = "key-status set";
      status.textContent = `Key saved (…${key.slice(-4)}).`;
    } else {
      status.className = "key-status unset";
      status.textContent = "No key saved yet — add one to get corrections.";
      details.open = true;
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

/* ---------- the question card ---------- */

let index = questionIndexForToday();

function render() {
  const question = QUESTIONS[index];
  const container = document.getElementById("card");

  const textarea = el("textarea", { placeholder: question.start });
  const submit = el("button", { textContent: "Get feedback" });
  const status = el("span", { className: "status" });
  const feedback = el("div", { className: "feedback", hidden: true });

  const next = el("button", {
    className: "secondary",
    textContent: "Otra pregunta ↻",
  });
  next.addEventListener("click", () => {
    index = (index + 1) % QUESTIONS.length;
    render();
  });

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
        context: `Question they are answering: ${question.q} ("${question.en}")`,
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
        kind: "routine",
        contextLabel: question.q,
        questionEn: question.en,
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

  const card = el("section", { className: "match question-card" });
  card.append(
    el("h2", { className: "question-es", textContent: question.q }),
    el("p", { className: "question-en", textContent: question.en }),
    el("div", { className: "wordbank" }, ...question.words.map((w) =>
      el(
        "span",
        { className: "chip" },
        el("b", { textContent: w.es }),
        el("span", { textContent: ` — ${w.en}` })
      )
    )),
    el(
      "div",
      { className: "practice" },
      el("label", {}, "Your answer — try starting with ", el("code", { textContent: question.start })),
      textarea,
      el("div", { className: "actions" }, submit, next, status),
      feedback
    )
  );

  container.replaceChildren(card);
  textarea.focus();
}

initSettings();
render();
