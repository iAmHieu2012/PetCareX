USE PETCAREX;
GO

--==============================================================
-- PHẦN 7: THIẾT LẬP CÁC RÀNG BUỘC TỰ ĐỘNG (TRIGGERS)
--==============================================================

--==============================================================
-- 1. NHÓM TRIGGER ĐẢM BẢO NHẤT QUÁN DỮ LIỆU (INTEGRITY)
--==============================================================

-- Kiểm tra thú cưng trên hóa đơn phải khớp với thú cưng trong các phiếu dịch vụ gốc
CREATE OR ALTER TRIGGER TRG_HOA_DON_KiemTra_NhatQuanThuCung
ON HOA_DON
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- 1. Kiểm tra với Phiếu Khám Bệnh
    IF EXISTS (
        SELECT 1 FROM INSERTED I
        JOIN PHIEU_KHAM_BENH PKB ON I.MaPhieuDichVu = PKB.MaPhieuDichVu
        WHERE (I.MaThuCung IS NOT NULL) AND (I.MaThuCung <> PKB.MaThuCung)
    )
    BEGIN
        RAISERROR(N'Lỗi: Thú cưng trên hóa đơn không khớp với thú cưng trong phiếu khám bệnh.', 16, 1);
        ROLLBACK TRANSACTION; RETURN;
    END

    -- 2. Kiểm tra với Phiếu Đăng ký gói tiêm
    IF EXISTS (
        SELECT 1 FROM INSERTED I
        JOIN PHIEU_DANG_KY_GOI_TIEM PGT ON I.MaPhieuDichVu = PGT.MaPhieuDichVu
        WHERE (I.MaThuCung IS NOT NULL) AND (I.MaThuCung <> PGT.MaThuCung)
    )
    BEGIN
        RAISERROR(N'Lỗi: Thú cưng trên hóa đơn không khớp với thú cưng trong phiếu đăng ký gói tiêm.', 16, 1);
        ROLLBACK TRANSACTION; RETURN;
    END

    -- 3. Kiểm tra với Phiếu Tiêm Phòng
    IF EXISTS (
        SELECT 1 FROM INSERTED I
        JOIN PHIEU_TIEM_PHONG PTP ON I.MaPhieuDichVu = PTP.MaPhieuDichVu
        WHERE (I.MaThuCung IS NOT NULL) AND (I.MaThuCung <> PTP.MaThuCung)
    )
    BEGIN
        RAISERROR(N'Lỗi: Thú cưng trên hóa đơn không khớp với thú cưng trong phiếu tiêm phòng.', 16, 1);
        ROLLBACK TRANSACTION; RETURN;
    END
    
    -- Lưu ý: Với Phiếu Mua Hàng, MaThuCung có thể NULL hoặc tùy ý (vì mua đồ không nhất thiết cho con vật cụ thể nào đi khám), nên ta không chặn.
END;
GO


--==============================================================
-- 2. NHÓM TRIGGER QUẢN LÝ NHÂN SỰ (IS-A & WORKFLOW)
--==============================================================

-- Kiểm tra chức vụ khi thêm mới Bác sĩ thú y
CREATE OR ALTER TRIGGER TRG_BAC_SI_THU_Y_CheckChucVu
ON BAC_SI_THU_Y
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted i JOIN NHAN_VIEN nv ON i.MaNhanVien = nv.MaNhanVien WHERE nv.ChucVu <> N'Bác sĩ thú y')
    BEGIN
        RAISERROR (N'Lỗi: Nhân viên được thêm vào danh sách bác sĩ phải có chức vụ là "Bác sĩ thú y".', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- Kiểm tra chức vụ khi thêm mới Nhân viên bán hàng
CREATE OR ALTER TRIGGER TRG_NHAN_VIEN_BAN_HANG_CheckChucVu
ON NHAN_VIEN_BAN_HANG
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted i JOIN NHAN_VIEN nv ON i.MaNhanVien = nv.MaNhanVien WHERE nv.ChucVu <> N'Nhân viên bán hàng')
    BEGIN
        RAISERROR (N'Lỗi: Nhân viên được thêm vào danh sách bán hàng phải có chức vụ là "Nhân viên bán hàng".', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- Ngăn chặn thay đổi chức vụ của nhân viên nếu họ đang nằm trong bảng chuyên biệt (IS-A)
CREATE OR ALTER TRIGGER TRG_NHAN_VIEN_CheckUpdateChucVu
ON NHAN_VIEN
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(ChucVu)
    BEGIN
        IF EXISTS (SELECT 1 FROM inserted i JOIN BAC_SI_THU_Y bs ON i.MaNhanVien = bs.MaNhanVien WHERE i.ChucVu <> N'Bác sĩ thú y')
           OR EXISTS (SELECT 1 FROM inserted i JOIN NHAN_VIEN_BAN_HANG nvbh ON i.MaNhanVien = nvbh.MaNhanVien WHERE i.ChucVu <> N'Nhân viên bán hàng')
        BEGIN
            RAISERROR(N'Lỗi: Không thể thay đổi chức vụ khi nhân viên đang thuộc danh mục chuyên biệt (Bác sĩ/Bán hàng).', 16, 1);
            ROLLBACK TRANSACTION;
        END
    END
END;
GO

-- Đảm bảo Quản lý phải thuộc chi nhánh mà họ đang quản lý
CREATE OR ALTER TRIGGER TRG_QUAN_LI_CheckChiNhanh
ON QUAN_LI
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM inserted i JOIN NHAN_VIEN nv ON i.MaNhanVien = nv.MaNhanVien WHERE nv.MaChiNhanh <> i.MaChiNhanhQuanLi)
    BEGIN
        RAISERROR (N'Lỗi: Quản lý phải đang làm việc tại chi nhánh được bổ nhiệm quản lý.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- Kiểm tra lịch sử điều động không được chồng chéo thời gian
CREATE OR ALTER TRIGGER TRG_LICH_SU_DIEU_DONG_CheckChongCheo
ON LICH_SU_DIEU_DONG
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM LICH_SU_DIEU_DONG lsdd
        JOIN inserted i ON lsdd.MaNhanVien = i.MaNhanVien
        WHERE (lsdd.MaChiNhanh <> i.MaChiNhanh OR lsdd.NgayBatDau <> i.NgayBatDau)
        AND (i.NgayBatDau < ISNULL(lsdd.NgayKetThuc, '9999-12-31') AND ISNULL(i.NgayKetThuc, '9999-12-31') > lsdd.NgayBatDau)
    )
    BEGIN
        RAISERROR(N'Lỗi: Khoảng thời gian điều động bị chồng chéo với lịch sử của nhân viên này.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

--==============================================================
-- 3. NHÓM TRIGGER QUẢN LÝ KHO HÀNG (FEFO & VALIDATION)
--==============================================================

-- GIAI ĐOẠN 1: Kiểm tra tồn kho khi thêm sản phẩm vào đơn hàng (Draft Check)
CREATE OR ALTER TRIGGER TRG_CHI_TIET_MUA_HANG_CheckTonKho
ON CHI_TIET_MUA_HANG
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1 FROM (
            SELECT pdv.MaChiNhanh, i.MaSanPham, SUM(i.SoLuong) AS TongDat
            FROM inserted i JOIN PHIEU_DICH_VU pdv ON i.MaPhieuDichVu = pdv.MaPhieuDichVu GROUP BY pdv.MaChiNhanh, i.MaSanPham
        ) AS NhuCau
        LEFT JOIN (SELECT MaChiNhanh, MaSanPham, SUM(SoLuongTonKho) AS TongTon FROM KHO_HANG GROUP BY MaChiNhanh, MaSanPham) AS Kho 
        ON NhuCau.MaChiNhanh = Kho.MaChiNhanh AND NhuCau.MaSanPham = Kho.MaSanPham
        WHERE NhuCau.TongDat > ISNULL(Kho.TongTon, 0)
    )
    BEGIN
        RAISERROR(N'Thông báo: Một hoặc nhiều sản phẩm không đủ tồn kho tại chi nhánh.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- GIAI ĐOẠN 2: Trừ kho thực tế khi lập Hóa đơn (Final Commit - FEFO)
CREATE OR ALTER TRIGGER TRG_HOA_DON_TruKhoFEFO
ON HOA_DON
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaPDV CHAR(10), @MaCN CHAR(10);
    DECLARE cur_HD CURSOR LOCAL FAST_FORWARD FOR 
        SELECT i.MaPhieuDichVu, pdv.MaChiNhanh FROM inserted i JOIN PHIEU_DICH_VU pdv ON i.MaPhieuDichVu = pdv.MaPhieuDichVu;
    OPEN cur_HD; FETCH NEXT FROM cur_HD INTO @MaPDV, @MaCN;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        DECLARE @MaSP CHAR(10), @SLCanTru INT;
        DECLARE cur_SP CURSOR LOCAL FAST_FORWARD FOR SELECT MaSanPham, SoLuong FROM CHI_TIET_MUA_HANG WHERE MaPhieuDichVu = @MaPDV;
        OPEN cur_SP; FETCH NEXT FROM cur_SP INTO @MaSP, @SLCanTru;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            WHILE @SLCanTru > 0
            BEGIN
                DECLARE @NgaySX DATETIME, @TonLo INT;
                SELECT TOP 1 @NgaySX = K.NgaySanXuat, @TonLo = K.SoLuongTonKho
                FROM KHO_HANG K WITH (UPDLOCK, ROWLOCK) JOIN LO_HANG L ON K.MaSanPham = L.MaSanPham AND K.NgaySanXuat = L.NgaySanXuat
                WHERE K.MaChiNhanh = @MaCN AND K.MaSanPham = @MaSP AND K.SoLuongTonKho > 0 AND (L.HanSuDung IS NULL OR L.HanSuDung > GETDATE())
                ORDER BY L.HanSuDung ASC, K.NgaySanXuat ASC; -- Ưu tiên HSD trước (FEFO)

                IF @NgaySX IS NULL 
                BEGIN
                    DECLARE @TenSP NVARCHAR(30); SELECT @TenSP = TenSanPham FROM SAN_PHAM WHERE MaSanPham = @MaSP;
                    RAISERROR(N'Lỗi: Sản phẩm [%s] đã hết hàng hoặc lô hàng khả dụng đã hết hạn.', 16, 1, @TenSP);
                    CLOSE cur_SP; DEALLOCATE cur_SP; CLOSE cur_HD; DEALLOCATE cur_HD; ROLLBACK TRANSACTION; RETURN;
                END

                IF @TonLo >= @SLCanTru
                BEGIN
                    UPDATE KHO_HANG SET SoLuongTonKho = SoLuongTonKho - @SLCanTru WHERE MaChiNhanh = @MaCN AND MaSanPham = @MaSP AND NgaySanXuat = @NgaySX;
                    SET @SLCanTru = 0;
                END
                ELSE
                BEGIN
                    UPDATE KHO_HANG SET SoLuongTonKho = 0 WHERE MaChiNhanh = @MaCN AND MaSanPham = @MaSP AND NgaySanXuat = @NgaySX;
                    SET @SLCanTru = @SLCanTru - @TonLo;
                END
            END
            FETCH NEXT FROM cur_SP INTO @MaSP, @SLCanTru;
        END
        CLOSE cur_SP; DEALLOCATE cur_SP; FETCH NEXT FROM cur_HD INTO @MaPDV, @MaCN;
    END
    CLOSE cur_HD; DEALLOCATE cur_HD;
END;
GO

--==============================================================
-- 4. NHÓM TRIGGER KHÁCH HÀNG & KHUYẾN MÃI (CRM)
--==============================================================

-- Tự động cộng điểm tích lũy khi có hóa đơn mới (1 điểm cho mỗi 50,000 VND)
CREATE OR ALTER TRIGGER TRG_HOA_DON_CongDiemTichLuy
ON HOA_DON
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE kh SET DiemTichLuy = kh.DiemTichLuy + FLOOR(i.TongTienThanhToan / 50000)
    FROM KHACH_HANG kh JOIN PHIEU_DICH_VU pdv ON kh.MaKhachHang = pdv.MaKhachHang
    JOIN inserted i ON pdv.MaPhieuDichVu = i.MaPhieuDichVu
    WHERE FLOOR(i.TongTienThanhToan / 50000) > 0;
END;
GO

-- Tự động tính toán và cập nhật hạng thành viên của khách hàng
CREATE OR ALTER TRIGGER TRG_HOA_DON_PhanLoaiKhachHang
ON HOA_DON
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @AffectedCustomers TABLE (MaKhachHang CHAR(10));
    INSERT INTO @AffectedCustomers SELECT DISTINCT PDV.MaKhachHang FROM (
        SELECT MaPhieuDichVu 
        FROM INSERTED 
        UNION 
        SELECT MaPhieuDichVu 
        FROM DELETED
    ) AS Changes 
    JOIN PHIEU_DICH_VU PDV ON Changes.MaPhieuDichVu = PDV.MaPhieuDichVu;

    WITH CustomerSpending AS (
        SELECT PDV.MaKhachHang, SUM(HD.TongTienThanhToan) AS TongChiTieu,
        (SELECT TOP 1 TenLoai FROM PHAN_LOAI_KHACH_HANG WHERE MaKhachHang = PDV.MaKhachHang AND Nam = YEAR(GETDATE()) - 1) AS HangNamTruoc
        FROM HOA_DON HD 
        JOIN PHIEU_DICH_VU PDV ON HD.MaPhieuDichVu = PDV.MaPhieuDichVu
        WHERE PDV.MaKhachHang IN (SELECT MaKhachHang FROM @AffectedCustomers) AND YEAR(HD.NgayLap) = YEAR(GETDATE())
        GROUP BY PDV.MaKhachHang
    ),
    NewRankings AS (
        SELECT MaKhachHang, TongChiTieu,
        CASE 
            WHEN TongChiTieu >= 12000000 OR (HangNamTruoc = N'VIP' AND TongChiTieu >= 8000000) THEN N'VIP'
            WHEN TongChiTieu >= 5000000 OR (HangNamTruoc IN (N'Thân thiết', N'VIP') AND TongChiTieu >= 3000000) THEN N'Thân thiết' 
            ELSE N'Cơ bản'
        END AS HangMoi FROM CustomerSpending
    )
    MERGE PHAN_LOAI_KHACH_HANG AS T 
    USING NewRankings AS S 
    ON (T.MaKhachHang = S.MaKhachHang AND T.Nam = YEAR(GETDATE()))
    WHEN MATCHED THEN 
        UPDATE SET MucChiTieu = S.TongChiTieu, TenLoai = S.HangMoi
    WHEN NOT MATCHED THEN 
        INSERT (MaKhachHang, Nam, MucChiTieu, TenLoai) VALUES (S.MaKhachHang, YEAR(GETDATE()), S.TongChiTieu, S.HangMoi);
END;
GO

-- Kiểm tra ưu đãi của hóa đơn không được thấp hơn cam kết của gói tiêm
CREATE OR ALTER TRIGGER TRG_HOA_DON_CheckUuDaiGoiTiem
ON HOA_DON
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS(
        SELECT 1 FROM inserted i 
        JOIN PHIEU_DANG_KY_GOI_TIEM pdk ON i.MaPhieuDichVu = pdk.MaPhieuDichVu 
        JOIN GOI_TIEM gt ON pdk.MaGoiTiem = gt.MaGoiTiem 
        JOIN PHIEU_DICH_VU pdv ON i.MaPhieuDichVu = pdv.MaPhieuDichVu 
        WHERE i.KhuyenMai < gt.UuDai
    )
    BEGIN 
        RAISERROR(N'Lỗi: Số tiền khuyến mãi thấp hơn mức ưu đãi tối thiểu của gói tiêm.', 16, 1);
        ROLLBACK TRANSACTION;
    END 
END;
GO

--==============================================================
-- 5. NHÓM TRIGGER PHIẾU TIÊM PHÒNG
--==============================================================
-- kiểm tra thú cưng phải sở hữu gói tiêm trước khi lập phiếu tiêm
CREATE OR ALTER TRIGGER TRG_PHIEU_TIEM_PHONG_CheckSoHuuGoi
ON PHIEU_TIEM_PHONG
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    -- Kiểm tra nếu phiếu tiêm có gắn MaGoiTiem (không phải tiêm lẻ)
    IF EXISTS (
        SELECT 1 FROM inserted i
        WHERE i.MaGoiTiem IS NOT NULL
        AND NOT EXISTS (
            -- Kiểm tra xem thú cưng này đã có phiếu đăng ký gói tiêm đó chưa
            SELECT 1 FROM PHIEU_DANG_KY_GOI_TIEM pdk
            WHERE pdk.MaThuCung = i.MaThuCung 
            AND pdk.MaGoiTiem = i.MaGoiTiem
        )
    )
    BEGIN
        RAISERROR(N'Lỗi: Thú cưng này chưa đăng ký/mua gói tiêm đã chọn.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO