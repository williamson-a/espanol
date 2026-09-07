// Speak-your-answer support, using the browser's built-in SpeechRecognition.
//
// No API key and no cost: recognition is handled by the browser (Safari and
// Chrome both ship it; Firefox does not). Requires HTTPS or localhost.
//
// The transcript lands in the textarea rather than being submitted straight
// away, so you can see what it heard and fix a mishearing before spending a
// correction on it.

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

export const isSpeechSupported = () => Boolean(SR);

const ERRORS = {
  "not-allowed": "Microphone blocked. Allow it in your browser's site settings.",
  "service-not-allowed": "Microphone blocked. Allow it in your browser's site settings.",
  "no-speech": "Didn't catch anything — try again a little louder.",
  "audio-capture": "No microphone found.",
  network: "Speech recognition needs a network connection.",
  aborted: "", // user stopped it deliberately; not worth a message
};

// Wires a mic button to a textarea. Returns nothing — it manages its own state.
export function attachDictation({ button, textarea, status, lang = "es-ES", onSpoken }) {
  if (!SR) return;

  const recognition = new SR();
  recognition.lang = lang;
  recognition.interimResults = true; // show words as they land, so you can tell it's working
  recognition.continuous = false; // one sentence, then stop — no hanging mic
  recognition.maxAlternatives = 1;

  let listening = false;
  let base = ""; // whatever was already typed before this dictation started

  const setListening = (on) => {
    listening = on;
    button.classList.toggle("listening", on);
    button.textContent = on ? "◼ Escuchando…" : "🎤 Hablar";
    button.setAttribute("aria-pressed", String(on));
  };

  recognition.addEventListener("result", (event) => {
    let transcript = "";
    for (const result of event.results) transcript += result[0].transcript;
    textarea.value = (base ? base.trimEnd() + " " : "") + transcript.trim();
    // Any final result means we heard a complete utterance.
    if ([...event.results].some((r) => r.isFinal)) onSpoken?.();
  });

  recognition.addEventListener("error", (event) => {
    const message = ERRORS[event.error] ?? `Speech error: ${event.error}`;
    if (message) {
      status.className = "status error";
      status.textContent = message;
    }
    setListening(false);
  });

  recognition.addEventListener("end", () => {
    setListening(false);
    textarea.focus();
  });

  button.addEventListener("click", () => {
    if (listening) {
      recognition.stop();
      return;
    }
    base = textarea.value;
    status.className = "status";
    status.textContent = "";
    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws if called while already running; ignore and reset
      setListening(false);
    }
  });

  setListening(false);
}

// A mic button, or null when the browser can't do speech recognition — in which
// case the pages simply don't show one.
export function micButton() {
  if (!SR) return null;
  const b = document.createElement("button");
  b.type = "button";
  b.className = "secondary mic";
  b.textContent = "🎤 Hablar";
  return b;
}
