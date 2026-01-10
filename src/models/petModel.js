const { connectDB, sql } = require('../config/db');
const { generateMaThuCung } = require('../utils/idGenerator');

const petModel = {
    // Lấy chi tiết thú cưng
    getPetDetail: async (maThuCung) => {
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaThuCung', sql.Char(10), maThuCung)
            .query(`
                SELECT *
                FROM THU_CUNG
                WHERE MaThuCung = @MaThuCung
            `);
        return result.recordset;
    },

    // Lấy lịch sử y tế
    getMedicalHistory: async (maThuCung) => {
        const pool = await connectDB();
        
        const checkups = await pool.request()
            .input('MaThuCung', sql.Char(10), maThuCung)
            .query(`
                SELECT 
                    MaPhieuDichVu,
                    ChuanDoan,
                    NgayHenTaiKham
                FROM PHIEU_KHAM_BENH
                WHERE MaThuCung = @MaThuCung
                ORDER BY NgayHenTaiKham DESC
            `);

        const vaccinations = await pool.request()
            .input('MaThuCung', sql.Char(10), maThuCung)
            .query(`
                SELECT 
                    ptp.MaPhieuDichVu,
                    ptp.NgayTiem,
                    vx.TenVacxin,
                    ptp.LieuLuong
                FROM PHIEU_TIEM_PHONG ptp
                JOIN VACXIN vx ON ptp.MaVacxin = vx.MaVacxin
                WHERE ptp.MaThuCung = @MaThuCung
                ORDER BY ptp.NgayTiem DESC
            `);

        const packages = await pool.request()
            .input('MaThuCung', sql.Char(10), maThuCung)
            .query(`
                SELECT 
                    pdkgt.MaPhieuDichVu,
                    pdkgt.MaGoiTiem,
                    pdkgt.NgayDangKy,
                    gt.ChuKi,
                    gt.LoaiGoiTiem
                FROM PHIEU_DANG_KY_GOI_TIEM pdkgt
                JOIN GOI_TIEM gt ON pdkgt.MaGoiTiem = gt.MaGoiTiem
                WHERE pdkgt.MaThuCung = @MaThuCung
                ORDER BY pdkgt.NgayDangKy DESC
            `);

        return {
            checkups: checkups.recordset,
            vaccinations: vaccinations.recordset,
            packages: packages.recordset
        };
    },

    // Thêm thú cưng
    addPet: async (data) => {
        const pool = await connectDB();
        
        // Generate MaThuCung
        const maThuCung = await generateMaThuCung(pool);
        
        const result = await pool.request()
            .input('MaThuCung', sql.Char(10), maThuCung)
            .input('TenThuCung', sql.NVarChar(30), data.tenThuCung)
            .input('Loai', sql.NVarChar(20), data.loaiThuCung)
            .input('Giong', sql.NVarChar(20), data.giong || null)
            .input('NgaySinh', sql.Date, data.ngaySinh ? new Date(data.ngaySinh) : null)
            .input('GioiTinh', sql.NVarChar(3), data.gioiTinh || 'Chưa xác định')
            .input('MaKhachHang', sql.Char(10), data.maKhachHang)
            .execute('SP_ThemThuCung');
        
        return {
            petId: result.recordset?.[0]?.MaThuCung
        };
    }
};

module.exports = petModel;
