let data = {
  categories: [],
  transactions: [],
  settings: {
    theme: "dark",
    currency: "R$",
  },
};

let viewMode = "separado";
let currentFilterStartDate = null;
let currentFilterEndDate = null;
let newData = null;

window.onload = function () {
  captureClientDateTime();
  loadFromServer();
  applyTheme();
};

function captureClientDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const formattedDateTime = now.toISOString();
  newData = formattedDateTime;
  console.log("Client date and time captured:", newData);
}

function saveToServer() {
  fetch("/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => console.log("Sucesso:", data))
    .catch((error) => console.error("Erro:", error));
}

function loadFromServer() {
  fetch("/load")
    .then((response) => response.json())
    .then((serverData) => {
      if (serverData && serverData.settings) {
        data = serverData;
        updateCategorySelect();

        const todayTransactions = getTodayTransactions();

        displayTransactions(todayTransactions);
        applyTheme();
      } else {
        console.error("Dados do servidor inválidos");
      }
    })
    .catch((error) =>
      console.error("Erro ao carregar dados do servidor:", error)
    );
}

function addCategory() {
  const categoryName = document.getElementById("category-input").value.trim();
  if (categoryName !== "") {
    data.categories.push(categoryName);
    document.getElementById("category-input").value = "";
    updateCategorySelect();
    saveToServer();
  }
}

function updateCategorySelect() {
  const categorySelect = document.getElementById("category-select");
  categorySelect.innerHTML = "";
  data.categories.forEach((category) => {
    const option = document.createElement("option");
    option.text = category;
    option.value = category;
    categorySelect.appendChild(option);
  });
}

function removeCategory() {
  const categorySelect = document.getElementById("category-select");
  const selectedCategory = categorySelect.value;

  if (selectedCategory) {
    data.categories = data.categories.filter(
      (category) => category !== selectedCategory
    );

    updateCategorySelect();
    saveToServer();
  }
}

function addTransaction() {
  const description = document.getElementById("description-input").value.trim();
  const valueInput = document.getElementById("value-input");
  const value = parseFloat(document.getElementById("value-input").value);
  const category = document.getElementById("category-select").value;
  const subcategory = document.getElementById("subcategory-input").value.trim();
  const operation = document.getElementById("operation-select").value;
  let date = document.getElementById("date-input").value;

  if (date === "") {
    date = newData.split("T")[0];
  }

  if (value < 0.01) {
    valueInput.value = 0.01;
    alert("O valor não pode ser negativo.");
    return;
  }

  if (
    description !== "" &&
    !isNaN(value) &&
    category !== "" &&
    subcategory !== "" &&
    operation !== "" &&
    date !== ""
  ) {
    const transaction = {
      description,
      value,
      category,
      subcategory,
      operation,
      date,
    };
    data.transactions.push(transaction);
    document.getElementById("description-input").value = "";
    document.getElementById("subcategory-input").value = "";
    document.getElementById("value-input").value = "";

    applyCurrentFilter();

    saveToServer();
  }
}

function filterTransactions() {
  currentFilterStartDate = document.getElementById("start-date-input").value;
  currentFilterEndDate = document.getElementById("end-date-input").value;

  let filteredTransactions = data.transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const startDateObject = currentFilterStartDate
      ? new Date(currentFilterStartDate)
      : null;
    const endDateObject = currentFilterEndDate
      ? new Date(currentFilterEndDate)
      : null;

    return (
      (!startDateObject || transactionDate >= startDateObject) &&
      (!endDateObject || transactionDate <= endDateObject)
    );
  });

  displayTransactions(filteredTransactions);
}

function displayTransactions(transactions) {
  const tableBody = document.getElementById("table-body");
  tableBody.innerHTML = "";

  let totalEntrada = 0;
  let totalSaida = 0;

  if (transactions.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = viewMode === "agrupado" ? 4 : 7;
    cell.textContent = "Nenhuma transação feita";
    cell.style.textAlign = "center";
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  if (viewMode === "agrupado") {
    transactions = groupTransactions(transactions);
  }

  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  transactions.forEach((transaction) => {
    const row = document.createElement("tr");

    if (viewMode === "separado") {
      const descriptionCell = document.createElement("td");
      descriptionCell.textContent = transaction.description;
      row.appendChild(descriptionCell);
    }

    const valueCell = document.createElement("td");
    let displayValue = transaction.value;
    if (transaction.operation === "saida") {
      displayValue *= -1;
    }
    valueCell.textContent = `${data.settings.currency} ${displayValue
      .toFixed(2)
      .replace(".", ",")}`;
    row.appendChild(valueCell);

    const categoryCell = document.createElement("td");
    categoryCell.textContent = transaction.category;
    row.appendChild(categoryCell);

    const subcategoryCell = document.createElement("td");
    subcategoryCell.textContent = transaction.subcategory;
    row.appendChild(subcategoryCell);

    const operationCell = document.createElement("td");
    operationCell.textContent = transaction.operation;
    row.appendChild(operationCell);

    if (viewMode === "separado") {
      const dateCell = document.createElement("td");
      const [year, month, day] = transaction.date.split("-");
      dateCell.textContent = `${day}/${month}/${year}`;
      row.appendChild(dateCell);

      const removeCell = document.createElement("td");
      const removeButton = document.createElement("button");
      removeButton.textContent = "Deletar";
      removeButton.classList.add("button");
      removeButton.onclick = () => {
        const index = data.transactions.indexOf(transaction);
        if (index !== -1) {
          data.transactions.splice(index, 1);
          applyCurrentFilter();
          saveToServer();
        }
      };
      removeCell.appendChild(removeButton);
      row.appendChild(removeCell);
    }

    tableBody.appendChild(row);

    if (transaction.operation === "entrada") {
      totalEntrada += transaction.value;
    } else {
      totalSaida += transaction.value;
    }
  });

  const totalEntradaElement = document.getElementById("total-entrada");
  const totalEntradaVariant = totalEntradaElement.querySelector(".variant");
  totalEntradaVariant.textContent = `${data.settings.currency} ${totalEntrada
    .toFixed(2)
    .replace(".", ",")}`;
  totalEntradaElement.classList.remove(
    "neutral-text",
    "positive-text",
    "negative-text"
  );

  if (totalEntrada < 0) {
    totalEntradaElement.classList.add("negative-text");
  } else if (totalEntrada === 0) {
    totalEntradaElement.classList.add("neutral-text");
  } else {
    totalEntradaElement.classList.add("positive-text");
  }

  const totalSaidaElement = document.getElementById("total-saida");
  const totalSaidaVariant = totalSaidaElement.querySelector(".variant");
  const totalSaidaNegativo = totalSaida * -1;
  totalSaidaVariant.textContent = `${
    data.settings.currency
  } ${totalSaidaNegativo.toFixed(2).replace(".", ",")}`;
  totalSaidaElement.classList.remove(
    "neutral-text",
    "positive-text",
    "negative-text"
  );

  if (totalSaidaNegativo < 0) {
    totalSaidaElement.classList.add("negative-text");
  } else if (totalSaidaNegativo === 0) {
    totalSaidaElement.classList.add("neutral-text");
  } else {
    totalSaidaElement.classList.add("positive-text");
  }

  const resumoElement = document.getElementById("resumo");
  const resumoVariant = resumoElement.querySelector(".variant");
  const resumoValue = totalEntrada - totalSaida;
  resumoVariant.textContent = `${data.settings.currency} ${resumoValue
    .toFixed(2)
    .replace(".", ",")}`;
  resumoElement.classList.remove(
    "neutral-text",
    "positive-text",
    "negative-text"
  );

  if (resumoValue < 0) {
    resumoElement.classList.add("negative-text");
  } else if (resumoValue === 0) {
    resumoElement.classList.add("neutral-text");
  } else {
    resumoElement.classList.add("positive-text");
  }
}

function groupTransactions(transactions) {
  const grouped = {};

  transactions.forEach((transaction) => {
    const key = `${transaction.subcategory}-${transaction.category}-${transaction.operation}`;
    if (!grouped[key]) {
      grouped[key] = {
        ...transaction,
        value: 0,
      };
    }
    grouped[key].value += transaction.value;
  });

  return Object.values(grouped);
}

function toggleViewMode() {
  const button = document.querySelector('button[onclick="toggleViewMode()"]');
  if (viewMode === "separado") {
    viewMode = "agrupado";
    button.textContent = "Dados Separados";
    document.getElementById("description-header").style.display = "none";
    document.getElementById("date-header").style.display = "none";
    document.getElementById("remove-header").style.display = "none";
  } else {
    viewMode = "separado";
    button.textContent = "Dados Agrupados";
    document.getElementById("description-header").style.display = "";
    document.getElementById("date-header").style.display = "";
    document.getElementById("remove-header").style.display = "";
  }

  applyCurrentFilter();
}

function applyCurrentFilter() {
  let filteredTransactions;

  if (currentFilterStartDate || currentFilterEndDate) {
    filteredTransactions = data.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const startDateObject = currentFilterStartDate
        ? new Date(currentFilterStartDate)
        : null;
      const endDateObject = currentFilterEndDate
        ? new Date(currentFilterEndDate)
        : null;

      return (
        (!startDateObject || transactionDate >= startDateObject) &&
        (!endDateObject || transactionDate <= endDateObject)
      );
    });
  } else {
    filteredTransactions = getTodayTransactions();
  }

  displayTransactions(filteredTransactions);
}

function getTodayTransactions() {
  const today = newData.split("T")[0];
  return data.transactions.filter((transaction) => transaction.date === today);
}

function toggleTheme() {
  if (data.settings.theme === "light") {
    data.settings.theme = "dark";
  } else {
    data.settings.theme = "light";
  }
  applyTheme();
  saveToServer();
}

function applyTheme() {
  if (data.settings.theme === "dark") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
  } else {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
  }
}

updateCategorySelect();
applyCurrentFilter();
