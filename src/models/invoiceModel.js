const { connectDB, sql } = require('../config/db');
const { generateMaHoaDon } = require('../utils/idGenerator');
const { handleModelError } = require('../utils/errorHandler');

// 1. Lấy danh sách TẤT CẢ phiếu dịch vụ của khách hàng (với trạng thái thanh toán)
async function getAllPhieuDichVu(maKhachHang) {
    try {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input('MaKhachHang', sql.Char(10), maKhachHang)
            .query(`
                SELECT 
                    p.MaPhieuDichVu,
                    p.TongTien,
                    p.MaChiNhanh,
                    cn.TenChiNhanh,
                    p.MaKhachHang,
                    ISNULL(hd.MaHoaDon, '') AS MaHoaDon,
                    ISNULL(hd.NgayLap, '') AS NgayLap,
                    CASE 
                        WHEN hd.MaNhanVien IS NOT NULL AND hd.HinhThucThanhToan IS NOT NULL AND hd.HinhThucThanhToan != N'Đã hủy' THEN N'Đã thanh toán'
                        WHEN hd.MaNhanVien IS NULL AND hd.HinhThucThanhToan IS NOT NULL AND hd.HinhThucThanhToan != N'Đã hủy' THEN N'Chờ xác nhận'
                        ELSE N'Chưa thanh toán'
                    END AS TrangThaiThanhToan,
                    hd.HinhThucThanhToan,
                    CASE 
                        WHEN EXISTS(SELECT 1 FROM PHIEU_KHAM_BENH WHERE MaPhieuDichVu = p.MaPhieuDichVu) THEN 'exam'
                        WHEN EXISTS(SELECT 1 FROM PHIEU_TIEM_PHONG WHERE MaPhieuDichVu = p.MaPhieuDichVu) THEN 'vaccine'
                        WHEN EXISTS(SELECT 1 FROM PHIEU_DANG_KY_GOI_TIEM WHERE MaPhieuDichVu = p.MaPhieuDichVu) THEN 'package'
                        WHEN EXISTS(SELECT 1 FROM PHIEU_MUA_HANG WHERE MaPhieuDichVu = p.MaPhieuDichVu) THEN 'retail'
                        ELSE 'unknown'
                    END AS LoaiPhieuDichVu
                FROM PHIEU_DICH_VU p
                JOIN CHI_NHANH cn ON p.MaChiNhanh = cn.MaChiNhanh
                LEFT JOIN HOA_DON hd ON p.MaPhieuDichVu = hd.MaPhieuDichVu
                WHERE p.MaKhachHang = @MaKhachHang
                ORDER BY p.MaPhieuDichVu DESC
            `);
        
        return result.recordset || [];
    } catch (err) {
        handleModelError(err, 'getAllPhieuDichVu');
    }
}

// 1b. Lấy danh sách phiếu dịch vụ chưa thanh toán (legacy - keep for backward compatibility)
async function getPendingInvoices(maKhachHang) {
    try {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input('MaKhachHang', sql.Char(10), maKhachHang)
            .query(`
                SELECT 
                    p.MaPhieuDichVu,
                    p.TongTien,
                    p.MaChiNhanh,
                    cn.TenChiNhanh,
                    p.MaKhachHang,
                    ISNULL(hd.MaHoaDon, '') AS MaHoaDon,
                    ISNULL(hd.NgayLap, '') AS NgayLap,
                    CASE 
                        WHEN hd.MaNhanVien IS NOT NULL AND hd.HinhThucThanhToan IS NOT NULL AND hd.HinhThucThanhToan != N'Đã hủy' THEN N'Đã thanh toán'
                        WHEN hd.MaNhanVien IS NULL AND hd.HinhThucThanhToan IS NOT NULL AND hd.HinhThucThanhToan != N'Đã hủy' THEN N'Chờ xác nhận'
                        ELSE N'Chưa thanh toán'
                    END AS TrangThaiThanhToan,
                    hd.HinhThucThanhToan,
                    CASE 
                        WHEN EXISTS(SELECT 1 FROM PHIEU_KHAM_BENH WHERE MaPhieuDichVu = p.MaPhieuDichVu) THEN 'exam'
                        WHEN EXISTS(SELECT 1 FROM PHIEU_TIEM_PHONG WHERE MaPhieuDichVu = p.MaPhieuDichVu) THEN 'vaccine'
                        WHEN EXISTS(SELECT 1 FROM PHIEU_DANG_KY_GOI_TIEM WHERE MaPhieuDichVu = p.MaPhieuDichVu) THEN 'package'
                        WHEN EXISTS(SELECT 1 FROM PHIEU_MUA_HANG WHERE MaPhieuDichVu = p.MaPhieuDichVu) THEN 'retail'
                        ELSE 'unknown'
                    END AS LoaiPhieuDichVu
                FROM PHIEU_DICH_VU p
                JOIN CHI_NHANH cn ON p.MaChiNhanh = cn.MaChiNhanh
                LEFT JOIN HOA_DON hd ON p.MaPhieuDichVu = hd.MaPhieuDichVu
                WHERE p.MaKhachHang = @MaKhachHang
                AND NOT EXISTS (
                    SELECT 1 FROM HOA_DON hd2
                    WHERE hd2.MaPhieuDichVu = p.MaPhieuDichVu 
                    AND hd2.HinhThucThanhToan IS NOT NULL
                    AND hd2.HinhThucThanhToan != N'Đã hủy'
                )
                ORDER BY p.MaPhieuDichVu DESC
            `);
        
        return result.recordset || [];
    } catch (err) {
        handleModelError(err, 'getPendingInvoices');
    }
}

// 2. Lấy chi tiết một phiếu dịch vụ (bao gồm thông tin khám bệnh & toa thuốc nếu có)
async function getPhieuDichVuDetail(maPhieuDichVu) {
    try {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input('MaPhieuDichVu', sql.Char(10), maPhieuDichVu)
            .query(`
                SELECT 
                    p.MaPhieuDichVu,
                    p.TongTien,
                    p.MaChiNhanh,
                    p.MaKhachHang,
                    kh.TenKhachHang,
                    kh.DiemTichLuy,
                    cn.TenChiNhanh
                FROM PHIEU_DICH_VU p
                JOIN KHACH_HANG kh ON p.MaKhachHang = kh.MaKhachHang
                JOIN CHI_NHANH cn ON p.MaChiNhanh = cn.MaChiNhanh
                WHERE p.MaPhieuDichVu = @MaPhieuDichVu
            `);
        
        if (result.recordset.length === 0) {
            return null;
        }

        const detail = result.recordset[0];

        // Lấy thông tin khám bệnh nếu có
        const examRes = await pool.request()
            .input('MaPhieuDichVu', sql.Char(10), maPhieuDichVu)
            .query(`
                SELECT 
                    pkb.TrieuChung,
                    pkb.ChuanDoan,
                    pkb.NgayHenTaiKham,
                    nv.HoTen AS TenBacSi
                FROM PHIEU_KHAM_BENH pkb
                LEFT JOIN NHAN_VIEN nv ON pkb.MaBacSi = nv.MaNhanVien
                WHERE pkb.MaPhieuDichVu = @MaPhieuDichVu
            `);

        if (examRes.recordset.length > 0) {
            detail.exam = examRes.recordset[0];

            // Lấy chi tiết toa thuốc
            const prescRes = await pool.request()
                .input('MaPhieuKhamBenh', sql.Char(10), maPhieuDichVu)
                .query(`
                    SELECT 
                        c.MaThuoc,
                        s.TenSanPham,
                        c.SoLuong,
                        s.GiaBan,
                        (c.SoLuong * s.GiaBan) AS ThanhTien
                    FROM CHI_TIET_TOA_THUOC c
                    JOIN SAN_PHAM s ON c.MaThuoc = s.MaSanPham
                    WHERE c.MaPhieuKhamBenh = @MaPhieuKhamBenh
                `);

            detail.prescriptions = prescRes.recordset || [];
        }

        return detail;
    } catch (err) {
        handleModelError(err, 'getPhieuDichVuDetail');
    }
}

// 3. Tạo hóa đơn mới (Thanh toán dịch vụ)
async function createInvoice(data) {
    try {
        const pool = await connectDB();
        
        // Check xem HOA_DON đã tồn tại cho phiếu dịch vụ này chưa
        const existingCheck = await pool
            .request()
            .input('MaPhieuDichVu', sql.Char(10), data.maPhieuDichVu)
            .query(`SELECT MaHoaDon FROM HOA_DON WHERE MaPhieuDichVu = @MaPhieuDichVu`);
        
        if (existingCheck.recordset.length > 0) {
            // HOA_DON đã tồn tại, return thành công mà không tạo lại
            return {
                maHoaDon: existingCheck.recordset[0].MaHoaDon,
                ngayLap: new Date().toISOString().split('T')[0],
                tongTienThanhToan: data.tongTien,
                khuyenMai: data.khuyenMai || 0,
                hinhThucThanhToan: data.hinhThucThanhToan,
                diemSuDung: 0,
                message: 'Hóa đơn đã tồn tại'
            };
        }
        
        const maHoaDon = await generateMaHoaDon(pool);
        const ngayLap = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Lấy MaThuCung và UuDai từ các phiếu dịch vụ liên quan
        let maThuCung = null;
        let uuDaiDefault = 0;

        const thuCungResult = await pool
            .request()
            .input('MaPhieuDichVu', sql.Char(10), data.maPhieuDichVu)
            .query(`
                SELECT pdk.MaThuCung, ISNULL(gt.UuDai, 0) AS UuDai 
                FROM PHIEU_DANG_KY_GOI_TIEM pdk
                JOIN GOI_TIEM gt ON pdk.MaGoiTiem = gt.MaGoiTiem
                WHERE pdk.MaPhieuDichVu = @MaPhieuDichVu
                UNION ALL
                SELECT pkb.MaThuCung, 0 AS UuDai FROM PHIEU_KHAM_BENH pkb
                WHERE pkb.MaPhieuDichVu = @MaPhieuDichVu
                UNION ALL
                SELECT ptp.MaThuCung, 0 AS UuDai FROM PHIEU_TIEM_PHONG ptp
                WHERE ptp.MaPhieuDichVu = @MaPhieuDichVu
            `);
        
        if (thuCungResult.recordset.length > 0) {
            maThuCung = thuCungResult.recordset[0].MaThuCung;
            uuDaiDefault = thuCungResult.recordset[0].UuDai || 0;
        }

        // Tính tiền sau giảm giá
        let tongTienThanhToan = data.tongTien;
        // Dùng UuDai của gói tiêm nếu có, nếu không dùng giá trị từ controller
        // QUAN TRỌNG: Trigger TRG_HOA_DON_CheckUuDaiGoiTiem yêu cầu KhuyenMai >= UuDai
        // Nếu UuDai > 0, BUỘC KhuyenMai >= UuDai
        // Nếu không phải đăng ký gói tiêm (uuDaiDefault = 0), thì khuyenMai = NULL
        let khuyenMai = null;
        
        if (uuDaiDefault > 0) {
            // Là đăng ký gói tiêm, có ưu đãi
            khuyenMai = data.khuyenMai !== undefined ? data.khuyenMai : uuDaiDefault;
            if (khuyenMai < uuDaiDefault) {
                khuyenMai = uuDaiDefault; // Buộc set = UuDai nếu nhỏ hơn
            }
        } else {
            // Không phải đăng ký gói tiêm (mua hàng, khám bệnh, tiêm phòng), khuyenMai = 0
            khuyenMai = 0;
        }
        
        // Ensure khuyenMai is a number
        khuyenMai = Math.max(0, parseFloat(khuyenMai) || 0);
        
        if (khuyenMai > 0) {
            tongTienThanhToan = data.tongTien * (1 - khuyenMai / 100);
        }

        // Tính tiền giảm bằng điểm tích lũy
        let tongTienThanhToanSauDiem = tongTienThanhToan;
        let diemSuDung = 0;

        if (data.diemSuDung && data.diemSuDung > 0) {
            // Tỷ lệ: 1 điểm = 1000 VNĐ (có thể thay đổi)
            const diemGiaTriVND = data.diemSuDung * 1000;
            diemSuDung = data.diemSuDung;

            // Không được vượt quá tổng tiền thanh toán
            if (diemGiaTriVND >= tongTienThanhToan) {
                tongTienThanhToanSauDiem = 0;
            } else {
                tongTienThanhToanSauDiem = tongTienThanhToan - diemGiaTriVND;
            }
        }

        const request = pool.request();
        request.input('MaHoaDon', sql.Char(10), maHoaDon);
        request.input('NgayLap', sql.Date, ngayLap);
        request.input('TongTienThanhToan', sql.Decimal(11, 2), Math.max(0, tongTienThanhToanSauDiem));
        request.input('KhuyenMai', sql.Decimal(5, 2), khuyenMai);
        request.input('HinhThucThanhToan', sql.NVarChar(20), data.hinhThucThanhToan);
        request.input('MaPhieuDichVu', sql.Char(10), data.maPhieuDichVu);
        request.input('MaNhanVien', sql.Char(10), null); // NULL = Chờ xác nhận
        request.input('MaThuCung', sql.Char(10), maThuCung || null);

        let result;
        try {
            result = await request.query(`
                SET XACT_ABORT OFF;
                BEGIN TRY
                    INSERT INTO HOA_DON 
                    (MaHoaDon, NgayLap, TongTienThanhToan, KhuyenMai, HinhThucThanhToan, MaPhieuDichVu, MaNhanVien, MaThuCung)
                    VALUES 
                    (@MaHoaDon, @NgayLap, @TongTienThanhToan, @KhuyenMai, @HinhThucThanhToan, @MaPhieuDichVu, @MaNhanVien, @MaThuCung);
                    SELECT * FROM HOA_DON WHERE MaHoaDon = @MaHoaDon;
                END TRY
                BEGIN CATCH
                    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
                    RAISERROR(@ErrorMessage, 16, 1);
                END CATCH;
            `);
        } catch (triggerErr) {
            const errMsg = triggerErr.message.toLowerCase();
            
            if (errMsg.includes('hết hàng') || errMsg.includes('hạn')) {
                // Lỗi kho hàng
                throw new Error(`Lỗi kho: Sản phẩm đã hết hàng hoặc hạn sử dụng quá. Vui lòng kiểm tra kho.`);
            } else if (errMsg.includes('ưu đãi') || errMsg.includes('khuyến mãi')) {
                // Lỗi khuyến mãi - retry mà không có khuyến mãi
                console.log('⚠️ Trigger error về khuyến mãi, retrying with KhuyenMai = NULL...');
                const retryRequest = pool.request();
                retryRequest.input('MaHoaDon', sql.Char(10), maHoaDon);
                retryRequest.input('NgayLap', sql.Date, ngayLap);
                retryRequest.input('TongTienThanhToan', sql.Decimal(11, 2), Math.max(0, tongTienThanhToanSauDiem));
                retryRequest.input('KhuyenMai', sql.Decimal(5, 2), null);
                retryRequest.input('HinhThucThanhToan', sql.NVarChar(20), data.hinhThucThanhToan);
                retryRequest.input('MaPhieuDichVu', sql.Char(10), data.maPhieuDichVu);
                retryRequest.input('MaNhanVien', sql.Char(10), null);
                retryRequest.input('MaThuCung', sql.Char(10), maThuCung || null);
                
                result = await retryRequest.query(`
                    SET XACT_ABORT OFF;
                    INSERT INTO HOA_DON 
                    (MaHoaDon, NgayLap, TongTienThanhToan, KhuyenMai, HinhThucThanhToan, MaPhieuDichVu, MaNhanVien, MaThuCung)
                    VALUES 
                    (@MaHoaDon, @NgayLap, @TongTienThanhToan, @KhuyenMai, @HinhThucThanhToan, @MaPhieuDichVu, @MaNhanVien, @MaThuCung);
                    SELECT * FROM HOA_DON WHERE MaHoaDon = @MaHoaDon;
                `);
            } else if (errMsg.includes('thú cưng') || errMsg.includes('không khớp')) {
                // Lỗi mismatch thú cưng
                throw new Error(`Lỗi: Thú cưng không khớp giữa hóa đơn và phiếu dịch vụ.`);
            } else {
                throw triggerErr;
            }
        }
        // Cập nhật điểm tích lũy khách hàng (trừ đi điểm đã sử dụng)
        if (diemSuDung > 0) {
            await pool
                .request()
                .input('MaKhachHang', sql.Char(10), data.maKhachHang)
                .input('DiemSuDung', sql.Int, diemSuDung)
                .query(`
                    UPDATE KHACH_HANG 
                    SET DiemTichLuy = DiemTichLuy - @DiemSuDung
                    WHERE MaKhachHang = @MaKhachHang AND DiemTichLuy >= @DiemSuDung
                `);
        }

        return {
            maHoaDon: maHoaDon,
            ngayLap: ngayLap,
            tongTienThanhToan: tongTienThanhToanSauDiem,
            khuyenMai: khuyenMai,
            hinhThucThanhToan: data.hinhThucThanhToan,
            diemSuDung: diemSuDung
        };
    } catch (err) {
        handleModelError(err, 'createInvoice');
    }
}

// 4. Hủy hóa đơn và trả lại điểm tích lũy
async function cancelInvoice(maHoaDon, ngayLap) {
    try {
        const pool = await connectDB();

        // Lấy thông tin hóa đơn trước khi hủy
        const invoiceResult = await pool
            .request()
            .input('MaHoaDon', sql.Char(10), maHoaDon)
            .input('NgayLap', sql.Date, ngayLap)
            .query(`
                SELECT hd.*, p.MaKhachHang
                FROM HOA_DON hd
                JOIN PHIEU_DICH_VU p ON hd.MaPhieuDichVu = p.MaPhieuDichVu
                WHERE hd.MaHoaDon = @MaHoaDon AND hd.NgayLap = @NgayLap
            `);

        if (!invoiceResult.recordset[0]) {
            throw new Error('Hóa đơn không tồn tại');
        }

        const invoice = invoiceResult.recordset[0];
        const maKhachHang = invoice.MaKhachHang;

        // Cập nhật hóa đơn thành "Đã hủy"
        await pool
            .request()
            .input('MaHoaDon', sql.Char(10), maHoaDon)
            .input('NgayLap', sql.Date, ngayLap)
            .query(`
                UPDATE HOA_DON
                SET HinhThucThanhToan = N'Đã hủy'
                WHERE MaHoaDon = @MaHoaDon AND NgayLap = @NgayLap
            `);

        // Tính điểm cần trả lại dựa trên TongTienThanhToan
        // Tỷ lệ: 1000 VNĐ = 1 điểm
        const diemTienTruong = Math.floor(invoice.TongTienThanhToan / 1000);

        // Trả lại điểm tích lũy cho khách hàng
        if (diemTienTruong > 0) {
            await pool
                .request()
                .input('MaKhachHang', sql.Char(10), maKhachHang)
                .input('DiemTienTruong', sql.Int, diemTienTruong)
                .query(`
                    UPDATE KHACH_HANG
                    SET DiemTichLuy = DiemTichLuy + @DiemTienTruong
                    WHERE MaKhachHang = @MaKhachHang
                `);
        }

        return {
            success: true,
            message: 'Hủy hóa đơn thành công',
            diemTienTruong: diemTienTruong
        };
    } catch (err) {
        handleModelError(err, 'cancelInvoice');
    }
}

// 5. Lấy lịch sử hóa đơn của khách hàng (tất cả)
async function getInvoiceHistory(maKhachHang) {
    try {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input('MaKhachHang', sql.Char(10), maKhachHang)
            .query(`
                SELECT 
                    hd.MaHoaDon,
                    hd.NgayLap,
                    hd.TongTienThanhToan,
                    hd.KhuyenMai,
                    hd.HinhThucThanhToan,
                    hd.MaPhieuDichVu,
                    hd.MaNhanVien,
                    CASE 
                        WHEN hd.HinhThucThanhToan = N'Đã hủy' THEN N'Đã hủy'
                        WHEN hd.MaNhanVien IS NULL THEN N'Chờ xác nhận'
                        ELSE N'Đã xác nhận'
                    END AS TrangThaiXacNhan,
                    p.TongTien,
                    cn.TenChiNhanh
                FROM HOA_DON hd
                JOIN PHIEU_DICH_VU p ON hd.MaPhieuDichVu = p.MaPhieuDichVu
                JOIN CHI_NHANH cn ON p.MaChiNhanh = cn.MaChiNhanh
                WHERE p.MaKhachHang = @MaKhachHang
                ORDER BY hd.NgayLap DESC, hd.MaHoaDon DESC
            `);

        return result.recordset || [];
    } catch (err) {
        handleModelError(err, 'getInvoiceHistory');
    }
}

// 7. Tìm khách hàng theo CCCD hoặc Email
async function findCustomerByCCCDOrEmail(cccd, email) {
    try {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input('CCCD', sql.Char(12), cccd)
            .input('Email', sql.Char(30), email)
            .query(`
                SELECT 
                    MaKhachHang,
                    TenKhachHang,
                    SoDienThoai,
                    Email,
                    CCCD,
                    DiemTichLuy
                FROM KHACH_HANG
                WHERE (CCCD = @CCCD OR Email = @Email)
            `);
        
        return result.recordset[0] || null;
    } catch (err) {
        handleModelError(err, 'findCustomerByCCCDOrEmail');
    }
}

// 8. Lấy danh sách hóa đơn chờ xác nhận (MaNhanVien IS NULL)
async function getPendingConfirmationInvoices(maKhachHang) {
    try {
        const pool = await connectDB();
        const result = await pool
            .request()
            .input('MaKhachHang', sql.Char(10), maKhachHang)
            .query(`
                SELECT 
                    hd.MaHoaDon,
                    hd.NgayLap,
                    hd.TongTienThanhToan,
                    hd.KhuyenMai,
                    hd.HinhThucThanhToan,
                    hd.MaPhieuDichVu,
                    hd.MaNhanVien,
                    p.TongTien,
                    cn.TenChiNhanh,
                    CASE 
                        WHEN hd.HinhThucThanhToan = N'Đã hủy' THEN N'Đã hủy'
                        WHEN hd.MaNhanVien IS NULL THEN N'Chờ xác nhận'
                        ELSE N'Đã xác nhận'
                    END AS TrangThaiXacNhan
                FROM HOA_DON hd
                JOIN PHIEU_DICH_VU p ON hd.MaPhieuDichVu = p.MaPhieuDichVu
                JOIN CHI_NHANH cn ON p.MaChiNhanh = cn.MaChiNhanh
                WHERE p.MaKhachHang = @MaKhachHang 
                AND hd.MaNhanVien IS NULL 
                AND hd.HinhThucThanhToan IS NOT NULL
                AND hd.HinhThucThanhToan != 'Đã hủy'
                ORDER BY hd.NgayLap DESC, hd.MaHoaDon DESC
            `);

        return result.recordset || [];
    } catch (err) {
        handleModelError(err, 'getPendingConfirmationInvoices');
    }
}

// 9. Lấy tất cả hóa đơn chờ xác nhận (không lọc theo khách hàng)
async function getAllPendingConfirmationInvoices() {
    try {
        const pool = await connectDB();
        const result = await pool
            .request()
            .query(`
                SELECT 
                    hd.MaHoaDon,
                    hd.NgayLap,
                    hd.TongTienThanhToan,
                    hd.KhuyenMai,
                    hd.HinhThucThanhToan,
                    hd.MaPhieuDichVu,
                    hd.MaNhanVien,
                    p.TongTien,
                    p.MaKhachHang,
                    kh.TenKhachHang,
                    kh.CCCD,
                    kh.SoDienThoai,
                    cn.TenChiNhanh,
                    CASE 
                        WHEN hd.HinhThucThanhToan = 'Đã hủy' THEN 'Đã hủy'
                        WHEN hd.MaNhanVien IS NULL THEN 'Chờ xác nhận'
                        ELSE 'Đã xác nhận'
                    END AS TrangThaiXacNhan
                FROM HOA_DON hd
                JOIN PHIEU_DICH_VU p ON hd.MaPhieuDichVu = p.MaPhieuDichVu
                JOIN KHACH_HANG kh ON p.MaKhachHang = kh.MaKhachHang
                JOIN CHI_NHANH cn ON p.MaChiNhanh = cn.MaChiNhanh
                WHERE hd.MaNhanVien IS NULL 
                AND hd.HinhThucThanhToan IS NOT NULL
                AND hd.HinhThucThanhToan != 'Đã hủy'
                ORDER BY hd.NgayLap DESC, hd.MaHoaDon DESC
            `);

        return result.recordset || [];
    } catch (err) {
        handleModelError(err, 'getAllPendingConfirmationInvoices');
    }
}

// 10. Xác nhận thanh toán (cập nhật MaNhanVien)
async function confirmPayment(maHoaDon, ngayLap, maNhanVien, hinhThucThanhToan) {
    try {
        const pool = await connectDB();

        const result = await pool
            .request()
            .input('MaHoaDon', sql.Char(10), maHoaDon)
            .input('NgayLap', sql.Date, ngayLap)
            .input('MaNhanVien', sql.Char(10), maNhanVien)
            .input('HinhThucThanhToan', sql.NVarChar(20), hinhThucThanhToan || 'Chuyển khoản')
            .query(`
                UPDATE HOA_DON
                SET MaNhanVien = @MaNhanVien,
                    HinhThucThanhToan = @HinhThucThanhToan
                WHERE MaHoaDon = @MaHoaDon AND NgayLap = @NgayLap
            `);

        return {
            success: true,
            message: 'Xác nhận thanh toán thành công',
            maHoaDon: maHoaDon,
            maNhanVien: maNhanVien
        };
    } catch (err) {
        handleModelError(err, 'confirmPayment');
    }
}

module.exports = {
    getAllPhieuDichVu,
    getPendingInvoices,
    getPhieuDichVuDetail,
    createInvoice,
    cancelInvoice,
    getInvoiceHistory,
    findCustomerByCCCDOrEmail,
    getPendingConfirmationInvoices,
    getAllPendingConfirmationInvoices,
    confirmPayment
};

// Lấy hóa đơn theo chi nhánh
async function getInvoicesByBranch(maChiNhanh, trangThaiThanhToan = null, ngayTao = null) {
    try {
        const pool = await connectDB();
        let query = `
            SELECT 
                hd.MaHoaDon,
                kh.TenKhachHang,
                hd.TongTienThanhToan AS tongTien,
                CASE 
                    WHEN hd.HinhThucThanhToan IS NOT NULL AND hd.HinhThucThanhToan != N'Đã hủy' THEN N'Đã thanh toán'
                    ELSE N'Chưa thanh toán'
                END AS trangThaiThanhToan,
                hd.NgayLap,
                hd.KhuyenMai,
                p.TongTien AS tongDichVu,
                0 AS tongSanPham
            FROM HOA_DON hd
            JOIN PHIEU_DICH_VU p ON hd.MaPhieuDichVu = p.MaPhieuDichVu
            JOIN KHACH_HANG kh ON p.MaKhachHang = kh.MaKhachHang
            WHERE p.MaChiNhanh = @MaChiNhanh
        `;
        
        const request = pool.request();
        request.input('MaChiNhanh', sql.Char(10), maChiNhanh);
        
        if (trangThaiThanhToan) {
            query += ` AND (
                CASE 
                    WHEN hd.HinhThucThanhToan IS NOT NULL AND hd.HinhThucThanhToan != N'Đã hủy' THEN N'Đã thanh toán'
                    ELSE N'Chưa thanh toán'
                END = @TrangThaiThanhToan
            )`;
            request.input('TrangThaiThanhToan', sql.NVarChar(20), trangThaiThanhToan);
        }
        
        if (ngayTao) {
            query += ` AND YEAR(hd.NgayLap) = YEAR(@NgayTao) AND MONTH(hd.NgayLap) = MONTH(@NgayTao)`;
            request.input('NgayTao', sql.Date, new Date(ngayTao + '-01'));
        }
        
        query += ` ORDER BY hd.NgayLap DESC`;
        
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        handleModelError(err, 'getInvoicesByBranch');
    }
}

// Gửi đánh giá hóa đơn
async function submitReview(data) {
    try {
        const pool = await connectDB();
        
        const result = await pool.request()
            .input('MaHD', sql.Char(10), data.maHoaDon)
            .input('NgayLap', sql.Date, new Date(data.ngayLap))
            .input('DiemCL', sql.Int, data.diemChatLuong)
            .input('ThaiDo', sql.Int, data.thaiDo)
            .input('HaiLong', sql.Int, data.mucDoHaiLong)
            .input('BinhLuan', sql.NVarChar(100), data.binhLuan || null)
            .execute('SP_KhachHangDanhGia');
        
        return { success: true, message: 'Đánh giá đã được lưu' };
    } catch (err) {
        handleModelError(err, 'submitReview');
    }
}

// Lấy đánh giá hóa đơn
async function getReview(maHoaDon, ngayLap) {
    try {
        const pool = await connectDB();
        
        const result = await pool.request()
            .input('MaHoaDon', sql.Char(10), maHoaDon)
            .input('NgayLap', sql.Date, new Date(ngayLap))
            .query(`
                SELECT 
                    MaHoaDon,
                    NgayLap,
                    DiemChatLuongDichVu,
                    ThaiDoNhanVien,
                    MucDoHaiLong,
                    BinhLuan,
                    PhanHoi
                FROM DANH_GIA
                WHERE MaHoaDon = @MaHoaDon AND NgayLap = @NgayLap
            `);
        
        return result.recordset[0] || null;
    } catch (err) {
        handleModelError(err, 'getReview');
    }
}

module.exports = {
    getAllPhieuDichVu,
    getPendingInvoices,
    getPhieuDichVuDetail,
    createInvoice,
    cancelInvoice,
    getInvoiceHistory,
    getAllPendingConfirmationInvoices,
    confirmPayment,
    getInvoicesByBranch,
    submitReview,
    getReview
};
