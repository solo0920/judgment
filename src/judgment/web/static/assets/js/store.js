/* Browser-local persistence for query history and console settings. */

const DB_NAME = "judgment-console";
const DB_VERSION = 1;
const HISTORY_STORE = "query_history";
const SETTINGS_STORE = "settings";
const MAX_HISTORY = 120;

const memory = {
  history: [],
  settings: new Map(),
  nextId: 1,
};

let dbPromise = null;
let degraded = !("indexedDB" in window);

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error("transaction aborted"));
  });
}

function openDatabase() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      degraded = true;
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    let request;
    try {
      request = window.indexedDB.open(DB_NAME, DB_VERSION);
    } catch (error) {
      degraded = true;
      reject(error);
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const store = db.createObjectStore(HISTORY_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("created_at", "created_at");
        store.createIndex("kind", "kind");
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };

    request.onerror = () => {
      degraded = true;
      reject(request.error || new Error("Unable to open IndexedDB"));
    };

    request.onblocked = () => {
      degraded = true;
      reject(new Error("IndexedDB upgrade blocked by another tab"));
    };
  });
  return dbPromise;
}

export function isSupported() {
  return "indexedDB" in window;
}

export function isDegraded() {
  return degraded;
}

export function storageMode() {
  return degraded ? "memory" : "indexeddb";
}

function normalizeEntry(entry) {
  const createdAt = entry.created_at || new Date().toISOString();
  return {
    kind: entry.kind || "query",
    title: String(entry.title || ""),
    detail: String(entry.detail || ""),
    payload: entry.payload || {},
    pinned: Boolean(entry.pinned),
    project_id: String(entry.project_id || ""),
    created_at: createdAt,
  };
}

async function pruneHistory() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    const store = transaction.objectStore(HISTORY_STORE);
    const count = await requestToPromise(store.count());
    if (count > MAX_HISTORY) {
      let toDelete = count - MAX_HISTORY;
      const cursorRequest = store.index("created_at").openCursor();
      await new Promise((resolve, reject) => {
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (!cursor || toDelete <= 0) {
            resolve();
            return;
          }
          cursor.delete();
          toDelete -= 1;
          cursor.continue();
        };
        cursorRequest.onerror = () => reject(cursorRequest.error);
      });
    }
    await transactionDone(transaction);
  } catch (error) {
    degraded = true;
  }
}

export async function addHistory(entry) {
  const record = normalizeEntry(entry);
  try {
    const db = await openDatabase();
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    const store = transaction.objectStore(HISTORY_STORE);
    const id = await requestToPromise(store.add(record));
    await transactionDone(transaction);
    await pruneHistory();
    return id;
  } catch (error) {
    degraded = true;
    const id = memory.nextId++;
    memory.history.push({ id, ...record });
    if (memory.history.length > MAX_HISTORY) memory.history.shift();
    return id;
  }
}

export async function updateHistoryEntry(id, patch = {}) {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;
  try {
    const db = await openDatabase();
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    const store = transaction.objectStore(HISTORY_STORE);
    const existing = await requestToPromise(store.get(numericId));
    if (!existing) {
      await transactionDone(transaction);
      return null;
    }
    const updated = { ...existing, ...patch, id: numericId };
    await requestToPromise(store.put(updated));
    await transactionDone(transaction);
    return updated;
  } catch (error) {
    degraded = true;
    const index = memory.history.findIndex(
      (record) => Number(record.id) === numericId,
    );
    if (index === -1) return null;
    memory.history[index] = {
      ...memory.history[index],
      ...patch,
      id: numericId,
    };
    return memory.history[index];
  }
}

export async function listHistory({ keyword = "", limit = 50 } = {}) {
  const needle = keyword.trim().toLowerCase();
  try {
    const db = await openDatabase();
    const transaction = db.transaction(HISTORY_STORE, "readonly");
    const store = transaction.objectStore(HISTORY_STORE);
    const records = await requestToPromise(store.getAll());
    await transactionDone(transaction);
    return records
      .filter((record) => {
        if (!needle) return true;
        return `${record.kind} ${record.title} ${record.detail}`
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, limit);
  } catch (error) {
    degraded = true;
    return memory.history
      .filter((record) => {
        if (!needle) return true;
        return `${record.kind} ${record.title} ${record.detail}`
          .toLowerCase()
          .includes(needle);
      })
      .slice()
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      .slice(0, limit);
  }
}

export async function clearHistory() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    transaction.objectStore(HISTORY_STORE).clear();
    await transactionDone(transaction);
  } catch (error) {
    degraded = true;
  }
  memory.history = [];
}

export async function setSetting(key, value) {
  const record = {
    key: String(key),
    value,
    updated_at: new Date().toISOString(),
  };
  try {
    const db = await openDatabase();
    const transaction = db.transaction(SETTINGS_STORE, "readwrite");
    transaction.objectStore(SETTINGS_STORE).put(record);
    await transactionDone(transaction);
    return record;
  } catch (error) {
    degraded = true;
    memory.settings.set(record.key, record);
    return record;
  }
}

export async function getSetting(key, fallback = null) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(SETTINGS_STORE, "readonly");
    const store = transaction.objectStore(SETTINGS_STORE);
    const record = await requestToPromise(store.get(String(key)));
    await transactionDone(transaction);
    return record ? record.value : fallback;
  } catch (error) {
    degraded = true;
    const record = memory.settings.get(String(key));
    return record ? record.value : fallback;
  }
}

export async function listSettings({ keyword = "" } = {}) {
  const needle = keyword.trim().toLowerCase();
  try {
    const db = await openDatabase();
    const transaction = db.transaction(SETTINGS_STORE, "readonly");
    const store = transaction.objectStore(SETTINGS_STORE);
    const records = await requestToPromise(store.getAll());
    await transactionDone(transaction);
    return records
      .filter((record) => {
        if (!needle) return true;
        return `${record.key} ${JSON.stringify(record.value)}`
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
  } catch (error) {
    degraded = true;
    return Array.from(memory.settings.values()).filter((record) => {
      if (!needle) return true;
      return `${record.key} ${JSON.stringify(record.value)}`
        .toLowerCase()
        .includes(needle);
    });
  }
}

export async function deleteSetting(key) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(SETTINGS_STORE, "readwrite");
    transaction.objectStore(SETTINGS_STORE).delete(String(key));
    await transactionDone(transaction);
  } catch (error) {
    degraded = true;
  }
  memory.settings.delete(String(key));
}

export function prettyValue(value) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}
