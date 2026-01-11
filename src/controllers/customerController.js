const { connectDB } = require('../config/db');
const sql = require('mssql');
const { validateId, handleControllerError, successResponse, notFoundResponse } = require('../utils');

const customerController = {
    // Get customer info
    getCustomerInfo: async (req, res) => {
        try {
            const { maKhachHang } = req.params;
            
            if (!validateId(maKhachHang)) {
                return res.status(400).json({ success: false, message: 'Mã khách hàng không hợp lệ' });
            }

            const pool = await connectDB();

            const result = await pool.request()
                .input('MaKH', sql.Char(10), maKhachHang)
                .query(`
                    SELECT 
                        MaKhachHang,
                        TenKhachHang,
                        SoDienThoai,
                        Email,
                        CCCD,
                        GioiTinh,
                        DiemTichLuy
                    FROM KHACH_HANG
                    WHERE MaKhachHang = @MaKH
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json(notFoundResponse('Khách hàng'));
            }

            return res.json(successResponse(result.recordset[0], 'Lấy thông tin khách hàng thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    },

    // Get all pets of customer
    getCustomerPets: async (req, res) => {
        try {
            const { maKhachHang } = req.params;
            
            if (!validateId(maKhachHang)) {
                return res.status(400).json({ success: false, message: 'Mã khách hàng không hợp lệ' });
            }

            const pool = await connectDB();

            const result = await pool.request()
                .input('MaKH', sql.Char(10), maKhachHang)
                .query(`
                    SELECT 
                        MaThuCung,
                        TenThuCung,
                        Loai,
                        Giong,
                        NgaySinh,
                        GioiTinh,
                        TinhTrang,
                        MaKhachHang
                    FROM THU_CUNG
                    WHERE MaKhachHang = @MaKH
                    ORDER BY TenThuCung
                `);

            return res.json(successResponse(result.recordset, 'Lấy danh sách thú cưng thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    },

    // Get customer bookings
    getCustomerBookings: async (req, res) => {
        try {
            const { maKhachHang } = req.params;
            
            if (!validateId(maKhachHang)) {
                return res.status(400).json({ success: false, message: 'Mã khách hàng không hợp lệ' });
            }

            const pool = await connectDB();

            const result = await pool.request()
                .input('MaKH', sql.Char(10), maKhachHang)
                .query(`
                    SELECT 
                        LH.MaLichHen,
                        LH.ThoiGian,
                        LH.TrangThai,
                        LH.LoaiLichHen,
                        TC.TenThuCung,
                        TC.Loai,
                        CN.TenChiNhanh,
                        CN.DiaChi,
                        KH.TenKhachHang
                    FROM LICH_HEN LH
                    JOIN THU_CUNG TC ON LH.MaThuCung = TC.MaThuCung
                    JOIN CHI_NHANH CN ON LH.MaChiNhanh = CN.MaChiNhanh
                    JOIN KHACH_HANG KH ON LH.MaKhachHang = KH.MaKhachHang
                    WHERE LH.MaKhachHang = @MaKH
                    ORDER BY LH.ThoiGian DESC
                `);

            return res.json(successResponse(result.recordset, 'Lấy danh sách lịch hẹn thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    },

    // Search customers
    searchCustomers: async (req, res) => {
        try {
            const { keyword, q } = req.query;
            const searchQuery = keyword || q;

            if (!searchQuery || searchQuery.length < 2) {
                return res.json(successResponse(null, 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'));
            }

            const pool = await connectDB();

            const result = await pool.request()
                .input('Keyword', sql.NVarChar(50), `%${searchQuery}%`)
                .query(`
                    SELECT TOP 10
                        MaKhachHang,
                        TenKhachHang,
                        SoDienThoai,
                        Email,
                        CCCD,
                        DiemTichLuy
                    FROM KHACH_HANG
                    WHERE TenKhachHang LIKE @Keyword
                       OR SoDienThoai LIKE @Keyword
                       OR Email LIKE @Keyword
                       OR CCCD LIKE @Keyword
                    ORDER BY TenKhachHang
                `);

            // Return first match as single object, or array if multiple
            const customers = result.recordset;
            if (customers.length === 0) {
                return res.json(successResponse(null, 'Không tìm thấy khách hàng'));
            }

            return res.json(successResponse(customers[0], 'Tìm kiếm khách hàng thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    },

    // Get all customers
    getAllCustomers: async (req, res) => {
        try {
            const pool = await connectDB();
            const result = await pool.request().query(`
                SELECT 
                    MaKhachHang,
                    TenKhachHang,
                    SoDienThoai,
                    Email,
                    GioiTinh,
                    DiemTichLuy,
                    (SELECT COUNT(*) FROM THU_CUNG WHERE MaKhachHang = KHACH_HANG.MaKhachHang) AS SoPetCung
                FROM KHACH_HANG
                ORDER BY TenKhachHang
            `);

            return res.json(successResponse(result.recordset, 'Lấy danh sách khách hàng thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    }
};

module.exports = customerController;
