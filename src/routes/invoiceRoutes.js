const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// GET - Lấy chi tiết phiếu dịch vụ (PHẢI TRƯỚC :maKhachHang để tránh match nhầm)
router.get('/phieu/:maPhieuDichVu', invoiceController.getPhieuDichVuDetail);

// GET - Lấy hóa đơn theo chi nhánh (cho manager dashboard)
router.get('/by-branch/:maChiNhanh', invoiceController.getInvoicesByBranch);

// GET - Lấy lịch sử hóa đơn
router.get('/history/:maKhachHang', invoiceController.getInvoiceHistory);

// GET - Lấy tất cả danh sách hóa đơn chờ xác nhận (staff - không filter theo khách hàng)
router.get('/pending-confirmation', invoiceController.getAllPendingConfirmationInvoices);

// GET - Lấy danh sách hóa đơn đã xác nhận bởi nhân viên
router.get('/confirmed/:maNhanVien', invoiceController.getConfirmedInvoicesByStaff);

// GET - Lấy danh sách phiếu dịch vụ chưa thanh toán (legacy)
router.get('/pending/:maKhachHang', invoiceController.getPendingInvoices);

// GET - Lấy TẤT CẢ phiếu dịch vụ (với trạng thái thanh toán) (PHẢI CÓ SẴN)
router.get('/:maKhachHang', invoiceController.getAllPhieuDichVu);

// POST - Tạo hóa đơn mới (Thanh toán)
router.post('/create', invoiceController.createInvoice);

// POST - Hủy hóa đơn
router.post('/cancel', invoiceController.cancelInvoice);

// POST - Xác nhận thanh toán (staff)
router.post('/confirm', invoiceController.confirmPayment);

// POST - Gửi đánh giá
router.post('/review/submit', invoiceController.submitReview);

// GET - Lấy đánh giá
router.get('/review/:maHoaDon/:ngayLap', invoiceController.getReview);

module.exports = router;