const { sql, connectDB } = require('../config/db');
const { handleModelError } = require('../utils');
const { generateMaPhieuDichVu, generateMaHoaDon } = require('../utils/idGenerator');

const retailModel = {
    // Tạo Phiếu dịch vụ
    createPDV: async (data) => {
        try {
            const pool = await connectDB();
            
            // Sinh mã Phiếu dịch vụ
            const maPDV = await generateMaPhieuDichVu(pool);
            
            if (!maPDV) {
                throw new Error('Không thể sinh mã phiếu dịch vụ');
            }
            
            const result = await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPDV)
                .input('MaKhachHang', sql.Char(10), data.customerId)
                .input('MaChiNhanh', sql.Char(10), data.branchId)
                .execute('SP_ThemPhieuDichVu');
            
            
            return {
                maPDV,
                success: true,
                message: 'Phiếu dịch vụ được tạo thành công'
            };
        } catch (err) {
            handleModelError(err, 'createPDV');
        }
    },

    // Thêm chi tiết mua hàng
    addDetail: async (data) => {
        try {
            const pool = await connectDB();
            await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), data.maPDV)
                .input('SoThuTu', sql.Int, data.soThuTu)
                .input('SoLuong', sql.Int, data.soLuong)
                .input('MaSanPham', sql.Char(10), data.maSP)
                .execute('SP_ThemChiTietMuaHang');
            
            return {
                success: true,
                message: 'Chi tiết mua hàng được thêm thành công'
            };
        } catch (err) {
            handleModelError(err, 'addDetail');
        }
    },

    // Lấy tổng tiền Phiếu dịch vụ
    getPDVTotal: async (maPDV) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPDV)
                .query('SELECT TongTien FROM PHIEU_DICH_VU WHERE MaPhieuDichVu = @MaPhieuDichVu');
            
            return result.recordset.length > 0 ? result.recordset[0].TongTien : 0;
        } catch (err) {
            handleModelError(err, 'getPDVTotal');
        }
    },

    // Tạo Hóa đơn (Tự động tạo với trạng thái chờ thanh toán)
    createInvoice: async (data) => {
        try {
            const pool = await connectDB();
            
            // Sinh mã Hóa đơn
            const maHD = await generateMaHoaDon(pool);
            
            if (!maHD) {
                throw new Error('Không thể sinh mã hóa đơn');
            }
            
            const ngayLap = new Date();
            
            const result = await pool.request()
                .input('MaHoaDon', sql.Char(10), maHD)
                .input('NgayLap', sql.Date, ngayLap)
                .input('MaPhieuDichVu', sql.Char(10), data.maPDV)
                .input('MaNhanVien', sql.Char(10), null) // NULL - chờ nhân viên xác nhận
                .execute('SP_ThemHoaDon');
            
            
            return {
                maHD,
                success: true,
                message: 'Hóa đơn được tạo thành công'
            };
        } catch (err) {
            handleModelError(err, 'createInvoice');
        }
    },

    // Lấy hóa đơn bán hàng chưa xác nhận (chưa thanh toán)
    getUnconfirmedInvoices: async (maChiNhanh) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaChiNhanh', sql.Char(10), maChiNhanh)
                .query(`
                    SELECT 
                        hd.MaHoaDon,
                        hd.NgayLap as NgayTao,
                        hd.MaPhieuDichVu,
                        kh.TenKhachHang,
                        kh.SoDienThoai,
                        pdv.TongTien,
                        hd.MaNhanVien
                    FROM HOA_DON hd
                    JOIN PHIEU_DICH_VU pdv ON hd.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    JOIN PHIEU_MUA_HANG pmh ON hd.MaPhieuDichVu = pmh.MaPhieuDichVu
                    WHERE pdv.MaChiNhanh = @MaChiNhanh
                        AND hd.MaNhanVien IS NULL
                    ORDER BY hd.NgayLap DESC
                `);

            // Lấy chi tiết sản phẩm cho mỗi hóa đơn
            const invoices = result.recordset;
            for (const invoice of invoices) {
                const detailRes = await pool.request()
                    .input('MaPhieuDichVu', sql.Char(10), invoice.MaPhieuDichVu)
                    .query(`
                        SELECT 
                            sp.TenSanPham,
                            ctmh.SoLuong,
                            sp.GiaBan
                        FROM CHI_TIET_MUA_HANG ctmh
                        JOIN SAN_PHAM sp ON ctmh.MaSanPham = sp.MaSanPham
                        WHERE ctmh.MaPhieuDichVu = @MaPhieuDichVu
                        ORDER BY ctmh.SoThuTu
                    `);
                invoice.details = detailRes.recordset;
            }

            return invoices;
        } catch (err) {
            handleModelError(err, 'getUnconfirmedInvoices');
            return [];
        }
    },

    // Lấy hóa đơn bán hàng đã xác nhận (đã thanh toán)
    getConfirmedInvoices: async (maChiNhanh) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaChiNhanh', sql.Char(10), maChiNhanh)
                .query(`
                    SELECT 
                        hd.MaHoaDon,
                        hd.NgayLap as NgayTao,
                        hd.MaPhieuDichVu,
                        kh.TenKhachHang,
                        kh.SoDienThoai,
                        pdv.TongTien,
                        nv.HoTen,
                        hd.HinhThucThanhToan
                    FROM HOA_DON hd
                    JOIN PHIEU_DICH_VU pdv ON hd.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    JOIN PHIEU_MUA_HANG pmh ON hd.MaPhieuDichVu = pmh.MaPhieuDichVu
                    LEFT JOIN NHAN_VIEN nv ON hd.MaNhanVien = nv.MaNhanVien
                    WHERE pdv.MaChiNhanh = @MaChiNhanh
                        AND hd.MaNhanVien IS NOT NULL
                    ORDER BY hd.NgayLap DESC
                `);

            // Lấy chi tiết sản phẩm cho mỗi hóa đơn
            const invoices = result.recordset;
            for (const invoice of invoices) {
                const detailRes = await pool.request()
                    .input('MaPhieuDichVu', sql.Char(10), invoice.MaPhieuDichVu)
                    .query(`
                        SELECT 
                            sp.TenSanPham,
                            ctmh.SoLuong,
                            sp.GiaBan
                        FROM CHI_TIET_MUA_HANG ctmh
                        JOIN SAN_PHAM sp ON ctmh.MaSanPham = sp.MaSanPham
                        WHERE ctmh.MaPhieuDichVu = @MaPhieuDichVu
                        ORDER BY ctmh.SoThuTu
                    `);
                invoice.details = detailRes.recordset;
            }

            return invoices;
        } catch (err) {
            handleModelError(err, 'getConfirmedInvoices');
            return [];
        }
    },

    // Lấy chi tiết hóa đơn
    getInvoiceDetails: async (maPhieuDichVu) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPhieuDichVu)
                .query(`
                    SELECT 
                        hd.MaHoaDon,
                        hd.NgayLap as NgayTao,
                        hd.MaPhieuDichVu,
                        kh.TenKhachHang,
                        kh.SoDienThoai,
                        pdv.TongTien,
                        hd.HinhThucThanhToan
                    FROM HOA_DON hd
                    JOIN PHIEU_DICH_VU pdv ON hd.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    WHERE hd.MaPhieuDichVu = @MaPhieuDichVu
                `);

            if (result.recordset.length === 0) return null;

            const invoice = result.recordset[0];

            // Lấy chi tiết sản phẩm
            const detailRes = await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPhieuDichVu)
                .query(`
                    SELECT 
                        sp.TenSanPham,
                        ctmh.SoLuong,
                        sp.GiaBan
                    FROM CHI_TIET_MUA_HANG ctmh
                    JOIN SAN_PHAM sp ON ctmh.MaSanPham = sp.MaSanPham
                    WHERE ctmh.MaPhieuDichVu = @MaPhieuDichVu
                    ORDER BY ctmh.SoThuTu
                `);
            invoice.details = detailRes.recordset;

            return invoice;
        } catch (err) {
            handleModelError(err, 'getInvoiceDetails');
            return null;
        }
    },

    // Lấy danh sách sản phẩm trong kho của chi nhánh
    getWarehouseInventory: async (maChiNhanh) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaChiNhanh', sql.Char(10), maChiNhanh)
                .query(`
                    SELECT 
                        sp.MaSanPham,
                        sp.TenSanPham,
                        ISNULL(kh.SoLuongTonKho, 0) as SoLuongTonKho
                    FROM SAN_PHAM sp
                    LEFT JOIN KHO_HANG kh ON sp.MaSanPham = kh.MaSanPham 
                        AND kh.MaChiNhanh = @MaChiNhanh
                    ORDER BY sp.TenSanPham
                `);

            return result.recordset;
        } catch (err) {
            handleModelError(err, 'getWarehouseInventory');
            return [];
        }
    },

    // Xác nhận thanh toán (cập nhật MaNhanVien và HinhThucThanhToan)
    confirmPayment: async (data) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), data.maPhieuDichVu)
                .input('MaNhanVien', sql.Char(10), data.maNhanVien)
                .input('HinhThucThanhToan', sql.NVarChar(20), data.hinhThucThanhToan)
                .query(`
                    UPDATE HOA_DON 
                    SET MaNhanVien = @MaNhanVien, 
                        HinhThucThanhToan = @HinhThucThanhToan
                    WHERE MaPhieuDichVu = @MaPhieuDichVu
                `);

            return {
                success: true,
                message: 'Xác nhận thanh toán thành công'
            };
        } catch (err) {
            handleModelError(err, 'confirmPayment');
            throw err;
        }
    },

    // Lấy chi tiết phiếu dịch vụ
    getPDVDetail: async (maPDV) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaPDV', sql.Char(10), maPDV)
                .query(`SELECT * FROM PHIEU_DICH_VU WHERE MaPhieuDichVu = @MaPDV`);
            
            return result.recordset?.[0] || null;
        } catch (err) {
            handleModelError(err, 'getPDVDetail');
        }
    }
};

// Lấy chi tiết phiếu dịch vụ
const getPDVDetail = async (maPDV) => {
    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('MaPDV', sql.Char(10), maPDV)
            .query(`SELECT * FROM PHIEU_DICH_VU WHERE MaPhieuDichVu = @MaPDV`);
        
        return result.recordset?.[0] || null;
    } catch (err) {
        handleModelError(err, 'getPDVDetail');
    }
};

// Thêm vào exports
retailModel.getPDVDetail = getPDVDetail;

module.exports = retailModel;