const { connectDB } = require('../config/db');
const sql = require('mssql');

const BookingModel = {
    // ========== KHÁCH HÀNG ==========
    // Tạo mới lịch hẹn (gọi SP_KhachHangDatLichHen)
    createBooking: async (booking) => {
        try {
            const pool = await connectDB();
            
            // Generate MaLichHen
            const resultId = await pool.request()
                .query('SELECT COUNT(*) as count FROM LICH_HEN');
            const maLichHen = 'LH' + String(resultId.recordset[0].count + 1).padStart(8, '0');
            
            // Gọi stored procedure SP_KhachHangDatLichHen
            const result = await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .input('ThoiGian', sql.DateTime, new Date(booking.ThoiGian))
                .input('Loai', sql.NVarChar(10), booking.LoaiLichHen)
                .input('MaKH', sql.Char(10), booking.MaKhachHang)
                .input('MaTC', sql.Char(10), booking.MaThuCung)
                .input('MaCN', sql.Char(10), booking.MaChiNhanh)
                .execute('SP_KhachHangDatLichHen');
            
            return {
                success: true,
                bookingId: maLichHen,
                message: 'Đặt lịch hẹn thành công'
            };
        } catch (err) {
            throw new Error('Lỗi tạo lịch hẹn: ' + err.message);
        }
    },

    // ========== NHÂN VIÊN TIẾP TÂN ==========
    // Tạo lịch hẹn với đầy đủ thông tin (gọi SP_ThemLichHen + SP_QuanTriXacNhanLichHen)
    createBookingStaff: async (booking) => {
        try {
            const pool = await connectDB();
            
            // Generate MaLichHen
            const resultId = await pool.request()
                .query('SELECT COUNT(*) as count FROM LICH_HEN');
            const maLichHen = 'LH' + String(resultId.recordset[0].count + 1).padStart(8, '0');
            
            // Gọi SP_ThemLichHen
            const result = await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .input('ThoiGian', sql.DateTime, new Date(booking.ThoiGian))
                .input('TrangThai', sql.NVarChar(15), booking.TrangThai || 'Chờ xác nhận')
                .input('Loai', sql.NVarChar(10), booking.LoaiLichHen)
                .input('MaKH', sql.Char(10), booking.MaKhachHang)
                .input('MaTC', sql.Char(10), booking.MaThuCung)
                .input('MaCN', sql.Char(10), booking.MaChiNhanh)
                .input('MaNVXacNhan', sql.Char(10), booking.MaNhanVienXacNhan || null)
                .input('MaPDV', sql.Char(10), null)
                .execute('SP_ThemLichHen');
            
            // Nếu trạng thái là "Đã xác nhận", gọi thêm SP_QuanTriXacNhanLichHen để tạo phiếu dịch vụ
            let maPhieuDichVu = null;
            if (booking.TrangThai === 'Đã xác nhận' && booking.MaNhanVienXacNhan) {
                const resultPDV = await pool.request()
                    .input('MaLichHen', sql.Char(10), maLichHen)
                    .input('MaNhanVienXacNhan', sql.Char(10), booking.MaNhanVienXacNhan)
                    .execute('SP_QuanTriXacNhanLichHen');
                
                // Lấy MaPhieuDichVu vừa tạo
                const checkPDV = await pool.request()
                    .input('MaLichHen', sql.Char(10), maLichHen)
                    .query('SELECT MaPhieuDichVu FROM LICH_HEN WHERE MaLichHen = @MaLichHen');
                
                if (checkPDV.recordset.length > 0) {
                    maPhieuDichVu = checkPDV.recordset[0].MaPhieuDichVu;
                }
            }
            
            return {
                success: true,
                bookingId: maLichHen,
                phieuDichVuId: maPhieuDichVu,
                message: booking.TrangThai === 'Đã xác nhận' ? 'Tạo lịch hẹn và xác nhận thành công' : 'Tạo lịch hẹn chờ xác nhận thành công'
            };
        } catch (err) {
            throw new Error('Lỗi tạo lịch hẹn: ' + err.message);
        }
    },

    // Lấy tất cả lịch hẹn của khách hàng
    getBookingsByCustomer: async (maKhachHang) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaKhachHang', sql.Char(10), maKhachHang)
                .query(`SELECT 
                    LH.MaLichHen, LH.ThoiGian, LH.TrangThai, LH.LoaiLichHen,
                    TC.TenThuCung, TC.Loai,
                    CN.TenChiNhanh, CN.DiaChi,
                    KH.TenKhachHang
                FROM LICH_HEN LH
                JOIN THU_CUNG TC ON LH.MaThuCung = TC.MaThuCung
                JOIN CHI_NHANH CN ON LH.MaChiNhanh = CN.MaChiNhanh
                JOIN KHACH_HANG KH ON LH.MaKhachHang = KH.MaKhachHang
                WHERE LH.MaKhachHang = @MaKhachHang
                ORDER BY LH.ThoiGian DESC`);
            
            return result.recordset;
        } catch (err) {
            throw new Error('Lỗi lấy danh sách lịch hẹn: ' + err.message);
        }
    },

    // Cập nhật trạng thái lịch hẹn (gọi SP_CapNhatTrangThaiLichHen)
    updateBookingStatus: async (maLichHen, maChiNhanh, trangThai) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .input('MaCN', sql.Char(10), maChiNhanh)
                .input('TrangThaiMoi', sql.NVarChar(15), trangThai)
                .execute('SP_CapNhatTrangThaiLichHen');
            
            return {
                success: true,
                message: 'Cập nhật trạng thái thành công'
            };
        } catch (err) {
            throw new Error('Lỗi cập nhật trạng thái: ' + err.message);
        }
    },

    // Lấy tất cả lịch hẹn (cho admin/nhân viên)
    getAllBookings: async () => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`SELECT 
                    LH.MaLichHen, LH.ThoiGian, LH.TrangThai, LH.LoaiLichHen,
                    TC.TenThuCung, TC.Loai,
                    CN.TenChiNhanh,
                    KH.TenKhachHang, KH.SoDienThoai
                FROM LICH_HEN LH
                JOIN THU_CUNG TC ON LH.MaThuCung = TC.MaThuCung
                JOIN CHI_NHANH CN ON LH.MaChiNhanh = CN.MaChiNhanh
                JOIN KHACH_HANG KH ON LH.MaKhachHang = KH.MaKhachHang
                ORDER BY LH.ThoiGian DESC`);
            
            return result.recordset;
        } catch (err) {
            throw new Error('Lỗi lấy danh sách tất cả lịch hẹn: ' + err.message);
        }
    },

    // Lấy lịch hẹn theo chi nhánh (cho nhân viên tiếp tân)
    getBookingsByBranch: async (maChiNhanh) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaChiNhanh', sql.Char(10), maChiNhanh)
                .query(`SELECT 
                    LH.MaLichHen, LH.ThoiGian, LH.TrangThai, LH.LoaiLichHen,
                    TC.TenThuCung, TC.Loai,
                    CN.TenChiNhanh,
                    KH.TenKhachHang, KH.SoDienThoai
                FROM LICH_HEN LH
                JOIN THU_CUNG TC ON LH.MaThuCung = TC.MaThuCung
                JOIN CHI_NHANH CN ON LH.MaChiNhanh = CN.MaChiNhanh
                JOIN KHACH_HANG KH ON LH.MaKhachHang = KH.MaKhachHang
                WHERE LH.MaChiNhanh = @MaChiNhanh
                ORDER BY LH.ThoiGian ASC`);
            
            return result.recordset;
        } catch (err) {
            throw new Error('Lỗi lấy danh sách lịch hẹn chi nhánh: ' + err.message);
        }
    },

    // Hủy lịch hẹn (gọi SP_CapNhatTrangThaiLichHen với trạng thái "Đã hủy")
    cancelBooking: async (maLichHen, maChiNhanh) => {
        try {
            const pool = await connectDB();
            
            // Kiểm tra xem lịch hẹn có tồn tại hay không
            const checkResult = await pool.request()
                .input('MaLichHen', sql.Char(10), maLichHen)
                .input('MaChiNhanh', sql.Char(10), maChiNhanh)
                .query(`SELECT * FROM LICH_HEN WHERE MaLichHen = @MaLichHen AND MaChiNhanh = @MaChiNhanh`);
            
            if (checkResult.recordset.length === 0) {
                throw new Error('Lịch hẹn không tồn tại');
            }
            
            // Gọi SP_CapNhatTrangThaiLichHen để cập nhật trạng thái thành "Đã hủy"
            const result = await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .input('MaCN', sql.Char(10), maChiNhanh)
                .input('TrangThaiMoi', sql.NVarChar(15), 'Đã hủy')
                .execute('SP_CapNhatTrangThaiLichHen');
            
            return {
                success: true,
                message: 'Hủy lịch hẹn thành công'
            };
        } catch (err) {
            throw new Error('Lỗi hủy lịch hẹn: ' + err.message);
        }
    }
};

module.exports = BookingModel;
