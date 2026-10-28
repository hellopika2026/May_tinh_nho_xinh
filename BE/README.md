# Backend (BE) - Máy Tính Nhỏ Xinh (`007-19`)

Backend REST API xử lý tính toán biểu thức toán học, chuẩn hóa sai số dấu phẩy động (`0.1 + 0.2 = 0.3`) và quản lý lịch sử phép tính.

## 1. Cấu trúc File

- `calculator.js`: Core Engine tính toán 2 ngôi (`+`, `-`, `*`, `/`, `%`, `^`) & giải thuật Shunting-yard phân tích biểu thức phức hợp có ngoặc `()`.
- `server.js`: HTTP REST API Server (Cổng mặc định: `3001`, hỗ trợ đầy đủ CORS cho FE).
- `calculator.test.js`: Bộ kiểm thử tự động (Unit Test + HTTP Integration Test).

## 2. Chạy Server & Kiểm thử

```powershell
cd C:\Users\Admin\May_tinh_nho_xinh\BE

# Chạy bộ test tự động
npm test

# Khởi động Server tại http://localhost:3001
npm start
```

## 3. Danh sách API Endpoints

| Method | Endpoint | Mô tả | Payload mẫu |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra trạng thái hoạt động của BE | - |
| `POST` | `/api/calculate` | Tính giá trị biểu thức hoặc phép toán 2 ngôi | `{ "expression": "(12 + 8) * 2" }` hoặc `{ "a": 10, "b": 5, "operator": "+" }` |
| `GET` | `/api/history` | Lấy danh sách lịch sử các phép tính gần nhất | - |
| `DELETE` | `/api/history` | Xóa toàn bộ lịch sử phép tính | - |
