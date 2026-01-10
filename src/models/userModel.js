const { sql } = require('../config/db');

const userModel = {

    generateNextMaKH: async () => {
        const pool = await sql.connect();
        const result = await pool.request()
            .query("SELECT TOP 1 MaKhachHang FROM KHACH_HANG ORDER BY MaKhachHang DESC");
        
        if (result.recordset.length === 0) return 'KH00000001';

        const lastMaKH = result.recordset[0].MaKhachHang; // Ví dụ: 'KH00000010'
        const lastNumber = parseInt(lastMaKH.replace('KH', '')); // Lấy số: 10
        const nextNumber = lastNumber + 1; // Tăng lên: 11
        
        // Trả về định dạng KH + 8 chữ số (KH00000011)
        return 'KH' + nextNumber.toString().padStart(8, '0');
    },

    registerFullCustomer: async (data) => {
        const { maKH, fullName, phone, username, password, email, cccd, gender } = data;
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            const request = new sql.Request(transaction);

            // Bước A: Thêm vào bảng KHACH_HANG
            await request
                .input('maKH', sql.Char(10), maKH)
                .input('fullName', sql.NVarChar(30), fullName)
                .input('phone', sql.Char(10), phone)
                .input('email', sql.Char(30), email)
                .input('cccd', sql.Char(12), cccd)
                .input('gender', sql.NVarChar(3), gender)
                .query(`INSERT INTO KHACH_HANG (MaKhachHang, TenKhachHang, SoDienThoai, Email, CCCD, GioiTinh, DiemTichLuy) 
                        VALUES (@maKH, @fullName, @phone, @email, @cccd, @gender, 0)`);

            // Bước B: Thêm vào bảng TAI_KHOAN
            await request
                .input('username', sql.VarChar(50), username)
                .input('password', sql.VarChar(255), password)
                .input('emailAccount', sql.VarChar(50), email)
                .input('role', sql.NVarChar(20), 'KhachHang')
                .input('maKHAccount', sql.Char(10), maKH)
                .query(`INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, Email, VaiTro, MaKhachHang) 
                        VALUES (@username, @password, @emailAccount, @role, @maKHAccount)`);

            await transaction.commit();
            return true;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    findByUsername: async (username) => {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('username', sql.VarChar, username)
                .query('SELECT * FROM TAI_KHOAN WHERE TenDangNhap = @username');
            
            return result.recordset[0];
        } catch (err) {
            console.error("Lỗi Model findByUsername:", err.message);
            throw err;
        }
    },

    findUserDetailed: async (loginIdentifier) => {
        try {
            const pool = await sql.connect();
            const result = await pool.request()
                .input('input', sql.VarChar, loginIdentifier)
                .query(`
                    SELECT 
                        tk.MaTaiKhoan, tk.TenDangNhap, tk.MatKhau, tk.Email, 
                        tk.VaiTro, tk.MaKhachHang, tk.MaNhanVien,
                        COALESCE(nv.HoTen, kh.TenKhachHang) AS HoTen,
                        nv.ChucVu, nv.MaChiNhanh
                    FROM TAI_KHOAN tk
                    LEFT JOIN NHAN_VIEN nv ON tk.MaNhanVien = nv.MaNhanVien
                    LEFT JOIN KHACH_HANG kh ON tk.MaKhachHang = kh.MaKhachHang
                    -- SỬA DÒNG NÀY: Kiểm tra cả Tên đăng nhập HOẶC Email
                    WHERE tk.TenDangNhap = @input OR tk.Email = @input
                `);
            
            return result.recordset[0];
        } catch (err) {
            console.error("Lỗi Model findUserDetailed:", err.message);
            throw err;
        }
    },

    create: async (data) => {
        try {
            const { username, password, email, role, maKH, maNV } = data;
            const pool = await sql.connect();
            
            await pool.request()
                .input('u', sql.VarChar, username)
                .input('p', sql.VarChar, password)
                .input('e', sql.VarChar, email)
                .input('r', sql.NVarChar, role)
                .input('kh', sql.Char, maKH || null)
                .input('nv', sql.Char, maNV || null)
                .query(`
                    INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, Email, VaiTro, MaKhachHang, MaNhanVien)
                    VALUES (@u, @p, @e, @r, @kh, @nv)
                `);
            
            return true;
        } catch (err) {
            console.error("Lỗi Model create user:", err.message);
            throw err;
        }
    },

    findByEmail: async (email) => {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM TAI_KHOAN WHERE Email = @email');
        return result.recordset[0];
    }
};

module.exports = userModel;