/**
 * HTTP REST API Server - Máy Tính Nhỏ Xinh (BE - 007-19)
 * Cung cấp API tính toán và lưu lịch sử phép tính cho Frontend.
 */

const http = require('node:http');
const { calculateBinary, evaluateExpression } = require('./calculator');

const PORT = process.env.PORT || 3001;
const calculationHistory = [];
const MAX_HISTORY = 50;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload, null, 2));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString('utf-8');
      if (body.length > 1e5) {
        reject(new Error('Payload quá lớn'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('JSON đầu vào không hợp lệ'));
      }
    });
    req.on('error', reject);
  });
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // Xử lý CORS Preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      return res.end();
    }

    // 1. GET /api/health - Kiểm tra trạng thái Backend
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        service: 'May_tinh_nho_xinh BE',
        issue: '007-19',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. GET /api/history - Lấy danh sách lịch sử phép tính
    if (req.method === 'GET' && url.pathname === '/api/history') {
      return sendJson(res, 200, {
        success: true,
        count: calculationHistory.length,
        history: calculationHistory,
      });
    }

    // 3. DELETE /api/history - Xóa lịch sử phép tính
    if (req.method === 'DELETE' && url.pathname === '/api/history') {
      calculationHistory.length = 0;
      return sendJson(res, 200, {
        success: true,
        message: 'Đã xóa toàn bộ lịch sử tính toán',
      });
    }

    // 4. POST /api/calculate - Thực hiện phép tính
    if (req.method === 'POST' && url.pathname === '/api/calculate') {
      try {
        const body = await parseJsonBody(req);
        let expressionStr;
        let result;

        if (typeof body.expression === 'string') {
          expressionStr = body.expression.trim();
          result = evaluateExpression(expressionStr);
        } else if (body.a !== undefined && body.b !== undefined && body.operator) {
          expressionStr = `${body.a} ${body.operator} ${body.b}`;
          result = calculateBinary(body.a, body.b, body.operator);
        } else {
          return sendJson(res, 400, {
            success: false,
            error: 'Vui lòng truyền `expression` (ví dụ: "12 + 8 * 2") hoặc bộ `{ a, b, operator }`',
          });
        }

        const entry = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          expression: expressionStr,
          result,
          createdAt: new Date().toISOString(),
        };

        calculationHistory.unshift(entry);
        if (calculationHistory.length > MAX_HISTORY) {
          calculationHistory.pop();
        }

        return sendJson(res, 200, {
          success: true,
          expression: expressionStr,
          result,
          entry,
        });
      } catch (err) {
        return sendJson(res, 400, {
          success: false,
          error: err.message || 'Lỗi tính toán',
        });
      }
    }

    return sendJson(res, 404, {
      success: false,
      error: `Không tìm thấy endpoint: ${req.method} ${url.pathname}`,
    });
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`[BE - 007-19] Server Máy Tính Nhỏ Xinh đang chạy tại http://localhost:${PORT}`);
  });
}

module.exports = { createServer };
