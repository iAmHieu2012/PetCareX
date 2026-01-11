const staffModel = require('../models/staffModel');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { handleControllerError } = require('../utils/errorHandler');
const { validateAndConvertTime } = require('../utils/validation');

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

        // Validate time format cho Bác sĩ thú y
        let validatedGioLamViec = gioLamViec;
        let validatedGioNghi = gioNghi;

        if (chucVu === 'Bác sĩ thú y') {
            const gioLamViecValidation = validateAndConvertTime(gioLamViec);
            if (!gioLamViecValidation.isValid) {
                return res.status(400).json(errorResponse(gioLamViecValidation.message));
            }
            validatedGioLamViec = gioLamViecValidation.value;

            const gioNghiValidation = validateAndConvertTime(gioNghi);
            if (!gioNghiValidation.isValid) {
                return res.status(400).json(errorResponse(gioNghiValidation.message));
            }
            validatedGioNghi = gioNghiValidation.value;
        }

        const result = await staffModel.addStaff({
            hoTen,
            email,
            ngaySinh,
            gioiTinh,
            ngayVaoLam: ngayVaoLam || new Date().toISOString().split('T')[0],
            chucVu,
            maChiNhanh,
            gioLamViec: validatedGioLamViec,
            gioNghi: validatedGioNghi,
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

        // Validate time format cho Bác sĩ thú y
        let validatedGioLamViec = gioLamViec;
        let validatedGioNghi = gioNghi;

        if (chucVu === 'Bác sĩ thú y') {
            if (gioLamViec) {
                const gioLamViecValidation = validateAndConvertTime(gioLamViec);
                if (!gioLamViecValidation.isValid) {
                    return res.status(400).json(errorResponse(gioLamViecValidation.message));
                }
                validatedGioLamViec = gioLamViecValidation.value;
            }

            if (gioNghi) {
                const gioNghiValidation = validateAndConvertTime(gioNghi);
                if (!gioNghiValidation.isValid) {
                    return res.status(400).json(errorResponse(gioNghiValidation.message));
                }
                validatedGioNghi = gioNghiValidation.value;
            }
        }

        const result = await staffModel.updateStaff({
            maNhanVien,
            chucVu,
            gioLamViec: validatedGioLamViec,
            gioNghi: validatedGioNghi,
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

// Lấy bảng lương theo chức vụ
const getSalaryTable = async (req, res) => {
    try {
        const salaryTable = await staffModel.getSalaryTable();

        return res.json(successResponse(salaryTable || [], 'Lấy bảng lương thành công'));
    } catch (err) {
        handleControllerError(err, res, 'getSalaryTable');
    }
};

// Điều động nhân viên sang chi nhánh khác
const transferStaff = async (req, res) => {
    try {
        const { maNhanVien } = req.params;
        const { oldBranch, newBranch, newPosition } = req.body;

        if (!maNhanVien || !oldBranch || !newBranch) {
            return res.status(400).json(errorResponse('Thiếu thông tin bắt buộc'));
        }

        if (oldBranch === newBranch) {
            return res.status(400).json(errorResponse('Chi nhánh mới phải khác chi nhánh cũ'));
        }

        const result = await staffModel.transferStaff({
            maNhanVien,
            oldBranch,
            newBranch,
            newPosition
        });

        if (!result) {
            return res.status(404).json(errorResponse('Không tìm thấy nhân viên hoặc lỗi khi điều động'));
        }

        return res.json(successResponse(result, 'Điều động nhân viên thành công'));
    } catch (err) {
        handleControllerError(err, res, 'transferStaff');
    }
};

// Lấy danh sách bác sĩ khả dụng theo chi nhánh và giờ khám
const getAvailableDoctors = async (req, res) => {
    try {
        const { maChiNhanh, gioKham } = req.query;

        if (!maChiNhanh || !gioKham) {
            return res.status(400).json(errorResponse('Thiếu mã chi nhánh hoặc giờ khám'));
        }

        // Validate time format HH:mm:ss
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
        if (!timeRegex.test(gioKham)) {
            return res.status(400).json(errorResponse('Format giờ khám không hợp lệ. Cần HH:mm hoặc HH:mm:ss'));
        }

        // Parse time thành object { hours, minutes, seconds }
        const timeParts = gioKham.split(':');
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = timeParts.length === 3 ? parseInt(timeParts[2], 10) : 0;

        const doctors = await staffModel.getAvailableDoctors(maChiNhanh, { hours, minutes, seconds });

        return res.json(successResponse(doctors || [], 'Lấy danh sách bác sĩ thành công'));
    } catch (err) {
        handleControllerError(err, res, 'getAvailableDoctors');
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
    getStaffHistory,
    getSalaryTable,
    transferStaff,
    getAvailableDoctors
};
