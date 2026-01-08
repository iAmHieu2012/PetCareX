const { connectDB } = require('../config/db');
const sql = require('mssql');

const customerController = {
    // Get customer info
    getCustomerInfo: async (req, res) => {
        try {
            const { maKhachHang } = req.params;
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
                return res.status(404).json({ message: 'Khách hàng không tìm thấy' });
            }

            res.json({
                success: true,
                data: result.recordset[0]
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get all pets of customer
    getCustomerPets: async (req, res) => {
        try {
            const { maKhachHang } = req.params;
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

            res.json({
                success: true,
                data: result.recordset
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get pet detail
    getPetDetail: async (req, res) => {
        try {
            const { maThuCung } = req.params;
            const pool = await connectDB();

            const result = await pool.request()
                .input('MaTC', sql.Char(10), maThuCung)
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
                    WHERE MaThuCung = @MaTC
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({ message: 'Thú cưng không tìm thấy' });
            }

            res.json({
                success: true,
                data: result.recordset[0]
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Add new pet
    addPet: async (req, res) => {
        try {
            const { MaKhachHang, TenThuCung, Loai, Giong, NgaySinh, GioiTinh, TinhTrang } = req.body;
            
            if (!MaKhachHang || !TenThuCung || !Loai) {
                return res.status(400).json({ message: 'Thông tin không đầy đủ' });
            }

            const pool = await connectDB();

            // Generate MaThuCung
            const resultId = await pool.request()
                .query('SELECT COUNT(*) as count FROM THU_CUNG');
            const maThuCung = 'TC' + String(resultId.recordset[0].count + 1).padStart(8, '0');

            // Add pet
            await pool.request()
                .input('MaTC', sql.Char(10), maThuCung)
                .input('TenTC', sql.NVarChar(30), TenThuCung)
                .input('Loai', sql.NVarChar(20), Loai)
                .input('Giong', sql.NVarChar(20), Giong || null)
                .input('NgaySinh', sql.Date, NgaySinh || null)
                .input('GioiTinh', sql.NVarChar(3), GioiTinh || null)
                .input('TinhTrang', sql.NVarChar(20), TinhTrang || 'Bình thường')
                .input('MaKH', sql.Char(10), MaKhachHang)
                .query(`
                    INSERT INTO THU_CUNG (MaThuCung, TenThuCung, Loai, Giong, NgaySinh, GioiTinh, TinhTrang, MaKhachHang)
                    VALUES (@MaTC, @TenTC, @Loai, @Giong, @NgaySinh, @GioiTinh, @TinhTrang, @MaKH)
                `);

            res.status(201).json({
                success: true,
                message: 'Thêm thú cưng thành công',
                maThuCung: maThuCung
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get customer bookings
    getCustomerBookings: async (req, res) => {
        try {
            const { maKhachHang } = req.params;
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

            res.json({
                success: true,
                data: result.recordset
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Create booking
    createBooking: async (req, res) => {
        try {
            const { MaKhachHang, MaThuCung, MaChiNhanh, ThoiGian, LoaiLichHen, GhiChu } = req.body;

            if (!MaKhachHang || !MaThuCung || !MaChiNhanh || !ThoiGian || !LoaiLichHen) {
                return res.status(400).json({ message: 'Thông tin không đầy đủ' });
            }

            const pool = await connectDB();

            // Check if pet belongs to customer
            const petCheck = await pool.request()
                .input('MaTC', sql.Char(10), MaThuCung)
                .input('MaKH', sql.Char(10), MaKhachHang)
                .query('SELECT * FROM THU_CUNG WHERE MaThuCung = @MaTC AND MaKhachHang = @MaKH');

            if (petCheck.recordset.length === 0) {
                return res.status(403).json({ message: 'Thú cưng không tồn tại hoặc không thuộc về bạn' });
            }

            // Generate MaLichHen
            const resultId = await pool.request()
                .query('SELECT COUNT(*) as count FROM LICH_HEN');
            const maLichHen = 'LH' + String(resultId.recordset[0].count + 1).padStart(8, '0');

            // Create booking
            const now = new Date();
            await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .input('ThoiGian', sql.DateTime, new Date(ThoiGian))
                .input('TrangThai', sql.NVarChar(15), 'Chờ xác nhận')
                .input('LoaiLichHen', sql.NVarChar(10), LoaiLichHen)
                .input('MaKH', sql.Char(10), MaKhachHang)
                .input('MaTC', sql.Char(10), MaThuCung)
                .input('MaCN', sql.Char(10), MaChiNhanh)
                .query(`
                    INSERT INTO LICH_HEN (MaLichHen, ThoiGian, TrangThai, LoaiLichHen, MaKhachHang, MaThuCung, MaChiNhanh)
                    VALUES (@MaLH, @ThoiGian, @TrangThai, @LoaiLichHen, @MaKH, @MaTC, @MaCN)
                `);

            res.status(201).json({
                success: true,
                message: 'Đặt lịch hẹn thành công',
                maLichHen: maLichHen
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Cancel booking
    cancelBooking: async (req, res) => {
        try {
            const { maLichHen } = req.params;
            const { maKhachHang } = req.body;

            const pool = await connectDB();

            // Verify booking belongs to customer
            const bookingCheck = await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .input('MaKH', sql.Char(10), maKhachHang)
                .query('SELECT * FROM LICH_HEN WHERE MaLichHen = @MaLH AND MaKhachHang = @MaKH');

            if (bookingCheck.recordset.length === 0) {
                return res.status(403).json({ message: 'Lịch hẹn không tồn tại hoặc không thuộc về bạn' });
            }

            // Update status to cancelled
            await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .query(`
                    UPDATE LICH_HEN
                    SET TrangThai = 'Hủy'
                    WHERE MaLichHen = @MaLH
                `);

            res.json({
                success: true,
                message: 'Hủy lịch hẹn thành công'
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = customerController;
