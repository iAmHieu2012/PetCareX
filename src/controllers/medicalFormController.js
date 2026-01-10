const medicalFormModel = require('../models/medicalFormModel');
const { validateRequired, handleControllerError, successResponse } = require('../utils');

const medicalFormController = {
    // Lấy phiếu khám hôm nay
    getTodayMedicalForms: async (req, res) => {
        try {
            const { maBacSi } = req.params;

            if (!maBacSi) {
                return res.status(400).json({ success: false, message: 'Mã bác sĩ là bắt buộc' });
            }

            const forms = await medicalFormModel.getTodayMedicalForms(maBacSi);
            res.json(successResponse(forms || []));
        } catch (err) {
            return handleControllerError(err, res, 'getTodayMedicalForms');
        }
    },

    // Lấy phiếu khám đã hoàn tất
    getCompletedMedicalForms: async (req, res) => {
        try {
            const { maBacSi } = req.params;

            if (!maBacSi) {
                return res.status(400).json({ success: false, message: 'Mã bác sĩ là bắt buộc' });
            }

            const forms = await medicalFormModel.getCompletedMedicalForms(maBacSi);
            res.json(successResponse(forms || []));
        } catch (err) {
            return handleControllerError(err, res, 'getCompletedMedicalForms');
        }
    },

    // Lấy phiếu khám chưa tới ngày
    getUpcomingMedicalForms: async (req, res) => {
        try {
            const { maBacSi } = req.params;

            if (!maBacSi) {
                return res.status(400).json({ success: false, message: 'Mã bác sĩ là bắt buộc' });
            }

            const forms = await medicalFormModel.getUpcomingMedicalForms(maBacSi);
            res.json(successResponse(forms || []));
        } catch (err) {
            return handleControllerError(err, res, 'getUpcomingMedicalForms');
        }
    },

    // Lấy chi tiết phiếu khám bệnh (với toa thuốc)
    getMedicalFormDetail: async (req, res) => {
        try {
            const { maPhieuDichVu } = req.params;

            if (!maPhieuDichVu) {
                return res.status(400).json({ success: false, message: 'Mã phiếu dịch vụ là bắt buộc' });
            }

            const detail = await medicalFormModel.getMedicalFormDetail(maPhieuDichVu);
            
            if (!detail) {
                return res.status(404).json({ success: false, message: 'Phiếu khám bệnh không tồn tại' });
            }

            res.json(successResponse(detail));
        } catch (err) {
            return handleControllerError(err, res, 'getMedicalFormDetail');
        }
    },

    // Xác nhận lịch hẹn và tạo phiếu khám bệnh
    confirmAndCreateMedicalForm: async (req, res) => {
        try {
            const { maLichHen, maChiNhanh, maKhachHang, maThuCung, maBacSi } = req.body;

            const validation = validateRequired(
                ['maLichHen', 'maChiNhanh', 'maKhachHang', 'maThuCung', 'maBacSi'],
                { maLichHen, maChiNhanh, maKhachHang, maThuCung, maBacSi }
            );
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const result = await medicalFormModel.createMedicalForm({
                maLichHen,
                maChiNhanh,
                maKhachHang,
                maThuCung,
                maBacSi
            });

            return res.status(201).json(successResponse(result, 'Tạo phiếu khám bệnh thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'confirmAndCreateMedicalForm');
        }
    },

    // Lấy tất cả phiếu khám bệnh của bác sĩ
    getPhieuKhamBenhByDoctor: async (req, res) => {
        try {
            const { maBacSi } = req.params;

            if (!maBacSi) {
                return res.status(400).json({ success: false, message: 'Mã bác sĩ là bắt buộc' });
            }

            const forms = await medicalFormModel.getPhieuKhamBenhByDoctor(maBacSi);
            res.json(successResponse(forms || []));
        } catch (err) {
            return handleControllerError(err, res, 'getPhieuKhamBenhByDoctor');
        }
    },

    // Cập nhật phiếu khám bệnh
    updatePhieuKhamBenh: async (req, res) => {
        try {
            const { 
                maPhieuDichVu, 
                phiKhamBenh,
                trieuChung, 
                chuanDoan, 
                ngayHenTaiKham, 
                prescriptions 
            } = req.body;

            if (!maPhieuDichVu || !trieuChung || !chuanDoan) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Mã phiếu, triệu chứng và chuẩn đoán là bắt buộc' 
                });
            }

            // 2. Truyền đầy đủ dữ liệu vào Model
            const result = await medicalFormModel.updatePhieuKhamBenh({
                maPhieuDichVu,
                phiKhamBenh: phiKhamBenh || 0,
                trieuChung,
                chuanDoan,
                ngayHenTaiKham,
                prescriptions: prescriptions || []
            });

            res.json(successResponse(result, 'Cập nhật phiếu khám bệnh và toa thuốc thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'updatePhieuKhamBenh');
        }
    },

    // Lấy lịch sử khám bệnh của thú cưng
    getPetMedicalHistory: async (req, res) => {
        try {
            const { maThuCung } = req.params;

            if (!maThuCung) {
                return res.status(400).json({ success: false, message: 'Mã thú cưng là bắt buộc' });
            }

            const detail = await medicalFormModel.getPetMedicalHistory(maThuCung);
            
            res.json(successResponse(detail));
        } catch (err) {
            return handleControllerError(err, res, 'getPetMedicalHistory');
        }
    }
};

module.exports = medicalFormController;
