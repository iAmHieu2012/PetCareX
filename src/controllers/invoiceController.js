const invoiceModel = require('../models/invoiceModel');
const { handleControllerError } = require('../utils/errorHandler');
const { successResponse } = require('../utils/responseFormatter');

// 1. Lấy TẤT CẢ phiếu dịch vụ (với trạng thái thanh toán)
async function getAllPhieuDichVu(req, res) {
    try {
        const { maKhachHang } = req.params;

        if (!maKhachHang) {
            return res.status(400).json({ success: false, message: 'maKhachHang là bắt buộc' });
        }

        const invoices = await invoiceModel.getAllPhieuDichVu(maKhachHang);
        res.json(successResponse(invoices));
    } catch (err) {
        handleControllerError(err, res, 'getAllPhieuDichVu');
    }
}

// 2. Lấy danh sách phiếu dịch vụ chưa thanh toán (legacy)
async function getPendingInvoices(req, res) {
    try {
        const { maKhachHang } = req.params;

        if (!maKhachHang) {
            return res.status(400).json({ success: false, message: 'maKhachHang là bắt buộc' });
        }

        const invoices = await invoiceModel.getPendingInvoices(maKhachHang);
        res.json(successResponse(invoices));
    } catch (err) {
        handleControllerError(err, res, 'getPendingInvoices');
    }
}

// 3. Lấy chi tiết một phiếu dịch vụ
async function getPhieuDichVuDetail(req, res) {
    try {
        const { maPhieuDichVu } = req.params;

        if (!maPhieuDichVu) {
            return res.status(400).json({ success: false, message: 'maPhieuDichVu là bắt buộc' });
        }

        const detail = await invoiceModel.getPhieuDichVuDetail(maPhieuDichVu);

        if (!detail) {
            return res.status(404).json({ success: false, message: 'Phiếu dịch vụ không tồn tại' });
        }

        res.json(successResponse(detail));
    } catch (err) {
        handleControllerError(err, res, 'getPhieuDichVuDetail');
    }
}

// 4. Tạo hóa đơn (Thanh toán)
async function createInvoice(req, res) {
    try {
        const { maPhieuDichVu, maKhachHang, maThuCung, hinhThucThanhToan, diemSuDung, khuyenMai } = req.body;

        if (!maPhieuDichVu || !maKhachHang || !hinhThucThanhToan) {
            return res.status(400).json({ 
                success: false, 
                message: 'maPhieuDichVu, maKhachHang, hinhThucThanhToan là bắt buộc' 
            });
        }

        // Lấy thông tin phiếu dịch vụ
        const detail = await invoiceModel.getPhieuDichVuDetail(maPhieuDichVu);
        if (!detail) {
            return res.status(404).json({ success: false, message: 'Phiếu dịch vụ không tồn tại' });
        }

        // Validate điểm tích lũy
        const diemSuDungSafe = Math.max(0, diemSuDung || 0);
        if (diemSuDungSafe > detail.DiemTichLuy) {
            return res.status(400).json({ 
                success: false, 
                message: `Bạn chỉ có ${detail.DiemTichLuy} điểm tích lũy` 
            });
        }

        const invoiceData = {
            maPhieuDichVu,
            maKhachHang,
            maThuCung,
            tongTien: detail.TongTien,
            hinhThucThanhToan,
            diemSuDung: diemSuDungSafe,
            khuyenMai: khuyenMai || 0
        };

        const result = await invoiceModel.createInvoice(invoiceData);
        res.json(successResponse(result));
    } catch (err) {
        handleControllerError(err, res, 'createInvoice');
    }
}

// 5. Hủy hóa đơn
async function cancelInvoice(req, res) {
    try {
        const { maHoaDon, ngayLap } = req.body;

        if (!maHoaDon || !ngayLap) {
            return res.status(400).json({ success: false, message: 'maHoaDon, ngayLap là bắt buộc' });
        }

        const result = await invoiceModel.cancelInvoice(maHoaDon, ngayLap);
        res.json(successResponse(result));
    } catch (err) {
        handleControllerError(err, res, 'cancelInvoice');
    }
}

// 6. Lấy lịch sử hóa đơn
async function getInvoiceHistory(req, res) {
    try {
        const { maKhachHang } = req.params;

        if (!maKhachHang) {
            return res.status(400).json({ success: false, message: 'maKhachHang là bắt buộc' });
        }

        const history = await invoiceModel.getInvoiceHistory(maKhachHang);
        res.json(successResponse(history));
    } catch (err) {
        handleControllerError(err, res, 'getInvoiceHistory');
    }
}

// 7. Lấy tất cả hóa đơn chờ xác nhận (MaNhanVien IS NULL)
async function getAllPendingConfirmationInvoices(req, res) {
    try {
        const invoices = await invoiceModel.getAllPendingConfirmationInvoices();
        res.json(successResponse(invoices));
    } catch (err) {
        handleControllerError(err, res, 'getAllPendingConfirmationInvoices');
    }
}

// 8. Xác nhận thanh toán (cập nhật MaNhanVien)
async function confirmPayment(req, res) {
    try {
        const { maHoaDon, ngayLap, maNhanVien, hinhThucThanhToan } = req.body;

        if (!maHoaDon || !ngayLap || !maNhanVien) {
            return res.status(400).json({ 
                success: false, 
                message: 'maHoaDon, ngayLap, maNhanVien là bắt buộc' 
            });
        }

        const result = await invoiceModel.confirmPayment(maHoaDon, ngayLap, maNhanVien, hinhThucThanhToan);
        res.json(successResponse(result));
    } catch (err) {
        handleControllerError(err, res, 'confirmPayment');
    }
}

// Get invoices by branch with optional filters
async function getInvoicesByBranch(req, res) {
    try {
        const { maChiNhanh } = req.params;
        const { trangThaiThanhToan, ngayTao } = req.query;

        if (!maChiNhanh) {
            return res.status(400).json({ success: false, message: 'maChiNhanh là bắt buộc' });
        }

        const invoices = await invoiceModel.getInvoicesByBranch(maChiNhanh, trangThaiThanhToan || null, ngayTao || null);
        return res.json(successResponse(invoices, 'Lấy danh sách hóa đơn thành công'));
    } catch (err) {
        handleControllerError(err, res, 'getInvoicesByBranch');
    }
}

module.exports = {
    getAllPhieuDichVu,
    getPendingInvoices,
    getPhieuDichVuDetail,
    createInvoice,
    cancelInvoice,
    getInvoiceHistory,
    getAllPendingConfirmationInvoices,
    confirmPayment,
    getInvoicesByBranch
};
