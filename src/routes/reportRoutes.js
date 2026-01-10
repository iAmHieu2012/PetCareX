const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// 1. Route doanh thu cơ bản (đã có)
router.get('/revenue', reportController.getRevenueReport);

// 2. Route thống kê hiệu suất nhân viên (đã có)
router.get('/staff', reportController.getStaffStats);

// 3. BỔ SUNG: Route thống kê nâng cao (Bác sĩ, lượt khám, phân loại SP/Dịch vụ)
// Endpoint này sẽ xử lý các yêu cầu từ api.getAdvancedReport trong api.js
router.get('/advanced', reportController.getAdvancedStats);

module.exports = router;