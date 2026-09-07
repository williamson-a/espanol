// Shared configuration and constants.

export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
export const ANTHROPIC_VERSION = "2023-06-01";

// Model used for sentence correction. Haiku is fast and cheap, and correcting
// one A1 sentence is not hard work. Swap to "claude-sonnet-5" or
// "claude-opus-5" if corrections ever feel too shallow — but note those two
// accept an `output_config.effort` setting that Haiku rejects, so if you
// switch, see the commented-out line in anthropic.js.
export const MODEL = "claude-haiku-4-5";

export const STORAGE_KEYS = {
  apiKey: "laliga_spanish.apiKey",
  entries: "laliga_spanish.entries",
  routineDone: "laliga_spanish.routineDone",
};

export const DATA_URL = "data/today.json";
