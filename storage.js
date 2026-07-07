// storage.js
// Handles persistence of "doubt" records in localStorage.

const RECORDS_STORAGE_KEY = "doubtPortal_records";

function getRecords() {
  const raw = localStorage.getItem(RECORDS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Could not parse stored records.", e);
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function addRecord({ domainId, userName, claimNumber, category, comment }) {
  const records = getRecords();
  const newRecord = {
    id: generateId(),
    domainId,
    userName,
    claimNumber,
    category,
    comment,
    createdAt: new Date().toISOString(),
  };
  records.unshift(newRecord); // newest first
  saveRecords(records);
  return newRecord;
}

function updateRecord(id, updates) {
  const records = getRecords();
  const idx = records.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...updates };
  saveRecords(records);
  return records[idx];
}

function deleteRecord(id) {
  const records = getRecords().filter((r) => r.id !== id);
  saveRecords(records);
}

function searchRecords(query) {
  const q = (query || "").trim().toLowerCase();
  const records = getRecords();
  if (!q) return records;
  return records.filter((r) => {
    return (
      (r.domainId || "").toLowerCase().includes(q) ||
      (r.userName || "").toLowerCase().includes(q) ||
      (r.claimNumber || "").toLowerCase().includes(q) ||
      (r.category || "").toLowerCase().includes(q) ||
      (r.comment || "").toLowerCase().includes(q)
    );
  });
}
