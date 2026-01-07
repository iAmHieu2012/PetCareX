USE PETCAREX
GO

--==============================================================
-- PHẦN 5: THIẾT LẬP CÁC HÀM (FUNCTIONS)
--==============================================================

-- Lấy tên loại khách hàng trong năm trước, nếu không có thì trả về loại cơ bản
CREATE OR ALTER FUNCTION FN_LayTenLoaiNamTruoc (
    @MaKhachHang CHAR(10), 
    @NamHienTai INT
) 
RETURNS NVARCHAR(10)
AS 
BEGIN 
    DECLARE @TenLoaiNamTruoc NVARCHAR(10); 
    SELECT @TenLoaiNamTruoc=TenLoai 
    FROM PHAN_LOAI_KHACH_HANG 
    WHERE MaKhachHang=@MaKhachHang AND Nam=@NamHienTai-1; 
    RETURN ISNULL(@TenLoaiNamTruoc,N'Cơ bản'); 
END;
GO

-- Tính thưởng doanh thu (Giữ nguyên độ chính xác Decimal). Phần này sẽ tính dựa trên hiệu suất bán hàng của nhân viên trong một tháng cụ thể.
CREATE OR ALTER FUNCTION FN_TinhThuongDoanhThu (@MaNV CHAR(10), @Thang INT, @Nam INT, @MucThuong FLOAT = 0.01)
RETURNS DECIMAL(11,2)
AS
BEGIN
    DECLARE @DoanhThu DECIMAL(11,2) = 0;

    SELECT @DoanhThu = SUM(TongTienThanhToan)
    FROM HOA_DON
    WHERE MaNhanVien = @MaNV AND MONTH(NgayLap) = @Thang AND YEAR(NgayLap) = @Nam;

    RETURN ISNULL(@DoanhThu * @MucThuong, 0); 
END;
GO

-- Tính thưởng Tết (Tháng 13 = số tháng làm trong năm/12)
CREATE OR ALTER FUNCTION FN_TinhThuongTet (
    @MaNV CHAR(10), @Nam INT
)
RETURNS DECIMAL(11,2)
AS
BEGIN
    DECLARE @NgayVaoLam DATE, @LuongCoBan DECIMAL(11,2), @SoThang INT = 0;

    SELECT @NgayVaoLam = nv.NgayVaoLam, @LuongCoBan = bl.LuongCoBan
    FROM NHAN_VIEN nv JOIN BANG_LUONG bl ON nv.ChucVu = bl.ChucVu
    WHERE nv.MaNhanVien = @MaNV;

    IF YEAR(@NgayVaoLam) < @Nam SET @SoThang = 12;
    ELSE IF YEAR(@NgayVaoLam) = @Nam SET @SoThang = 12 - MONTH(@NgayVaoLam) + 1;
    
    RETURN ISNULL((@SoThang * 1.0 / 12) * @LuongCoBan, 0);
END;
GO

-- Tính toán điểm chất lượng dịch vụ trung bình, số lượt đánh giá tại chi nhánh
CREATE FUNCTION FN_DanhGiaChatLuongChiNhanh()
RETURNS TABLE
AS
RETURN (
    SELECT CN.TenChiNhanh, 
           AVG(CAST(DG.DiemChatLuongDichVu AS float)) AS DiemTrungBinh,
           COUNT(DG.MaHoaDon) AS TongLuotDanhGia
    FROM CHI_NHANH CN
    JOIN PHIEU_DICH_VU PDV ON CN.MaChiNhanh = PDV.MaChiNhanh
    JOIN HOA_DON HD ON PDV.MaPhieuDichVu = HD.MaPhieuDichVu
    JOIN DANH_GIA DG ON HD.MaHoaDon = DG.MaHoaDon
    GROUP BY CN.TenChiNhanh
);