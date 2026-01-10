const { connectDB, sql } = require('../config/db');
const { handleModelError } = require('../utils');
const { generateMaPhieuDichVu, generateMaLichHen } = require('../utils/idGenerator');


const BookingModel = {
    // ========== KHÁCH HÀNG ==========
    // Tạo mới lịch hẹn (gọi SP_KhachHangDatLichHen)
    createBooking: async (booking) => {
        try {
            const pool = await connectDB();
            
            // Generate MaLichHen
            const maLichHen = await generateMaLichHen(pool);;
            
            // Gọi stored procedure SP_KhachHangDatLichHen
            const result = await pool.request()
                .input('MaLichHen', sql.Char(10), maLichHen)
                .input('ThoiGian', sql.DateTime, new Date(booking.ThoiGian))
                .input('LoaiLichHen', sql.NVarChar(10), booking.LoaiLichHen)
                .input('MaKhachHang', sql.Char(10), booking.MaKhachHang)
                .input('MaThuCung', sql.Char(10), booking.MaThuCung)
                .input('MaChiNhanh', sql.Char(10), booking.MaChiNhanh)
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
            const maLichHen = await generateMaLichHen(pool);
            
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
            
            let maPhieuDichVu = null;
            if (booking.TrangThai === 'Đã xác nhận' && booking.MaNhanVienXacNhan) {
                // Gọi SP_CapNhatTrangThaiLichHen để cập nhật trạng thái thành "Đã xác nhận"
                const resultPDV = await pool.request()
                    .input('MaLH', sql.Char(10), maLichHen)
                    .input('MaCN', sql.Char(10), booking.MaChiNhanh)
                    .input('TrangThaiMoi', sql.NVarChar(15), 'Đã xác nhận')
                    .execute('SP_CapNhatTrangThaiLichHen');
                
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

    // Xác nhận lịch hẹn và tạo phiếu dịch vụ (gọi SP_TiepNhanLichHen)
    confirmBooking: async (maLichHen, maChiNhanh, maKhachHang) => {
        try {
            const pool = await connectDB();
            
            // Generate mã Phiếu dịch vụ
            const maPhieuDichVu = await generateMaPhieuDichVu(pool);
                       
            // Gọi SP_TiepNhanLichHen để xác nhận lịch hẹn và tạo phiếu dịch vụ
            const result = await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .input('MaCN', sql.Char(10), maChiNhanh)
                .input('MaPDV_Moi', sql.Char(10), maPhieuDichVu)
                .input('MaKH', sql.Char(10), maKhachHang)
                .execute('SP_TiepNhanLichHen');
                       
            return {
                success: true,
                message: 'Xác nhận lịch hẹn và tạo phiếu dịch vụ thành công',
                maPhieuDichVu: maPhieuDichVu
            };
        } catch (err) {
            throw new Error('Lỗi xác nhận lịch hẹn: ' + err.message);
        }
    },

    // Xác nhận lịch hẹn + tạo phiếu khám bệnh
    confirmAndCreateMedicalForm: async (maLichHen, maChiNhanh, maKhachHang, maThuCung, maBacSi) => {
        try {
            const pool = await connectDB();
            
            const maPhieuDichVu = await generateMaPhieuDichVu(pool);
            
            // 1. SP_TiepNhanLichHen
            await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .input('MaCN', sql.Char(10), maChiNhanh)
                .input('MaPDV_Moi', sql.Char(10), maPhieuDichVu)
                .input('MaKH', sql.Char(10), maKhachHang)
                .execute('SP_TiepNhanLichHen');
            
            // 2. SP_TaoPhieuKhamBenh
            await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPhieuDichVu)
                .input('MaThuCung', sql.Char(10), maThuCung)
                .input('MaBacSi', sql.Char(10), maBacSi)
                .execute('SP_TaoPhieuKhamBenh');
            
            return {
                success: true,
                message: 'Xác nhận lịch hẹn, tạo phiếu dịch vụ và phân công bác sĩ khám bệnh thành công',
                maPhieuDichVu: maPhieuDichVu
            };
        } catch (err) {
            throw new Error('Lỗi xác nhận lịch hẹn và tạo phiếu khám bệnh: ' + err.message);
        }
    },

    // Xác nhận lịch hẹn + tạo phiếu tiêm phòng
    confirmAndCreateVaccinationForm: async (maLichHen, maChiNhanh, maKhachHang, maThuCung, maBacSi, maGoiTiem = null) => {
        try {
            const pool = await connectDB();
            
            const maPhieuDichVu = await generateMaPhieuDichVu(pool);
            
            // 1. SP_TiepNhanLichHen
            await pool.request()
                .input('MaLH', sql.Char(10), maLichHen)
                .input('MaCN', sql.Char(10), maChiNhanh)
                .input('MaPDV_Moi', sql.Char(10), maPhieuDichVu)
                .input('MaKH', sql.Char(10), maKhachHang)
                .execute('SP_TiepNhanLichHen');
            
            // 2. SP_TaoPhieuTiemPhong
            const request = pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPhieuDichVu)
                .input('MaThuCung', sql.Char(10), maThuCung)
                .input('MaBacSi', sql.Char(10), maBacSi);
            
            if (maGoiTiem) {
                request.input('MaGoiTiem', sql.Char(10), maGoiTiem);
            }
            
            await request.execute('SP_TaoPhieuTiemPhong');
            
            return {
                success: true,
                message: 'Xác nhận lịch hẹn, tạo phiếu dịch vụ và phân công bác sĩ tiêm phòng thành công',
                maPhieuDichVu: maPhieuDichVu
            };
        } catch (err) {
            throw new Error('Lỗi xác nhận lịch hẹn và tạo phiếu tiêm phòng: ' + err.message);
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
                    LH.MaLichHen, LH.MaKhachHang, LH.MaThuCung, LH.ThoiGian, LH.TrangThai, LH.LoaiLichHen, LH.MaChiNhanh,
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
    },

    // ========== KIỂM TRA GÓI TIÊM ==========
    // Kiểm tra thú cưng có gói tiêm chưa (cho lịch tiêm phòng)
    checkVaccinePackages: async (maThuCung) => {
        try {
            const pool = await connectDB();
            
            // Lấy danh sách gói tiêm đã mua + hóa đơn đã xác nhận
            const result = await pool
                .request()
                .input('MaThuCung', sql.Char(10), maThuCung)
                .query(`
                    SELECT 
                        pdk.MaPhieuDichVu,
                        pdk.MaGoiTiem,
                        gt.ChuKi,
                        gt.LoaiGoiTiem,
                        hd.MaHoaDon,
                        hd.NgayLap,
                        hd.MaNhanVien,
                        CASE 
                            WHEN hd.MaNhanVien IS NOT NULL THEN N'Đã xác nhận'
                            ELSE N'Chưa xác nhận'
                        END AS TrangThaiHoaDon
                    FROM PHIEU_DANG_KY_GOI_TIEM pdk
                    JOIN GOI_TIEM gt ON pdk.MaGoiTiem = gt.MaGoiTiem
                    JOIN HOA_DON hd ON pdk.MaPhieuDichVu = hd.MaPhieuDichVu
                    WHERE pdk.MaThuCung = @MaThuCung
                    AND hd.MaNhanVien IS NOT NULL
                    AND hd.HinhThucThanhToan IS NOT NULL
                    AND hd.HinhThucThanhToan != N'Đã hủy'
                `);
            
            return result.recordset || [];
        } catch (err) {
            throw new Error('Lỗi kiểm tra gói tiêm: ' + err.message);
        }
    },

    // Kiểm tra thú cưng đã tiêm hết gói chưa (đếm số phiếu tiêm)
    checkVaccineProgress: async (maThuCung, maGoiTiem) => {
        try {
            const pool = await connectDB();
            
            // Lấy số lượng vacxin trong gói tiêm
            const goi = await pool
                .request()
                .input('MaGoiTiem', sql.Char(10), maGoiTiem)
                .query(`
                    SELECT COUNT(*) AS SoLuongVacxin
                    FROM CHI_TIET_GOI_TIEM
                    WHERE MaGoiTiem = @MaGoiTiem
                `);
            
            const soLuongVacxin = goi.recordset[0]?.SoLuongVacxin || 0;
            
            // Đếm số phiếu tiêm đã thực hiện cho thú cưng + gói tiêm này
            const tiem = await pool
                .request()
                .input('MaThuCung', sql.Char(10), maThuCung)
                .input('MaGoiTiem', sql.Char(10), maGoiTiem)
                .query(`
                    SELECT COUNT(*) AS SoPhieuTiemDaLam
                    FROM PHIEU_TIEM_PHONG
                    WHERE MaThuCung = @MaThuCung
                    AND MaGoiTiem = @MaGoiTiem
                `);
            
            const soPhieuTiemDaLam = tiem.recordset[0]?.SoPhieuTiemDaLam || 0;
            
            return {
                soLuongVacxin: soLuongVacxin,
                soPhieuTiemDaLam: soPhieuTiemDaLam,
                conLai: Math.max(0, soLuongVacxin - soPhieuTiemDaLam)
            };
        } catch (err) {
            throw new Error('Lỗi kiểm tra tiến độ tiêm: ' + err.message);
        }
    }
};

module.exports = BookingModel;
