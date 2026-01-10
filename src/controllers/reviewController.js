const reviewModel = require('../models/reviewModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { handleControllerError } = require('../utils/errorHandler');

// Lấy đánh giá theo mã hóa đơn
const getReviewByInvoice = async (req, res) => {
    try {
        const { maHoaDon } = req.params;

        if (!maHoaDon) {
            return res.status(400).json(errorResponse('Thiếu mã hóa đơn'));
        }

        const review = await reviewModel.getReviewByInvoice(maHoaDon);

        if (!review) {
            return res.json(successResponse(null, 'Khách hàng chưa đánh giá'));
        }

        return res.json(successResponse(review, 'Lấy đánh giá thành công'));
    } catch (err) {
        handleControllerError(err, res, 'getReviewByInvoice');
    }
};

// Cập nhật phản hồi quản lí
const updateFeedback = async (req, res) => {
    try {
        const { maHoaDon } = req.params;
        const { phanHoi } = req.body;

        if (!maHoaDon || !phanHoi) {
            return res.status(400).json(errorResponse('Thiếu mã hóa đơn hoặc phản hồi'));
        }

        const result = await reviewModel.updateFeedback(maHoaDon, phanHoi);

        if (!result) {
            return res.status(404).json(errorResponse('Không tìm thấy đánh giá'));
        }

        return res.json(successResponse(result, 'Cập nhật phản hồi thành công'));
    } catch (err) {
        handleControllerError(err, res, 'updateFeedback');
    }
};

module.exports = {
    getReviewByInvoice,
    updateFeedback
};
