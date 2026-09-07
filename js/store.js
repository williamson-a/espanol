// localStorage wrapper: the API key and every sentence I've written.

import { STORAGE_KEYS } from "./config.js";

export function getApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEYS.apiKey) || "";
  } catch {
    return "";
  }
}

export function setApiKey(key) {
  try {
    if (key) localStorage.setItem(STORAGE_KEYS.apiKey, key.trim());
    else localStorage.removeItem(STORAGE_KEYS.apiKey);
  } catch {
    /* storage unavailable (private window, etc.) — nothing we can do */
  }
}

export function getEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.entries);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

// entry: { matchId, matchLabel, date, original, corrected, note }
export function addEntry(entry) {
  const entries = getEntries();
  const full = {
    id:
      (crypto.randomUUID && crypto.randomUUID()) ||
      String(Date.now()) + Math.random().toString(16).slice(2),
    createdAt: new Date().toISOString(),
    ...entry,
  };
  entries.push(full);
  saveEntries(entries);
  return full;
}

export function deleteEntry(id) {
  saveEntries(getEntries().filter((e) => e.id !== id));
}

/* --- which "Mi día" questions have been answered, so the set can be worked
       through across sessions rather than restarting every visit --- */

export function getAnswered() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.routineDone);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markAnswered(index) {
  const answered = getAnswered();
  answered.add(index);
  try {
    localStorage.setItem(STORAGE_KEYS.routineDone, JSON.stringify([...answered]));
  } catch {
    /* ignore */
  }
}

export function resetAnswered() {
  try {
    localStorage.removeItem(STORAGE_KEYS.routineDone);
  } catch {
    /* ignore */
  }
}

export function clearEntries() {
  saveEntries([]);
}
