const grid = document.getElementById("customer-grid");
const openTaskButton = document.getElementById("open-task");
const taskModal = document.getElementById("task-modal");
const resolveModal = document.getElementById("resolve-modal");
const closeTask = document.getElementById("close-task");
const closeResolve = document.getElementById("close-resolve");
const taskText = document.getElementById("task-text");
const detectTask = document.getElementById("detect-task");
const saveTask = document.getElementById("save-task");
const manualSelect = document.getElementById("manual-select");
const assignManual = document.getElementById("assign-manual");
const sendUnassigned = document.getElementById("send-unassigned");
const toast = document.getElementById("toast");

let dataStore = { customers: [], unassigned: 0 };

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
};

const openModal = (modal) => {
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = (modal) => {
  modal.setAttribute("aria-hidden", "true");
};

const renderCards = () => {
  grid.innerHTML = "";
  dataStore.customers.forEach((customer) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${customer.logo}" alt="${customer.name} logo" />
      <h3>${customer.name}</h3>
      <p>Aktif görevler anlık olarak güncellenir.</p>
      <span class="count">${customer.openTasks} açık görev</span>
    `;
    grid.appendChild(card);
  });
};

const updateManualOptions = () => {
  manualSelect.innerHTML = dataStore.customers
    .map((customer) => `<option value="${customer.id}">${customer.name}</option>`)
    .join("");
};

const detectCustomer = (text) => {
  const lower = text.toLowerCase();
  return dataStore.customers.find((customer) =>
    customer.keywords.some((keyword) => lower.includes(keyword))
  );
};

const assignTask = (customerId) => {
  const customer = dataStore.customers.find((entry) => entry.id === customerId);
  if (!customer) {
    dataStore.unassigned += 1;
    showToast("Görev diğer kısma gönderildi.");
    return;
  }
  customer.openTasks += 1;
  showToast(`${customer.name} için yeni görev eklendi.`);
};

const resetForm = () => {
  taskText.value = "";
};

openTaskButton.addEventListener("click", () => openModal(taskModal));
closeTask.addEventListener("click", () => closeModal(taskModal));
closeResolve.addEventListener("click", () => closeModal(resolveModal));

detectTask.addEventListener("click", () => {
  const text = taskText.value.trim();
  if (!text) {
    showToast("Görev açıklaması girin.");
    return;
  }
  const found = detectCustomer(text);
  if (found) {
    showToast(`Müşteri algılandı: ${found.name}`);
  } else {
    openModal(resolveModal);
  }
});

saveTask.addEventListener("click", () => {
  const text = taskText.value.trim();
  if (!text) {
    showToast("Görev açıklaması girin.");
    return;
  }
  const found = detectCustomer(text);
  if (found) {
    assignTask(found.id);
    renderCards();
    resetForm();
    closeModal(taskModal);
  } else {
    openModal(resolveModal);
  }
});

assignManual.addEventListener("click", () => {
  assignTask(manualSelect.value);
  renderCards();
  resetForm();
  closeModal(resolveModal);
  closeModal(taskModal);
});

sendUnassigned.addEventListener("click", () => {
  assignTask(null);
  resetForm();
  closeModal(resolveModal);
  closeModal(taskModal);
});

fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    dataStore = data;
    renderCards();
    updateManualOptions();
  })
  .catch(() => {
    showToast("Veriler yüklenemedi.");
  });
