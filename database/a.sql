USE PETCAREX
GO

DECLARE @ti TIME = '10:00:00'

SELECT * FROM BAC_SI_THU_Y b
LEFT JOIN NHAN_VIEN n ON n.MaNhanVien = b.MaNhanVien
WHERE GioLamViec <= @ti AND @ti <= GioNghi
