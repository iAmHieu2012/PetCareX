const { connectDB, sql } = require('../config/db');

const reportModel = {
    // 1. Báo cáo doanh thu chi nhánh theo thời gian
    getBranchRevenue: async (branchId, type, value, year) => {
        const pool = await connectDB();
        return await pool.request()
            .input('MaChiNhanh', sql.Char, branchId)
            .input('LoaiThoiGian', sql.NVarChar, type) // 'Ngay', 'Thang', 'Quy', 'Nam'
            .input('GiaTri', sql.Int, value)
            .input('Nam', sql.Int, year)
            .execute('SP_DoanhThuChiNhanh');
    },

    // 2. Top doanh thu hệ thống (Thống kê tổng quan)
    getTopRevenue: async () => {
        const pool = await connectDB();
        return await pool.request().execute('SP_TopDoanhThuHeThong');
    },

    // 3. Thống kê hiệu suất nhân viên
    getStaffPerformance: async (branchId) => {
        const pool = await connectDB();
        return await pool.request()
            .input('MaChiNhanh', sql.Char, branchId)
            .execute('SP_ThongKeHieuSuat_NhanVien');
    },
    // Thống kê phân loại (SP vs Dịch vụ)
    getGeneralStats: async (branchId, year) => {
        const pool = await connectDB();
        return await pool.request()
            .input('MaCN', sql.Char, branchId)
            .input('Nam', sql.Int, year)
            .execute('SP_Report_GeneralStats');
    },

    // Thống kê hiệu suất bác sĩ cụ thể
    getDoctorPerformance: async (branchId, month, year) => {
        const pool = await connectDB();
        return await pool.request()
            .input('MaCN', sql.Char, branchId)
            .input('Thang', sql.Int, month)
            .input('Nam', sql.Int, year)
            .execute('SP_Report_DoctorPerformance');
    },
    getAdvancedReport: async (branchId, type, value, year) => {
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaCN', sql.Char, branchId)
            .input('Loai', sql.NVarChar, type)
            .input('GiaTri', sql.Int, value)
            .input('Nam', sql.Int, year)
            .execute('SP_Report_Comprehensive'); 
    
        return {
            // recordsets[0] là kết quả của SELECT đầu tiên (các con số KPI)
            stats: result.recordsets[0][0] || { TongDoanhThu: 0, DoanhThuDichVu: 0, DoanhThuSanPham: 0, SoLuotKham: 0 },
            // recordsets[1] là kết quả của SELECT thứ hai (danh sách bác sĩ)
            doctors: result.recordsets[1] || []
        };
    }
};

module.exports = reportModel;