const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateBinary, evaluateExpression } = require('./calculator');
const { createServer } = require('./server');

test('Calculator Core - Phép toán cơ bản (+, -, *, /, %, ^)', () => {
  assert.equal(calculateBinary(10, 5, '+'), 15);
  assert.equal(calculateBinary(10, 5, '-'), 5);
  assert.equal(calculateBinary(10, 5, '*'), 50);
  assert.equal(calculateBinary(10, 5, '/'), 2);
  assert.equal(calculateBinary(10, 3, '%'), 1);
  assert.equal(calculateBinary(2, 3, '^'), 8);
});

test('Calculator Core - Chuẩn hóa sai số dấu phẩy động (0.1 + 0.2 === 0.3)', () => {
  assert.equal(calculateBinary(0.1, 0.2, '+'), 0.3);
  assert.equal(evaluateExpression('0.1 + 0.2'), 0.3);
});

test('Calculator Core - Biểu thức phức hợp & dấu ngoặc', () => {
  assert.equal(evaluateExpression('12 + 8 * 2'), 28);
  assert.equal(evaluateExpression('(12 + 8) * 2'), 40);
  assert.equal(evaluateExpression('-5 + 10 * (3 - 1)'), 15);
  assert.equal(evaluateExpression('100 ÷ 4 × 2'), 50);
});

test('Calculator Core - Bắt lỗi chia cho 0 và biểu thức sai', () => {
  assert.throws(() => calculateBinary(10, 0, '/'), /Không thể chia cho 0/);
  assert.throws(() => evaluateExpression('25 / (5 - 5)'), /Không thể chia cho 0/);
  assert.throws(() => evaluateExpression('10 + * 5'), /Biểu thức thiếu toán hạng/);
});

test('BE HTTP API - POST /api/calculate & GET /api/history', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Test tính biểu thức
    const calcRes = await fetch(`${baseUrl}/api/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression: '(15 + 5) * 3' }),
    });
    const calcData = await calcRes.json();
    assert.equal(calcRes.status, 200);
    assert.equal(calcData.success, true);
    assert.equal(calcData.result, 60);

    // 2. Test lịch sử phép tính
    const histRes = await fetch(`${baseUrl}/api/history`);
    const histData = await histRes.json();
    assert.equal(histRes.status, 200);
    assert.equal(histData.count, 1);
    assert.equal(histData.history[0].result, 60);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
