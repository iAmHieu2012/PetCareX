const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const branchRoutes = require('./routes/branchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

// 1. Middlewares hệ thống
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 2. Định nghĩa API Routes (Phải đặt TRƯỚC static và catch-all)
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customer', customerRoutes);

// 3. Cấu hình thư mục tĩnh
// Khi bạn vào localhost:5000/css/style.css, nó sẽ tìm trong thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// 4. Catch-all Route (Dùng Regex để khớp tất cả trừ API)
// Dùng /.*/ (không có dấu nháy đơn hay kép)
app.get(/.*/, (req, res) => {
    // Nếu đường dẫn KHÔNG bắt đầu bằng /api
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ message: 'API endpoint không tồn tại!' });
    }
});

// 5. Xử lý lỗi toàn cục
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Đã có lỗi xảy ra từ phía Server!' });
});

module.exports = app;