// Browser-side call to the Anthropic Messages API.
//
// The API key lives in localStorage and is sent straight from the browser, so
// this only makes sense for a personal, single-user site. The
// `anthropic-dangerous-direct-browser-access` header opts into CORS from the
// browser; without it the request is blocked.

import { ANTHROPIC_API_URL, ANTHROPIC_VERSION, MODEL } from "./config.js";

const SYSTEM_PROMPT = `You are a warm, encouraging Spanish tutor for an absolute beginner (roughly A1).
The student is practising by writing ONE short sentence in Spanish. The prompt they are
responding to is given below — either a real La Liga result, or a question about their
own daily routine.

Correct their sentence with a light touch:
- Keep the corrected version simple, present tense, and close to what they tried to say.
- Do not rewrite it into advanced Spanish. If it is already correct, return it unchanged.
- Never change the facts. If they say they wake up at five, they wake up at five —
  correct the Spanish, not their life.
- Watch for reflexive verbs (despertarse, levantarse, acostarse, ducharse). Dropping the
  "me" is the most common beginner mistake in daily-routine sentences.
- The note must be ONE short sentence in English explaining the single most important change
  (or praising what they got right if nothing needed changing). No lists, no grammar jargon dumps.

Respond with ONLY a JSON object, no markdown, no commentary:
{"original": "<their sentence, verbatim>", "corrected": "<the corrected sentence>", "note": "<one short English sentence>"}`;

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    // tolerate ```json fences or stray prose around the object
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error("Could not parse a JSON reply from the model.");
  }
}

// `context` is a short line describing what they were responding to, e.g.
//   'Match: Valencia 0–5 Barça'
//   'Question: ¿A qué hora te despiertas? ("What time do you wake up?")'
export async function correctSentence({ apiKey, context, sentence }) {
  const userMessage = `${context}
My sentence: "${sentence}"`;

  let res;
  try {
    res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        // Haiku 4.5 has no `effort` setting and errors if you send one. If you
        // switch MODEL to Sonnet 5 or Opus 5, add: output_config: { effort: "low" }
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (err) {
    throw new Error(`Network error talking to the Anthropic API: ${err.message}`);
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error?.message || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => "");
    }
    if (res.status === 401) {
      throw new Error("The API key was rejected (401). Check it in Settings.");
    }
    throw new Error(`Anthropic API error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const parsed = extractJson(text);
  return {
    original: String(parsed.original ?? sentence),
    corrected: String(parsed.corrected ?? "").trim(),
    note: String(parsed.note ?? "").trim(),
  };
}
