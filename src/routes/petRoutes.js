const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');

// GET - Lấy chi tiết thú cưng
router.get('/detail/:maThuCung', petController.getPetDetail);

// GET - Lấy lịch sử y tế thú cưng
router.get('/history/:maThuCung', petController.getPetMedicalHistory);

// POST - Thêm thú cưng mới
router.post('/', petController.addPet);

module.exports = router;
