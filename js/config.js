// Shared configuration and constants.

export const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
export const ANTHROPIC_VERSION = "2023-06-01";

// Model used for sentence correction. Swap to "claude-haiku-4-5" or
// "claude-sonnet-5" if you want cheaper/faster feedback.
export const MODEL = "claude-opus-5";

export const STORAGE_KEYS = {
  apiKey: "laliga_spanish.apiKey",
  entries: "laliga_spanish.entries",
};

export const DATA_URL = "data/today.json";
