// users.js
// Directory of Domain IDs -> User Names.
// Seeded with sample data on first run, then persisted (and editable) via localStorage
// so the list can grow without touching code.

const USERS_STORAGE_KEY = "doubtPortal_users";

const DEFAULT_USERS = [
  { domainId: "jsmith", userName: "John Smith" },
  { domainId: "apatel", userName: "Aditi Patel" },
  { domainId: "rverma", userName: "Rohan Verma" },
  { domainId: "skhan", userName: "Sara Khan" },
  { domainId: "mgupta", userName: "Manish Gupta" },
];

function loadUsers() {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS.slice();
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.error("Could not parse stored users, falling back to defaults.", e);
  }
  return DEFAULT_USERS.slice();
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function getUsers() {
  return loadUsers();
}

function getUserName(domainId) {
  const users = loadUsers();
  const match = users.find((u) => u.domainId === domainId);
  return match ? match.userName : "";
}

function addOrUpdateUser(domainId, userName) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.domainId === domainId);
  if (idx >= 0) {
    users[idx].userName = userName;
  } else {
    users.push({ domainId, userName });
  }
  saveUsers(users);
}

function deleteUser(domainId) {
  const users = loadUsers().filter((u) => u.domainId !== domainId);
  saveUsers(users);
}

function populateDomainDropdown(selectEl) {
  const users = loadUsers();
  // Keep the placeholder option, clear the rest.
  selectEl.innerHTML = '<option value="">Select Domain ID</option>';
  users
    .slice()
    .sort((a, b) => a.domainId.localeCompare(b.domainId))
    .forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.domainId;
      opt.textContent = u.domainId;
      selectEl.appendChild(opt);
    });
}
