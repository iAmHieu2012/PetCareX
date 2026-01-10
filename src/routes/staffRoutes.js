const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST - Thêm nhân viên mới
router.post('/add', authMiddleware.verifyToken, authMiddleware.isManager, staffController.addStaff);

// POST - Xóa nhân viên
router.post('/delete', authMiddleware.verifyToken, authMiddleware.isManager, staffController.deleteStaff);

// PUT - Cập nhật nhân viên
router.put('/:maNhanVien', authMiddleware.verifyToken, authMiddleware.isManager, staffController.updateStaff);

// GET - Lấy danh sách nhân viên theo chi nhánh
router.get('/by-branch/:maChiNhanh', authMiddleware.verifyToken, authMiddleware.isManager, staffController.getStaffByBranch);

// GET - Lấy danh sách quản lí tại chi nhánh
router.get('/managers/:maChiNhanh', authMiddleware.verifyToken, authMiddleware.isManager, staffController.getManagersByBranch);

// GET - Lấy lịch sử điều động của nhân viên
router.get('/history/:maNhanVien', authMiddleware.verifyToken, authMiddleware.isManager, staffController.getStaffHistory);

// GET - Lấy chi tiết nhân viên
router.get('/:maNhanVien', authMiddleware.verifyToken, authMiddleware.isManager, staffController.getStaffDetail);

module.exports = router;
