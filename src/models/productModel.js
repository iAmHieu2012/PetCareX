const { sql, connectDB } = require('../config/db');

const productModel = {
    // Lấy toàn bộ sản phẩm hoặc lọc theo tên/loại (Gọi SP_TraCuuSanPham)
    getAll: async (name = null, type = null) => {
        const pool = await connectDB();
        return await pool.request()
            .input('TenSanPham', sql.NVarChar, name)
            .input('LoaiSanPham', sql.NVarChar, type)
            .execute('SP_TraCuuSanPham'); //
    },

    // Lấy sản phẩm có tồn kho tại chi nhánh cụ thể (bao gồm số lượng tồn)
    getByBranch: async (branchId, type = null) => {
        const pool = await connectDB();
        const request = pool.request()
            .input('MaChiNhanh', sql.Char(10), branchId);
        
        // Xây dựng query an toàn
        let query = `
            SELECT sp.MaSanPham, sp.TenSanPham, sp.LoaiSanPham, sp.GiaBan,
                   SUM(kh.SoLuongTonKho) as SoLuongTonKho
            FROM SAN_PHAM sp
            INNER JOIN KHO_HANG kh ON sp.MaSanPham = kh.MaSanPham
            WHERE kh.MaChiNhanh = @MaChiNhanh 
            AND kh.SoLuongTonKho > 0
        `;
        
        // Nếu có filter loại, thêm vào với parameterized input
        if (type && type !== 'all') {
            request.input('LoaiSanPham', sql.NVarChar, type);
            query += ` AND sp.LoaiSanPham = @LoaiSanPham `;
        }
        
        query += ` GROUP BY sp.MaSanPham, sp.TenSanPham, sp.LoaiSanPham, sp.GiaBan
            ORDER BY sp.TenSanPham `;
        
        return await request.query(query);
    },

    // Thêm sản phẩm mới
    create: async (data) => {
        const pool = await connectDB();
        return await pool.request()
            .input('MaSanPham', sql.Char, data.id)
            .input('TenSanPham', sql.NVarChar, data.name)
            .input('LoaiSanPham', sql.NVarChar, data.type)
            .input('GiaBan', sql.Decimal, data.price)
            .execute('SP_ThemSanPham'); //
    },

    // Xem sản phẩm sắp hết hạn (Gọi View)
    getExpiring: async () => {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM VW_SanPhamSapHetHan'); //
        return result.recordset;
    },

    // Lấy danh sách dược phẩm
    getAllMedicines: async () => {
        try {
            const pool = await connectDB();
            const result = await pool.request().query(`
                SELECT MaThuoc, TenThuoc
                FROM DANH_MUC_THUOC
                ORDER BY TenThuoc
            `);
            return result.recordset || [];
        } catch (err) {
            throw err;
        }
    },

    // Lấy danh sách vacxin
    getAllVaccines: async () => {
        try {
            const pool = await connectDB();
            const result = await pool.request().query(`
                SELECT MaVacxin, TenVacxin, MoTa, LieuLuongToiDa
                FROM VACXIN
                ORDER BY TenVacxin
            `);
            return result.recordset || [];
        } catch (err) {
            throw err;
        }
    }
};

module.exports = productModel;