# La Liga en español

A tiny static site for learning Spanish from yesterday's La Liga results.

Four pages, all sharing one write → correct → save loop:

- **index.html** (*Inicio*) — home page; pick a mode. Each card shows live
  context: today's match count, the current routine question, your sentence total.
- **partidos.html** (*La Liga*) — the scoreline, a word bank, and a box where you
  write one sentence about the result. The 3 model sentences are collapsed behind
  a toggle so they can't be copied; the toggle opens itself once you've submitted,
  so they read as a comparison rather than an answer key.
- **rutina.html** (*Mi día*) — an A1 question about your own daily routine, with a
  word bank and a grammar hint. 24 questions, rotating by date.

  Word banks list **infinitives only** — never a conjugated form. Conjugating is
  the exercise, so `despertarse` appears but `me despierto` never does; the hint
  states the rule ("reflexive, and stem-changing e → ie") without applying it.
- **practice.html** (*Mis frases*) — every sentence you've written, with its
  correction, tagged by which page it came from.

Submitting an answer on either of the first two calls the Anthropic API and returns
your sentence, a corrected version, and one short note on what changed. The API key
and every entry live in `localStorage`.

## Status

Both parts are live and verified end to end.

- ✅ **Frontend** — deployed, corrections working against the live Anthropic API.
- ✅ **Data pipeline** — ran successfully against football-data.org and Anthropic,
  wrote 4 real matches, and committed them back. The skip guard was confirmed to
  make zero API calls on a repeat run.

## The data pipeline

`scripts/generate.mjs` does three things:

1. Asks football-data.org for finished La Liga (`PD`) matches in the last 7 days.
2. Picks **yesterday**, or — if La Liga didn't play yesterday, which is most
   weekdays — the most recent day that did have matches, so the site is never
   blank. Use `--lookback=0` for strict yesterday-only.
3. Sends each match to the Anthropic API and gets back 3 A1 present-tense
   sentences and a 5–6 word bank, constrained by a JSON schema
   (`output_config.format`), then writes `data/today.json`.

Match dates are computed in `Europe/Madrid`, so a 21:00 kickoff counts as that
day's football rather than rolling into the next UTC day.

### Generating the data

```bash
npm install
FOOTBALL_DATA_TOKEN=xxx ANTHROPIC_API_KEY=xxx npm run generate
```

Useful flags:

```bash
node scripts/generate.mjs --dry-run              # print JSON, don't write the file
node scripts/generate.mjs --date=2026-09-05      # a specific matchday
node scripts/generate.mjs --lookback=0           # yesterday only, no fallback
node scripts/generate.mjs --force                # regenerate even if unchanged
```

**Cost guard:** before calling Anthropic, the script compares the matchday it
found against what `data/today.json` already holds — same date, same fixtures,
same scores means it exits without spending anything. Since La Liga only plays a
few days a month and the lookback keeps landing on the same matchday, this is
what most daily runs do. `--force` overrides it.

Get a free football-data.org token at https://www.football-data.org/client/register
(the free tier covers La Liga).

### The cron

`.github/workflows/generate.yml` runs at **06:00 UTC** daily (07:00 Madrid in
winter, 08:00 in summer) and commits `data/today.json` back to the repo. GitHub
cron is always UTC — edit the `cron:` line to move it. You can also trigger it by
hand from the Actions tab (`workflow_dispatch`).

Two repo secrets are required under **Settings → Secrets and variables → Actions**:

| Secret                | Where to get it                             |
| --------------------- | ------------------------------------------- |
| `ANTHROPIC_API_KEY`   | console.anthropic.com                       |
| `FOOTBALL_DATA_TOKEN` | football-data.org/client/register           |

The workflow needs **Settings → Actions → General → Workflow permissions** set to
"Read and write permissions" so it can push the updated JSON.

## Running the site locally

The pages use `fetch()` and ES modules, so you need a server (not `file://`):

```bash
cd espanol
python3 -m http.server 4173
```

Then open http://localhost:4173/ and paste an Anthropic API key into **Settings**.
The key is stored only in your browser's `localStorage` and sent directly to
`api.anthropic.com` from the page. Use a key with a low spend limit.

Model is `claude-haiku-4-5` (see `js/config.js` — switch to `claude-sonnet-5` for
deeper corrections, but add back the `effort` setting noted in `anthropic.js`).

## Deployment

Live at **https://williamson-a.github.io/espanol/** — GitHub Pages,
deployed from `main` at `/ (root)`. All paths in the code are relative, so it
works from the `/espanol/` subpath.

## Data format (`data/today.json`)

```jsonc
{
  "date": "2026-09-05",
  "competition": "La Liga",
  "matches": [
    {
      "id": "2026-09-05-real-madrid-getafe",
      "home": "Real Madrid",
      "away": "Getafe",
      "score": { "home": 2, "away": 1 },
      "sentences": [{ "es": "…", "en": "…" }],   // 3 items
      "wordBank": [{ "es": "el gol", "en": "the goal" }]  // 5–6 items
    }
  ]
}
```

## localStorage keys

| Key                       | Contents                                             |
| ------------------------- | --------------------------------------------------- |
| `laliga_spanish.apiKey`   | Anthropic API key                                   |
| `laliga_spanish.entries`  | array of `{ id, createdAt, kind, contextLabel, original, corrected, note }` |

`kind` is `"match"` or `"routine"`. Entries saved before the *Mi día* page existed
have `matchLabel` instead of `contextLabel`; the history page reads either.
