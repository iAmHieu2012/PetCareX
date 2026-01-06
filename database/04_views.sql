USE PETCAREX
GO

--==============================================================
-- PHẦN 4: THIẾT LẬP VIEW (VIEWS)
--==============================================================

-- Tra cứu thông tin khách hàng và Hạng thành viện
CREATE OR ALTER VIEW VW_KhachHangHangThanhVien AS
SELECT 
    kh.MaKhachHang, 
    kh.TenKhachHang, 
    kh.SoDienThoai, 
    kh.DiemTichLuy,
    pl.TenLoai AS HangThanhVien,
    pl.MucChiTieu,
    pl.Nam AS NamXetHang
FROM KHACH_HANG kh
LEFT JOIN PHAN_LOAI_KHACH_HANG pl ON kh.MaKhachHang = pl.MaKhachHang 
    AND pl.Nam = YEAR(GETDATE());
GO

-- View: Tra cứu lịch sử y tế của thú cưng
CREATE OR ALTER VIEW VW_LichSuYTeThuCung
AS
SELECT 
    pkb.MaThuCung,
    pdv.NgayLap AS NgayThucHien,
    N'Khám bệnh' AS LoaiDichVu,
    pkb.ChuanDoan AS ThongTinChinh,
    N'Triệu chứng: ' + pkb.TrieuChung AS ChiTiet,
    bs.HoTen AS NguoiThucHien
FROM PHIEU_KHAM_BENH pkb
JOIN (SELECT MaPhieuDichVu, MaHoaDon FROM HOA_DON) hd ON pkb.MaPhieuDichVu = hd.MaPhieuDichVu
JOIN HOA_DON pdv ON hd.MaHoaDon = pdv.MaHoaDon
JOIN NHAN_VIEN bs ON pkb.MaBacSi = bs.MaNhanVien

UNION ALL

SELECT 
    ptp.MaThuCung,
    ptp.NgayTiem AS NgayThucHien,
    N'Tiêm phòng' AS LoaiDichVu,
    vx.TenVacxin AS ThongTinChinh,
    N'Liều lượng: ' + CAST(ptp.LieuLuong AS NVARCHAR(10)) AS ChiTiet,
    bs.HoTen AS NguoiThucHien
FROM PHIEU_TIEM_PHONG ptp
JOIN VACXIN vx ON ptp.MaVacxin = vx.MaVacxin
JOIN NHAN_VIEN bs ON ptp.MaBacSi = bs.MaNhanVien;
GO

-- Tra cứu lịch sử khám bệnh của thú cưng
CREATE OR ALTER VIEW VW_LichSuKhamBenh AS
SELECT 
    pkb.MaThuCung, 
    pkb.MaPhieuDichVu, 
    pkb.ChuanDoan, 
    pkb.NgayHenTaiKham,
    dt.TenThuoc, 
    ct.SoLuong AS SoLuongKeToa
FROM PHIEU_KHAM_BENH pkb
LEFT JOIN CHI_TIET_TOA_THUOC ct ON pkb.MaPhieuDichVu = ct.MaPhieuKhamBenh
LEFT JOIN DANH_MUC_THUOC dt ON ct.MaThuoc = dt.MaThuoc;
GO

-- Tra cứu lịch sử tiêm phòng của thú cưng
CREATE OR ALTER VIEW VW_LichSuTiemPhong AS
SELECT 
    pdk.MaThuCung, 
    tc.TenThuCung, 
    gt.LoaiGoiTiem,
    vx.TenVacxin, 
    ctgt.SoThuTuVacxin AS MuiSo, 
    pdk.NgayDangKy
FROM PHIEU_DANG_KY_GOI_TIEM pdk
JOIN THU_CUNG tc ON pdk.MaThuCung = tc.MaThuCung
JOIN GOI_TIEM gt ON pdk.MaGoiTiem = gt.MaGoiTiem
JOIN CHI_TIET_GOI_TIEM ctgt ON gt.MaGoiTiem = ctgt.MaGoiTiem
JOIN VACXIN vx ON ctgt.MaVacxin = vx.MaVacxin;
GO

-- Báo cáo doanh thu cúa các chi nhánh
CREATE OR ALTER VIEW VW_BaoCaoDoanhThu_ChiNhanh AS
SELECT 
    cn.MaChiNhanh,
    cn.TenChiNhanh,
    CAST(hd.NgayLap AS DATE) AS NgayBaoCao,
    SUM(hd.TongTienThanhToan) AS DoanhThuNgay,
    COUNT(hd.MaHoaDon) AS SoLuongDonHang,
    AVG(CAST(dg.DiemChatLuongDichVu AS FLOAT)) AS DiemDanhGiaTB 
FROM HOA_DON hd
JOIN PHIEU_DICH_VU pdv ON hd.MaPhieuDichVu = pdv.MaPhieuDichVu
JOIN CHI_NHANH cn ON pdv.MaChiNhanh = cn.MaChiNhanh
LEFT JOIN DANH_GIA dg ON hd.MaHoaDon = dg.MaHoaDon AND hd.NgayLap = dg.NgayLap
GROUP BY cn.MaChiNhanh, cn.TenChiNhanh, CAST(hd.NgayLap AS DATE);
GO

-- Các sản phẩm sắp hết hạn trong kho để đánh dấu giảm giá
CREATE OR ALTER VIEW VW_SanPhamSapHetHan AS
SELECT 
    cn.MaChiNhanh,
    cn.TenChiNhanh,
    sp.MaSanPham,
    sp.TenSanPham,
    sp.LoaiSanPham,
    sp.GiaBan,
    kh.SoLuongTonKho,
    lh.NgaySanXuat,
    lh.HanSuDung,
    DATEDIFF(DAY, GETDATE(), lh.HanSuDung) AS SoNgayConLai,
    CASE 
        WHEN DATEDIFF(DAY, GETDATE(), lh.HanSuDung) <= 7 THEN N'Rất gấp'
        WHEN DATEDIFF(DAY, GETDATE(), lh.HanSuDung) <= 15 THEN N'Gấp'
        ELSE N'Cần chú ý'
    END AS MucDoUuTien
FROM KHO_HANG kh
INNER JOIN LO_HANG lh ON kh.MaSanPham = lh.MaSanPham AND kh.NgaySanXuat = lh.NgaySanXuat
INNER JOIN SAN_PHAM sp ON kh.MaSanPham = sp.MaSanPham
INNER JOIN CHI_NHANH cn ON kh.MaChiNhanh = cn.MaChiNhanh
WHERE lh.HanSuDung IS NOT NULL 
    AND DATEDIFF(DAY, GETDATE(), lh.HanSuDung) <= 30
    AND DATEDIFF(DAY, GETDATE(), lh.HanSuDung) >= 0
    AND kh.SoLuongTonKho > 0;
GO
