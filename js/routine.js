// "Mi día" page: every daily-routine question on one page, like the match list.
// Answer them in any order; progress and past answers persist across visits.

import { QUESTIONS } from "./questions.js";
import {
  getApiKey,
  addEntry,
  getEntries,
  getAnswered,
  markAnswered,
  resetAnswered,
} from "./store.js";
import { initSettings } from "./settings.js";
import { correctSentence } from "./anthropic.js";
import { micButton, attachDictation } from "./speech.js";

const el = (tag, props = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const k of kids) node.append(k);
  return node;
};

// Most recent answer to a given question, so reopening the page shows the work
// you've already done rather than 24 blank boxes.
function lastAnswerFor(questionText, entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.kind === "routine" && e.contextLabel === questionText) return e;
  }
  return null;
}

/* ---------- progress header ---------- */

const progressText = el("span");
const progressFill = el("span", { className: "progress-fill" });
const resetBtn = el("button", {
  className: "secondary tiny",
  textContent: "Reiniciar",
  hidden: true,
});

resetBtn.addEventListener("click", () => {
  if (!confirm("Clear your progress marks? Your saved sentences are not deleted.")) return;
  resetAnswered();
  document.querySelectorAll(".question-card").forEach((c) => c.classList.remove("answered"));
  updateProgress();
});

function updateProgress() {
  const done = getAnswered().size;
  const total = QUESTIONS.length;
  progressText.textContent =
    done === total ? `¡Completado! all ${total} answered 🎉` : `${done} of ${total} answered`;
  progressFill.style.width = `${(done / total) * 100}%`;
  resetBtn.hidden = done === 0;
}

/* ---------- one question card ---------- */

function questionCard(question, index, previous) {
  const card = el("section", { className: "match question-card" });

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

  const showFeedback = ({ original, corrected, note }) => {
    feedback.replaceChildren(
      el(
        "p",
        { className: "line" },
        el("span", { className: "label", textContent: "You said" }),
        el("span", { textContent: original })
      ),
      el(
        "p",
        { className: "line" },
        el("span", { className: "label", textContent: "Corrected" }),
        el("span", { className: "corrected", textContent: corrected })
      ),
      el(
        "p",
        { className: "line" },
        el("span", { className: "label", textContent: "Note" }),
        el("span", { className: "note", textContent: note })
      )
    );
    feedback.hidden = false;
  };

  // The tick is driven by the progress mark (set below), not by this — an entry
  // deleted from "Mis frases" shouldn't un-tick a question you did answer.
  if (previous) showFeedback(previous);

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

    try {
      const result = await correctSentence({
        apiKey,
        context: `Question they are answering: ${question.q} ("${question.en}")`,
        sentence,
        spoken,
      });

      showFeedback(result);
      status.textContent = "";
      textarea.value = "";

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
      card.classList.add("answered");
      updateProgress();
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

  card.append(
    el(
      "h2",
      { className: "question-es" },
      el("span", { className: "check", textContent: "✓ " }),
      question.q
    ),
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
      el("div", { className: "actions" }, submit, ...(mic ? [mic] : []), status),
      feedback
    )
  );

  return card;
}

/* ---------- boot ---------- */

initSettings();

const answered = getAnswered();
const entries = getEntries();
const container = document.getElementById("card");

container.replaceChildren(
  el(
    "div",
    { className: "progress sticky-progress" },
    progressText,
    el("span", { className: "progress-bar" }, progressFill),
    resetBtn
  ),
  ...QUESTIONS.map((q, i) => {
    const card = questionCard(q, i, lastAnswerFor(q.q, entries));
    if (answered.has(i)) card.classList.add("answered");
    return card;
  })
);

updateProgress();
