// "Mi día" page: work through the whole set of daily-routine questions, one at
// a time. Answering one unlocks the next; progress is remembered across visits.

import { QUESTIONS, questionIndexForToday } from "./questions.js";
import { getApiKey, addEntry, getAnswered, markAnswered, resetAnswered } from "./store.js";
import { initSettings } from "./settings.js";
import { correctSentence } from "./anthropic.js";
import { micButton, attachDictation } from "./speech.js";

const el = (tag, props = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const k of kids) node.append(k);
  return node;
};

const container = () => document.getElementById("card");

// First unanswered question at or after `from`, wrapping. null once all are done.
function nextUnanswered(answered, from) {
  for (let k = 0; k < QUESTIONS.length; k++) {
    const i = (from + k) % QUESTIONS.length;
    if (!answered.has(i)) return i;
  }
  return null;
}

/* ---------- completed state ---------- */

function renderDone() {
  const again = el("button", { textContent: "Empezar de nuevo" });
  again.addEventListener("click", () => {
    resetAnswered();
    index = questionIndexForToday();
    render();
  });

  container().replaceChildren(
    el(
      "section",
      { className: "match question-card" },
      el("h2", { className: "question-es", textContent: "¡Completado! 🎉" }),
      el("p", {
        className: "question-en",
        textContent: `You've answered all ${QUESTIONS.length} questions. Your sentences are saved in Mis frases.`,
      }),
      el("div", { className: "practice" }, el("div", { className: "actions" }, again))
    )
  );
}

/* ---------- one question ---------- */

let index = null;

function render() {
  const answered = getAnswered();
  if (index === null || answered.has(index)) {
    index = nextUnanswered(answered, index ?? questionIndexForToday());
  }
  if (index === null) return renderDone();

  const question = QUESTIONS[index];
  const done = answered.size;

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

  // Skip without answering — stays in the pool for later.
  const skip = el("button", { className: "secondary", textContent: "Saltar ↻" });
  skip.addEventListener("click", () => {
    index = nextUnanswered(getAnswered(), (index + 1) % QUESTIONS.length);
    render();
  });

  // Appears only once you've answered, so the correction is read before moving on.
  const next = el("button", { textContent: "Siguiente pregunta →", hidden: true });
  next.addEventListener("click", () => {
    index = nextUnanswered(getAnswered(), (index + 1) % QUESTIONS.length);
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
          el("span", { className: "label", textContent: "You said" }),
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

      markAnswered(index);
      submit.hidden = true;
      if (mic) mic.hidden = true;
      skip.hidden = true;
      next.hidden = false;
      next.focus();
    } catch (err) {
      status.className = "status error";
      status.textContent = err.message;
      submit.disabled = false;
    }
  }

  submit.addEventListener("click", run);
  textarea.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
  });

  const card = el("section", { className: "match question-card" });
  card.append(
    el(
      "div",
      { className: "progress" },
      el("span", { textContent: `${done} of ${QUESTIONS.length} answered` }),
      el(
        "span",
        { className: "progress-bar" },
        el("span", {
          className: "progress-fill",
          style: `width:${(done / QUESTIONS.length) * 100}%`,
        })
      )
    ),
    el("h2", { className: "question-es", textContent: question.q }),
    el("p", { className: "question-en", textContent: question.en }),
    el(
      "div",
      { className: "wordbank" },
      ...question.words.map((w) =>
        el(
          "span",
          { className: "chip" },
          el("b", { textContent: w.es }),
          el("span", { textContent: ` — ${w.en}` })
        )
      )
    ),
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
      el(
        "div",
        { className: "actions" },
        submit,
        ...(mic ? [mic] : []),
        skip,
        next,
        status
      ),
      feedback
    )
  );

  container().replaceChildren(card);
  textarea.focus();
}

initSettings();
render();
