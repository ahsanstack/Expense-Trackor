/* DATA */

let transactions =
  JSON.parse(localStorage.getItem("expense_tracker_data")) || [];

let currentType = "expense";

let editingId = null;

/* =========================
   CURRENCY CONFIG
========================== */

const CURRENCIES = {
  USD: { symbol: "$", rate: 1, locale: "en-US" },
  PKR: { symbol: "₨", rate: 278.5, locale: "en-PK" },
  EUR: { symbol: "€", rate: 0.92, locale: "de-DE" },
  GBP: { symbol: "£", rate: 0.79, locale: "en-GB" },
  INR: { symbol: "₹", rate: 83.12, locale: "en-IN" },
  JPY: { symbol: "¥", rate: 151.5, locale: "ja-JP" },
};

let currentCurrency = localStorage.getItem("expense_currency") || "USD";

/* ELEMENTS */

const transactionModal = document.getElementById("transactionModal");

const clearModal = document.getElementById("clearModal");

const form = document.getElementById("transactionForm");

const dateInput = document.getElementById("date");

function setDefaultDate() {
  dateInput.value = new Date().toISOString().split("T")[0];
}

setDefaultDate();

/* CURRENT DATE */

document.getElementById("currentDate").textContent =
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function openAddModal() {
  editingId = null;

  document.getElementById("modalTitle").textContent = "Add Transaction";

  document.getElementById("submitButton").textContent = "Add Transaction";

  form.reset();

  setDefaultDate();

  setType("expense");

  transactionModal.classList.add("show");

  setTimeout(() => {
    document.getElementById("description").focus();
  }, 100);
}

/* EDIT TRANSACTION */

function editTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    return;
  }

  editingId = id;

  document.getElementById("modalTitle").textContent = "Edit Transaction";

  document.getElementById("submitButton").textContent = "Update Transaction";

  document.getElementById("description").value = transaction.description;

  document.getElementById("amount").value = transaction.amount;

  document.getElementById("category").value = transaction.category;

  document.getElementById("date").value = transaction.date;

  setType(transaction.type);

  transactionModal.classList.add("show");
}

/* CLOSE TRANSACTION MODAL */

function closeTransactionModal() {
  transactionModal.classList.remove("show");

  editingId = null;

  form.reset();

  setDefaultDate();

  setType("expense");
}

function closeTransactionOutside(event) {
  if (event.target === transactionModal) {
    closeTransactionModal();
  }
}

/* TYPE */

function setType(type) {
  currentType = type;

  const expenseButton = document.getElementById("expenseType");

  const incomeButton = document.getElementById("incomeType");

  expenseButton.classList.remove("expense-active");

  incomeButton.classList.remove("income-active");

  if (type === "expense") {
    expenseButton.classList.add("expense-active");
  } else {
    incomeButton.classList.add("income-active");
  }
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = document.getElementById("description").value.trim();

  const amount = Number(document.getElementById("amount").value);

  const category = document.getElementById("category").value;

  const date = document.getElementById("date").value;

  if (!description || amount <= 0 || !date) {
    showToast("Please enter valid information.");

    return;
  }

  if (editingId !== null) {
    const index = transactions.findIndex((t) => t.id === editingId);

    if (index !== -1) {
      transactions[index] = {
        id: editingId,

        description: description,

        amount: amount,

        category: category,

        date: date,

        type: currentType,
      };
    }

    saveData();

    renderAll();

    closeTransactionModal();

    showToast("Transaction updated successfully.");

    return;
  }

  /* ADD */

  const transaction = {
    id: Date.now(),

    description: description,

    amount: amount,

    category: category,

    date: date,

    type: currentType,
  };

  transactions.unshift(transaction);

  saveData();

  renderAll();

  closeTransactionModal();

  showToast("Transaction added successfully.");
});

/* DELETE */

function deleteTransaction(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this transaction?",
  );

  if (!confirmed) {
    return;
  }

  transactions = transactions.filter((transaction) => transaction.id !== id);

  saveData();

  renderAll();

  showToast("Transaction deleted.");
}

/* LOCAL STORAGE */

function saveData() {
  localStorage.setItem("expense_tracker_data", JSON.stringify(transactions));
}

function money(value) {
  const currency = CURRENCIES[currentCurrency];

  const converted = value * currency.rate;

  return (
    currency.symbol +
    converted.toLocaleString(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
/* RENDER TRANSACTIONS */

function renderTransactions() {
  const list = document.getElementById("transactionList");

  const search = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const filtered = transactions.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(search) ||
      transaction.category.toLowerCase().includes(search),
  );

  if (filtered.length === 0) {
    list.innerHTML = `
 
            <div class="empty">
 
                ${search ? "No transactions found." : "No transactions yet."}
 
            </div>
 
        `;

    return;
  }

  list.innerHTML = filtered
    .map((transaction) => {
      const sign = transaction.type === "income" ? "+" : "-";

      const amountClass = transaction.type === "income" ? "income" : "expense";

      const formattedDate = new Date(
        transaction.date + "T00:00:00",
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      return `
 
                    <div
                        class="transaction"
                    >
 
                        <div
                            class="
                                transaction-details
                            "
                        >
 
                            <h4>
                                ${escapeHTML(transaction.description)}
                            </h4>
 
 
                            <p>
                                ${escapeHTML(transaction.category)}
                                •
                                ${formattedDate}
                            </p>
 
                        </div>
 
 
                        <div
                            class="
                                transaction-right
                            "
                        >
 
                            <span
                                class="
                                    amount
                                    ${amountClass}
                                "
                            >
                                ${sign}${money(transaction.amount)}
                            </span>
 
 
                            <button
                                class="
                                    transaction-action
                                    edit-btn
                                "
                                onclick="
                                    editTransaction(
                                        ${transaction.id}
                                    )
                                "
                            >
                                Edit
                            </button>
 
 
                            <button
                                class="
                                    transaction-action
                                    delete-btn
                                "
                                onclick="
                                    deleteTransaction(
                                        ${transaction.id}
                                    )
                                "
                            >
                                Delete
                            </button>
 
                        </div>
 
                    </div>
 
                `;
    })
    .join("");
}

function renderSummary() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  document.getElementById("balance").textContent = money(balance);

  document.getElementById("income").textContent = money(income);

  document.getElementById("expenses").textContent = money(expenses);

  document.getElementById("savings").textContent = money(Math.max(balance, 0));

  document.getElementById("chartTotal").textContent = money(expenses);

  document.getElementById("transactionCount").textContent =
    transactions.length +
    (transactions.length === 1 ? " transaction" : " transactions");

  const now = new Date();

  const currentMonth = now.getMonth();

  const currentYear = now.getFullYear();

  const monthExpense = transactions
    .filter((t) => {
      const date = new Date(t.date + "T00:00:00");

      return (
        t.type === "expense" &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  document.getElementById("monthExpense").textContent = money(monthExpense);
}

/* CHART */

function renderChart() {
  const chart = document.getElementById("chart");

  const today = new Date();

  const day = today.getDay();

  const mondayOffset = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);

  monday.setDate(today.getDate() + mondayOffset);

  monday.setHours(0, 0, 0, 0);

  const days = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);

    date.setDate(monday.getDate() + i);

    days.push(date);
  }

  const values = days.map((day) => {
    return transactions
      .filter((t) => {
        if (t.type !== "expense") {
          return false;
        }

        const date = new Date(t.date + "T00:00:00");

        return (
          date.getFullYear() === day.getFullYear() &&
          date.getMonth() === day.getMonth() &&
          date.getDate() === day.getDate()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const max = Math.max(...values, 1);

  chart.innerHTML = values
    .map((value) => {
      const height = Math.max((value / max) * 100, 3);

      return `
 
                    <div
                        class="bar-wrapper"
                    >
 
                        <div
                            class="bar"
                            style="
                                height:
                                ${height}%
                            "
                            data-value="
                                ${money(value)}
                            "
                        ></div>
 
                    </div>
 
                `;
    })
    .join("");
}

/* CATEGORIES */

function renderCategories() {
  const list = document.getElementById("categoryList");

  const totals = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (!totals[t.category]) {
        totals[t.category] = 0;
      }

      totals[t.category] += t.amount;
    });

  const categories = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  if (categories.length === 0) {
    list.innerHTML = `
 
            <div class="empty">
                No expense data yet.
            </div>
 
        `;

    return;
  }

  const total = categories.reduce((sum, item) => sum + item[1], 0);

  list.innerHTML = categories
    .map(([category, amount]) => {
      const percentage = (amount / total) * 100;

      return `
 
                    <div
                        class="
                            category-item
                        "
                    >
 
                        <div
                            class="
                                category-top
                            "
                        >
 
                            <span>
                                ${escapeHTML(category)}
                            </span>
 
 
                            <strong>
                                ${money(amount)}
                            </strong>
 
                        </div>
 
 
                        <div
                            class="progress"
                        >
 
                            <div
                                class="
                                    progress-bar
                                "
                                style="
                                    width:
                                    ${percentage}%
                                "
                            ></div>
 
                        </div>
 
                    </div>
 
                `;
    })
    .join("");
}
/* EXPORT DATA */

function exportData() {
  if (transactions.length === 0) {
    showToast("There is no data to export.");

    return;
  }

  const data = JSON.stringify(transactions, null, 2);

  const blob = new Blob([data], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "expense-tracker-data.json";

  link.click();

  URL.revokeObjectURL(url);

  showToast("Data exported successfully.");
}

/* IMPORT DATA */

function importData(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        throw new Error();
      }

      const valid = imported.every(
        (transaction) =>
          transaction.id &&
          transaction.description &&
          typeof transaction.amount === "number" &&
          transaction.category &&
          transaction.date &&
          (transaction.type === "income" || transaction.type === "expense"),
      );

      if (!valid) {
        throw new Error();
      }

      const confirmed = confirm(
        "Importing this file will replace your current data. Continue?",
      );

      if (!confirmed) {
        event.target.value = "";

        return;
      }

      transactions = imported;

      saveData();

      renderAll();

      showToast("Data imported successfully.");
    } catch {
      showToast("Invalid expense tracker file.");
    }

    event.target.value = "";
  };

  reader.readAsText(file);
}

/* CLEAR ALL */

function openClearModal() {
  if (transactions.length === 0) {
    showToast("There are no transactions to clear.");

    return;
  }

  clearModal.classList.add("show");
}

function closeClearModal() {
  clearModal.classList.remove("show");
}

function closeClearOutside(event) {
  if (event.target === clearModal) {
    closeClearModal();
  }
}

function clearAllData() {
  transactions = [];

  localStorage.removeItem("expense_tracker_data");

  renderAll();

  closeClearModal();

  showToast("All transactions have been cleared.");
}

/* CURRENCY */

function setCurrency(code) {
  currentCurrency = code;

  localStorage.setItem("expense_currency", code);

  renderAll();
}

function loadCurrency() {
  document.getElementById("currencySelect").value = currentCurrency;
}

/* DARK MODE */

function toggleTheme() {
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  localStorage.setItem("expense_theme", dark ? "dark" : "light");

  document.getElementById("themeButton").textContent = dark
    ? "Light Mode"
    : "Dark Mode";
}

function loadTheme() {
  const theme = localStorage.getItem("expense_theme");

  if (theme === "dark") {
    document.body.classList.add("dark");

    document.getElementById("themeButton").textContent = "Light Mode";
  }
}

let toastTimer;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

/* ESCAPE HTML */

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}

/* ESC KEY */

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    if (transactionModal.classList.contains("show")) {
      closeTransactionModal();
    }

    if (clearModal.classList.contains("show")) {
      closeClearModal();
    }
  }
});

function renderAll() {
  renderSummary();

  renderTransactions();

  renderChart();

  renderCategories();
}

loadTheme();

loadCurrency();

renderAll();
