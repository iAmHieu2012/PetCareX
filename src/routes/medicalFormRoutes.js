const express = require('express');
const router = express.Router();
const medicalFormController = require('../controllers/medicalFormController');

// GET - Lấy phiếu khám hôm nay
router.get('/today/:maBacSi', medicalFormController.getTodayMedicalForms);

// GET - Lấy phiếu khám đã hoàn tất
router.get('/completed/:maBacSi', medicalFormController.getCompletedMedicalForms);

// GET - Lấy phiếu khám chưa tới ngày
router.get('/upcoming/:maBacSi', medicalFormController.getUpcomingMedicalForms);

// GET - Lấy chi tiết phiếu khám bệnh (với toa thuốc)
router.get('/detail/:maPhieuDichVu', medicalFormController.getMedicalFormDetail);

// GET - Lấy lịch sử khám bệnh của thú cưng
router.get('/pet-history/:maThuCung', medicalFormController.getPetMedicalHistory);

// PUT - Xác nhận lịch hẹn và tạo phiếu khám bệnh
router.put('/confirm', medicalFormController.confirmAndCreateMedicalForm);

// GET - Lấy tất cả phiếu khám bệnh của bác sĩ
router.get('/doctor/:maBacSi', medicalFormController.getPhieuKhamBenhByDoctor);

// POST - Cập nhật phiếu khám bệnh
router.post('/update', medicalFormController.updatePhieuKhamBenh);

module.exports = router;
