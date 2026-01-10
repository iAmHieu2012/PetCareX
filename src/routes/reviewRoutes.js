const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// GET - Lấy đánh giá theo mã hóa đơn
router.get('/:maHoaDon', authMiddleware.verifyToken, authMiddleware.isManager, reviewController.getReviewByInvoice);

// PUT - Cập nhật phản hồi
router.put('/:maHoaDon/feedback', authMiddleware.verifyToken, authMiddleware.isManager, reviewController.updateFeedback);

module.exports = router;
