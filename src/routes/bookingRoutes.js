const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// ========== KHÁCH HÀNG ==========
// POST - Khách hàng tạo lịch hẹn
router.post('/', bookingController.createBooking);

// GET - Lấy lịch hẹn của khách hàng
router.get('/customer/:maKhachHang', bookingController.getMyBookings);

// PUT - Xác nhận lịch hẹn (PHẢI TRƯỚC các route GET khác)
router.put('/confirm', bookingController.confirmBooking);

// PUT - Hủy lịch hẹn
router.put('/cancel', bookingController.cancelBooking);

// ========== NHÂN VIÊN TIẾP TÂN ==========
// POST - Nhân viên tiếp tân tạo lịch hẹn
router.post('/staff', bookingController.createBookingStaff);

// GET - Lấy lịch hẹn theo chi nhánh (PHẢI TRƯỚC route GET '/' chung)
router.get('/branch/:maChiNhanh', bookingController.getBookingsByBranch);

// GET - Lấy tất cả lịch hẹn (admin) - CUỐI CÙNG
router.get('/', bookingController.getAllBookings);

module.exports = router;
