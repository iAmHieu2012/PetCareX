USE PETCAREX
GO

--==============================================================
-- PHẦN 6: THIẾT LẬP CÁC THỦ TỤC (STORED PROCEDURES)
--==============================================================

--==============================================================
-- QUẢN LÝ KHÁCH HÀNG & THÚ CƯNG
--==============================================================
-- Lưu thông tin một khách hàng mới
CREATE OR ALTER PROCEDURE SP_ThemKhachHang
    @MaKhachHang CHAR(10),
    @HoTen NVARCHAR(30),
    @SoDienThoai CHAR(10),
    @Email CHAR(30),
    @CCCD CHAR(12),
    @GioiTinh NVARCHAR(3),
    @NgaySinh DATE
AS
BEGIN
    -- Kiểm tra các thông tin unique đã tồn tại chưa
    IF EXISTS (SELECT 1 FROM KHACH_HANG WHERE MaKhachHang = @MaKhachHang)
    BEGIN
        RAISERROR(N'Mã khách hàng đã tồn tại.', 16, 1);
        RETURN;
    END
    IF EXISTS (SELECT 1 FROM KHACH_HANG WHERE SoDienThoai = @SoDienThoai)
    BEGIN
        RAISERROR(N'Số điện thoại đã được đăng ký.', 16, 1);
        RETURN;
    END
    IF EXISTS (SELECT 1 FROM KHACH_HANG WHERE Email = @Email)
    BEGIN
        RAISERROR(N'Email đã được đăng ký.', 16, 1);
        RETURN;
    END
    IF EXISTS (SELECT 1 FROM KHACH_HANG WHERE CCCD = @CCCD)
    BEGIN
        RAISERROR(N'Số CCCD đã được đăng ký.', 16, 1);
        RETURN;
    END
    -- Thêm khách hàng mới với điểm tích lũy mặc định là 0
    INSERT INTO KHACH_HANG (MaKhachHang, TenKhachHang, SoDienThoai, Email, CCCD, GioiTinh, NgaySinh, DiemTichLuy)
    VALUES (@MaKhachHang, @HoTen, @SoDienThoai, @Email, @CCCD, @GioiTinh, @NgaySinh, 0);
END;
GO
-- Chạy thử: EXEC SP_ThemKhachHang 'KH00000001', N'Nguyễn Văn A', '0901234567', 'a.nguyen@email.com', '123456789012', N'Nam', '1990-01-01'
-- GO

-- Tra cứu thông tin khách hàng theo Số điện thoại
CREATE OR ALTER PROCEDURE SP_TraCuuKhachHang_TheoSDT
    @SoDienThoai CHAR(10)
AS
BEGIN
    SELECT * FROM KHACH_HANG WHERE SoDienThoai = @SoDienThoai;
END;
GO
-- Chạy thử: EXEC SP_TraCuuKhachHang_TheoSDT '0901234567'
-- GO

-- Lưu thông tin một thú cưng mới cho khách hàng đã có
CREATE OR ALTER PROCEDURE SP_ThemThuCung
    @MaThuCung CHAR(10),
    @TenThuCung NVARCHAR(30),
    @Loai NVARCHAR(20),
    @Giong NVARCHAR(20),
    @NgaySinh DATE,
    @GioiTinh NVARCHAR(3),
    @MaKhachHang CHAR(10)
AS
BEGIN
    -- Kiểm tra chủ sở hữu có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM KHACH_HANG WHERE MaKhachHang = @MaKhachHang)
    BEGIN
        RAISERROR(N'Không tìm thấy khách hàng sở hữu.', 16, 1);
        RETURN;
    END
    INSERT INTO THU_CUNG (MaThuCung, TenThuCung, Loai, Giong, NgaySinh, GioiTinh, MaKhachHang)
    VALUES (@MaThuCung, @TenThuCung, @Loai, @Giong, @NgaySinh, @GioiTinh, @MaKhachHang);
END;
GO
-- Chạy thử: EXEC SP_ThemThuCung 'TC00000001', N'Lu Lu', N'Chó', N'Poodle', '2023-05-10', N'Đực', 'KH00000001'
-- GO

-- Tra cứu thông tin chi tiết thú cưng và chủ sở hữu
CREATE OR ALTER PROCEDURE SP_TraCuuThuCung_ChiTiet
    @MaThuCung CHAR(10)
AS
BEGIN
    SELECT 
        tc.MaThuCung, tc.TenThuCung, tc.Loai, tc.Giong, tc.NgaySinh, tc.GioiTinh,
        kh.MaKhachHang, kh.TenKhachHang AS TenChuSoHuu, kh.SoDienThoai
    FROM THU_CUNG tc
    JOIN KHACH_HANG kh ON tc.MaKhachHang = kh.MaKhachHang
    WHERE tc.MaThuCung = @MaThuCung;
END;
GO
-- Chạy thử: EXEC SP_TraCuuThuCung_ChiTiet 'TC00000001'
-- GO

--==============================================================
-- CHƯƠNG TRÌNH THÀNH VIÊN & LOYALTY
--==============================================================
-- Phân loại khách hàng tự động theo chi tiêu năm (VIP, Thân thiết, Cơ bản)
CREATE OR ALTER PROCEDURE SP_PhanLoaiKhachHang
    @Nam INT = NULL
AS BEGIN
    SET NOCOUNT ON;
    
    -- Mặc định là năm hiện tại
    IF @Nam IS NULL
        SET @Nam = YEAR(GETDATE());
    
    -- Xóa phân loại cũ của năm này (nếu có)
    DELETE FROM PHAN_LOAI_KHACH_HANG WHERE Nam = @Nam;
    
    -- Tính tổng chi tiêu của từng khách hàng trong năm
    WITH ChiTieuNam AS (
        SELECT 
            pdv.MaKhachHang,
            SUM(hd.TongTienThanhToan) AS TongChiTieu
        FROM HOA_DON hd
        INNER JOIN PHIEU_DICH_VU pdv ON hd.MaPhieuDichVu = pdv.MaPhieuDichVu
        WHERE YEAR(hd.NgayLap) = @Nam
        GROUP BY pdv.MaKhachHang
    ),
    PhanLoaiNamTruoc AS (
        SELECT MaKhachHang, TenLoai
        FROM PHAN_LOAI_KHACH_HANG
        WHERE Nam = @Nam - 1
    )
    -- Phân loại theo quy tắc
    INSERT INTO PHAN_LOAI_KHACH_HANG (MaKhachHang, Nam, MucChiTieu, TenLoai)
    SELECT 
        kh.MaKhachHang,
        @Nam,
        ISNULL(ct.TongChiTieu, 0) AS MucChiTieu,
        CASE
            -- VIP: >= 12tr HOẶC (>= 8tr VÀ năm trước VIP)
            WHEN ISNULL(ct.TongChiTieu, 0) >= 12000000 THEN N'VIP'
            WHEN ISNULL(ct.TongChiTieu, 0) >= 8000000 AND pl.TenLoai = N'VIP' THEN N'VIP'
            
            -- Thân thiết: < 12tr VÀ [>= 5tr HOẶC (>= 3tr VÀ năm trước Thân thiết)]
            WHEN ISNULL(ct.TongChiTieu, 0) >= 5000000 AND ISNULL(ct.TongChiTieu, 0) < 12000000 THEN N'Thân thiết'
            WHEN ISNULL(ct.TongChiTieu, 0) >= 3000000 AND ISNULL(ct.TongChiTieu, 0) < 12000000 AND pl.TenLoai = N'Thân thiết' THEN N'Thân thiết'
            
            -- Cơ bản: còn lại
            ELSE N'Cơ bản'
        END AS TenLoai
    FROM KHACH_HANG kh
    LEFT JOIN ChiTieuNam ct ON kh.MaKhachHang = ct.MaKhachHang
    LEFT JOIN PhanLoaiNamTruoc pl ON kh.MaKhachHang = pl.MaKhachHang;
END;
GO
-- Chạy thử: EXEC SP_PhanLoaiKhachHang 2025
-- GO

-- Xem thông tin hạng thành viên hiện tại của khách hàng
CREATE OR ALTER PROCEDURE SP_XemHangThanhVien
    @MaKhachHang CHAR(10) = NULL
AS BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        kh.MaKhachHang,
        kh.TenKhachHang,
        kh.SoDienThoai,
        kh.Email,
        kh.DiemTichLuy,
        pl.TenLoai AS HangThanhVien,
        pl.MucChiTieu AS ChiTieuNam,
        pl.Nam
    FROM KHACH_HANG kh
    LEFT JOIN PHAN_LOAI_KHACH_HANG pl ON kh.MaKhachHang = pl.MaKhachHang
        AND pl.Nam = YEAR(GETDATE())
    WHERE @MaKhachHang IS NULL OR kh.MaKhachHang = @MaKhachHang
    ORDER BY kh.MaKhachHang;
END;
GO
-- Chạy thử: EXEC SP_XemHangThanhVien 'KH00000001'
-- GO

-- Quy đổi điểm tích lũy thành tiền giảm giá (100 điểm = 100.000 VNĐ)
CREATE OR ALTER PROCEDURE SP_SuDungDiemTichLuy
    @MaKhachHang CHAR(10),
    @SoDiemSuDung INT,
    @TienGiamGia DECIMAL(11,2) OUTPUT
AS BEGIN
    SET NOCOUNT ON;
    
    DECLARE @DiemHienTai INT;
    
    -- Kiểm tra điểm hiện tại
    SELECT @DiemHienTai = DiemTichLuy FROM KHACH_HANG WHERE MaKhachHang = @MaKhachHang;
    
    IF @DiemHienTai IS NULL
    BEGIN
        RAISERROR(N'Không tìm thấy khách hàng!', 16, 1);
        RETURN;
    END
    
    IF @SoDiemSuDung > @DiemHienTai
    BEGIN
        RAISERROR(N'Không đủ điểm tích lũy!', 16, 1);
        RETURN;
    END
    
    -- Quy đổi: 100 điểm = 100.000 VNĐ
    SET @TienGiamGia = (@SoDiemSuDung / 100.0) * 100000;
    
    -- Trừ điểm
    UPDATE KHACH_HANG 
    SET DiemTichLuy = DiemTichLuy - @SoDiemSuDung
    WHERE MaKhachHang = @MaKhachHang;
    
    PRINT N'Đã sử dụng ' + CAST(@SoDiemSuDung AS NVARCHAR(10)) + N' điểm = ' + 
          CAST(@TienGiamGia AS NVARCHAR(20)) + N' VNĐ';
END;
GO
-- Chạy thử: DECLARE @TienGiam DECIMAL(11,2); EXEC SP_SuDungDiemTichLuy 'KH00000001', 100, @TienGiam OUTPUT; SELECT @TienGiam AS SoTienDuocGiam;
-- GO
--==============================================================
-- QUẢN LÝ DANH MỤC SẢN PHẨM & VACCINE
--==============================================================
-- Thêm sản phẩm mới vào danh mục
CREATE OR ALTER PROCEDURE SP_ThemSanPham
    @MaSanPham CHAR(10),
    @TenSanPham NVARCHAR(30),
    @LoaiSanPham NVARCHAR(10),
    @GiaBan DECIMAL(11,2)
AS BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM SAN_PHAM WHERE MaSanPham = @MaSanPham)
    BEGIN
        RAISERROR(N'Mã sản phẩm đã tồn tại!', 16, 1);
        RETURN;
    END
    
    -- CHECK CONSTRAINT tự động kiểm tra GiaBan > 0 và LoaiSanPham hợp lệ
    INSERT INTO SAN_PHAM (MaSanPham, TenSanPham, LoaiSanPham, GiaBan)
    VALUES (@MaSanPham, @TenSanPham, @LoaiSanPham, @GiaBan);
    
    PRINT N'Đã thêm sản phẩm: ' + @TenSanPham;
END;
GO
-- Chạy thử: EXEC SP_ThemSanPham 'SP00000001', N'Hạt Royal Canin', N'thức ăn', 250000
-- GO

-- Sửa thông tin sản phẩm
CREATE OR ALTER PROCEDURE SP_SuaSanPham
    @MaSanPham CHAR(10),
    @TenSanPham NVARCHAR(30) = NULL,
    @LoaiSanPham NVARCHAR(10) = NULL,
    @GiaBan DECIMAL(11,2) = NULL
AS BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM SAN_PHAM WHERE MaSanPham = @MaSanPham)
    BEGIN
        RAISERROR(N'Không tìm thấy sản phẩm!', 16, 1);
        RETURN;
    END
    
    -- CHECK CONSTRAINT tự động kiểm tra GiaBan > 0 và LoaiSanPham hợp lệ
    UPDATE SAN_PHAM
    SET TenSanPham = ISNULL(@TenSanPham, TenSanPham),
        LoaiSanPham = ISNULL(@LoaiSanPham, LoaiSanPham),
        GiaBan = ISNULL(@GiaBan, GiaBan)
    WHERE MaSanPham = @MaSanPham;
    
    PRINT N'Đã cập nhật sản phẩm: ' + @MaSanPham;
END;
GO
-- Chạy thử: EXEC SP_SuaSanPham 'SP00000001', @GiaBan = 260000
-- GO

-- Xóa sản phẩm (Kiểm tra ràng buộc giao dịch và tồn kho)
CREATE OR ALTER PROCEDURE SP_XoaSanPham
    @MaSanPham CHAR(10)
AS 
BEGIN
    SET NOCOUNT ON;
    
    -- 1. Kiểm tra xem sản phẩm đã từng được bán chưa (Lịch sử hóa đơn)
    IF EXISTS (SELECT 1 FROM CHI_TIET_MUA_HANG WHERE MaSanPham = @MaSanPham)
    BEGIN
        RAISERROR(N'Không thể xóa: Sản phẩm này đã có lịch sử giao dịch trong các hóa đơn!', 16, 1);
        RETURN;
    END
    
    -- 2. Kiểm tra xem sản phẩm còn tồn kho tại bất kỳ chi nhánh nào không
    IF EXISTS (SELECT 1 FROM KHO_HANG WHERE MaSanPham = @MaSanPham AND SoLuongTonKho > 0)
    BEGIN
        RAISERROR(N'Không thể xóa: Sản phẩm vẫn còn số lượng tồn kho thực tế!', 16, 1);
        RETURN;
    END

    -- 3. Kiểm tra các lô hàng (Lot history)
    IF EXISTS (SELECT 1 FROM LO_HANG WHERE MaSanPham = @MaSanPham)
    BEGIN
        RAISERROR(N'Không thể xóa: Sản phẩm vẫn còn thông tin lưu trữ trong danh mục Lô hàng!', 16, 1);
        RETURN;
    END
    
    -- 4. Tiến hành xóa nếu vượt qua các kiểm tra trên
    BEGIN TRY
        DELETE FROM SAN_PHAM WHERE MaSanPham = @MaSanPham;
        PRINT N'Đã xóa thành công sản phẩm: ' + @MaSanPham;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(N'Lỗi hệ thống khi xóa sản phẩm: %s', 16, 1, @ErrorMsg);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_XoaSanPham 'SP00000001'
-- GO

-- Tra cứu sản phẩm theo tên hoặc loại
CREATE OR ALTER PROCEDURE SP_TraCuuSanPham
    @TenSanPham NVARCHAR(30) = NULL,
    @LoaiSanPham NVARCHAR(10) = NULL
AS BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        sp.MaSanPham,
        sp.TenSanPham,
        sp.LoaiSanPham,
        sp.GiaBan,
        SUM(kh.SoLuongTonKho) AS TongTonKho
    FROM SAN_PHAM sp
    LEFT JOIN KHO_HANG kh ON sp.MaSanPham = kh.MaSanPham
    WHERE (@TenSanPham IS NULL OR sp.TenSanPham LIKE N'%' + @TenSanPham + N'%')
        AND (@LoaiSanPham IS NULL OR sp.LoaiSanPham = @LoaiSanPham)
    GROUP BY sp.MaSanPham, sp.TenSanPham, sp.LoaiSanPham, sp.GiaBan
    ORDER BY sp.TenSanPham;
END;
GO
-- Chạy thử: EXEC SP_TraCuuSanPham N'Hạt', N'thức ăn'
-- GO

-- Tra cứu thông tin Vaccine và Gói tiêm đi kèm
CREATE OR ALTER PROCEDURE SP_TraCuuVaccine
    @TenVacxin NVARCHAR(30) = NULL,
    @MaGoiTiem CHAR(10) = NULL
AS BEGIN
    SET NOCOUNT ON;
    
    SELECT DISTINCT
        vx.MaVacxin,
        vx.TenVacxin,
        vx.GiaTien,
        vx.LieuLuongToiDa,
        vx.MoTa,
        gt.MaGoiTiem,
        gt.LoaiGoiTiem,
        gt.ChuKi,
        gt.UuDai
    FROM VACXIN vx
    LEFT JOIN CHI_TIET_GOI_TIEM ctgt ON vx.MaVacxin = ctgt.MaVacxin
    LEFT JOIN GOI_TIEM gt ON ctgt.MaGoiTiem = gt.MaGoiTiem
    WHERE (@TenVacxin IS NULL OR vx.TenVacxin LIKE N'%' + @TenVacxin + N'%')
        AND (@MaGoiTiem IS NULL OR gt.MaGoiTiem = @MaGoiTiem)
    ORDER BY vx.TenVacxin;
END;
GO
-- Chạy thử: EXEC SP_TraCuuVaccine N'Dại', NULL
-- GO

--==============================================================
-- QUY TRÌNH DỊCH VỤ (LỊCH HẸN, KHÁM BỆNH, TIÊM PHÒNG)
--==============================================================
-- Khách hàng đặt một lịch hẹn mới (Trạng thái mặc định: Chờ xác nhận)
CREATE OR ALTER PROCEDURE SP_KhachHangDatLichHen
    @MaLichHen CHAR(10),
    @ThoiGian DATETIME,
    @LoaiLichHen NVARCHAR(10),
    @MaKhachHang CHAR(10),
    @MaThuCung CHAR(10),
    @MaChiNhanh CHAR(10)
AS
BEGIN
    INSERT INTO LICH_HEN (MaLichHen, ThoiGian, TrangThai, LoaiLichHen, MaKhachHang, MaThuCung, MaChiNhanh)
    VALUES (@MaLichHen, @ThoiGian, N'Chờ xác nhận', @LoaiLichHen, @MaKhachHang, @MaThuCung, @MaChiNhanh);
END;
GO
-- Chạy thử: EXEC SP_KhachHangDatLichHen 'LH00000001', '2026-02-01 09:00:00', N'Khám bệnh', 'KH00000001', 'TC00000001', 'CN00000001'
-- GO

-- Thêm lịch hẹn (Dành cho Quản trị viên/Nhân viên với đầy đủ tham số)
CREATE OR ALTER PROCEDURE SP_ThemLichHen
    @MaLH CHAR(10), @ThoiGian DATETIME, @TrangThai NVARCHAR(15),
    @Loai NVARCHAR(10), @MaKH CHAR(10), @MaTC CHAR(10),
    @MaCN CHAR(10), @MaNVXacNhan CHAR(10) = NULL, @MaPDV CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra trùng mã lịch hẹn
        IF EXISTS (SELECT 1 FROM LICH_HEN WHERE MaLichHen = @MaLH AND MaChiNhanh = @MaCN)
        BEGIN
            RAISERROR(N'Lỗi: Mã lịch hẹn %s đã tồn tại tại chi nhánh này.', 16, 1, @MaLH);
            RETURN;
        END

        -- Kiểm tra mã khách hàng có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM KHACH_HANG WHERE MaKhachHang = @MaKH)
        BEGIN
            RAISERROR(N'Lỗi: Mã khách hàng không tồn tại trong hệ thống.', 16, 1);
            RETURN;
        END

        -- Kiểm tra thú cưng có thuộc khách hàng đã chọn không
        IF NOT EXISTS (SELECT 1 FROM THU_CUNG WHERE MaThuCung = @MaTC AND MaKhachHang = @MaKH)
        BEGIN
            RAISERROR(N'Lỗi: Thú cưng này không thuộc quyền sở hữu của khách hàng đã chọn.', 16, 1);
            RETURN;
        END

        -- Kiểm tra thời gian hẹn (Không được đặt lịch trong quá khứ)
        IF @ThoiGian < GETDATE()
        BEGIN
            RAISERROR(N'Lỗi: Thời gian hẹn không hợp lệ (phải là thời gian trong tương lai).', 16, 1);
            RETURN;
        END

        -- Kiểm tra trạng thái hợp lệ
        IF @TrangThai NOT IN (N'Chờ xác nhận', N'Đã xác nhận', N'Đã hủy')
        BEGIN
            RAISERROR(N'Lỗi: Trạng thái lịch hẹn không hợp lệ.', 16, 1);
            RETURN;
        END

        -- Kiểm tra loại lịch hẹn hợp lệ
        IF NOT EXISTS (SELECT 1 FROM DICH_VU WHERE TenDichVu = @Loai)
        BEGIN
            RAISERROR(N'Lỗi: Loại dịch vụ "%s" không tồn tại trong danh mục hệ thống.', 16, 1, @Loai);
            RETURN;
        END

        -- KIỂM TRA CHI NHÁNH CÓ CUNG CẤP DỊCH VỤ NÀY KHÔNG
        IF NOT EXISTS (
            SELECT 1 FROM DICH_VU_CHI_NHANH dvcn
            JOIN DICH_VU dv ON dvcn.MaDichVu = dv.MaDichVu
            WHERE dvcn.MaChiNhanh = @MaCN AND dv.TenDichVu = @Loai
        )
        BEGIN
            RAISERROR(N'Lỗi: Chi nhánh %s hiện không cung cấp dịch vụ "%s".', 16, 1, @MaCN, @Loai);
            RETURN;
        END

        -- Kiểm tra mã nhân viên xác nhận có thuộc bộ phận Tiếp tân không
        IF @MaNVXacNhan IS NOT NULL
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN_TIEP_TAN WHERE MaNhanVien = @MaNVXacNhan)
            BEGIN
                RAISERROR(N'Lỗi: Nhân viên xác nhận phải thuộc bộ phận Tiếp tân.', 16, 1);
                RETURN;
            END
        END

        INSERT INTO LICH_HEN (MaLichHen, ThoiGian, TrangThai, LoaiLichHen, MaKhachHang, MaThuCung, MaChiNhanh, MaNhanVienXacNhan, MaPhieuDichVu)
        VALUES (@MaLH, @ThoiGian, @TrangThai, @Loai, @MaKH, @MaTC, @MaCN, @MaNVXacNhan, @MaPDV);
        
        PRINT N'Thêm lịch hẹn thành công.';
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_ThemLichHen 'LH00000002', '2026-02-05 10:30:00', N'Chờ xác nhận', N'Tiêm phòng', 'KH00000001', 'TC00000001', 'CN00000001'
-- GO

-- Cập nhật trạng thái lịch hẹn
CREATE OR ALTER PROCEDURE SP_CapNhatTrangThaiLichHen
    @MaLH CHAR(10), @MaCN CHAR(10), @TrangThaiMoi NVARCHAR(15)
AS
BEGIN
    SET NOCOUNT ON;
    IF @TrangThaiMoi NOT IN (N'Chờ xác nhận', N'Đã xác nhận', N'Đã hủy')
    BEGIN
        RAISERROR(N'Lỗi: Trạng thái không hợp lệ.', 16, 1); RETURN;
    END

    UPDATE LICH_HEN 
    SET TrangThai = @TrangThaiMoi 
    WHERE MaLichHen = @MaLH AND MaChiNhanh = @MaCN;
    
    IF @@ROWCOUNT = 0 PRINT N'Không tìm thấy lịch hẹn để cập nhật.';
    ELSE PRINT N'Cập nhật trạng thái thành công.';
END;
GO
-- Chạy thử: EXEC SP_CapNhatTrangThaiLichHen 'LH00000001', 'CN00000001', N'Đã hủy'
-- GO

-- Tiếp nhận lịch hẹn (Xác nhận và tự động tạo Phiếu dịch vụ)
CREATE OR ALTER PROCEDURE SP_TiepNhanLichHen
    @MaLH CHAR(10),
    @MaCN CHAR(10),
    @MaPDV_Moi CHAR(10),
    @MaKH CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @CurrentStatus NVARCHAR(15), @CurrentKH CHAR(10);
        SELECT @CurrentStatus = TrangThai, @CurrentKH = MaKhachHang 
        FROM LICH_HEN WHERE MaLichHen = @MaLH AND MaChiNhanh = @MaCN;

        IF @CurrentStatus IS NULL
        BEGIN
            RAISERROR(N'Lỗi: Không tìm thấy lịch hẹn.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF @CurrentStatus = N'Đã hủy'
        BEGIN
            RAISERROR(N'Lỗi: Không thể tiếp nhận lịch hẹn đã bị hủy.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF @CurrentKH <> @MaKH
        BEGIN
            RAISERROR(N'Lỗi: Mã khách hàng không khớp với dữ liệu trên lịch hẹn.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF EXISTS (SELECT 1 FROM PHIEU_DICH_VU WHERE MaPhieuDichVu = @MaPDV_Moi)
        BEGIN
            RAISERROR(N'Lỗi: Mã phiếu dịch vụ %s đã tồn tại.', 16, 1, @MaPDV_Moi);
            ROLLBACK TRANSACTION; RETURN;
        END

        INSERT INTO PHIEU_DICH_VU (MaPhieuDichVu, TongTien, MaChiNhanh, MaKhachHang)
        VALUES (@MaPDV_Moi, 0, @MaCN, @MaKH);

        UPDATE LICH_HEN
        SET TrangThai = N'Đã xác nhận',
            MaPhieuDichVu = @MaPDV_Moi
        WHERE MaLichHen = @MaLH AND MaChiNhanh = @MaCN;

        COMMIT TRANSACTION;
        PRINT N'Tiếp nhận thành công. Đã tạo Phiếu dịch vụ.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_TiepNhanLichHen 'LH00000002', 'CN00000001', 'PD00000001', 'KH00000001'
-- GO

-- Tạo phiếu dịch vụ từ lịch hẹn (Tiếp tân gọi khi xác nhận lịch hẹn)
CREATE OR ALTER PROCEDURE SP_TaoPhieuDichVuTuLichHen
    @MaLichHen CHAR(10),
    @MaChiNhanh CHAR(10),
    @MaPhieuDichVu CHAR(10) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra lịch hẹn có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM LICH_HEN WHERE MaLichHen = @MaLichHen AND MaChiNhanh = @MaChiNhanh)
        BEGIN
            RAISERROR(N'Lỗi: Không tìm thấy lịch hẹn %s tại chi nhánh %s.', 16, 1, @MaLichHen, @MaChiNhanh);
            RETURN;
        END

        -- Kiểm tra lịch hẹn đã có phiếu dịch vụ chưa
        DECLARE @ExistingPDV CHAR(10);
        SELECT @ExistingPDV = MaPhieuDichVu FROM LICH_HEN WHERE MaLichHen = @MaLichHen AND MaChiNhanh = @MaChiNhanh;
        
        IF @ExistingPDV IS NOT NULL
        BEGIN
            SET @MaPhieuDichVu = @ExistingPDV;
            PRINT N'Lịch hẹn đã có phiếu dịch vụ: ' + @MaPhieuDichVu;
            RETURN;
        END

        -- Lấy thông tin lịch hẹn
        DECLARE @MaKhachHang CHAR(10);
        SELECT @MaKhachHang = MaKhachHang FROM LICH_HEN WHERE MaLichHen = @MaLichHen AND MaChiNhanh = @MaChiNhanh;

        -- Tạo phiếu dịch vụ mới
        INSERT INTO PHIEU_DICH_VU (MaPhieuDichVu, TongTien, MaChiNhanh, MaKhachHang)
        VALUES (@MaPhieuDichVu, 0.00, @MaChiNhanh, @MaKhachHang);

        -- Update lịch hẹn với mã phiếu dịch vụ
        UPDATE LICH_HEN 
        SET MaPhieuDichVu = @MaPhieuDichVu, TrangThai = N'Đã xác nhận'
        WHERE MaLichHen = @MaLichHen AND MaChiNhanh = @MaChiNhanh;

        PRINT N'Đã tạo phiếu dịch vụ ' + @MaPhieuDichVu + ' cho lịch hẹn ' + @MaLichHen;
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO

-- Tạo phiếu khám bệnh mới (Tiếp tân tạo sau khi tiếp nhận lịch hẹn + phân công bác sĩ)
CREATE OR ALTER PROCEDURE SP_TaoPhieuKhamBenh
    @MaPhieuDichVu CHAR(10),
    @MaThuCung CHAR(10),
    @MaBacSi CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra phiếu dịch vụ có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM PHIEU_DICH_VU WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            RAISERROR(N'Lỗi: Không tìm thấy phiếu dịch vụ %s.', 16, 1, @MaPhieuDichVu);
            RETURN;
        END

        -- Kiểm tra bác sĩ có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM BAC_SI_THU_Y WHERE MaNhanVien = @MaBacSi)
        BEGIN
            RAISERROR(N'Lỗi: Mã bác sĩ %s không tồn tại.', 16, 1, @MaBacSi);
            RETURN;
        END

        -- Kiểm tra thú cưng có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM THU_CUNG WHERE MaThuCung = @MaThuCung)
        BEGIN
            RAISERROR(N'Lỗi: Mã thú cưng %s không tồn tại.', 16, 1, @MaThuCung);
            RETURN;
        END

        -- Kiểm tra phiếu khám bệnh chưa tồn tại
        IF EXISTS (SELECT 1 FROM PHIEU_KHAM_BENH WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            RAISERROR(N'Lỗi: Phiếu khám bệnh cho phiếu dịch vụ %s đã tồn tại.', 16, 1, @MaPhieuDichVu);
            RETURN;
        END

        -- Tạo phiếu khám bệnh mới (Tiếp tân tạo, bác sĩ được phân công, chờ bác sĩ nhập liệu kết quả)
        INSERT INTO PHIEU_KHAM_BENH (MaPhieuDichVu, TrieuChung, ChuanDoan, NgayHenTaiKham, MaBacSi, MaThuCung)
        VALUES (@MaPhieuDichVu, NULL, NULL, NULL, @MaBacSi, @MaThuCung);

        PRINT N'Tiếp tân đã tạo phiếu khám bệnh và phân công bác sĩ thành công.';
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_TaoPhieuKhamBenh 'PD00000001', 'TC00000001', 'NV00000001'
-- GO

-- Cập nhật thông tin phiếu khám bệnh (Bác sĩ nhập liệu kết quả khám)
CREATE OR ALTER PROCEDURE SP_CapNhatPhieuKhamBenh
    @MaPhieuDichVu CHAR(10),
    @TrieuChung NVARCHAR(100),
    @ChuanDoan NVARCHAR(100),
    @NgayHenTaiKham DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra phiếu khám bệnh có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM PHIEU_KHAM_BENH WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            RAISERROR(N'Lỗi: Không tìm thấy phiếu khám bệnh cho phiếu dịch vụ %s.', 16, 1, @MaPhieuDichVu);
            RETURN;
        END

        -- Cập nhật thông tin khám
        UPDATE PHIEU_KHAM_BENH
        SET TrieuChung = @TrieuChung,
            ChuanDoan = @ChuanDoan,
            NgayHenTaiKham = ISNULL(@NgayHenTaiKham, NgayHenTaiKham)
        WHERE MaPhieuDichVu = @MaPhieuDichVu;

        PRINT N'Cập nhật phiếu khám bệnh thành công.';
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_CapNhatPhieuKhamBenh 'PD00000001', N'Ho, sốt, mệt', N'Viêm đường hô hấp', '2026-02-15'
-- GO

-- Tạo phiếu tiêm phòng mới (Tiếp tân tạo sau khi tiếp nhận lịch hẹn + phân công bác sĩ)
CREATE OR ALTER PROCEDURE SP_TaoPhieuTiemPhong
    @MaPhieuDichVu CHAR(10),
    @MaThuCung CHAR(10),
    @MaBacSi CHAR(10),
    @MaGoiTiem CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- 1. KIỂM TRA THAM SỐ ĐẦU VÀO
        IF @MaGoiTiem IS NULL OR LTRIM(RTRIM(@MaGoiTiem)) = ''
        BEGIN
            RAISERROR(N'Lỗi: Mã gói tiêm là bắt buộc (bao gồm cả gói tiêm lẻ).', 16, 1);
            RETURN;
        END

        -- 2. KIỂM TRA SỰ TỒN TẠI CỦA CÁC THỰC THỂ
        IF NOT EXISTS (SELECT 1 FROM PHIEU_DICH_VU WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            RAISERROR(N'Lỗi: Không tìm thấy phiếu dịch vụ %s.', 16, 1, @MaPhieuDichVu);
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM BAC_SI_THU_Y WHERE MaNhanVien = @MaBacSi)
        BEGIN
            RAISERROR(N'Lỗi: Mã bác sĩ %s không tồn tại.', 16, 1, @MaBacSi);
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM THU_CUNG WHERE MaThuCung = @MaThuCung)
        BEGIN
            RAISERROR(N'Lỗi: Mã thú cưng %s không tồn tại.', 16, 1, @MaThuCung);
            RETURN;
        END

        -- 3. KIỂM TRA GÓI TIÊM VÀ QUYỀN SỞ HỮU
        IF NOT EXISTS (SELECT 1 FROM GOI_TIEM WHERE MaGoiTiem = @MaGoiTiem)
        BEGIN
            RAISERROR(N'Lỗi: Mã gói tiêm %s không tồn tại trong danh mục.', 16, 1, @MaGoiTiem);
            RETURN;
        END

        -- Ràng buộc: Thú cưng phải có phiếu đăng ký gói tiêm này trước đó
        IF NOT EXISTS (
            SELECT 1 FROM PHIEU_DANG_KY_GOI_TIEM 
            WHERE MaThuCung = @MaThuCung AND MaGoiTiem = @MaGoiTiem
        )
        BEGIN
            RAISERROR(N'Lỗi: Thú cưng %s chưa đăng ký/mua gói tiêm %s.', 16, 1, @MaThuCung, @MaGoiTiem);
            RETURN;
        END

        -- 4. KIỂM TRA TÍNH DUY NHẤT (QUY TẮC XOR)
        -- Một Phiếu dịch vụ chỉ được là một loại phiếu con
        IF EXISTS (SELECT 1 FROM PHIEU_TIEM_PHONG WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            RAISERROR(N'Lỗi: Phiếu tiêm phòng này đã tồn tại.', 16, 1);
            RETURN;
        END
        
        IF EXISTS (SELECT 1 FROM PHIEU_KHAM_BENH WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            RAISERROR(N'Lỗi: Phiếu dịch vụ này đã được sử dụng làm Phiếu khám bệnh.', 16, 1);
            RETURN;
        END

        -- 5. THỰC THI INSERT
        INSERT INTO PHIEU_TIEM_PHONG (MaPhieuDichVu, NgayTiem, MaVacxin, LieuLuong, MaGoiTiem, MaThuCung, MaBacSi)
        VALUES (@MaPhieuDichVu, NULL, NULL, NULL, @MaGoiTiem, @MaThuCung, @MaBacSi);

        PRINT N'Thành công: Đã tạo phiếu tiêm phòng với gói tiêm ' + @MaGoiTiem;
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_TaoPhieuTiemPhong 'PD00000001', 'TC00000001', 'NV00000001', 'GT00000001'
-- GO

-- Cập nhật thông tin phiếu tiêm phòng (Bác sĩ nhập liệu chi tiết tiêm)
CREATE OR ALTER PROCEDURE SP_CapNhatPhieuTiemPhong
    @MaPhieuDichVu CHAR(10),
    @NgayTiem DATE,
    @MaVacxin CHAR(10),
    @LieuLuong INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra phiếu tiêm phòng có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM PHIEU_TIEM_PHONG WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            RAISERROR(N'Lỗi: Không tìm thấy phiếu tiêm phòng cho phiếu dịch vụ %s.', 16, 1, @MaPhieuDichVu);
            RETURN;
        END

        -- Kiểm tra vaccine có tồn tại không
        IF NOT EXISTS (SELECT 1 FROM VACXIN WHERE MaVacxin = @MaVacxin)
        BEGIN
            RAISERROR(N'Lỗi: Mã vaccine %s không tồn tại.', 16, 1, @MaVacxin);
            RETURN;
        END

        -- Cập nhật thông tin tiêm
        UPDATE PHIEU_TIEM_PHONG
        SET NgayTiem = @NgayTiem,
            MaVacxin = @MaVacxin,
            LieuLuong = @LieuLuong
        WHERE MaPhieuDichVu = @MaPhieuDichVu;

        PRINT N'Cập nhật phiếu tiêm phòng thành công.';
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_CapNhatPhieuTiemPhong 'PD00000001', '2026-02-01', 'VX00000001', 1
-- GO

-- Ghi nhận kết quả khám bệnh (Cũ - giữ lại để tương thích)
CREATE OR ALTER PROCEDURE SP_GhiNhanPhieuKhamBenh
    @MaPhieuDichVu CHAR(10),
    @TrieuChung NVARCHAR(100),
    @ChuanDoan NVARCHAR(100),
    @NgayHenTaiKham DATE = NULL,
    @MaBacSi CHAR(10) = NULL,
    @MaThuCung CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Nếu phiếu chưa tồn tại thì tạo mới, nếu có rồi thì chỉ cập nhật
    IF NOT EXISTS (SELECT 1 FROM PHIEU_KHAM_BENH WHERE MaPhieuDichVu = @MaPhieuDichVu)
    BEGIN
        INSERT INTO PHIEU_KHAM_BENH(MaPhieuDichVu, TrieuChung, ChuanDoan, NgayHenTaiKham, MaBacSi, MaThuCung)
        VALUES (@MaPhieuDichVu, @TrieuChung, @ChuanDoan, @NgayHenTaiKham, @MaBacSi, @MaThuCung);
    END
    ELSE
    BEGIN
        UPDATE PHIEU_KHAM_BENH
        SET TrieuChung = ISNULL(@TrieuChung, TrieuChung),
            ChuanDoan = ISNULL(@ChuanDoan, ChuanDoan),
            NgayHenTaiKham = ISNULL(@NgayHenTaiKham, NgayHenTaiKham),
            MaBacSi = ISNULL(@MaBacSi, MaBacSi),
            MaThuCung = ISNULL(@MaThuCung, MaThuCung)
        WHERE MaPhieuDichVu = @MaPhieuDichVu;
    END
END;
GO
-- Chạy thử: EXEC SP_GhiNhanPhieuKhamBenh 'PD00000001', N'Ho, sốt', N'Viêm phổi nhẹ', '2026-02-15', 'NV00000001', 'TC00000001'
-- GO

-- Thêm thuốc vào toa thuốc của phiếu khám bệnh
CREATE OR ALTER PROCEDURE SP_ThemThuocVaoToa
    @MaPhieuKhamBenh CHAR(10),
    @MaThuoc CHAR(10),
    @SoLuong INT
AS
BEGIN
    INSERT INTO CHI_TIET_TOA_THUOC(MaPhieuKhamBenh, MaThuoc, SoLuong)
    VALUES(@MaPhieuKhamBenh, @MaThuoc, @SoLuong);
END;
GO
-- Chạy thử: EXEC SP_ThemThuocVaoToa 'PD00000001', 'SP00000002', 10
-- GO

-- Ghi nhận một mũi tiêm phòng (Cũ - giữ lại để tương thích)
CREATE OR ALTER PROCEDURE SP_GhiNhanTiemPhong
    @MaPhieuDichVu CHAR(10),
    @NgayTiem DATE = NULL,
    @MaVacxin CHAR(10) = NULL,
    @LieuLuong INT = NULL,
    @MaGoiTiem CHAR(10) = NULL,
    @MaThuCung CHAR(10) = NULL,
    @MaBacSi CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Nếu phiếu chưa tồn tại thì tạo mới, nếu có rồi thì chỉ cập nhật
    IF NOT EXISTS (SELECT 1 FROM PHIEU_TIEM_PHONG WHERE MaPhieuDichVu = @MaPhieuDichVu)
    BEGIN
        INSERT INTO PHIEU_TIEM_PHONG(MaPhieuDichVu, NgayTiem, MaVacxin, LieuLuong, MaGoiTiem, MaThuCung, MaBacSi)
        VALUES (@MaPhieuDichVu, @NgayTiem, @MaVacxin, @LieuLuong, @MaGoiTiem, @MaThuCung, @MaBacSi);
    END
    ELSE
    BEGIN
        UPDATE PHIEU_TIEM_PHONG
        SET NgayTiem = ISNULL(@NgayTiem, NgayTiem),
            MaVacxin = ISNULL(@MaVacxin, MaVacxin),
            LieuLuong = ISNULL(@LieuLuong, LieuLuong),
            MaGoiTiem = ISNULL(@MaGoiTiem, MaGoiTiem),
            MaThuCung = ISNULL(@MaThuCung, MaThuCung),
            MaBacSi = ISNULL(@MaBacSi, MaBacSi)
        WHERE MaPhieuDichVu = @MaPhieuDichVu;
    END
END;
GO
-- Chạy thử: EXEC SP_GhiNhanTiemPhong 'PD00000001', '2026-02-01', 'VX00000001', 1, 'GT00000001', 'TC00000001', 'NV00000001'
-- GO

-- Xem lịch sử tiêm phòng của một thú cưng
CREATE OR ALTER PROCEDURE SP_LichSuTiemPhong
    @MaThuCung CHAR(10)
AS BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ptp.MaPhieuDichVu,
        ptp.NgayTiem,
        vx.TenVacxin,
        ptp.LieuLuong,
        gt.LoaiGoiTiem,
        bs.HoTen AS BacSi
    FROM PHIEU_TIEM_PHONG ptp
    INNER JOIN VACXIN vx ON ptp.MaVacxin = vx.MaVacxin
    INNER JOIN GOI_TIEM gt ON ptp.MaGoiTiem = gt.MaGoiTiem
    INNER JOIN NHAN_VIEN bs ON ptp.MaBacSi = bs.MaNhanVien
    WHERE ptp.MaThuCung = @MaThuCung
    ORDER BY ptp.NgayTiem DESC;
END;
GO
-- Chạy thử: EXEC SP_LichSuTiemPhong 'TC00000001'
-- GO

--==============================================================
-- GIAO DỊCH & HÓA ĐƠN (BILLING)
--==============================================================
-- Lập Hóa Đơn Tổng Hợp (Tự động tính ưu đãi gói tiêm và tích lũy điểm)
CREATE OR ALTER PROCEDURE SP_LapHoaDonTongHop
    @MaHoaDon CHAR(10),
    @MaPhieuDichVu CHAR(10),
    @MaNhanVien CHAR(10),
    @KhuyenMaiNgoai FLOAT = 0,
    @HinhThucThanhToan NVARCHAR(20),
    @SuDungDiem INT = 0
AS 
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @TongTienGoc DECIMAL(11,2) = 0;
        DECLARE @TiLeUuDaiGoi FLOAT = 0;
        DECLARE @TiLeGiamTong FLOAT = 0;
        DECLARE @SoTienGiamGia DECIMAL(11,2) = 0;
        DECLARE @TienGiamDiem DECIMAL(11,2) = 0;
        DECLARE @MaKhachHang CHAR(10);
        DECLARE @MaThuCung CHAR(10) = NULL;
        DECLARE @TongThanhToan DECIMAL(11,2) = 0;

        SELECT 
            @TongTienGoc = TongTien, 
            @MaKhachHang = MaKhachHang 
        FROM PHIEU_DICH_VU 
        WHERE MaPhieuDichVu = @MaPhieuDichVu;

        IF @MaKhachHang IS NULL 
        BEGIN
            RAISERROR(N'Lỗi: Không tìm thấy Phiếu dịch vụ!', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM PHIEU_TIEM_PHONG WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            SELECT @MaThuCung = MaThuCung FROM PHIEU_TIEM_PHONG WHERE MaPhieuDichVu = @MaPhieuDichVu;
            SET @TongTienGoc = 0; 
            SET @HinhThucThanhToan = N'Khấu trừ gói tiêm';
        END
        
        ELSE IF EXISTS (SELECT 1 FROM PHIEU_DANG_KY_GOI_TIEM WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            SELECT 
                @MaThuCung = pdk.MaThuCung,
                @TiLeUuDaiGoi = ISNULL(gt.UuDai, 0)
            FROM PHIEU_DANG_KY_GOI_TIEM pdk
            JOIN GOI_TIEM gt ON pdk.MaGoiTiem = gt.MaGoiTiem
            WHERE pdk.MaPhieuDichVu = @MaPhieuDichVu;
        END

        ELSE IF EXISTS (SELECT 1 FROM PHIEU_KHAM_BENH WHERE MaPhieuDichVu = @MaPhieuDichVu)
        BEGIN
            SELECT @MaThuCung = MaThuCung FROM PHIEU_KHAM_BENH WHERE MaPhieuDichVu = @MaPhieuDichVu;
        END

        IF @SuDungDiem > 0
        BEGIN
            EXEC SP_SuDungDiemTichLuy @MaKhachHang, @SuDungDiem, @TienGiamDiem OUTPUT;
        END

        SET @TiLeGiamTong = @TiLeUuDaiGoi + @KhuyenMaiNgoai;
        SET @SoTienGiamGia = @TongTienGoc * CAST(@TiLeGiamTong AS DECIMAL(11,4));
        SET @TongThanhToan = @TongTienGoc - @SoTienGiamGia - @TienGiamDiem;
        
        IF @TongThanhToan < 0 SET @TongThanhToan = 0;

        INSERT INTO HOA_DON (MaHoaDon, NgayLap, TongTienThanhToan, KhuyenMai, HinhThucThanhToan, MaPhieuDichVu, MaNhanVien, MaThuCung)
        VALUES (@MaHoaDon, CAST(GETDATE() AS DATE), @TongThanhToan, @TiLeGiamTong, @HinhThucThanhToan, @MaPhieuDichVu, @MaNhanVien, @MaThuCung);

        IF @TongTienGoc = 0 
        BEGIN
            UPDATE PHIEU_DICH_VU SET TongTien = 0 WHERE MaPhieuDichVu = @MaPhieuDichVu;
        END

        PRINT N'Thành công: Đã lập hóa đơn với tổng mức giảm giá ' + CAST(@TiLeGiamTong * 100 AS NVARCHAR(10)) + '%';
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_LapHoaDonTongHop 'HD00000001', 'PD00000001', 'NV00000001', 0.05, N'Tiền mặt', 0
-- GO

--==============================================================
-- QUẢN LÝ TỒN KHO
--==============================================================
-- Báo cáo tồn kho theo chi nhánh và loại sản phẩm
CREATE OR ALTER PROCEDURE SP_BaoCaoTonKho
    @MaChiNhanh CHAR(10) = NULL,
    @LoaiSanPham NVARCHAR(10) = NULL
AS BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        cn.MaChiNhanh,
        cn.TenChiNhanh,
        sp.MaSanPham,
        sp.TenSanPham,
        sp.LoaiSanPham,
        sp.GiaBan,
        SUM(kh.SoLuongTonKho) AS TongTonKho,
        MIN(lh.HanSuDung) AS HanSuDungGanNhat
    FROM KHO_HANG kh
    INNER JOIN SAN_PHAM sp ON kh.MaSanPham = sp.MaSanPham
    INNER JOIN CHI_NHANH cn ON kh.MaChiNhanh = cn.MaChiNhanh
    LEFT JOIN LO_HANG lh ON kh.MaSanPham = lh.MaSanPham AND kh.NgaySanXuat = lh.NgaySanXuat
    WHERE (@MaChiNhanh IS NULL OR cn.MaChiNhanh = @MaChiNhanh)
        AND (@LoaiSanPham IS NULL OR sp.LoaiSanPham = @LoaiSanPham)
    GROUP BY cn.MaChiNhanh, cn.TenChiNhanh, sp.MaSanPham, sp.TenSanPham, sp.LoaiSanPham, sp.GiaBan
    ORDER BY cn.TenChiNhanh, sp.TenSanPham;
END;
GO
-- Chạy thử: EXEC SP_BaoCaoTonKho 'CN00000001', N'thuốc'
-- GO

-- Nhập hàng vào kho tại chi nhánh cụ thể
CREATE OR ALTER PROCEDURE SP_NhapHang
    @MaChiNhanh CHAR(10),
    @MaSanPham CHAR(10),
    @NgaySanXuat DATETIME,
    @HanSuDung DATETIME = NULL,
    @SoLuong INT
AS BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM LO_HANG WHERE MaSanPham = @MaSanPham AND NgaySanXuat = @NgaySanXuat)
        BEGIN
            INSERT INTO LO_HANG (MaSanPham, NgaySanXuat, HanSuDung)
            VALUES (@MaSanPham, @NgaySanXuat, @HanSuDung);
        END
        
        IF EXISTS (SELECT 1 FROM KHO_HANG WHERE MaChiNhanh = @MaChiNhanh 
                   AND MaSanPham = @MaSanPham AND NgaySanXuat = @NgaySanXuat)
        BEGIN
            UPDATE KHO_HANG
            SET SoLuongTonKho = SoLuongTonKho + @SoLuong
            WHERE MaChiNhanh = @MaChiNhanh AND MaSanPham = @MaSanPham AND NgaySanXuat = @NgaySanXuat;
        END
        ELSE
        BEGIN
            INSERT INTO KHO_HANG (MaChiNhanh, MaSanPham, NgaySanXuat, SoLuongTonKho)
            VALUES (@MaChiNhanh, @MaSanPham, @NgaySanXuat, @SoLuong);
        END
        
        COMMIT TRANSACTION;
        PRINT N'Đã nhập ' + CAST(@SoLuong AS NVARCHAR(10)) + N' sản phẩm vào kho';
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMsg, 16, 1);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_NhapHang 'CN00000001', 'SP00000001', '2026-01-01', '2028-01-01', 100
-- GO

--==============================================================
-- QUẢN LÝ NHÂN SỰ & LƯƠNG THƯỞNG
--==============================================================
-- Lấy hồ sơ thông tin nhân viên
CREATE OR ALTER PROCEDURE SP_LayHoSoNhanVien
    @MaNV CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT  nv.MaNhanVien, 
            nv.HoTen, 
            nv.NgayVaoLam, 
            nv.ChucVu, 
            bl.LuongCoBan,
            cn.TenChiNhanh
    FROM NHAN_VIEN nv 
    JOIN BANG_LUONG bl ON nv.ChucVu = bl.ChucVu
    JOIN CHI_NHANH cn ON nv.MaChiNhanh = cn.MaChiNhanh
    WHERE (@MaNV IS NULL OR nv.MaNhanVien = @MaNV)
    ORDER BY nv.ChucVu;
END;
GO
-- Chạy thử: EXEC SP_LayHoSoNhanVien 'NV00000001'
-- GO

-- Xem lịch sử điều động chi nhánh của nhân viên
CREATE OR ALTER PROCEDURE SP_LayLichSuDieuDong
    @MaNV CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT ls.MaChiNhanh, cn.TenChiNhanh, ls.NgayBatDau, ls.NgayKetThuc, ls.ViTri
    FROM LICH_SU_DIEU_DONG ls 
    JOIN CHI_NHANH cn ON ls.MaChiNhanh = cn.MaChiNhanh
    WHERE ls.MaNhanVien = @MaNV
    ORDER BY ls.NgayBatDau DESC;
END;
GO
-- Chạy thử: EXEC SP_LayLichSuDieuDong 'NV00000001'
-- GO

-- Thực hiện điều chuyển chi nhánh hoặc thăng chức cho nhân viên
CREATE OR ALTER PROCEDURE SP_DieuChuyenVaThangChuc
    @MaNV CHAR(10),
    @MaChiNhanhMoi CHAR(10),
    @ChucVuMoi NVARCHAR(20),
    @NgayHieuLuc DATE
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN WHERE MaNhanVien = @MaNV)
        BEGIN
            RAISERROR(N'Lỗi: Mã nhân viên %s không tồn tại.', 16, 1, @MaNV);
            ROLLBACK TRANSACTION; RETURN;
        END
        
        IF NOT EXISTS (SELECT 1 FROM CHI_NHANH WHERE MaChiNhanh = @MaChiNhanhMoi)
        BEGIN
            RAISERROR(N'Lỗi: Mã chi nhánh %s không tồn tại.', 16, 1, @MaChiNhanhMoi);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM BANG_LUONG WHERE ChucVu = @ChucVuMoi)
        BEGIN
            RAISERROR(N'Lỗi: Chức vụ %s không tồn tại trong danh mục bảng lương.', 16, 1, @ChucVuMoi);
            ROLLBACK TRANSACTION; RETURN;
        END

        DECLARE @NgayVaoLam DATE;
        DECLARE @NgayVaoLamStr NVARCHAR(10);
        SELECT @NgayVaoLam = NgayVaoLam FROM NHAN_VIEN WHERE MaNhanVien = @MaNV;
        SET @NgayVaoLamStr = CONVERT(NVARCHAR(10), @NgayVaoLam, 105); 

        IF @NgayHieuLuc < @NgayVaoLam
        BEGIN
            RAISERROR(N'Lỗi: Ngày hiệu lực không được trước ngày vào làm (%s).', 16, 1, @NgayVaoLamStr);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF EXISTS (SELECT 1 FROM NHAN_VIEN 
                   WHERE MaNhanVien = @MaNV AND MaChiNhanh = @MaChiNhanhMoi AND ChucVu = @ChucVuMoi)
        BEGIN
            RAISERROR(N'Lỗi: Nhân viên hiện đã ở chi nhánh và chức vụ này, không cần điều chuyển.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        UPDATE LICH_SU_DIEU_DONG 
        SET NgayKetThuc = DATEADD(DAY, -1, @NgayHieuLuc)
        WHERE MaNhanVien = @MaNV AND NgayKetThuc IS NULL;

        UPDATE NHAN_VIEN 
        SET MaChiNhanh = @MaChiNhanhMoi, ChucVu = @ChucVuMoi 
        WHERE MaNhanVien = @MaNV;

        INSERT INTO LICH_SU_DIEU_DONG (MaNhanVien, MaChiNhanh, NgayBatDau, NgayKetThuc, ViTri)
        VALUES (@MaNV, @MaChiNhanhMoi, @NgayHieuLuc, NULL, @ChucVuMoi);

        COMMIT TRANSACTION;
        PRINT N'Thành công: Đã điều chuyển và cập nhật lịch sử nhân viên.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO
-- Chạy thử: EXEC SP_DieuChuyenVaThangChuc 'NV00000001', 'CN00000002', N'Quản lí', '2026-03-01'
-- GO

-- Tổng hợp thu nhập hàng tháng (Lương + Thưởng doanh thu + Thưởng Tết)
CREATE OR ALTER PROCEDURE SP_TongHopThuNhap_NhanVien
    @MaNV CHAR(10),
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @LuongCoBan DECIMAL(11,2), @ThuongDoanhThu DECIMAL(11,2), @ThuongTet DECIMAL(11,2) = 0;

    SELECT @LuongCoBan = bl.LuongCoBan
    FROM NHAN_VIEN nv JOIN BANG_LUONG bl ON nv.ChucVu = bl.ChucVu
    WHERE nv.MaNhanVien = @MaNV;

    SET @ThuongDoanhThu = dbo.FN_TinhThuongDoanhThu(@MaNV, @Thang, @Nam, DEFAULT);

    IF @Thang = 12 
        SET @ThuongTet = dbo.FN_TinhThuongTet(@MaNV, @Nam);

    SELECT @MaNV AS MaNhanVien,
           @LuongCoBan AS LuongChinh,
           @ThuongDoanhThu AS ThuongKinhDoanh,
           @ThuongTet AS ThuongThang13,
           (@LuongCoBan + @ThuongDoanhThu + @ThuongTet) AS TongThucLinh;
END;
GO
-- Chạy thử: EXEC SP_TongHopThuNhap_NhanVien 'NV00000001', 12, 2025
-- GO

--==============================================================
-- THỐNG KÊ, BÁO CÁO & ĐÁNH GIÁ
--==============================================================
-- 8.1. Thống kê hiệu suất làm việc của nhân viên
CREATE OR ALTER PROCEDURE SP_ThongKeHieuSuat_NhanVien
    @Thang INT,
    @Nam INT,
    @MaNV CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT  nv.MaNhanVien, 
            nv.HoTen, 
            nv.ChucVu, 
            COUNT(hd.MaHoaDon) AS TongSoDonHang,
            SUM(hd.TongTienThanhToan) AS TongDoanhSo,
            ROUND(AVG(CAST(dg.DiemChatLuongDichVu AS FLOAT)), 2) AS DiemDichVuTB,
            ROUND(AVG(CAST(dg.ThaiDoNhanVien AS FLOAT)), 2) AS DiemThaiDoTB
    FROM NHAN_VIEN nv LEFT JOIN HOA_DON hd ON (nv.MaNhanVien = hd.MaNhanVien AND MONTH(hd.NgayLap) = @Thang AND YEAR(hd.NgayLap) = @Nam)
                      LEFT JOIN DANH_GIA dg ON hd.MaHoaDon = dg.MaHoaDon AND hd.NgayLap = dg.NgayLap
    WHERE (@MaNV IS NULL OR nv.MaNhanVien = @MaNV)
    GROUP BY nv.MaNhanVien, nv.HoTen, nv.ChucVu
    ORDER BY TongDoanhSo DESC;
END;
GO
-- Chạy thử: EXEC SP_ThongKeHieuSuat_NhanVien 1, 2026, NULL
-- GO

-- 8.2. Thống kê hiệu suất kinh doanh theo chi nhánh
CREATE OR ALTER PROCEDURE SP_ThongKeHieuSuat_ChiNhanh
    @Thang INT,
    @Nam INT,
    @MaCN CHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT  cn.MaChiNhanh,
            cn.TenChiNhanh,
            COUNT(hd.MaHoaDon) AS TongSoDonHang,
            ISNULL(SUM(hd.TongTienThanhToan), 0) AS TongDoanhThu,
            ROUND(AVG(CAST(dg.DiemChatLuongDichVu AS FLOAT)), 2) AS DiemDichVuTB,
            ROUND(AVG(CAST(dg.ThaiDoNhanVien AS FLOAT)), 2) AS DiemThaiDoTB,
            ROUND(AVG(CAST(dg.MucDoHaiLong AS FLOAT)), 2) AS DiemHaiLongTB
    FROM CHI_NHANH cn LEFT JOIN PHIEU_DICH_VU pdv ON cn.MaChiNhanh = pdv.MaChiNhanh
                      LEFT JOIN HOA_DON hd ON (pdv.MaPhieuDichVu = hd.MaPhieuDichVu AND MONTH(hd.NgayLap) = @Thang AND YEAR(hd.NgayLap) = @Nam)
                      LEFT JOIN DANH_GIA dg ON (hd.MaHoaDon = dg.MaHoaDon AND hd.NgayLap = dg.NgayLap)
    WHERE (@MaCN IS NULL OR cn.MaChiNhanh = @MaCN)
    GROUP BY cn.MaChiNhanh, cn.TenChiNhanh
    ORDER BY TongDoanhThu DESC;
END;
GO
-- Chạy thử: EXEC SP_ThongKeHieuSuat_ChiNhanh 1, 2026, 'CN00000001'
-- GO

-- 8.3. Báo cáo doanh thu chi tiết theo tiêu chí thời gian tại chi nhánh
CREATE PROCEDURE SP_DoanhThuChiNhanh
    @MaCN CHAR(10),
    @Loai nvarchar(10),
    @GiaTri int,
    @Nam int
AS
BEGIN
    SELECT SUM(HD.TongTienThanhToan) AS TongDoanhThu
    FROM HOA_DON HD
    JOIN PHIEU_DICH_VU PDV ON HD.MaPhieuDichVu = PDV.MaPhieuDichVu
    WHERE PDV.MaChiNhanh = @MaCN
      AND (@Loai = 'Ngay' AND DAY(HD.NgayLap) = @GiaTri AND MONTH(HD.NgayLap) = MONTH(GETDATE()) AND YEAR(HD.NgayLap) = @Nam)
      OR (@Loai = 'Thang' AND MONTH(HD.NgayLap) = @GiaTri AND YEAR(HD.NgayLap) = @Nam)
      OR (@Loai = 'Quy' AND DATEPART(QUARTER, HD.NgayLap) = @GiaTri AND YEAR(HD.NgayLap) = @Nam)
      OR (@Loai = 'Nam' AND YEAR(HD.NgayLap) = @Nam);
END;
GO
-- Chạy thử: EXEC SP_DoanhThuChiNhanh 'CN00000001', 'Thang', 1, 2026
-- GO

-- 8.4. Thống kê hoạt động tiêm phòng tại chi nhánh
CREATE PROCEDURE SP_ThongKeTiemPhong
    @MaCN CHAR(10)
AS
BEGIN
    SELECT DISTINCT TC.MaThuCung, TC.TenThuCung, V.TenVacxin, PTP.NgayTiem FROM PHIEU_TIEM_PHONG PTP
    JOIN THU_CUNG TC ON PTP.MaThuCung = TC.MaThuCung
    JOIN VACXIN V ON PTP.MaVacxin = V.MaVacxin
    JOIN PHIEU_DICH_VU PDV ON PTP.MaPhieuDichVu = PDV.MaPhieuDichVu
    WHERE PDV.MaChiNhanh = @MaCN;

    SELECT TOP 1 V.TenVacxin, COUNT(PTP.MaVacxin) AS LuotTiem FROM PHIEU_TIEM_PHONG PTP
    JOIN VACXIN V ON PTP.MaVacxin = V.MaVacxin
    JOIN PHIEU_DICH_VU PDV ON PTP.MaPhieuDichVu = PDV.MaPhieuDichVu
    WHERE PDV.MaChiNhanh = @MaCN GROUP BY V.TenVacxin ORDER BY LuotTiem DESC;
END;
GO
-- Chạy thử: EXEC SP_ThongKeTiemPhong 'CN00000001'
-- GO

-- 8.5. Danh sách khách hàng đã lâu không quay lại (>= 6 tháng)
CREATE PROCEDURE SP_KhachHangLauKhongQuayLai
    @MaCN CHAR(10)
AS
BEGIN
    SELECT KH.MaKhachHang, KH.TenKhachHang, KH.SoDienThoai, MAX(HD.NgayLap) AS NgayGiaoDichCuoi
    FROM KHACH_HANG KH
    JOIN PHIEU_DICH_VU PDV ON KH.MaKhachHang = PDV.MaKhachHang
    JOIN HOA_DON HD ON PDV.MaPhieuDichVu = HD.MaPhieuDichVu
    WHERE PDV.MaChiNhanh = @MaCN GROUP BY KH.MaKhachHang, KH.TenKhachHang, KH.SoDienThoai
    HAVING DATEDIFF(MONTH, MAX(HD.NgayLap), GETDATE()) >= 6;
END;
GO
-- Chạy thử: EXEC SP_KhachHangLauKhongQuayLai 'CN00000001'
-- GO

-- 8.6. Báo cáo tỷ lệ các hạng hội viên
CREATE PROCEDURE SP_TyLeHoiVien
AS
BEGIN
    DECLARE @TongHoiVien float = (SELECT COUNT(*) FROM PHAN_LOAI_KHACH_HANG WHERE Nam = 2024);
    
    SELECT TenLoai, 
           COUNT(*) AS SoLuong,
           (COUNT(*) / @TongHoiVien) * 100 AS TyLePhanTram
    FROM PHAN_LOAI_KHACH_HANG
    WHERE Nam = 2024
    GROUP BY TenLoai;
END;
GO
-- Chạy thử: EXEC SP_TyLeHoiVien
-- GO

-- 8.7. Top các chi nhánh có doanh thu cao nhất (6 tháng gần đây)
CREATE PROCEDURE SP_TopDoanhThuHeThong
AS
BEGIN
    SELECT TOP 3 CN.TenChiNhanh, SUM(HD.TongTienThanhToan) AS DoanhThu
    FROM CHI_NHANH CN
    JOIN PHIEU_DICH_VU PDV ON CN.MaChiNhanh = PDV.MaChiNhanh
    JOIN HOA_DON HD ON PDV.MaPhieuDichVu = HD.MaPhieuDichVu
    WHERE HD.NgayLap >= DATEADD(MONTH, -6, GETDATE())
    GROUP BY CN.TenChiNhanh
    ORDER BY DoanhThu DESC;
END;
GO
-- Chạy thử: EXEC SP_TopDoanhThuHeThong
-- GO

-- 8.8. Ghi nhận đánh giá của khách hàng về hóa đơn
CREATE PROCEDURE SP_KhachHangDanhGia
    @MaHD CHAR(10),
    @NgayLap DATE,
    @DiemCL int,
    @ThaiDo int,
    @HaiLong int,
    @BinhLuan nvarchar(100) = NULL
AS
BEGIN
    INSERT INTO DANH_GIA (MaHoaDon, NgayLap, DiemChatLuongDichVu, ThaiDoNhanVien, MucDoHaiLong, BinhLuan)
    VALUES (@MaHD, @NgayLap, @DiemCL, @ThaiDo, @HaiLong, @BinhLuan);
END;
GO
-- Chạy thử: EXEC SP_KhachHangDanhGia 'HD00000001', '2026-01-01', 5, 5, 5, N'Dịch vụ rất tốt'
-- GO

-- 8.9. Nhân viên/Quản lý viết phản hồi cho đánh giá khách hàng
CREATE PROCEDURE SP_NhanVienTraLoi
    @MaHD CHAR(10),
    @NgayLap DATE,
    @NoiDung nvarchar(100)
AS
BEGIN
    UPDATE DANH_GIA 
    SET PhanHoi = @NoiDung 
    WHERE MaHoaDon = @MaHD AND NgayLap = @NgayLap;
END;
GO
-- Chạy thử: EXEC SP_NhanVienTraLoi 'HD00000001', '2026-01-01', N'Cảm ơn quý khách!'
-- GO

CREATE OR ALTER PROCEDURE SP_Report_Comprehensive
    @MaCN CHAR(10),
    @Loai NVARCHAR(10), -- 'Ngay', 'Thang', 'Quy', 'Nam'
    @GiaTri INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;

    -- TẬP KẾT QUẢ 1: CÁC CHỈ SỐ KPI TỔNG HỢP
    SELECT 
        -- 1. Tổng doanh thu (Tất cả hóa đơn)
        ISNULL(SUM(HD.TongTienThanhToan), 0) AS TongDoanhThu,
        
        -- 2. Doanh thu Dịch vụ (Khám hoặc Tiêm)
        ISNULL(SUM(CASE 
            WHEN PKB.MaPhieuDichVu IS NOT NULL OR PTP.MaPhieuDichVu IS NOT NULL 
            THEN HD.TongTienThanhToan ELSE 0 END), 0) AS DoanhThuDichVu,
        
        -- 3. Doanh thu Sản phẩm (Từ phiếu mua hàng)
        ISNULL(SUM(CASE 
            WHEN PMH.MaPhieuDichVu IS NOT NULL 
            THEN HD.TongTienThanhToan ELSE 0 END), 0) AS DoanhThuSanPham,
        
        -- 4. Số lượt khám (Số hóa đơn thuộc loại Dịch vụ)
        COUNT(DISTINCT CASE 
            WHEN PKB.MaPhieuDichVu IS NOT NULL OR PTP.MaPhieuDichVu IS NOT NULL 
            THEN HD.MaHoaDon END) AS SoLuotKham
            
    FROM HOA_DON HD
    JOIN PHIEU_DICH_VU PDV ON HD.MaPhieuDichVu = PDV.MaPhieuDichVu
    -- Thay vì dùng EXISTS trong SUM, ta LEFT JOIN để kiểm tra sự tồn tại
    LEFT JOIN PHIEU_MUA_HANG PMH ON PDV.MaPhieuDichVu = PMH.MaPhieuDichVu
    LEFT JOIN PHIEU_KHAM_BENH PKB ON PDV.MaPhieuDichVu = PKB.MaPhieuDichVu
    LEFT JOIN PHIEU_TIEM_PHONG PTP ON PDV.MaPhieuDichVu = PTP.MaPhieuDichVu
    WHERE (@MaCN = 'ALL' OR PDV.MaChiNhanh = @MaCN)
      AND (
          (@Loai = 'Ngay' AND (MONTH(HD.NgayLap) * 100 + DAY(HD.NgayLap)) = @GiaTri AND YEAR(HD.NgayLap) = @Nam) OR
          (@Loai = 'Thang' AND MONTH(HD.NgayLap) = @GiaTri AND YEAR(HD.NgayLap) = @Nam) OR
          (@Loai = 'Quy' AND DATEPART(QUARTER, HD.NgayLap) = @GiaTri AND YEAR(HD.NgayLap) = @Nam) OR
          (@Loai = 'Nam' AND YEAR(HD.NgayLap) = @Nam)
      );

    -- TẬP KẾT QUẢ 2: HIỆU SUẤT BÁC SĨ (Performance)
    SELECT 
        NV.HoTen,
        SUM(HD.TongTienThanhToan) AS DoanhThuTaoRa
    FROM (
        SELECT MaPhieuDichVu, MaBacSi FROM PHIEU_KHAM_BENH
        UNION ALL
        SELECT MaPhieuDichVu, MaBacSi FROM PHIEU_TIEM_PHONG
    ) AS CongViec
    JOIN NHAN_VIEN NV ON CongViec.MaBacSi = NV.MaNhanVien
    JOIN PHIEU_DICH_VU PDV ON CongViec.MaPhieuDichVu = PDV.MaPhieuDichVu
    JOIN HOA_DON HD ON PDV.MaPhieuDichVu = HD.MaPhieuDichVu
    WHERE (@MaCN = 'ALL' OR PDV.MaChiNhanh = @MaCN)
      AND YEAR(HD.NgayLap) = @Nam
      AND (@Loai <> 'Thang' OR MONTH(HD.NgayLap) = @GiaTri)
    GROUP BY NV.HoTen;
END;
GO

--==============================================================
-- Phần 9: QUẢN LÝ BÁN LẺ & HÓA ĐƠN
--==============================================================

-- 1. Tạo Phiếu dịch vụ & Phiếu mua hàng (Khách nhấn Thanh toán)
CREATE OR ALTER PROCEDURE SP_ThemPhieuDichVu
    @MaPhieuDichVu CHAR(10),
    @MaKhachHang CHAR(10),
    @MaChiNhanh CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Thêm vào PHIEU_DICH_VU trước
    INSERT INTO PHIEU_DICH_VU (MaPhieuDichVu, TongTien, MaChiNhanh, MaKhachHang)
    VALUES (@MaPhieuDichVu, 0.00, @MaChiNhanh, @MaKhachHang);

    -- PHẢI thêm vào PHIEU_MUA_HANG vì CHI_TIET_MUA_HANG tham chiếu tới bảng này
    INSERT INTO PHIEU_MUA_HANG (MaPhieuDichVu)
    VALUES (@MaPhieuDichVu);
END;
GO

-- 2. Thêm chi tiết mua hàng
CREATE OR ALTER PROCEDURE SP_ThemChiTietMuaHang
    @MaPhieuDichVu CHAR(10),
    @SoThuTu INT,
    @SoLuong INT,
    @MaSanPham CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @GiaBan DECIMAL(11, 2);
    
    -- Lấy giá từ bảng SAN_PHAM để cập nhật cột TongTien phi chuẩn hóa
    SELECT @GiaBan = GiaBan FROM SAN_PHAM WHERE MaSanPham = @MaSanPham;

    INSERT INTO CHI_TIET_MUA_HANG (MaPhieuDichVu, SoThuTu, SoLuong, MaSanPham)
    VALUES (@MaPhieuDichVu, @SoThuTu, @SoLuong, @MaSanPham);

    -- Cập nhật cột TongTien trong PHIEU_DICH_VU
    UPDATE PHIEU_DICH_VU 
    SET TongTien = TongTien + (@GiaBan * @SoLuong)
    WHERE MaPhieuDichVu = @MaPhieuDichVu;
END;
GO

-- 3. Tạo Hóa đơn (Tự động tạo với HinhThucThanhToan = NULL để chờ xác nhận)
CREATE OR ALTER PROCEDURE SP_ThemHoaDon
    @MaHoaDon CHAR(10),
    @NgayLap DATE,
    @MaPhieuDichVu CHAR(10),
    @MaNhanVien CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TongTienPDV DECIMAL(11, 2);

    -- Lấy TongTien từ Phiếu dịch vụ
    SELECT @TongTienPDV = TongTien FROM PHIEU_DICH_VU WHERE MaPhieuDichVu = @MaPhieuDichVu;

    -- MaThuCung để NULL cho đơn hàng bán lẻ thuần túy
    -- HinhThucThanhToan = NULL để biểu thị trạng thái "Chờ thanh toán"
    INSERT INTO HOA_DON (MaHoaDon, NgayLap, TongTienThanhToan, KhuyenMai, HinhThucThanhToan, MaPhieuDichVu, MaNhanVien, MaThuCung)
    VALUES (@MaHoaDon, @NgayLap, @TongTienPDV, 0.00, NULL, @MaPhieuDichVu, @MaNhanVien, NULL);
END;
GO