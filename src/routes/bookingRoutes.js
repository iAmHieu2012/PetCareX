const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// ========== KHÁCH HÀNG ==========
// POST - Khách hàng tạo lịch hẹn
router.post('/', bookingController.createBooking);

// GET - Lấy lịch hẹn của khách hàng
router.get('/customer/:maKhachHang', bookingController.getMyBookings);

// PUT - Xác nhận lịch hẹn
router.put('/confirm', bookingController.confirmBooking);

// PUT - Hủy lịch hẹn
router.put('/cancel', bookingController.cancelBooking);

// ========== NHÂN VIÊN TIẾP TÂN ==========
// POST - Nhân viên tiếp tân tạo lịch hẹn
router.post('/staff/create', bookingController.createBookingStaff);

// GET - Lấy tất cả lịch hẹn (admin)
router.get('/', bookingController.getAllBookings);

// GET - Lấy lịch hẹn theo chi nhánh (nhân viên tiếp tân)
router.get('/branch/:maChiNhanh', bookingController.getBookingsByBranch);

module.exports = router;
