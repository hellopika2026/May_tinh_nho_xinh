/**
 * Frontend Application Logic - Máy Tính Nhỏ Xinh (FE - 007-18)
 * Kết nối trực tiếp tới Backend API (BE - 007-19) tại http://localhost:3001
 */

const API_BASE_URL = 'http://localhost:3001/api';

const expressionEl = document.getElementById('expression-preview');
const resultEl = document.getElementById('result-output');
const errorEl = document.getElementById('error-message');
const statusBadgeEl = document.getElementById('be-status');
const statusTextEl = document.getElementById('be-status-text');
const historyListEl = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

let currentExpression = '';
let lastResult = 0;
let justCalculated = false;

function updateScreen() {
  expressionEl.textContent = currentExpression || '0';
}

function showError(msg) {
  if (!msg) {
    errorEl.hidden = true;
    errorEl.textContent = '';
    return;
  }
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function setBackendStatus(isOnline) {
  statusBadgeEl.classList.remove('checking', 'online', 'offline');
  if (isOnline) {
    statusBadgeEl.classList.add('online');
    statusTextEl.textContent = 'BE Online (:3001)';
  } else {
    statusBadgeEl.classList.add('offline');
    statusTextEl.textContent = 'BE Offline';
  }
}

async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (res.ok) {
      setBackendStatus(true);
      await loadHistory();
      return true;
    }
  } catch {
    // BE chưa bật hoặc không kết nối được
  }
  setBackendStatus(false);
  return false;
}

async function loadHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/history`);
    if (!res.ok) return;
    const data = await res.json();
    renderHistory(data.history || []);
  } catch {
    // Ignore history error when offline
  }
}

function renderHistory(items) {
  historyListEl.innerHTML = '';
  if (!items || items.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'history-empty';
    emptyLi.textContent = 'Chưa có phép tính nào.';
    historyListEl.appendChild(emptyLi);
    return;
  }

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.title = 'Nhấn để sử dụng lại phép tính này';

    const exprSpan = document.createElement('span');
    exprSpan.className = 'history-expr';
    exprSpan.textContent = `${item.expression} =`;

    const resSpan = document.createElement('span');
    resSpan.className = 'history-res';
    resSpan.textContent = item.result;

    li.appendChild(exprSpan);
    li.appendChild(resSpan);

    li.addEventListener('click', () => {
      currentExpression = String(item.expression);
      resultEl.textContent = String(item.result);
      lastResult = item.result;
      justCalculated = false;
      showError('');
      updateScreen();
    });

    historyListEl.appendChild(li);
  }
}

function appendValue(val) {
  showError('');
  const isOperator = ['+', '-', '×', '÷', '%', '^'].includes(val);

  if (justCalculated) {
    if (isOperator) {
      currentExpression = String(lastResult) + val;
    } else {
      currentExpression = val;
    }
    justCalculated = false;
  } else {
    currentExpression += val;
  }
  updateScreen();
}

function clearAll() {
  currentExpression = '';
  resultEl.textContent = '0';
  justCalculated = false;
  showError('');
  updateScreen();
}

function backspace() {
  showError('');
  if (justCalculated) {
    justCalculated = false;
  }
  currentExpression = currentExpression.slice(0, -1);
  updateScreen();
}

async function submitCalculation() {
  if (!currentExpression.trim()) {
    return;
  }
  showError('');

  try {
    const response = await fetch(`${API_BASE_URL}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: currentExpression }),
    });

    const data = await response.json();
    setBackendStatus(true);

    if (!response.ok || !data.success) {
      showError(data.error || 'Lỗi phép tính từ Backend');
      return;
    }

    lastResult = data.result;
    resultEl.textContent = String(data.result);
    justCalculated = true;
    await loadHistory();
  } catch {
    setBackendStatus(false);
    showError('Không kết nối được Backend API tại http://localhost:3001. Hãy chạy BE server!');
  }
}

async function clearHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/history`, { method: 'DELETE' });
    if (res.ok) {
      renderHistory([]);
    }
  } catch {
    showError('Không thể xóa lịch sử do mất kết nối tới Backend');
  }
}

// Gắn sự kiện click cho bàn phím
document.querySelector('.keypad').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const value = btn.dataset.value;
  const action = btn.dataset.action;

  if (value !== undefined) {
    appendValue(value);
  } else if (action === 'clear') {
    clearAll();
  } else if (action === 'backspace') {
    backspace();
  } else if (action === 'ans') {
    appendValue(String(lastResult));
  } else if (action === 'calculate') {
    submitCalculation();
  }
});

// Hỗ trợ gõ bàn phím máy tính vật lý
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') {
    appendValue(e.key);
  } else if (e.key === '.') {
    appendValue('.');
  } else if (e.key === '+' || e.key === '-') {
    appendValue(e.key);
  } else if (e.key === '*') {
    appendValue('×');
  } else if (e.key === '/') {
    e.preventDefault();
    appendValue('÷');
  } else if (e.key === '%' || e.key === '^' || e.key === '(' || e.key === ')') {
    appendValue(e.key);
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    submitCalculation();
  } else if (e.key === 'Backspace') {
    backspace();
  } else if (e.key === 'Escape') {
    clearAll();
  }
});

clearHistoryBtn.addEventListener('click', clearHistory);
statusBadgeEl.addEventListener('click', checkBackendHealth);

// Khởi chạy kiểm tra kết nối BE ban đầu
checkBackendHealth();
