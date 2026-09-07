// "Mi día" page: answer a daily-routine question in the present tense.

import { QUESTIONS, questionIndexForToday } from "./questions.js";
import { getApiKey, addEntry } from "./store.js";
import { initSettings } from "./settings.js";
import { correctSentence } from "./anthropic.js";
import { micButton, attachDictation } from "./speech.js";

const el = (tag, props = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const k of kids) node.append(k);
  return node;
};


/* ---------- the question card ---------- */

let index = questionIndexForToday();

function render() {
  const question = QUESTIONS[index];
  const container = document.getElementById("card");

  const textarea = el("textarea", { placeholder: "Escribe tu respuesta…" });
  const submit = el("button", { textContent: "Get feedback" });
  const status = el("span", { className: "status" });
  const feedback = el("div", { className: "feedback", hidden: true });

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
    textarea.addEventListener("keydown", () => {
      spoken = false;
    });
  }

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

      addEntry({
        kind: "routine",
        contextLabel: question.q,
        questionEn: question.en,
        spoken,
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
      "p",
      { className: "grammar-hint" },
      el("span", { className: "hint-label", textContent: "hint" }),
      el("span", { textContent: question.hint })
    ),
    el(
      "div",
      { className: "practice" },
      el("label", { textContent: "Your answer — conjugate the verb yourself" }),
      textarea,
      el("div", { className: "actions" }, submit, ...(mic ? [mic] : []), next, status),
      feedback
    )
  );

  container.replaceChildren(card);
  textarea.focus();
}

initSettings();
render();
