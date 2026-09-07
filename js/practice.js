// history page: list every sentence I've written with its correction.

import { getEntries, deleteEntry, clearEntries } from "./store.js";

const el = (tag, props = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const k of kids) node.append(k);
  return node;
};

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function entryCard(entry, onDelete) {
  const del = el("button", { className: "del", textContent: "delete" });
  del.addEventListener("click", () => {
    deleteEntry(entry.id);
    onDelete();
  });

  return el(
    "article",
    { className: "entry" },
    el(
      "div",
      { className: "meta" },
      el("span", { textContent: entry.matchLabel || "—" }),
      el("span", {}, del)
    ),
    el("p", { className: "original", textContent: `“${entry.original}”` }),
    el("p", { className: "corrected", textContent: `“${entry.corrected}”` }),
    entry.note ? el("p", { className: "note", textContent: entry.note }) : "",
    el("div", { className: "meta" }, el("span", { textContent: fmtDate(entry.createdAt) }))
  );
}

function render() {
  const list = document.getElementById("list");
  const count = document.getElementById("count");
  const entries = getEntries().slice().reverse(); // newest first

  list.replaceChildren();

  if (entries.length === 0) {
    count.textContent = "Every sentence you've written, with its correction.";
    list.append(
      el("p", {
        className: "empty",
        textContent: "Nothing yet. Write a sentence on the home page.",
      })
    );
    return;
  }

  count.textContent = `${entries.length} sentence${entries.length === 1 ? "" : "s"} written.`;
  for (const e of entries) list.append(entryCard(e, render));
}

document.getElementById("clearAll").addEventListener("click", () => {
  if (confirm("Delete every saved sentence? This cannot be undone.")) {
    clearEntries();
    render();
  }
});

render();
