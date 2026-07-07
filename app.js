// app.js
// Main UI wiring for the Internal Doubt Management Portal.

document.addEventListener("DOMContentLoaded", () => {
  const domainSelect = document.getElementById("domain");
  const usernameInput = document.getElementById("username");
  const claimNumberInput = document.getElementById("claimNumber");
  const categorySelect = document.getElementById("category");
  const commentInput = document.getElementById("comment");
  const saveBtn = document.getElementById("saveBtn");

  const searchBox = document.getElementById("searchBox");

  const adminPasswordInput = document.getElementById("adminPassword");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const newPasswordInput = document.getElementById("newPassword");
  const changePasswordBtn = document.getElementById("changePasswordBtn");

  const tableBody = document.getElementById("tableBody");
  const recordCount = document.getElementById("recordCount");

  let editingId = null; // track record currently being edited inline

  // ---------- Init ----------
  populateDomainDropdown(domainSelect);
  refreshAdminUI();
  renderTable(getRecords());

  // ---------- Domain -> Username auto-fill ----------
  domainSelect.addEventListener("change", () => {
    usernameInput.value = domainSelect.value ? getUserName(domainSelect.value) : "";
  });

  // ---------- Claim number: digits only, max 9 ----------
  claimNumberInput.addEventListener("input", () => {
    claimNumberInput.value = claimNumberInput.value.replace(/\D/g, "").slice(0, 9);
  });

  // ---------- Save new record ----------
  saveBtn.addEventListener("click", () => {
    const domainId = domainSelect.value;
    const userName = usernameInput.value;
    const claimNumber = claimNumberInput.value;
    const category = categorySelect.value;
    const comment = commentInput.value.trim();

    if (!domainId) {
      alert("Please select a Domain ID.");
      return;
    }
    if (claimNumber.length !== 9) {
      alert("Please enter a valid 9 digit number.");
      return;
    }
    if (!comment) {
      alert("Please write a comment.");
      return;
    }

    addRecord({ domainId, userName, claimNumber, category, comment });

    // Reset form
    domainSelect.value = "";
    usernameInput.value = "";
    claimNumberInput.value = "";
    categorySelect.selectedIndex = 0;
    commentInput.value = "";

    renderTable(searchRecords(searchBox.value));
  });

  // ---------- Search ----------
  searchBox.addEventListener("input", () => {
    renderTable(searchRecords(searchBox.value));
  });

  // ---------- Admin: login / logout / change password ----------
  loginBtn.addEventListener("click", () => {
    const ok = adminLogin(adminPasswordInput.value);
    if (ok) {
      adminPasswordInput.value = "";
      refreshAdminUI();
      renderTable(searchRecords(searchBox.value));
    } else {
      alert("Incorrect password.");
    }
  });

  logoutBtn.addEventListener("click", () => {
    adminLogout();
    editingId = null;
    refreshAdminUI();
    renderTable(searchRecords(searchBox.value));
  });

  changePasswordBtn.addEventListener("click", () => {
    if (!isAdminLoggedIn()) {
      alert("Please log in as admin first.");
      return;
    }
    const changed = changeAdminPassword(newPasswordInput.value);
    if (changed) {
      newPasswordInput.value = "";
      alert("Password changed.");
    } else {
      alert("Enter a new password first.");
    }
  });

  function refreshAdminUI() {
    const loggedIn = isAdminLoggedIn();
    loginBtn.style.display = loggedIn ? "none" : "inline-block";
    adminPasswordInput.style.display = loggedIn ? "none" : "inline-block";
    logoutBtn.style.display = loggedIn ? "inline-block" : "none";
  }

  // ---------- Table rendering ----------
  function renderTable(records) {
    tableBody.innerHTML = "";
    recordCount.textContent = `Total: ${records.length}`;

    if (records.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="7" style="text-align:center;">No records found.</td>`;
      tableBody.appendChild(row);
      return;
    }

    const admin = isAdminLoggedIn();

    records.forEach((record, index) => {
      const row = document.createElement("tr");

      if (editingId === record.id) {
        row.innerHTML = buildEditRow(record, index);
        tableBody.appendChild(row);
        wireEditRow(row, record);
        return;
      }

      row.innerHTML = `
        <td data-label="#">${index + 1}</td>
        <td data-label="Domain ID">${escapeHtml(record.domainId)}</td>
        <td data-label="User Name">${escapeHtml(record.userName)}</td>
        <td data-label="9 Digit Number">${escapeHtml(record.claimNumber)}</td>
        <td data-label="Category">${escapeHtml(record.category)}</td>
        <td data-label="Comment">${escapeHtml(record.comment)}</td>
        <td data-label="Actions" class="actions-cell">
          ${
            admin
              ? `<button class="edit-btn" data-id="${record.id}">Edit</button>
                 <button class="delete-btn" data-id="${record.id}">Delete</button>`
              : `<span class="muted">Admin only</span>`
          }
        </td>
      `;
      tableBody.appendChild(row);
    });

    if (admin) {
      tableBody.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          editingId = btn.dataset.id;
          renderTable(searchRecords(searchBox.value));
        });
      });
      tableBody.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Delete this record?")) {
            deleteRecord(btn.dataset.id);
            renderTable(searchRecords(searchBox.value));
          }
        });
      });
    }
  }

  function buildEditRow(record, index) {
    const categories = [
      "Claim", "Provider", "Bill Type", "Diagnosis Code", "Pos", "DXR Pointer",
      "Modifier", "Pass 2 Processing Issue", "Bill Amount", "History",
      "New Update Doubt (Pass 1)", "New Update Doubt (Pass 2)",
    ];
    const options = categories
      .map((c) => `<option ${c === record.category ? "selected" : ""}>${c}</option>`)
      .join("");

    return `
      <td>${index + 1}</td>
      <td>${escapeHtml(record.domainId)}</td>
      <td>${escapeHtml(record.userName)}</td>
      <td><input class="edit-claim" value="${escapeHtml(record.claimNumber)}" maxlength="9"></td>
      <td><select class="edit-category">${options}</select></td>
      <td><textarea class="edit-comment" rows="2">${escapeHtml(record.comment)}</textarea></td>
      <td class="actions-cell">
        <button class="save-edit-btn">Save</button>
        <button class="cancel-edit-btn">Cancel</button>
      </td>
    `;
  }

  function wireEditRow(row, record) {
    const claimInput = row.querySelector(".edit-claim");
    const categorySel = row.querySelector(".edit-category");
    const commentArea = row.querySelector(".edit-comment");

    claimInput.addEventListener("input", () => {
      claimInput.value = claimInput.value.replace(/\D/g, "").slice(0, 9);
    });

    row.querySelector(".save-edit-btn").addEventListener("click", () => {
      const claimNumber = claimInput.value;
      if (claimNumber.length !== 9) {
        alert("Please enter a valid 9 digit number.");
        return;
      }
      updateRecord(record.id, {
        claimNumber,
        category: categorySel.value,
        comment: commentArea.value.trim(),
      });
      editingId = null;
      renderTable(searchRecords(searchBox.value));
    });

    row.querySelector(".cancel-edit-btn").addEventListener("click", () => {
      editingId = null;
      renderTable(searchRecords(searchBox.value));
    });
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
});
