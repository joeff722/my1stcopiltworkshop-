// 這個應用程式負責管理待辦清單的新增、完成與刪除功能。
// 內容會保存到 localStorage，讓頁面重新整理後仍可保留資料。

const STORAGE_KEY = 'todo-list-data';
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoSummary = document.getElementById('todo-summary');

// 讀取 localStorage 中的資料，若不存在則回傳空陣列。
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// 將待辦資料儲存到 localStorage。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 計算未完成項目數量，並更新底部統計文字。
function updateSummary() {
  const remainingCount = todos.filter((todo) => !todo.completed).length;
  todoSummary.textContent = `未完成: ${remainingCount} 項`;
}

// 渲染待辦清單，當列表為空時顯示提示文字。
function renderTodos() {
  if (todos.length === 0) {
    todoList.innerHTML = '<li class="empty-state">還沒有任何待辦事項,新增一個吧!</li>';
    updateSummary();
    return;
  }

  todoList.innerHTML = todos
    .map(
      (todo) => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <div class="todo-content">
            <input
              class="todo-checkbox"
              type="checkbox"
              ${todo.completed ? 'checked' : ''}
              aria-label="標記為完成"
            />
            <span class="todo-text">${escapeHtml(todo.text)}</span>
          </div>
          <button class="todo-delete" type="button" aria-label="刪除待辦">刪除</button>
        </li>
      `
    )
    .join('');

  updateSummary();
}

// 轉義 HTML 字元，避免使用者輸入內容造成 XSS 問題。
function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 新增待辦事項。
function addTodo(event) {
  event.preventDefault();

  const text = todoInput.value.trim();

  // 若輸入內容為空白，直接忽略並保留焦點。
  if (!text) {
    todoInput.value = '';
    todoInput.focus();
    return;
  }

  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
  };

  todos.unshift(newTodo);
  todoInput.value = '';
  saveTodos();
  renderTodos();
  todoInput.focus();
}

// 切換待辦完成狀態。
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
}

// 刪除指定待辦事項。
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// 表單提交時新增待辦。
todoForm.addEventListener('submit', addTodo);

// 透過事件代理處理勾選與刪除行為。
todoList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.todo-delete');
  if (deleteButton) {
    const item = deleteButton.closest('.todo-item');
    if (!item) return;

    const id = Number(item.dataset.id);
    deleteTodo(id);
    return;
  }
});

todoList.addEventListener('change', (event) => {
  const checkbox = event.target.closest('.todo-checkbox');
  if (!checkbox) return;

  const item = checkbox.closest('.todo-item');
  if (!item) return;

  const id = Number(item.dataset.id);
  toggleTodo(id);
});

// 首次載入頁面時，顯示現有資料。
renderTodos();
