# Frontend (FE) - Máy Tính Nhỏ Xinh (`007-18`)

Giao diện người dùng (UI) của dự án **Máy Tính Nhỏ Xinh**, kết nối trực tiếp tới REST API của Backend (`http://localhost:3001/api`).

## 1. Cấu trúc File

- `index.html`: Bố cục giao diện máy tính & bảng lịch sử tính toán.
- `style.css`: Giao diện Glassmorphism hiện đại, tương thích Desktop & Mobile.
- `app.js`: Logic kết nối API Backend (`/api/health`, `/api/calculate`, `/api/history`), hỗ trợ cả chuột và bàn phím vật lý (`0-9`, `+`, `-`, `*`, `/`, `Enter`, `Backspace`, `Escape`).

## 2. Cách khởi chạy

1. Khởi động Backend Server:
   ```powershell
   cd C:\Users\Admin\May_tinh_nho_xinh\BE
   npm start
   ```
2. Mở trình duyệt tại `http://localhost:3001` (hoặc mở trực tiếp file `C:\Users\Admin\May_tinh_nho_xinh\FE\index.html`).
