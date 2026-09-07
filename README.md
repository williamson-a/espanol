# La Liga en español

A tiny static site for learning Spanish from yesterday's La Liga results.

- **index.html** — each match rendered as 3 simple present-tense Spanish sentences
  (tap to reveal the English), a word bank, and a box where you write one sentence
  about the result. Submitting calls the Anthropic API and shows your sentence, a
  corrected version, and one short note on what changed. Everything is saved to
  `localStorage`.
- **practice.html** — every sentence you've written, with its correction.

## Status

- ✅ **Part 2 — frontend** (this): working against a hardcoded `data/today.json`.
- ⬜ **Part 1 — data pipeline** (`scripts/generate.mjs` + GitHub Actions cron): not built yet.

## Running locally

The pages use `fetch()` and ES modules, so you need a server (not `file://`):

```bash
cd laliga-spanish
python3 -m http.server 4173
```

Then open http://localhost:4173/ and paste an Anthropic API key into **Settings**.
The key is stored only in your browser's `localStorage` and sent directly to
`api.anthropic.com` from the page. Use a key with a low spend limit.

Model is `claude-opus-5` (see `js/config.js` — change to `claude-haiku-4-5` for
cheaper/faster corrections).

## Deploying to GitHub Pages

1. Push this folder to a GitHub repo.
2. Settings → Pages → Build and deployment → **Deploy from a branch**, branch
   `main`, folder `/ (root)`.
3. The site is served at `https://<user>.github.io/<repo>/`. All paths in the code
   are relative, so it works from a subpath.

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
| `laliga_spanish.entries`  | array of `{ id, createdAt, matchId, matchLabel, matchDate, original, corrected, note }` |
