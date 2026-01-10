const petModel = require('../models/petModel');
const { validateRequired, validateId, handleControllerError, successResponse, notFoundResponse } = require('../utils');

const petController = {
    // Lấy thông tin chi tiết thú cưng
    getPetDetail: async (req, res) => {
        try {
            const { maThuCung } = req.params;
            
            if (!validateId(maThuCung)) {
                return res.status(400).json({ success: false, message: 'Mã thú cưng không hợp lệ' });
            }

            const result = await petModel.getPetDetail(maThuCung);

            if (!result || result.length === 0) {
                return res.status(404).json(notFoundResponse('Thú cưng'));
            }

            return res.json(successResponse(result[0], 'Lấy thông tin thú cưng thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    // Lấy lịch sử y tế của thú cưng
    getPetMedicalHistory: async (req, res) => {
        try {
            const { maThuCung } = req.params;
            
            if (!validateId(maThuCung)) {
                return res.status(400).json({ success: false, message: 'Mã thú cưng không hợp lệ' });
            }

            const result = await petModel.getMedicalHistory(maThuCung);

            return res.json(successResponse(result, 'Lấy lịch sử y tế thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    // Thêm thú cưng mới
    addPet: async (req, res) => {
        try {
            const { maKhachHang, tenThuCung, loaiThuCung, gioiTinh, ngaySinh } = req.body;

            const validation = validateRequired(['maKhachHang', 'tenThuCung', 'loaiThuCung'], {
                maKhachHang, tenThuCung, loaiThuCung
            });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const result = await petModel.addPet({
                maKhachHang,
                tenThuCung,
                loaiThuCung,
                gioiTinh: gioiTinh || 'Chưa xác định',
                ngaySinh: ngaySinh ? new Date(ngaySinh) : null
            });

            return res.status(201).json(successResponse(result, 'Thêm thú cưng thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    }
};

module.exports = petController;
