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

    // Lấy danh sách sản phẩm trong kho (cho dashboard)
    getWarehouseProducts: async (maChiNhanh) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaChiNhanh', sql.Char(10), maChiNhanh)
                .query(`
                    SELECT 
                        sp.MaSanPham,
                        sp.TenSanPham,
                        sp.LoaiSanPham,
                        ISNULL(SUM(kh.SoLuongTonKho), 0) as SoLuong,
                        sp.GiaBan as Gia
                    FROM SAN_PHAM sp
                    LEFT JOIN KHO_HANG kh ON sp.MaSanPham = kh.MaSanPham 
                        AND kh.MaChiNhanh = @MaChiNhanh
                    GROUP BY sp.MaSanPham, sp.TenSanPham, sp.LoaiSanPham, sp.GiaBan
                    ORDER BY sp.TenSanPham
                `);

            return result.recordset;
        } catch (err) {
            handleModelError(err, 'getWarehouseProducts');
            return [];
        }
    },

    // Lấy danh sách lô hàng trong kho
    getWarehouseBatches: async (maChiNhanh) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaChiNhanh', sql.Char(10), maChiNhanh)
                .query(`
                    SELECT 
                        lh.MaSanPham as MaLo,
                        sp.TenSanPham,
                        ISNULL(kh.SoLuongTonKho, 0) as SoLuong,
                        lh.NgaySanXuat as NgayNhap,
                        lh.HanSuDung as NgayHetHan,
                        'Nhà cung cấp' as NhaCungCap,
                        'Cái' as DonVi
                    FROM LO_HANG lh
                    INNER JOIN SAN_PHAM sp ON lh.MaSanPham = sp.MaSanPham
                    LEFT JOIN KHO_HANG kh ON lh.MaSanPham = kh.MaSanPham 
                        AND lh.NgaySanXuat = kh.NgaySanXuat
                        AND kh.MaChiNhanh = @MaChiNhanh
                    WHERE kh.MaChiNhanh = @MaChiNhanh OR kh.MaChiNhanh IS NULL
                    ORDER BY lh.HanSuDung ASC, lh.NgaySanXuat DESC
                `);

            return result.recordset;
        } catch (err) {
            handleModelError(err, 'getWarehouseBatches');
            return [];
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
    },

    // Thêm sản phẩm mới
    addProduct: async (data) => {
        try {
            const pool = await connectDB();
            
            // Generate MaSanPham
            const result = await pool.request()
                .query('SELECT MAX(CAST(SUBSTRING(MaSanPham, 3, 8) AS INT)) as MaxId FROM SAN_PHAM');
            
            const maxId = result.recordset[0]?.MaxId || 0;
            const maSanPham = 'SP' + String(maxId + 1).padStart(8, '0');
            
            await pool.request()
                .input('MaSanPham', sql.Char(10), maSanPham)
                .input('TenSanPham', sql.NVarChar(30), data.tenSanPham)
                .input('LoaiSanPham', sql.NVarChar(10), data.loaiSanPham)
                .input('GiaBan', sql.Decimal(11, 2), data.giaBan)
                .query(`
                    INSERT INTO SAN_PHAM (MaSanPham, TenSanPham, LoaiSanPham, GiaBan)
                    VALUES (@MaSanPham, @TenSanPham, @LoaiSanPham, @GiaBan)
                `);
            
            return {
                maSanPham,
                tenSanPham: data.tenSanPham,
                success: true
            };
        } catch (err) {
            handleModelError(err, 'addProduct');
            throw err;
        }
    },

    // Nhập lô hàng
    importBatch: async (data) => {
        try {
            const pool = await connectDB();
            
            // Insert vào LO_HANG nếu chưa tồn tại
            const loHangCheck = await pool.request()
                .input('MaSanPham', sql.Char(10), data.maSanPham)
                .input('NgaySanXuat', sql.DateTime, new Date(data.ngaySanXuat))
                .query(`
                    SELECT * FROM LO_HANG 
                    WHERE MaSanPham = @MaSanPham AND NgaySanXuat = @NgaySanXuat
                `);
            
            const ngayHetHan = data.hanSuDung ? new Date(data.hanSuDung) : null;
            
            if (loHangCheck.recordset.length === 0) {
                // Insert lô mới
                await pool.request()
                    .input('MaSanPham', sql.Char(10), data.maSanPham)
                    .input('NgaySanXuat', sql.DateTime, new Date(data.ngaySanXuat))
                    .input('HanSuDung', sql.DateTime, ngayHetHan)
                    .query(`
                        INSERT INTO LO_HANG (MaSanPham, NgaySanXuat, HanSuDung)
                        VALUES (@MaSanPham, @NgaySanXuat, @HanSuDung)
                    `);
            }
            
            // Check xem đã có trong KHO_HANG chưa
            const khoHangCheck = await pool.request()
                .input('MaChiNhanh', sql.Char(10), data.maChiNhanh)
                .input('MaSanPham', sql.Char(10), data.maSanPham)
                .input('NgaySanXuat', sql.DateTime, new Date(data.ngaySanXuat))
                .query(`
                    SELECT * FROM KHO_HANG 
                    WHERE MaChiNhanh = @MaChiNhanh 
                        AND MaSanPham = @MaSanPham 
                        AND NgaySanXuat = @NgaySanXuat
                `);
            
            if (khoHangCheck.recordset.length === 0) {
                // Insert mới vào KHO_HANG
                await pool.request()
                    .input('MaChiNhanh', sql.Char(10), data.maChiNhanh)
                    .input('MaSanPham', sql.Char(10), data.maSanPham)
                    .input('NgaySanXuat', sql.DateTime, new Date(data.ngaySanXuat))
                    .input('SoLuongTonKho', sql.Int, data.soLuong)
                    .query(`
                        INSERT INTO KHO_HANG (MaChiNhanh, MaSanPham, NgaySanXuat, SoLuongTonKho)
                        VALUES (@MaChiNhanh, @MaSanPham, @NgaySanXuat, @SoLuongTonKho)
                    `);
            } else {
                // Update số lượng
                await pool.request()
                    .input('MaChiNhanh', sql.Char(10), data.maChiNhanh)
                    .input('MaSanPham', sql.Char(10), data.maSanPham)
                    .input('NgaySanXuat', sql.DateTime, new Date(data.ngaySanXuat))
                    .input('SoLuongTonKho', sql.Int, data.soLuong)
                    .query(`
                        UPDATE KHO_HANG 
                        SET SoLuongTonKho = SoLuongTonKho + @SoLuongTonKho
                        WHERE MaChiNhanh = @MaChiNhanh 
                            AND MaSanPham = @MaSanPham 
                            AND NgaySanXuat = @NgaySanXuat
                    `);
            }
            
            return {
                success: true,
                message: 'Nhập lô hàng thành công'
            };
        } catch (err) {
            handleModelError(err, 'importBatch');
            throw err;
        }
    }
};

module.exports = retailModel;