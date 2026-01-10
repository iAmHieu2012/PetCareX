const retailModel = require('../models/retailModel');
const invoiceModel = require('../models/invoiceModel');
const { validateRequired, handleControllerError, successResponse } = require('../utils');

const retailController = {
    checkout: async (req, res) => {
        try {
            const { customerId, branchId, cartItems } = req.body;

            const validation = validateRequired(['customerId', 'branchId', 'cartItems'], { 
                customerId, branchId, cartItems 
            });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            if (!Array.isArray(cartItems) || cartItems.length === 0) {
                return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
            }

            // 1. Tạo Phiếu dịch vụ & Phiếu mua hàng (sinh ID tự động)
            const pdvResult = await retailModel.createPDV({
                customerId: customerId,
                branchId: branchId
            });
            
            const maPDV = pdvResult.maPDV;

            // 2. Chèn từng món vào CHI_TIET_MUA_HANG
            for (let i = 0; i < cartItems.length; i++) {
                const item = cartItems[i];
                await retailModel.addDetail({
                    maPDV: maPDV,
                    soThuTu: i + 1,
                    soLuong: item.SoLuong,
                    maSP: item.MaSP
                });
            }

            return res.status(200).json(successResponse(
                { ticketId: maPDV }, 
                "Đã lưu phiếu mua hàng! Vui lòng vào tab Hóa đơn để thanh toán."
            ));
        } catch (err) {
            return handleControllerError(err, res);
        }
    },

    // Lấy hóa đơn chưa xác nhận
    getUnconfirmedInvoices: async (req, res) => {
        try {
            const { maChiNhanh } = req.params;

            const validation = validateRequired(['maChiNhanh'], { maChiNhanh });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const invoices = await retailModel.getUnconfirmedInvoices(maChiNhanh);
            return res.status(200).json(successResponse(invoices, 'Lấy hóa đơn chưa xác nhận thành công'));
        } catch (err) {
            return handleControllerError(err, res);
        }
    },

    // Lấy hóa đơn đã xác nhận
    getConfirmedInvoices: async (req, res) => {
        try {
            const { maChiNhanh } = req.params;

            const validation = validateRequired(['maChiNhanh'], { maChiNhanh });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const invoices = await retailModel.getConfirmedInvoices(maChiNhanh);
            return res.status(200).json(successResponse(invoices, 'Lấy hóa đơn đã xác nhận thành công'));
        } catch (err) {
            return handleControllerError(err, res);
        }
    },

    // Lấy chi tiết hóa đơn
    getInvoiceDetails: async (req, res) => {
        try {
            const { maPhieuDichVu } = req.params;

            const validation = validateRequired(['maPhieuDichVu'], { maPhieuDichVu });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const invoice = await retailModel.getInvoiceDetails(maPhieuDichVu);
            
            if (!invoice) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
            }

            return res.status(200).json(successResponse(invoice, 'Lấy chi tiết hóa đơn thành công'));
        } catch (err) {
            return handleControllerError(err, res);
        }
    },

    // Lấy danh sách sản phẩm trong kho
    getWarehouseInventory: async (req, res) => {
        try {
            const { maChiNhanh } = req.params;

            const validation = validateRequired(['maChiNhanh'], { maChiNhanh });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const inventory = await retailModel.getWarehouseInventory(maChiNhanh);
            return res.status(200).json(successResponse(inventory, 'Lấy danh sách kho hàng thành công'));
        } catch (err) {
            return handleControllerError(err, res);
        }
    },

    // Xác nhận thanh toán
    confirmPayment: async (req, res) => {
        try {
            const { maPhieuDichVu, phuongThucThanhToan, maChiNhanh, maNhanVien } = req.body;

            const validation = validateRequired(
                ['maPhieuDichVu', 'phuongThucThanhToan', 'maChiNhanh', 'maNhanVien'],
                { maPhieuDichVu, phuongThucThanhToan, maChiNhanh, maNhanVien }
            );

            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const result = await retailModel.confirmPayment({
                maPhieuDichVu,
                maNhanVien,
                phuongThucThanhToan
            });

            return res.status(200).json(successResponse(result, 'Xác nhận thanh toán thành công'));
        } catch (err) {
            return handleControllerError(err, res);
        }
    }
};

module.exports = retailController;