const storageKeys = {
  theme: 'qa-practice-theme',
  tasks: 'qa-practice-tasks',
  rememberEmail: 'qa-practice-email',
};

const state = {
  tasks: [],
  users: [],
  products: [
    { id: 1, name: 'Checkout Smoke Pack', category: 'web', price: 39 },
    { id: 2, name: 'Login Regression', category: 'web', price: 29 },
    { id: 3, name: 'Mobile Sanity Kit', category: 'mobile', price: 35 },
    { id: 4, name: 'Payments API Checks', category: 'api', price: 49 },
    { id: 5, name: 'User Profile Contract', category: 'api', price: 44 },
    { id: 6, name: 'Push Notification Flows', category: 'mobile', price: 25 },
    { id: 7, name: 'Admin Panel Suite', category: 'web', price: 59 },
  ],
  page: 1,
  pageSize: 3,
  sortOrder: 'asc',
};

const el = {
  toast: document.getElementById('toast'),
  themeToggle: document.getElementById('theme-toggle'),
  loginForm: document.getElementById('login-form'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  rememberMe: document.getElementById('remember-me'),
  emailError: document.getElementById('email-error'),
  passwordError: document.getElementById('password-error'),
  loginStatus: document.getElementById('login-status'),
  taskForm: document.getElementById('task-form'),
  taskInput: document.getElementById('task-input'),
  taskList: document.getElementById('task-list'),
  fetchUsers: document.getElementById('fetch-users'),
  resetApi: document.getElementById('reset-api'),
  apiStatus: document.getElementById('api-status'),
  usersBody: document.getElementById('users-body'),
  search: document.getElementById('search-input'),
  category: document.getElementById('category-filter'),
  sortPrice: document.getElementById('sort-price'),
  catalog: document.getElementById('catalog-grid'),
  prev: document.getElementById('prev-page'),
  next: document.getElementById('next-page'),
  indicator: document.getElementById('page-indicator'),
};

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.add('show');
  setTimeout(() => el.toast.classList.remove('show'), 1800);
}

function saveTasks() {
  localStorage.setItem(storageKeys.tasks, JSON.stringify(state.tasks));
}

function renderTasks() {
  el.taskList.innerHTML = '';
  state.tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item ${task.done ? 'done' : ''}`;
    li.dataset.testid = `task-item-${task.id}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
      const next = prompt('Update task', task.text);
      if (next !== null) {
        task.text = next.trim() || task.text;
        saveTasks();
        renderTasks();
      }
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      state.tasks = state.tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      renderTasks();
      showToast('Task deleted');
    });

    actions.append(editButton, deleteButton);
    li.append(checkbox, text, actions);
    el.taskList.append(li);
  });
}

function validEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

function handleLogin(event) {
  event.preventDefault();
  const email = el.email.value.trim();
  const password = el.password.value;
  let valid = true;

  el.emailError.textContent = '';
  el.passwordError.textContent = '';
  el.loginStatus.textContent = '';

  if (!validEmail(email)) {
    el.emailError.textContent = 'Enter a valid email address.';
    valid = false;
  }
  if (password.length < 8) {
    el.passwordError.textContent = 'Password must be at least 8 characters.';
    valid = false;
  }

  if (!valid) {
    return;
  }

  const role = email.includes('admin') ? 'Admin' : 'Tester';
  el.loginStatus.textContent = `Logged in as ${role}`;
  if (el.rememberMe.checked) {
    localStorage.setItem(storageKeys.rememberEmail, email);
  } else {
    localStorage.removeItem(storageKeys.rememberEmail);
  }
  showToast('Login successful');
}

function fakeApiFetchUsers() {
  const responseTime = 300 + Math.floor(Math.random() * 1200);
  const shouldFail = Math.random() < 0.35;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('503 Service Unavailable'));
        return;
      }

      resolve([
        { id: 101, name: 'Mia Carter', email: 'mia@example.com', role: 'Tester' },
        { id: 102, name: 'Noah Singh', email: 'noah@example.com', role: 'Automation Lead' },
        { id: 103, name: 'Sophia Chen', email: 'sophia@example.com', role: 'Developer' },
      ]);
    }, responseTime);
  });
}

function renderUsers() {
  el.usersBody.innerHTML = '';
  state.users.forEach((user) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${user.id}</td><td>${user.name}</td><td>${user.email}</td><td>${user.role}</td>`;
    el.usersBody.append(row);
  });
}

async function fetchUsers() {
  el.fetchUsers.disabled = true;
  el.apiStatus.textContent = 'Loading users...';

  try {
    state.users = await fakeApiFetchUsers();
    renderUsers();
    el.apiStatus.textContent = `Loaded ${state.users.length} users`;
  } catch (error) {
    state.users = [];
    renderUsers();
    el.apiStatus.textContent = `Request failed: ${error.message}`;
  } finally {
    el.fetchUsers.disabled = false;
  }
}

function currentProducts() {
  const query = el.search.value.trim().toLowerCase();
  const category = el.category.value;

  let list = state.products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query);
    const matchesCategory = category === 'all' || product.category === category;
    return matchesQuery && matchesCategory;
  });

  list = list.sort((a, b) => (state.sortOrder === 'asc' ? a.price - b.price : b.price - a.price));
  return list;
}

function renderCatalog() {
  const list = currentProducts();
  const totalPages = Math.max(1, Math.ceil(list.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);

  const start = (state.page - 1) * state.pageSize;
  const chunk = list.slice(start, start + state.pageSize);

  el.catalog.innerHTML = '';
  chunk.forEach((product) => {
    const article = document.createElement('article');
    article.className = 'product';
    article.dataset.testid = `product-${product.id}`;
    article.innerHTML = `
      <h3>${product.name}</h3>
      <p>Category: ${product.category}</p>
      <p>Price: $${product.price}</p>
      <button data-action="add">Add to cart</button>
    `;
    article.querySelector('[data-action="add"]').addEventListener('click', () => {
      showToast(`${product.name} added`);
    });
    el.catalog.append(article);
  });

  el.indicator.textContent = `Page ${state.page} / ${totalPages}`;
  el.prev.disabled = state.page <= 1;
  el.next.disabled = state.page >= totalPages;
}

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(storageKeys.theme, theme);
}

function setup() {
  const savedTheme = localStorage.getItem(storageKeys.theme) || 'light';
  applyTheme(savedTheme);

  const savedTasks = localStorage.getItem(storageKeys.tasks);
  if (savedTasks) {
    state.tasks = JSON.parse(savedTasks);
    renderTasks();
  }

  const rememberedEmail = localStorage.getItem(storageKeys.rememberEmail);
  if (rememberedEmail) {
    el.email.value = rememberedEmail;
    el.rememberMe.checked = true;
  }

  el.themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast(`Theme: ${nextTheme}`);
  });

  el.loginForm.addEventListener('submit', handleLogin);

  el.taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = el.taskInput.value.trim();
    if (!text) return;

    state.tasks.unshift({ id: Date.now(), text, done: false });
    el.taskInput.value = '';
    saveTasks();
    renderTasks();
  });

  el.fetchUsers.addEventListener('click', fetchUsers);
  el.resetApi.addEventListener('click', () => {
    state.users = [];
    renderUsers();
    el.apiStatus.textContent = 'Reset complete';
  });

  [el.search, el.category].forEach((node) => {
    node.addEventListener('input', () => {
      state.page = 1;
      renderCatalog();
    });
    node.addEventListener('change', () => {
      state.page = 1;
      renderCatalog();
    });
  });

  el.sortPrice.addEventListener('click', () => {
    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
    el.sortPrice.dataset.order = state.sortOrder;
    el.sortPrice.textContent = `Sort price ${state.sortOrder === 'asc' ? '↑' : '↓'}`;
    renderCatalog();
  });

  el.prev.addEventListener('click', () => {
    state.page -= 1;
    renderCatalog();
  });

  el.next.addEventListener('click', () => {
    state.page += 1;
    renderCatalog();
  });

  renderCatalog();
}

setup();
