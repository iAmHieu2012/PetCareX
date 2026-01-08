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
    getPetDetails: async (maThuCung) => {
        const pool = await connectDB();
        const request = pool.request();
        request.input('MaThuCung', sql.Char(10), maThuCung);
        const result = await request.execute('SP_TraCuuThuCung_ChiTiet');
        return result.recordset[0] || null;
    }
};

module.exports = BranchModel;