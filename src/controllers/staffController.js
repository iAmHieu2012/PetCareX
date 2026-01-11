const staffModel = require('../models/staffModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { handleControllerError } = require('../utils/errorHandler');

// Thêm nhân viên mới
const addStaff = async (req, res) => {
    try {
        const { hoTen, email, ngaySinh, gioiTinh, ngayVaoLam, chucVu, maChiNhanh, gioLamViec, gioNghi, nguoiQuanLi } = req.body;

        // Validation
        if (!hoTen || !email || !ngaySinh || !gioiTinh || !chucVu || !maChiNhanh) {
            return res.status(400).json(errorResponse('Thiếu thông tin bắt buộc'));
        }

        if (chucVu === 'Bác sĩ thú y' && (!gioLamViec || !gioNghi)) {
            return res.status(400).json(errorResponse('Bác sĩ thú y phải có giờ làm việc và giờ nghỉ'));
        }

        const result = await staffModel.addStaff({
            hoTen,
            email,
            ngaySinh,
            gioiTinh,
            ngayVaoLam: ngayVaoLam || new Date().toISOString().split('T')[0],
            chucVu,
            maChiNhanh,
            gioLamViec,
            gioNghi,
            nguoiQuanLi: nguoiQuanLi || null
        });

        return res.json(successResponse(result, 'Thêm nhân viên thành công'));
    } catch (err) {
        handleControllerError(err, res, 'addStaff');
    }
};

// Lấy danh sách tất cả nhân viên
const getAllStaff = async (req, res) => {
    try {
        const staff = await staffModel.getAllStaff();
        return res.json(successResponse(staff || [], 'Lấy danh sách nhân viên thành công'));
    } catch (err) {
        handleControllerError(err, res, 'getAllStaff');
    }
};

// Lấy danh sách nhân viên của chi nhánh
const getStaffByBranch = async (req, res) => {
    try {
        const { maChiNhanh } = req.params;

        if (!maChiNhanh) {
            return res.status(400).json(errorResponse('Thiếu mã chi nhánh'));
        }

        const staff = await staffModel.getStaffByBranch(maChiNhanh);

        return res.json(successResponse(staff || [], 'Lấy danh sách nhân viên thành công'));
    } catch (err) {
        handleControllerError(err, res, 'getStaffByBranch');
    }
};

// Lấy danh sách quản lí của chi nhánh
const getManagersByBranch = async (req, res) => {
    try {
        const { maChiNhanh } = req.params;

        if (!maChiNhanh) {
            return res.status(400).json(errorResponse('Thiếu mã chi nhánh'));
        }

        const managers = await staffModel.getManagersByBranch(maChiNhanh);

        return res.json(successResponse(managers || [], 'Lấy danh sách quản lí thành công'));
    } catch (err) {
        handleControllerError(err, res, 'getManagersByBranch');
    }
};

// Lấy chi tiết nhân viên
const getStaffDetail = async (req, res) => {
    try {
        const { maNhanVien } = req.params;

        if (!maNhanVien) {
            return res.status(400).json(errorResponse('Thiếu mã nhân viên'));
        }

        const staff = await staffModel.getStaffDetail(maNhanVien);

        if (!staff) {
            return res.status(404).json(errorResponse('Không tìm thấy nhân viên'));
        }

        return res.json(successResponse(staff, 'Lấy chi tiết nhân viên thành công'));
    } catch (err) {
        handleControllerError(err, res, 'getStaffDetail');
    }
};

// Xóa nhân viên (soft delete)
const deleteStaff = async (req, res) => {
    try {
        const { maNhanVien, maChiNhanh } = req.body;

        if (!maNhanVien || !maChiNhanh) {
            return res.status(400).json(errorResponse('Thiếu mã nhân viên hoặc mã chi nhánh'));
        }

        const result = await staffModel.deleteStaff(maNhanVien, maChiNhanh);

        if (!result) {
            return res.status(404).json(errorResponse('Không tìm thấy nhân viên'));
        }

        return res.json(successResponse(result, 'Xóa nhân viên thành công'));
    } catch (err) {
        handleControllerError(err, res, 'deleteStaff');
    }
};

// Cập nhật thông tin nhân viên
const updateStaff = async (req, res) => {
    try {
        const { maNhanVien } = req.params;
        const { chucVu, gioLamViec, gioNghi, maChiNhanh } = req.body;

        if (!maNhanVien || !chucVu) {
            return res.status(400).json(errorResponse('Thiếu mã nhân viên hoặc chức vụ'));
        }

        const result = await staffModel.updateStaff({
            maNhanVien,
            chucVu,
            gioLamViec,
            gioNghi,
            maChiNhanh
        });

        if (!result) {
            return res.status(404).json(errorResponse('Không tìm thấy nhân viên'));
        }

        return res.json(successResponse(result, 'Cập nhật nhân viên thành công'));
    } catch (err) {
        handleControllerError(err, res, 'updateStaff');
    }
};

// Lấy lịch sử điều động của nhân viên
const getStaffHistory = async (req, res) => {
    try {
        const { maNhanVien } = req.params;

        if (!maNhanVien) {
            return res.status(400).json(errorResponse('Thiếu mã nhân viên'));
        }

        const history = await staffModel.getStaffHistory(maNhanVien);

        return res.json(successResponse(history || [], 'Lấy lịch sử điều động thành công'));
    } catch (err) {
        handleControllerError(err, res, 'getStaffHistory');
    }
};

module.exports = {
    addStaff,
    getAllStaff,
    getStaffByBranch,
    getManagersByBranch,
    getStaffDetail,
    deleteStaff,
    updateStaff,
    getStaffHistory
};
