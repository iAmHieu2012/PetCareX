const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 1. Middlewares
app.use(cors()); // Cho phép gọi API từ các domain khác
app.use(express.json()); // Đọc dữ liệu dạng JSON
app.use(express.urlencoded({ extended: true })); // Đọc dữ liệu từ form

// 2. Cấu hình thư mục Public (Frontend tĩnh)
app.use(express.static(path.join(__dirname, 'public')));

// 3. Các Routes (Sau này bạn sẽ thêm vào đây)
// Ví dụ: app.use('/api/pets', require('./routes/petRoutes'));

// Route mặc định cho trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4. Middleware xử lý lỗi (ErrorHandler)
// Tạm thời comment nếu bạn chưa viết code trong errorHandler.js
// const errorHandler = require('./middlewares/errorHandler');
// app.use(errorHandler);

module.exports = app;