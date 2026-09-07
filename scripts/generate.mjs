#!/usr/bin/env node
// Fetch the most recent finished La Liga matches from football-data.org, turn
// each one into 3 absolute-beginner Spanish sentences plus a word bank via the
// Anthropic API, and write data/today.json.
//
//   FOOTBALL_DATA_TOKEN=... ANTHROPIC_API_KEY=... node scripts/generate.mjs
//
// Flags:
//   --date=YYYY-MM-DD   use this date instead of "yesterday"
//   --lookback=N        if that date has no matches, walk back up to N days (default 7)
//   --force             regenerate even if data/today.json already covers these results
//   --dry-run           print the JSON instead of writing data/today.json

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";

// Haiku is plenty for writing three A1 sentences, and ~5x cheaper than Opus.
// Note: Haiku 4.5 rejects `output_config.effort` — only add that if you switch
// to Sonnet 5 or Opus 5.
const MODEL = "claude-haiku-4-5";
const COMPETITION = "PD"; // Primera División (La Liga) on football-data.org
const LEAGUE_TZ = "Europe/Madrid";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(here, "..");
const OUT_FILE = path.join(repoRoot, "data", "today.json");

/* ---------------------------------------------------------------- args --- */

function parseArgs(argv) {
  const args = { date: null, lookback: 7, dryRun: false, force: false };
  for (const arg of argv.slice(2)) {
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--force") args.force = true;
    else if (arg.startsWith("--date=")) args.date = arg.slice(7);
    else if (arg.startsWith("--lookback=")) args.lookback = Number(arg.slice(11));
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (args.date && !/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
    throw new Error(`--date must be YYYY-MM-DD, got: ${args.date}`);
  }
  if (!Number.isInteger(args.lookback) || args.lookback < 0) {
    throw new Error(`--lookback must be a non-negative integer`);
  }
  return args;
}

/* ---------------------------------------------------------------- dates --- */

// Calendar date in the league's timezone, as YYYY-MM-DD.
function leagueDate(instant = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LEAGUE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

// Shift a YYYY-MM-DD string by whole days. Anchored at noon UTC so DST
// transitions can never push it onto the wrong calendar day.
function shiftDate(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* ----------------------------------------------------------- match data --- */

async function fetchFinishedMatches({ token, dateFrom, dateTo }) {
  const url =
    `https://api.football-data.org/v4/competitions/${COMPETITION}/matches` +
    `?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  const res = await fetch(url, { headers: { "X-Auth-Token": token } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`football-data.org ${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();

  return (data.matches ?? [])
    .filter((m) => m.status === "FINISHED")
    .filter((m) => m.score?.fullTime?.home != null && m.score?.fullTime?.away != null)
    .map((m) => ({
      home: m.homeTeam?.shortName || m.homeTeam?.name || "?",
      away: m.awayTeam?.shortName || m.awayTeam?.name || "?",
      score: { home: m.score.fullTime.home, away: m.score.fullTime.away },
      matchday: m.matchday ?? null,
      // group by the calendar date in Spain, not UTC — a 21:00 CEST kickoff is
      // still "yesterday" locally even though it is today in UTC
      date: leagueDate(new Date(m.utcDate)),
    }));
}

// Prefer `targetDate`; otherwise fall back to the most recent day that actually
// had matches, up to `lookback` days earlier.
function pickMatchday(matches, targetDate, lookback) {
  const byDate = new Map();
  for (const m of matches) {
    if (!byDate.has(m.date)) byDate.set(m.date, []);
    byDate.get(m.date).push(m);
  }
  for (let back = 0; back <= lookback; back++) {
    const date = shiftDate(targetDate, -back);
    if (byDate.has(date)) return { date, matches: byDate.get(date) };
  }
  return { date: targetDate, matches: [] };
}

/* ------------------------------------------------------------ freshness --- */

// La Liga plays a handful of days a month, and the lookback above means most
// daily runs land on a matchday that was already written up yesterday. Compare
// before spending anything: same date, same fixtures, same scores -> no work.
async function readExisting() {
  try {
    return JSON.parse(await fs.readFile(OUT_FILE, "utf8"));
  } catch {
    return null; // missing or unreadable — treat as "needs generating"
  }
}

function fingerprint(date, matches) {
  const fixtures = (matches ?? [])
    .map((m) => `${m.home}|${m.away}|${m.score?.home}-${m.score?.away}`)
    .sort()
    .join(",");
  return `${date}::${fixtures}`;
}

/* ------------------------------------------------------------- anthropic --- */

const SYSTEM_PROMPT = `You write Spanish practice material for an ABSOLUTE BEGINNER (CEFR A1) who is learning through football results.

For the match you are given, produce exactly 3 Spanish sentences and a word bank.

Rules for the sentences:
- Simple present tense only. Never use past tenses. (Spanish sports headlines use the present, so this is natural.)
- One idea per sentence. Subject–verb–object. No subordinate clauses, no relative pronouns.
- Use the real team names and the real score.
- Sentence 1: who plays / who is at home. Sentence 2: the goals. Sentence 3: the outcome (wins / loses / draws).
- Keep every sentence under 9 words.
- The English gloss must be a plain, literal translation — not a polished paraphrase.

Rules for the word bank:
- 5 or 6 entries, all drawn from the sentences you just wrote.
- Nouns get their article ("el gol", "el partido"). Verbs appear in the infinitive ("marcar", "ganar").
- The English gloss is short: "the goal", "to score".
- No proper nouns — team names are not vocabulary.`;

const CONTENT_SCHEMA = {
  type: "object",
  properties: {
    sentences: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        properties: { es: { type: "string" }, en: { type: "string" } },
        required: ["es", "en"],
        additionalProperties: false,
      },
    },
    wordBank: {
      type: "array",
      minItems: 5,
      maxItems: 6,
      items: {
        type: "object",
        properties: { es: { type: "string" }, en: { type: "string" } },
        required: ["es", "en"],
        additionalProperties: false,
      },
    },
  },
  required: ["sentences", "wordBank"],
  additionalProperties: false,
};

async function writeLesson(client, match) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: CONTENT_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content:
          `Match: ${match.home} ${match.score.home}–${match.score.away} ${match.away}\n` +
          `Home team: ${match.home}\nAway team: ${match.away}\n` +
          `Final score: ${match.score.home}–${match.score.away}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error(`model declined this match (${response.stop_details?.category ?? "unknown"})`);
  }

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("no text block in the response");

  const parsed = JSON.parse(text);
  const ok = (arr, min, max) =>
    Array.isArray(arr) &&
    arr.length >= min &&
    arr.length <= max &&
    arr.every((x) => typeof x?.es === "string" && x.es && typeof x?.en === "string" && x.en);

  if (!ok(parsed.sentences, 3, 3)) throw new Error("expected exactly 3 well-formed sentences");
  if (!ok(parsed.wordBank, 5, 6)) throw new Error("expected 5–6 well-formed word bank entries");

  return { sentences: parsed.sentences, wordBank: parsed.wordBank };
}

/* ------------------------------------------------------------------ main --- */

const slug = (s) =>
  s
    .normalize("NFD") // "Atlético" -> "Atle" + combining acute + "tico"
    .replace(/\p{Diacritic}/gu, "") // strip the combining marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function main() {
  const args = parseArgs(process.argv);

  const footballToken = process.env.FOOTBALL_DATA_TOKEN;
  if (!footballToken) throw new Error("FOOTBALL_DATA_TOKEN is not set");
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");

  const targetDate = args.date ?? shiftDate(leagueDate(), -1);
  const windowStart = shiftDate(targetDate, -args.lookback);

  console.error(`Looking for finished matches on ${targetDate} (back to ${windowStart})…`);
  const all = await fetchFinishedMatches({
    token: footballToken,
    dateFrom: windowStart,
    dateTo: targetDate,
  });
  const { date, matches } = pickMatchday(all, targetDate, args.lookback);

  if (matches.length === 0) {
    console.error(`No finished La Liga matches in that window.`);
    // International break, or the season hasn't started. Blanking the site is
    // worse than leaving yesterday's lesson up, so keep whatever is already
    // there and let a later run replace it.
    const previous = await readExisting();
    if (previous?.matches?.length) {
      console.error(
        `Keeping the existing ${previous.matches.length} match(es) from ${previous.date} rather than publishing an empty page.`
      );
      return;
    }
  } else if (date !== targetDate) {
    console.error(`Nothing on ${targetDate}; using the most recent matchday, ${date}.`);
  }
  console.error(`${matches.length} match(es) on ${date}.`);

  // Bail out before spending anything if the file already says exactly this.
  const existing = await readExisting();
  if (
    !args.force &&
    existing &&
    fingerprint(date, matches) === fingerprint(existing.date, existing.matches)
  ) {
    console.error(
      `data/today.json already covers ${date} with the same ${matches.length} result(s).` +
        ` No API calls made. Use --force to regenerate anyway.`
    );
    return;
  }

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  const out = [];
  const failures = [];

  for (const match of matches) {
    const label = `${match.home} ${match.score.home}–${match.score.away} ${match.away}`;
    try {
      const lesson = await writeLesson(client, match);
      out.push({
        id: `${date}-${slug(match.home)}-${slug(match.away)}`,
        home: match.home,
        away: match.away,
        score: match.score,
        matchday: match.matchday,
        ...lesson,
      });
      console.error(`  ✓ ${label}`);
    } catch (err) {
      failures.push(label);
      console.error(`  ✗ ${label} — ${err.message}`);
    }
  }

  // Don't overwrite a good file with an empty one because every call failed.
  if (matches.length > 0 && out.length === 0) {
    throw new Error(`All ${matches.length} match(es) failed; leaving data/today.json untouched.`);
  }

  const payload = {
    date,
    competition: "La Liga",
    generatedAt: new Date().toISOString(),
    source: "football-data.org + Anthropic API",
    matches: out,
  };
  const json = JSON.stringify(payload, null, 2) + "\n";

  if (args.dryRun) {
    process.stdout.write(json);
  } else {
    await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
    await fs.writeFile(OUT_FILE, json);
    console.error(`Wrote ${path.relative(repoRoot, OUT_FILE)} (${out.length} match(es)).`);
  }

  if (failures.length) console.error(`${failures.length} match(es) skipped.`);
}

main().catch((err) => {
  if (err instanceof Anthropic.AuthenticationError) {
    console.error("Anthropic rejected the API key (401). Check ANTHROPIC_API_KEY.");
  } else if (err instanceof Anthropic.RateLimitError) {
    console.error("Anthropic rate limited this run (429). Try again shortly.");
  } else if (err instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${err.status}: ${err.message}`);
  } else {
    console.error(err.message);
  }
  process.exit(1);
});
