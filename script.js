const form = document.querySelector("#transaction-form");
const titleInput = document.querySelector("#title");
const amountInput = document.querySelector("#amount");
const typeInput = document.querySelector("#type");

const balanceElement = document.querySelector("#balance");
const incomeElement = document.querySelector("#income");
const expenseElement = document.querySelector("#expense");
const transactionList = document.querySelector("#transaction-list");
const emptyMessage = document.querySelector("#empty-message");

// Load saved transactions
let transactions = [];

try {
  const savedData = localStorage.getItem("transactions");
  const parsedData = savedData ? JSON.parse(savedData) : [];

  if (Array.isArray(parsedData)) {
    transactions = parsedData.filter((item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      Number.isFinite(item.amount) &&
      item.amount > 0 &&
      ["income", "expense"].includes(item.type)
    );
  }
} catch (error) {
  console.error("Could not load saved transactions:", error);
}

// Format amounts as Indian Rupees
function formatMoney(amount) {
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR"
  });
}

// Save data in browser
function saveTransactions() {
  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );
}

// Calculate totals and update the screen
function updateSummary() {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = income - expense;

  incomeElement.textContent = formatMoney(income);
  expenseElement.textContent = formatMoney(expense);
  balanceElement.textContent = formatMoney(balance);
}

// Display all transactions
function renderTransactions() {
  transactionList.replaceChildren();

  emptyMessage.hidden = transactions.length > 0;

  transactions.forEach((item) => {
    const li = document.createElement("li");
    li.className = "transaction";

    const info = document.createElement("div");
    info.className = "transaction-info";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const date = document.createElement("p");
    date.textContent = item.date;

    info.append(title, date);

    const right = document.createElement("div");
    right.className = "transaction-right";

    const amount = document.createElement("span");
    amount.className = `amount ${item.type}`;

    const sign = item.type === "income" ? "+" : "-";
    amount.textContent = sign + formatMoney(item.amount);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";
    deleteButton.setAttribute(
      "aria-label",
      `Delete ${item.title}`
    );

    deleteButton.addEventListener("click", () => {
      deleteTransaction(item.id);
    });

    right.append(amount, deleteButton);
    li.append(info, right);
    transactionList.append(li);
  });
}

// Add a new transaction
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;

  if (
    !title ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !["income", "expense"].includes(type)
  ) {
    alert("Please enter valid transaction details.");
    return;
  }

  const transaction = {
    id: crypto.randomUUID(),
    title: title,
    amount: amount,
    type: type,
    date: new Date().toLocaleDateString("en-IN")
  };

  transactions.unshift(transaction);

  saveTransactions();
  updateSummary();
  renderTransactions();

  form.reset();
  titleInput.focus();
});

// Delete a transaction
function deleteTransaction(id) {
  transactions = transactions.filter(
    (item) => item.id !== id
  );

  saveTransactions();
  updateSummary();
  renderTransactions();
}

// Show saved data when the page opens
updateSummary();
renderTransactions();