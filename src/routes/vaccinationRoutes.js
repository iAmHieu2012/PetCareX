const express = require('express');
const router = express.Router();
const vaccinationController = require('../controllers/vaccinationController');

// GET - Lấy danh sách vacxin còn lại trong gói
router.get('/available/:maThuCung/:maGoiTiem', vaccinationController.getAvailableVaccines);

// GET - Lấy lịch sử tiêm phòng của thú cưng
router.get('/pet-history/:maThuCung', vaccinationController.getPetVaccinationHistory);

// PUT - Xác nhận lịch hẹn và tạo phiếu tiêm phòng
router.put('/confirm', vaccinationController.confirmAndCreateVaccinationForm);

// GET - Lấy danh sách tất cả gói tiêm
router.get('/packages', vaccinationController.getAllPackages);

// GET - Lấy chi tiết gói tiêm
router.get('/packages/:maGoiTiem', vaccinationController.getPackageDetail);

// GET - Lấy phiếu tiêm hôm nay
router.get('/today/:maBacSi', vaccinationController.getTodayVaccinationForms);

// GET - Lấy phiếu tiêm đã hoàn tất
router.get('/completed/:maBacSi', vaccinationController.getCompletedVaccinationForms);

// GET - Lấy phiếu tiêm chưa tới ngày
router.get('/upcoming/:maBacSi', vaccinationController.getUpcomingVaccinationForms);

// POST - Đăng ký gói tiêm cho thú cưng
router.post('/register', vaccinationController.registerPackage);

// POST - Thanh toán gói tiêm (tạo hóa đơn)
router.post('/checkout', vaccinationController.checkout);

// GET - Lấy tất cả phiếu tiêm phòng của bác sĩ
router.get('/doctor/:maBacSi', vaccinationController.getPhieuTiemPhongByDoctor);

// GET - Lấy danh sách vacxin trong gói tiêm
router.get('/vaccines/:maGoiTiem', vaccinationController.getVaccinesInPackage);

// POST - Cập nhật phiếu tiêm phòng
router.post('/update', vaccinationController.updatePhieuTiemPhong);

// POST - Xác nhận tiêm
router.post('/confirm-vaccination', vaccinationController.confirmVaccination);

module.exports = router;
