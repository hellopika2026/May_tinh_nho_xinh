/**
 * Core Calculator Engine - Máy Tính Nhỏ Xinh (BE - 007-19)
 * Xử lý các phép toán cơ bản, biểu thức phức hợp và chuẩn hóa sai số dấu phẩy động.
 */

function normalizeFloat(value) {
  if (!Number.isFinite(value)) {
    throw new Error('Kết quả phép tính không hợp lệ (Vô cực hoặc NaN)');
  }
  return Number(Math.round(Number(value + 'e12')) + 'e-12');
}

function calculateBinary(a, b, operator) {
  const numA = Number(a);
  const numB = Number(b);

  if (Number.isNaN(numA) || Number.isNaN(numB)) {
    throw new Error('Toán hạng phải là số hợp lệ');
  }

  let rawResult;
  switch (operator) {
    case '+':
      rawResult = numA + numB;
      break;
    case '-':
      rawResult = numA - numB;
      break;
    case '*':
    case 'x':
    case '×':
      rawResult = numA * numB;
      break;
    case '/':
    case '÷':
      if (numB === 0) {
        throw new Error('Không thể chia cho 0');
      }
      rawResult = numA / numB;
      break;
    case '%':
      if (numB === 0) {
        throw new Error('Không thể chia lấy dư cho 0');
      }
      rawResult = numA % numB;
      break;
    case '^':
      rawResult = Math.pow(numA, numB);
      break;
    default:
      throw new Error(`Toán tử không được hỗ trợ: ${operator}`);
  }

  return normalizeFloat(rawResult);
}

/**
 * Bộ phân tích và tính giá trị biểu thức toán học an toàn (Shunting-yard algorithm)
 * Hỗ trợ: +, -, *, /, %, ^, dấu ngoặc (), số âm và số thập phân.
 */
function evaluateExpression(expression) {
  if (typeof expression !== 'string' || !expression.trim()) {
    throw new Error('Biểu thức tính toán không được để trống');
  }

  const sanitized = expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '');

  if (!/^[0-9+\-*/%^().]+$/.test(sanitized)) {
    throw new Error('Biểu thức chứa ký tự không hợp lệ');
  }

  const tokens = [];
  let i = 0;
  while (i < sanitized.length) {
    const ch = sanitized[i];

    // Xử lý dấu âm hoặc dương một ngôi (unary +/-)
    const isUnary =
      (ch === '-' || ch === '+') &&
      (i === 0 || ['+', '-', '*', '/', '%', '^', '('].includes(sanitized[i - 1]));

    if (/[0-9.]/.test(ch) || (isUnary && /[0-9.]/.test(sanitized[i + 1] || ''))) {
      let numStr = ch;
      i++;
      while (i < sanitized.length && /[0-9.]/.test(sanitized[i])) {
        numStr += sanitized[i];
        i++;
      }
      if ((numStr.match(/\./g) || []).length > 1) {
        throw new Error(`Số thập phân không hợp lệ: ${numStr}`);
      }
      tokens.push({ type: 'number', value: parseFloat(numStr) });
      continue;
    }

    if (isUnary && sanitized[i + 1] === '(') {
      if (ch === '-') {
        tokens.push({ type: 'number', value: -1 });
        tokens.push({ type: 'operator', value: '*' });
      }
      i++;
      continue;
    }

    if (['+', '-', '*', '/', '%', '^'].includes(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i++;
      continue;
    }

    if (ch === '(' || ch === ')') {
      tokens.push({ type: 'paren', value: ch });
      i++;
      continue;
    }

    throw new Error(`Cú pháp không hợp lệ tại ký tự: ${ch}`);
  }

  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
  const rightAssociative = { '^': true };
  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      outputQueue.push(token);
    } else if (token.type === 'operator') {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type === 'operator' &&
        ((rightAssociative[token.value] &&
          precedence[token.value] < precedence[operatorStack[operatorStack.length - 1].value]) ||
          (!rightAssociative[token.value] &&
            precedence[token.value] <= precedence[operatorStack[operatorStack.length - 1].value]))
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token.type === 'paren' && token.value === '(') {
      operatorStack.push(token);
    } else if (token.type === 'paren' && token.value === ')') {
      let foundOpen = false;
      while (operatorStack.length > 0) {
        const top = operatorStack.pop();
        if (top.type === 'paren' && top.value === '(') {
          foundOpen = true;
          break;
        }
        outputQueue.push(top);
      }
      if (!foundOpen) {
        throw new Error('Dấu ngoặc đóng mở không khớp');
      }
    }
  }

  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    if (top.type === 'paren') {
      throw new Error('Dấu ngoặc đóng mở không khớp');
    }
    outputQueue.push(top);
  }

  const evalStack = [];
  for (const token of outputQueue) {
    if (token.type === 'number') {
      evalStack.push(token.value);
    } else if (token.type === 'operator') {
      if (evalStack.length < 2) {
        throw new Error('Biểu thức thiếu toán hạng');
      }
      const b = evalStack.pop();
      const a = evalStack.pop();
      evalStack.push(calculateBinary(a, b, token.value));
    }
  }

  if (evalStack.length !== 1) {
    throw new Error('Biểu thức không hợp lệ');
  }

  return normalizeFloat(evalStack[0]);
}

module.exports = {
  calculateBinary,
  evaluateExpression,
  normalizeFloat,
};
