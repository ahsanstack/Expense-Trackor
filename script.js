/* DATA */

let transactions =
  JSON.parse(localStorage.getItem("expense_tracker_data")) || [];

let currentType = "expense";

let editingId = null;

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
  return (
    "$" +
    value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
