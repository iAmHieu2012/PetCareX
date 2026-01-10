const vaccinationModel = require('../models/vaccinationModel');
const { validateRequired, handleControllerError, successResponse } = require('../utils');

const vaccinationController = {
    // Lấy danh sách vacxin còn lại trong gói
    getAvailableVaccines: async (req, res) => {
        try {
            const { maThuCung, maGoiTiem } = req.params;

            if (!maThuCung || !maGoiTiem) {
                return res.status(400).json({ success: false, message: 'Mã thú cưng và mã gói tiêm là bắt buộc' });
            }

            const vaccines = await vaccinationModel.getAvailableVaccinesInPackage(maThuCung, maGoiTiem);
            res.json(successResponse(vaccines || []));
        } catch (err) {
            return handleControllerError(err, res, 'getAvailableVaccines');
        }
    },

    // Xác nhận lịch hẹn và tạo phiếu tiêm phòng
    confirmAndCreateVaccinationForm: async (req, res) => {
        try {
            const { maLichHen, maChiNhanh, maKhachHang, maThuCung, maBacSi, goiTiem, ngayTiem } = req.body;

            const validation = validateRequired(
                ['maLichHen', 'maChiNhanh', 'maKhachHang', 'maThuCung', 'maBacSi'],
                { maLichHen, maChiNhanh, maKhachHang, maThuCung, maBacSi }
            );
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const result = await vaccinationModel.createVaccinationForm({
                maLichHen,
                maChiNhanh,
                maKhachHang,
                maThuCung,
                maBacSi,
                maGoiTiem: goiTiem,
                ngayTiem: ngayTiem
            });

            return res.status(201).json(successResponse(result, 'Tạo phiếu tiêm phòng thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'confirmAndCreateVaccinationForm');
        }
    },

    // Lấy phiếu tiêm hôm nay
    getTodayVaccinationForms: async (req, res) => {
        try {
            const { maBacSi } = req.params;

            if (!maBacSi) {
                return res.status(400).json({ success: false, message: 'Mã bác sĩ là bắt buộc' });
            }

            const forms = await vaccinationModel.getTodayVaccinationForms(maBacSi);
            res.json(successResponse(forms || []));
        } catch (err) {
            return handleControllerError(err, res, 'getTodayVaccinationForms');
        }
    },

    // Lấy phiếu tiêm đã hoàn tất
    getCompletedVaccinationForms: async (req, res) => {
        try {
            const { maBacSi } = req.params;

            if (!maBacSi) {
                return res.status(400).json({ success: false, message: 'Mã bác sĩ là bắt buộc' });
            }

            const forms = await vaccinationModel.getCompletedVaccinationForms(maBacSi);
            res.json(successResponse(forms || []));
        } catch (err) {
            return handleControllerError(err, res, 'getCompletedVaccinationForms');
        }
    },

    // Lấy phiếu tiêm chưa tới ngày
    getUpcomingVaccinationForms: async (req, res) => {
        try {
            const { maBacSi } = req.params;

            if (!maBacSi) {
                return res.status(400).json({ success: false, message: 'Mã bác sĩ là bắt buộc' });
            }

            const forms = await vaccinationModel.getUpcomingVaccinationForms(maBacSi);
            res.json(successResponse(forms || []));
        } catch (err) {
            return handleControllerError(err, res, 'getUpcomingVaccinationForms');
        }
    },

    // Lấy danh sách tất cả gói tiêm
    getAllPackages: async (req, res) => {
        try {
            const packages = await vaccinationModel.getAllVaccinationPackages();
            return res.status(200).json(successResponse(packages, 'Lấy danh sách gói tiêm thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'getAllPackages');
        }
    },

    // Lấy chi tiết gói tiêm
    getPackageDetail: async (req, res) => {
        try {
            const { maGoiTiem } = req.params;

            if (!maGoiTiem) {
                return res.status(400).json({ success: false, message: 'Mã gói tiêm là bắt buộc' });
            }

            const packageDetail = await vaccinationModel.getPackageDetail(maGoiTiem);
            return res.status(200).json(successResponse(packageDetail, 'Lấy chi tiết gói tiêm thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'getPackageDetail');
        }
    },

    // Đăng ký gói tiêm cho thú cưng
    registerPackage: async (req, res) => {
        try {
            const { maKhachHang, maThuCung, maGoiTiem, maChiNhanh } = req.body;

            const validation = validateRequired(
                ['maKhachHang', 'maThuCung', 'maGoiTiem', 'maChiNhanh'],
                { maKhachHang, maThuCung, maGoiTiem, maChiNhanh }
            );

            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const result = await vaccinationModel.registerVaccinationPackage({
                maKhachHang,
                maThuCung,
                maGoiTiem,
                maChiNhanh
            });

            return res.status(200).json(successResponse(
                { 
                    maPDV: result.maPDV,
                    tongGia: result.tongGia
                },
                result.message
            ));
        } catch (err) {
            return handleControllerError(err, res, 'registerPackage');
        }
    },

    // Thanh toán gói tiêm (tạo hóa đơn)
    checkout: async (req, res) => {
        try {
            const { maPDV, hinhThucThanhToan, khuyenMai } = req.body;

            const validation = validateRequired(['maPDV', 'hinhThucThanhToan'], { maPDV, hinhThucThanhToan });

            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const result = await vaccinationModel.createVaccinationInvoice({
                maPDV,
                hinhThucThanhToan,
                khuyenMai: khuyenMai || 0
            });

            return res.status(200).json(successResponse(
                { 
                    maHD: result.maHD,
                    tongTien: result.tongTien,
                    khuyenMai: result.khuyenMai,
                    tongThanhToan: result.tongThanhToan
                },
                result.message
            ));
        } catch (err) {
            return handleControllerError(err, res, 'checkout');
        }
    },

    // Lấy tất cả phiếu tiêm phòng của bác sĩ
    getPhieuTiemPhongByDoctor: async (req, res) => {
        try {
            const { maBacSi } = req.params;

            if (!maBacSi) {
                return res.status(400).json({ success: false, message: 'Mã bác sĩ là bắt buộc' });
            }

            const vaccines = await vaccinationModel.getPhieuTiemPhongByDoctor(maBacSi);
            return res.status(200).json(successResponse(vaccines, 'Lấy danh sách phiếu tiêm phòng thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'getPhieuTiemPhongByDoctor');
        }
    },

    // Lấy danh sách vacxin trong gói tiêm
    getVaccinesInPackage: async (req, res) => {
        try {
            const { maGoiTiem } = req.params;

            if (!maGoiTiem) {
                return res.status(400).json({ success: false, message: 'Mã gói tiêm là bắt buộc' });
            }

            const vaccines = await vaccinationModel.getVaccinesInPackage(maGoiTiem);
            return res.status(200).json(successResponse(vaccines, 'Lấy danh sách vacxin thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'getVaccinesInPackage');
        }
    },

    // Cập nhật phiếu tiêm phòng
    updatePhieuTiemPhong: async (req, res) => {
        try {
            const { maPhieuDichVu, ngayTiem, maVacxin, lieuLuong } = req.body;

            const validation = validateRequired(
                ['maPhieuDichVu', 'ngayTiem', 'maVacxin', 'lieuLuong'],
                { maPhieuDichVu, ngayTiem, maVacxin, lieuLuong }
            );

            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const result = await vaccinationModel.updatePhieuTiemPhong({
                maPhieuDichVu,
                ngayTiem,
                maVacxin,
                lieuLuong: parseInt(lieuLuong)
            });

            return res.status(200).json(successResponse(result, result.message));
        } catch (err) {
            return handleControllerError(err, res, 'updatePhieuTiemPhong');
        }
    },

    // Xác nhận tiêm chủng
    confirmVaccination: async (req, res) => {
        try {
            const { maPhieuDichVu, maVacxin, lieuLuong } = req.body;

            const validation = validateRequired(
                ['maPhieuDichVu', 'maVacxin', 'lieuLuong'],
                { maPhieuDichVu, maVacxin, lieuLuong }
            );

            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const today = new Date().toISOString().split('T')[0];
            const result = await vaccinationModel.updatePhieuTiemPhong({
                maPhieuDichVu,
                ngayTiem: today,
                maVacxin,
                lieuLuong: parseInt(lieuLuong)
            });

            return res.status(200).json(successResponse(result, 'Xác nhận tiêm chủng thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'confirmVaccination');
        }
    },

    // Lấy lịch sử tiêm phòng của thú cưng
    getPetVaccinationHistory: async (req, res) => {
        try {
            const { maThuCung } = req.params;

            if (!maThuCung) {
                return res.status(400).json({ success: false, message: 'Mã thú cưng là bắt buộc' });
            }

            const history = await vaccinationModel.getPetVaccinationHistory(maThuCung);
            res.json(successResponse(history));
        } catch (err) {
            return handleControllerError(err, res, 'getPetVaccinationHistory');
        }
    }
};

module.exports = vaccinationController;
