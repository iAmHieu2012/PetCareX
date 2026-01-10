const { connectDB, sql } = require('../config/db');
const BranchModel = {
    getBranches: async () => {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM CHI_NHANH');
        return result.recordset;
    },
    getServices: async () => {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM DICH_VU');
        return result.recordset;
    },
    getStaffCount: async () => {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT COUNT(*) as count FROM NHAN_VIEN');
        return result.recordset[0].count;
    },
    
    getDoctorsByBranch: async (maChiNhanh) => {
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaChiNhanh', sql.Char(10), maChiNhanh)
            .query(`
                SELECT nv.MaNhanVien, nv.HoTen, nv.ChucVu
                FROM NHAN_VIEN nv
                JOIN BAC_SI_THU_Y bs ON nv.MaNhanVien = bs.MaNhanVien
                WHERE nv.MaChiNhanh = @MaChiNhanh
                ORDER BY nv.HoTen
            `);
        return result.recordset;
    },
    
    getCustomersCount: async () => {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT COUNT(*) as count FROM KHACH_HANG');
        return result.recordset[0].count;
    },
    getAllStaff: async (maNV = null) => {
        const pool = await connectDB();
        const request = pool.request();
        if (maNV) {
            request.input('MaNV', sql.Char(10), maNV);
        } else {
            request.input('MaNV', sql.Char(10), null);
        }
        const result = await request.execute('SP_LayHoSoNhanVien');
        return result.recordset;
    },
    getTransferHistory: async (maNV) => {
        const pool = await connectDB();
        const request = pool.request();
        request.input('MaNV', sql.Char(10), maNV);
        const result = await request.execute('SP_LayLichSuDieuDong');
        return result.recordset;
    },
    getEmployeeIncome: async (maNV, thang, nam) => {
        const pool = await connectDB();
        const request = pool.request();
        request.input('MaNV', sql.Char(10), maNV);
        request.input('Thang', sql.Int, thang);
        request.input('Nam', sql.Int, nam);
        const result = await request.execute('SP_TongHopThuNhap_NhanVien');
        return result.recordset[0];
    },
    getEmployeePerformance: async (maNV, thang, nam) => {
        const pool = await connectDB();
        const request = pool.request();
        request.input('Thang', sql.Int, thang);
        request.input('Nam', sql.Int, nam);
        request.input('MaNV', sql.Char(10), maNV);
        const result = await request.execute('SP_ThongKeHieuSuat_NhanVien');
        return result.recordset[0] || null;
    },
    getAllEmployeesPerformance: async (thang, nam, maNV = null) => {
        const pool = await connectDB();
        const request = pool.request();
        request.input('Thang', sql.Int, thang);
        request.input('Nam', sql.Int, nam);
        request.input('MaNV', sql.Char(10), maNV);
        const result = await request.execute('SP_ThongKeHieuSuat_NhanVien');
        return result.recordset;
    },
    getStaffByBranch: async (maChiNhanh) => {
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaChiNhanh', sql.Char(10), maChiNhanh)
            .query(`
                SELECT 
                    MaNhanVien,
                    HoTen,
                    ChucVu AS viTriLamViec,
                    NgayVaoLam
                FROM NHAN_VIEN
                WHERE MaChiNhanh = @MaChiNhanh
                ORDER BY HoTen
            `);
        return result.recordset;
    }
};

module.exports = BranchModel;