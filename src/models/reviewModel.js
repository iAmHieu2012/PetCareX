const { connectDB, sql } = require('../config/db');
const { handleModelError } = require('../utils/errorHandler');

// Lấy đánh giá theo mã hóa đơn
async function getReviewByInvoice(maHoaDon) {
    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('MaHoaDon', sql.Char(10), maHoaDon)
            .query(`
                SELECT 
                    dg.MaHoaDon,
                    dg.NgayLap,
                    dg.DiemChatLuongDichVu,
                    dg.ThaiDoNhanVien,
                    dg.MucDoHaiLong,
                    dg.BinhLuan,
                    dg.PhanHoi,
                    kh.TenKhachHang
                FROM DANH_GIA dg
                JOIN HOA_DON hd ON dg.MaHoaDon = hd.MaHoaDon
                JOIN PHIEU_DICH_VU pdv ON hd.MaPhieuDichVu = pdv.MaPhieuDichVu
                JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                WHERE dg.MaHoaDon = @MaHoaDon
            `);

        return result.recordset[0] || null;
    } catch (err) {
        handleModelError(err, 'getReviewByInvoice');
    }
}

// Cập nhật phản hồi
async function updateFeedback(maHoaDon, phanHoi) {
    try {
        const pool = await connectDB();

        // Kiểm tra đánh giá tồn tại
        const checkReview = await pool.request()
            .input('MaHoaDon', sql.Char(10), maHoaDon)
            .query(`
                SELECT MaHoaDon FROM DANH_GIA
                WHERE MaHoaDon = @MaHoaDon
            `);

        if (checkReview.recordset.length === 0) {
            return null;
        }

        // Cập nhật phản hồi
        await pool.request()
            .input('MaHoaDon', sql.Char(10), maHoaDon)
            .input('PhanHoi', sql.NVarChar(500), phanHoi)
            .query(`
                UPDATE DANH_GIA
                SET PhanHoi = @PhanHoi
                WHERE MaHoaDon = @MaHoaDon
            `);

        return {
            maHoaDon,
            message: 'Cập nhật phản hồi thành công'
        };
    } catch (err) {
        handleModelError(err, 'updateFeedback');
    }
}

module.exports = {
    getReviewByInvoice,
    updateFeedback
};
