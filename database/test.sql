USE PETCAREX
GO
SELECT * FROM DANH_GIA
SELECT * FROm TAI_KHOAN
-- Kiểm tra chi tiết phiếu PD00000021
DECLARE @MaPhieuDichVu CHAR(10) = 'PD00000021'

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

USE PETCAREX
GO

SELECT * FROM PHIEU_DICH_VU h LEFT JOIN HOA_DON hd ON hd.MaPhieuDichVu = h.MaPhieuDichVu
RIGHT JOIN PHIEU_DICH_VU d ON h.MaPhieuDichVu = d.MaPhieuDichVu
SELECT * FROM TAI_KHOAN t
LEFT JOIN NHAN_VIEN n ON n.MaNhanVien = t.MaNhanVien
SELECT * FROM CHI_TIET_TOA_THUOC

SELECT 
                    p.MaPhieuDichVu,
                    p.TongTien,
                    p.MaChiNhanh,
                    cn.TenChiNhanh,
                    p.MaKhachHang,
                    ISNULL(hd.MaHoaDon, '') AS MaHoaDon,
                    ISNULL(hd.NgayLap, '') AS NgayLap,
                    CASE 
                        WHEN hd.MaNhanVien IS NOT NULL AND hd.HinhThucThanhToan IS NOT NULL AND hd.HinhThucThanhToan != 'Đã hủy' THEN 'Đã thanh toán'
                        WHEN hd.MaNhanVien IS NULL AND hd.HinhThucThanhToan IS NOT NULL AND hd.HinhThucThanhToan != 'Đã hủy' THEN 'Chờ xác nhận'
                        ELSE 'Chưa thanh toán'
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
                WHERE p.MaKhachHang = 'KH00000011'
                ORDER BY p.MaPhieuDichVu DESC