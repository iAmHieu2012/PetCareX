--==============================================================
-- SCRIPT NHẬP DỮ LIỆU MẪU CHO DATABASE PETCAREX
-- Tất cả các mã đều có định dạng 10 ký tự
--==============================================================

USE PETCAREX;
GO

--==============================================================
-- PHẦN 1: NHẬP DỮ LIỆU CHO CÁC BẢNG CƠ BẢN
--==============================================================

-- 1. BẢNG LƯƠNG
INSERT INTO BANG_LUONG (ChucVu, LuongCoBan) VALUES
(N'Bác sĩ thú y', 15000000.00),
(N'Nhân viên bán hàng', 8000000.00),
(N'Quản lí', 20000000.00),
(N'Tiếp tân', 7000000.00);
GO

-- 2. CHI NHÁNH
INSERT INTO CHI_NHANH (MaChiNhanh, TenChiNhanh, DiaChi, DienThoai, GioMoCua, GioDongCua) VALUES
('CN00000001', N'Chi nhánh Quận 1', N'123 Nguyễn Huệ, Q.1, TP.HCM', '0281234567', '08:00:00', '20:00:00'),
('CN00000002', N'Chi nhánh Quận 3', N'456 Võ Văn Tần, Q.3, TP.HCM', '0281234568', '08:00:00', '20:00:00'),
('CN00000003', N'Chi nhánh Thủ Đức', N'789 Võ Văn Ngân, Thủ Đức, TP.HCM', '0281234569', '08:00:00', '20:00:00'),
('CN00000004', N'Chi nhánh Bình Thạnh', N'321 Xô Viết Nghệ Tĩnh, Bình Thạnh', '0281234570', '08:00:00', '20:00:00'),
('CN00000005', N'Chi nhánh Tân Bình', N'654 Hoàng Văn Thụ, Tân Bình', '0281234571', '08:00:00', '20:00:00'),
('CN00000006', N'Chi nhánh Quận 7', N'111 Nguyễn Văn Linh, Q.7, TP.HCM', '0281234572', '08:00:00', '20:00:00'),
('CN00000007', N'Chi nhánh Phú Nhuận', N'222 Phan Xích Long, Phú Nhuận', '0281234573', '08:00:00', '20:00:00'),
('CN00000008', N'Chi nhánh Gò Vấp', N'333 Quang Trung, Gò Vấp', '0281234574', '08:00:00', '20:00:00');
GO

-- 3. DỊCH VỤ
INSERT INTO DICH_VU (MaDichVu, TenDichVu, MoTa) VALUES
('DV00000001', N'Khám tổng quát', N'Khám sức khỏe tổng quát cho thú cưng'),
('DV00000002', N'Tiêm phòng', N'Tiêm các loại vắc xin phòng bệnh'),
('DV00000003', N'Phẫu thuật', N'Các dịch vụ phẫu thuật cho thú cưng'),
('DV00000004', N'Tắm và vệ sinh', N'Dịch vụ tắm, cắt tỉa lông'),
('DV00000005', N'Nha khoa', N'Chăm sóc răng miệng cho thú cưng'),
('DV00000006', N'Siêu âm', N'Chẩn đoán hình ảnh bằng siêu âm'),
('DV00000007', N'Xét nghiệm', N'Xét nghiệm máu và nước tiểu'),
('DV00000008', N'Chăm sóc sau mổ', N'Theo dõi và chăm sóc hậu phẫu');
GO

-- 4. DỊCH VỤ CHI NHÁNH
INSERT INTO DICH_VU_CHI_NHANH (MaDichVu, MaChiNhanh) VALUES
('DV00000001', 'CN00000001'), ('DV00000002', 'CN00000001'), ('DV00000003', 'CN00000001'), 
('DV00000004', 'CN00000001'), ('DV00000005', 'CN00000001'), ('DV00000006', 'CN00000001'),
('DV00000001', 'CN00000002'), ('DV00000002', 'CN00000002'), ('DV00000004', 'CN00000002'), ('DV00000007', 'CN00000002'),
('DV00000001', 'CN00000003'), ('DV00000002', 'CN00000003'), ('DV00000003', 'CN00000003'), ('DV00000004', 'CN00000003'),
('DV00000001', 'CN00000004'), ('DV00000002', 'CN00000004'), ('DV00000004', 'CN00000004'), ('DV00000005', 'CN00000004'),
('DV00000001', 'CN00000005'), ('DV00000002', 'CN00000005'), ('DV00000003', 'CN00000005'), ('DV00000004', 'CN00000005');
GO

-- 5. NHÂN VIÊN
INSERT INTO NHAN_VIEN (MaNhanVien, HoTen, NgaySinh, GioiTinh, NgayVaoLam, ChucVu, NguoiQuanLi, MaChiNhanh) VALUES
-- Quản lý
('NV00000001', N'Nguyễn Văn An', '1980-05-15', N'Nam', '2020-01-10', N'Quản lí', NULL, 'CN00000001'),
('NV00000002', N'Trần Thị Bình', '1982-08-20', N'Nữ', '2020-02-15', N'Quản lí', NULL, 'CN00000002'),
('NV00000003', N'Lê Văn Cường', '1981-11-25', N'Nam', '2020-03-20', N'Quản lí', NULL, 'CN00000003'),
('NV00000004', N'Phạm Thị Dung', '1983-06-12', N'Nữ', '2020-04-10', N'Quản lí', NULL, 'CN00000004'),
-- Bác sĩ thú y
('NV00000005', N'Hoàng Văn Em', '1990-03-10', N'Nam', '2020-06-01', N'Bác sĩ thú y', 'NV00000001', 'CN00000001'),
('NV00000006', N'Võ Thị Phương', '1988-07-22', N'Nữ', '2020-07-15', N'Bác sĩ thú y', 'NV00000001', 'CN00000001'),
('NV00000007', N'Đặng Văn Giang', '1991-02-18', N'Nam', '2020-08-10', N'Bác sĩ thú y', 'NV00000002', 'CN00000002'),
('NV00000008', N'Bùi Thị Hoa', '1989-12-05', N'Nữ', '2020-09-01', N'Bác sĩ thú y', 'NV00000002', 'CN00000002'),
('NV00000009', N'Trương Văn Inh', '1992-04-20', N'Nam', '2020-10-05', N'Bác sĩ thú y', 'NV00000003', 'CN00000003'),
('NV00000010', N'Lý Thị Kim', '1990-08-15', N'Nữ', '2020-11-10', N'Bác sĩ thú y', 'NV00000004', 'CN00000004'),
-- Tiếp tân
('NV00000011', N'Phan Văn Long', '1995-04-12', N'Nam', '2021-01-15', N'Tiếp tân', 'NV00000001', 'CN00000001'),
('NV00000012', N'Ngô Thị Mai', '1996-09-08', N'Nữ', '2021-02-20', N'Tiếp tân', 'NV00000001', 'CN00000001'),
('NV00000013', N'Đỗ Văn Nam', '1994-06-30', N'Nam', '2021-03-10', N'Tiếp tân', 'NV00000002', 'CN00000002'),
('NV00000014', N'Nguyễn Thị Oanh', '1997-11-22', N'Nữ', '2021-04-05', N'Tiếp tân', 'NV00000003', 'CN00000003'),
-- Nhân viên bán hàng
('NV00000015', N'Huỳnh Văn Phúc', '1993-01-20', N'Nam', '2021-05-01', N'Nhân viên bán hàng', 'NV00000001', 'CN00000001'),
('NV00000016', N'Cao Thị Quỳnh', '1994-10-15', N'Nữ', '2021-06-15', N'Nhân viên bán hàng', 'NV00000002', 'CN00000002'),
('NV00000017', N'Lâm Văn Rộng', '1992-08-25', N'Nam', '2021-07-20', N'Nhân viên bán hàng', 'NV00000003', 'CN00000003'),
('NV00000018', N'Đinh Thị Sương', '1995-03-18', N'Nữ', '2021-08-10', N'Nhân viên bán hàng', 'NV00000004', 'CN00000004');
GO

-- 6. PHÂN LOẠI NHÂN VIÊN
INSERT INTO QUAN_LI (MaNhanVien, MaChiNhanhQuanLi) VALUES
('NV00000001', 'CN00000001'),
('NV00000002', 'CN00000002'),
('NV00000003', 'CN00000003'),
('NV00000004', 'CN00000004');
GO

INSERT INTO BAC_SI_THU_Y (MaNhanVien, GioLamViec, GioNghi) VALUES
('NV00000005', '08:00:00', '17:00:00'),
('NV00000006', '13:00:00', '22:00:00'),
('NV00000007', '08:00:00', '17:00:00'),
('NV00000008', '09:00:00', '18:00:00'),
('NV00000009', '08:30:00', '17:30:00'),
('NV00000010', '10:00:00', '19:00:00');
GO

INSERT INTO NHAN_VIEN_TIEP_TAN (MaNhanVien) VALUES
('NV00000011'),
('NV00000012'),
('NV00000013'),
('NV00000014');
GO

INSERT INTO NHAN_VIEN_BAN_HANG (MaNhanVien) VALUES
('NV00000015'),
('NV00000016'),
('NV00000017'),
('NV00000018');
GO

-- 7. LỊCH SỬ ĐIỀU ĐỘNG
INSERT INTO LICH_SU_DIEU_DONG (MaNhanVien, MaChiNhanh, NgayBatDau, NgayKetThuc, ViTri) VALUES
('NV00000005', 'CN00000001', '2020-06-01', NULL, N'Bác sĩ thú y'),
('NV00000006', 'CN00000001', '2020-07-15', NULL, N'Bác sĩ thú y'),
('NV00000007', 'CN00000002', '2020-08-10', '2024-12-31', N'Bác sĩ thú y'),
('NV00000007', 'CN00000001', '2025-01-01', NULL, N'Bác sĩ thú y'),
('NV00000008', 'CN00000002', '2020-09-01', NULL, N'Bác sĩ thú y'),
('NV00000015', 'CN00000002', '2021-05-01', '2023-06-30', N'Nhân viên bán hàng'),
('NV00000015', 'CN00000001', '2023-07-01', NULL, N'Nhân viên bán hàng');
GO

-- 8. KHÁCH HÀNG
INSERT INTO KHACH_HANG (MaKhachHang, TenKhachHang, SoDienThoai, Email, CCCD, GioiTinh, NgaySinh, DiemTichLuy) VALUES
('KH00000001', N'Nguyễn Thị Lan', '0901234567', 'lan.nguyen@email.com      ', '001088123456', N'Nữ', '1985-03-15', 1200),
('KH00000002', N'Trần Văn Minh', '0901234568', 'minh.tran@email.com       ', '001088123457', N'Nam', '1990-07-20', 800),
('KH00000003', N'Lê Thị Nga', '0901234569', 'nga.le@email.com          ', '001088123458', N'Nữ', '1988-11-10', 1500),
('KH00000004', N'Phạm Văn Oanh', '0901234570', 'oanh.pham@email.com       ', '001088123459', N'Nam', '1992-02-25', 500),
('KH00000005', N'Hoàng Thị Phương', '0901234571', 'phuong.hoang@email.com    ', '001088123460', N'Nữ', '1995-06-18', 2000),
('KH00000006', N'Võ Văn Quang', '0901234572', 'quang.vo@email.com        ', '001088123461', N'Nam', '1987-09-05', 300),
('KH00000007', N'Đặng Thị Rạng', '0901234573', 'rang.dang@email.com       ', '001088123462', N'Nữ', '1993-12-30', 1000),
('KH00000008', N'Bùi Văn Sơn', '0901234574', 'son.bui@email.com         ', '001088123463', N'Nam', '1991-04-12', 600),
('KH00000009', N'Trịnh Thị Tâm', '0901234575', 'tam.trinh@email.com       ', '001088123464', N'Nữ', '1994-08-08', 950),
('KH00000010', N'Dương Văn Uy', '0901234576', 'uy.duong@email.com        ', '001088123465', N'Nam', '1989-05-25', 1100);
GO

-- 9. PHÂN LOẠI KHÁCH HÀNG
INSERT INTO PHAN_LOAI_KHACH_HANG (MaKhachHang, Nam, MucChiTieu, TenLoai) VALUES
('KH00000001', 2024, 12000000.00, N'VIP'),
('KH00000002', 2024, 8000000.00, N'Thân thiết'),
('KH00000003', 2024, 15000000.00, N'VIP'),
('KH00000004', 2024, 5000000.00, N'Thân thiết'),
('KH00000005', 2024, 20000000.00, N'VIP'),
('KH00000006', 2024, 3000000.00, N'Cơ bản'),
('KH00000007', 2024, 10000000.00, N'Thân thiết'),
('KH00000008', 2024, 6000000.00, N'Thân thiết'),
('KH00000009', 2024, 9500000.00, N'Thân thiết'),
('KH00000010', 2024, 11000000.00, N'VIP');
GO

-- 10. THÚ CƯNG
INSERT INTO THU_CUNG (MaThuCung, TenThuCung, Loai, Giong, NgaySinh, GioiTinh, TinhTrang, MaKhachHang) VALUES
('TC00000001', N'Milu', N'Chó', N'Golden Retriever', '2020-05-10', N'Cái', N'Khỏe mạnh', 'KH00000001'),
('TC00000002', N'Lucky', N'Chó', N'Poodle', '2019-08-15', N'Đực', N'Khỏe mạnh', 'KH00000001'),
('TC00000003', N'Mèo Mun', N'Mèo', N'Anh lông ngắn', '2021-02-20', N'Đực', N'Khỏe mạnh', 'KH00000002'),
('TC00000004', N'Simba', N'Mèo', N'Ba Tư', '2020-11-05', N'Đực', N'Khỏe mạnh', 'KH00000003'),
('TC00000005', N'Béo', N'Chó', N'Corgi', '2022-03-12', N'Đực', N'Khỏe mạnh', 'KH00000004'),
('TC00000006', N'Cún Con', N'Chó', N'Husky', '2021-07-18', N'Cái', N'Khỏe mạnh', 'KH00000005'),
('TC00000007', N'Tom', N'Mèo', N'Tai Cụp', '2020-09-25', N'Đực', N'Khỏe mạnh', 'KH00000006'),
('TC00000008', N'Bông', N'Chó', N'Phốc Sóc', '2023-01-30', N'Cái', N'Khỏe mạnh', 'KH00000007'),
('TC00000009', N'Lucy', N'Mèo', N'Munchkin', '2021-05-15', N'Cái', N'Khỏe mạnh', 'KH00000008'),
('TC00000010', N'Max', N'Chó', N'Beagle', '2022-09-20', N'Đực', N'Khỏe mạnh', 'KH00000009'),
('TC00000011', N'Mimi', N'Mèo', N'Ragdoll', '2020-12-10', N'Cái', N'Khỏe mạnh', 'KH00000010'),
('TC00000012', N'Bobby', N'Chó', N'Chihuahua', '2023-04-05', N'Đực', N'Khỏe mạnh', 'KH00000003');
GO

--==============================================================
-- PHẦN 2: DỮ LIỆU SẢN PHẨM VÀ KHO HÀNG
--==============================================================

-- 11. SẢN PHẨM
INSERT INTO SAN_PHAM (MaSanPham, TenSanPham, LoaiSanPham, GiaBan) VALUES
('SP00000001', N'Thức ăn chó Royal Canin', N'thức ăn', 350000.00),
('SP00000002', N'Thức ăn mèo Me-O', N'thức ăn', 280000.00),
('SP00000003', N'Sữa tắm Bio-Groom', N'phụ kiện', 120000.00),
('SP00000004', N'Vòng cổ chó da thật', N'phụ kiện', 80000.00),
('SP00000005', N'Thuốc tẩy giun Drontal', N'thuốc', 150000.00),
('SP00000006', N'Vitamin Nutri-Vet', N'thuốc', 200000.00),
('SP00000007', N'Xương gặm Vegebrand', N'thức ăn', 45000.00),
('SP00000008', N'Cát vệ sinh Ever Clean', N'phụ kiện', 95000.00),
('SP00000009', N'Thuốc nhỏ mắt Opticare', N'thuốc', 85000.00),
('SP00000010', N'Đồ chơi bóng cho mèo', N'phụ kiện', 65000.00),
('SP00000011', N'Thức ăn chó Pedigree', N'thức ăn', 280000.00),
('SP00000012', N'Pate mèo Whiskas', N'thức ăn', 35000.00),
('SP00000013', N'Lồng vận chuyển M', N'phụ kiện', 450000.00),
('SP00000014', N'Thuốc ve rận Frontline', N'thuốc', 320000.00),
('SP00000015', N'Dây dắt tự động', N'phụ kiện', 185000.00);
GO

-- 12. LÔ HÀNG
INSERT INTO LO_HANG (MaSanPham, NgaySanXuat, HanSuDung) VALUES
('SP00000001', '2024-01-15 00:00:00', '2025-01-15 00:00:00'),
('SP00000001', '2024-06-20 00:00:00', '2025-06-20 00:00:00'),
('SP00000002', '2024-02-10 00:00:00', '2025-02-10 00:00:00'),
('SP00000002', '2024-07-15 00:00:00', '2025-07-15 00:00:00'),
('SP00000003', '2024-03-05 00:00:00', '2026-03-05 00:00:00'),
('SP00000004', '2024-01-01 00:00:00', NULL),
('SP00000005', '2024-04-12 00:00:00', '2025-04-12 00:00:00'),
('SP00000006', '2024-05-08 00:00:00', '2025-05-08 00:00:00'),
('SP00000007', '2024-06-15 00:00:00', '2025-06-15 00:00:00'),
('SP00000008', '2024-02-20 00:00:00', NULL),
('SP00000009', '2024-03-25 00:00:00', '2025-03-25 00:00:00'),
('SP00000010', '2024-01-10 00:00:00', NULL),
('SP00000011', '2024-05-20 00:00:00', '2025-05-20 00:00:00'),
('SP00000012', '2024-08-10 00:00:00', '2025-02-10 00:00:00'),
('SP00000013', '2024-03-01 00:00:00', NULL),
('SP00000014', '2024-04-18 00:00:00', '2026-04-18 00:00:00'),
('SP00000015', '2024-02-25 00:00:00', NULL);
GO

-- 13. KHO HÀNG
INSERT INTO KHO_HANG (MaChiNhanh, MaSanPham, NgaySanXuat, SoLuongTonKho) VALUES
('CN00000001', 'SP00000001', '2024-01-15 00:00:00', 50),
('CN00000001', 'SP00000002', '2024-02-10 00:00:00', 40),
('CN00000001', 'SP00000003', '2024-03-05 00:00:00', 30),
('CN00000001', 'SP00000005', '2024-04-12 00:00:00', 25),
('CN00000001', 'SP00000007', '2024-06-15 00:00:00', 100),
('CN00000002', 'SP00000001', '2024-06-20 00:00:00', 45),
('CN00000002', 'SP00000004', '2024-01-01 00:00:00', 60),
('CN00000002', 'SP00000006', '2024-05-08 00:00:00', 35),
('CN00000002', 'SP00000011', '2024-05-20 00:00:00', 38),
('CN00000003', 'SP00000007', '2024-06-15 00:00:00', 80),
('CN00000003', 'SP00000008', '2024-02-20 00:00:00', 65),
('CN00000003', 'SP00000009', '2024-03-25 00:00:00', 20),
('CN00000003', 'SP00000012', '2024-08-10 00:00:00', 150),
('CN00000004', 'SP00000013', '2024-03-01 00:00:00', 15),
('CN00000004', 'SP00000014', '2024-04-18 00:00:00', 28),
('CN00000004', 'SP00000015', '2024-02-25 00:00:00', 42);
GO

--==============================================================
-- PHẦN 3: DỮ LIỆU VẮC XIN VÀ GÓI TIÊM
--==============================================================

-- 14. VẮC XIN
INSERT INTO VACXIN (MaVacxin, TenVacxin, LieuLuongToiDa, MoTa, GiaTien) VALUES
('VX00000001', N'Vắc xin 5 bệnh', 3, N'Phòng Care, Parvo, Distemper, Hepatitis', 250000.00),
('VX00000002', N'Vắc xin dại', 1, N'Phòng bệnh dại cho chó mèo', 200000.00),
('VX00000003', N'Vắc xin 7 bệnh', 3, N'Phòng 7 bệnh phổ biến ở chó', 350000.00),
('VX00000004', N'Vắc xin mèo 3 bệnh', 2, N'Phòng Panleukopenia, Calicivirus', 280000.00),
('VX00000005', N'Vắc xin ho cũi', 2, N'Phòng bệnh ho cũi truyền nhiễm', 180000.00),
('VX00000006', N'Vắc xin giun tim', 1, N'Phòng bệnh giun tim ở chó', 220000.00);
GO

-- 15. GÓI TIÊM
INSERT INTO GOI_TIEM (MaGoiTiem, ChuKi, UuDai, LoaiGoiTiem) VALUES
('GT00000001', 30, 0.1, N'Theo tháng'),
('GT00000002', 0, 0, N'Lẻ'),
('GT00000003', 60, 0.15, N'Theo tháng'),
('GT00000004', 0, 0, N'Lẻ'),
('GT00000005', 90, 0.2, N'Theo tháng'),
('GT00000006', 45, 0.12, N'Theo tháng');
GO

-- 16. CHI TIẾT GÓI TIÊM
INSERT INTO CHI_TIET_GOI_TIEM (MaGoiTiem, SoThuTuVacxin, MaVacxin) VALUES
('GT00000001', 1, 'VX00000001'),
('GT00000001', 2, 'VX00000002'),
('GT00000002', 1, 'VX00000002'),
('GT00000003', 1, 'VX00000003'),
('GT00000003', 2, 'VX00000002'),
('GT00000003', 3, 'VX00000005'),
('GT00000004', 1, 'VX00000004'),
('GT00000005', 1, 'VX00000001'),
('GT00000005', 2, 'VX00000003'),
('GT00000005', 3, 'VX00000002'),
('GT00000006', 1, 'VX00000006'),
('GT00000006', 2, 'VX00000002');
GO

-- 17. DANH MỤC THUỐC
INSERT INTO DANH_MUC_THUOC (MaThuoc, TenThuoc) VALUES
('TH00000001', N'Kháng sinh Amoxicillin'),
('TH00000002', N'Thuốc giảm đau Paracetamol'),
('TH00000003', N'Thuốc tiêu hóa Probiotics'),
('TH00000004', N'Thuốc chống viêm'),
('TH00000005', N'Thuốc trị nấm'),
('TH00000006', N'Thuốc tẩy giun'),
('TH00000007', N'Vitamin B Complex'),
('TH00000008', N'Thuốc nhỏ mắt'),
('TH00000009', N'Thuốc ho'),
('TH00000010', N'Thuốc ngoài da Betadine');
GO

--==============================================================
-- PHẦN 4: DỮ LIỆU GIAO DỊCH
--==============================================================

-- 18. PHIẾU DỊCH VỤ
INSERT INTO PHIEU_DICH_VU (MaPhieuDichVu, TongTien, MaChiNhanh, MaKhachHang) VALUES
('PDV0000001', 500000.00, 'CN00000001', 'KH00000001'),
('PDV0000002', 250000.00, 'CN00000001', 'KH00000002'),
('PDV0000003', 800000.00, 'CN00000002', 'KH00000003'),
('PDV0000004', 350000.00, 'CN00000003', 'KH00000004'),
('PDV0000005', 1200000.00, 'CN00000001', 'KH00000005'),
('PDV0000006', 450000.00, 'CN00000002', 'KH00000001'),
('PDV0000007', 600000.00, 'CN00000003', 'KH00000002'),
('PDV0000008', 300000.00, 'CN00000001', 'KH00000006'),
('PDV0000009', 950000.00, 'CN00000002', 'KH00000007'),
('PDV0000010', 400000.00, 'CN00000001', 'KH00000003'),
('PDV0000011', 680000.00, 'CN00000004', 'KH00000008'),
('PDV0000012', 520000.00, 'CN00000003', 'KH00000009'),
('PDV0000013', 750000.00, 'CN00000002', 'KH00000010'),
('PDV0000014', 380000.00, 'CN00000001', 'KH00000004'),
('PDV0000015', 890000.00, 'CN00000004', 'KH00000005'),
('PDV0000016', 420000.00, 'CN00000003', 'KH00000006'),
('PDV0000017', 550000.00, 'CN00000002', 'KH00000007'),
('PDV0000018', 310000.00, 'CN00000001', 'KH00000008'),
('PDV0000019', 720000.00, 'CN00000004', 'KH00000009'),
('PDV0000020', 640000.00, 'CN00000002', 'KH00000010');
GO

-- 19. LỊCH HẸN
INSERT INTO LICH_HEN (MaLichHen, ThoiGian, TrangThai, LoaiLichHen, MaKhachHang, MaThuCung, MaChiNhanh, MaNhanVienXacNhan, MaPhieuDichVu) VALUES
('LH00000001', '2025-01-05 09:00:00', N'Đã xác nhận', N'Khám bệnh', 'KH00000001', 'TC00000001', 'CN00000001', 'NV00000011', 'PDV0000001'),
('LH00000002', '2025-01-06 10:30:00', N'Đã xác nhận', N'Tiêm phòng', 'KH00000002', 'TC00000003', 'CN00000001', 'NV00000011', 'PDV0000002'),
('LH00000003', '2025-01-07 14:00:00', N'Đã xác nhận', N'Khám bệnh', 'KH00000003', 'TC00000004', 'CN00000002', 'NV00000013', 'PDV0000003'),
('LH00000004', '2025-01-08 11:00:00', N'Đã xác nhận', N'Tiêm phòng', 'KH00000004', 'TC00000005', 'CN00000003', 'NV00000014', 'PDV0000004'),
('LH00000005', '2025-01-09 15:30:00', N'Đã hủy', N'Khám bệnh', 'KH00000005', 'TC00000006', 'CN00000001', 'NV00000011', NULL),
('LH00000006', '2025-01-10 09:30:00', N'Chờ xác nhận', N'Khám bệnh', 'KH00000006', 'TC00000007', 'CN00000002', NULL, NULL),
('LH00000007', '2025-01-11 13:00:00', N'Đã xác nhận', N'Tiêm phòng', 'KH00000007', 'TC00000008', 'CN00000003', 'NV00000014', 'PDV0000012'),
('LH00000008', '2025-01-12 10:00:00', N'Đã xác nhận', N'Khám bệnh', 'KH00000008', 'TC00000009', 'CN00000004', 'NV00000014', 'PDV0000011');
GO

-- 20. PHIẾU KHÁM BỆNH
INSERT INTO PHIEU_KHAM_BENH (MaPhieuDichVu, TrieuChung, ChuanDoan, NgayHenTaiKham, MaBacSi, MaThuCung) VALUES
('PDV0000001', N'Ho, sốt nhẹ', N'Viêm đường hô hấp', '2025-01-15', 'NV00000005', 'TC00000001'),
('PDV0000003', N'Tiêu chảy, mất nước', N'Viêm dạ dày ruột', '2025-01-20', 'NV00000007', 'TC00000004'),
('PDV0000007', N'Ngứa, rụng lông', N'Viêm da nấm', '2025-01-18', 'NV00000009', 'TC00000003'),
('PDV0000011', N'Chán ăn, uể oải', N'Nhiễm trùng nhẹ', '2025-01-22', 'NV00000010', 'TC00000009'),
('PDV0000013', N'Sưng mắt, chảy nước mắt', N'Viêm kết mạc', '2025-01-25', 'NV00000007', 'TC00000011');
GO

-- 21. CHI TIẾT TOA THUỐC
INSERT INTO CHI_TIET_TOA_THUOC (MaPhieuKhamBenh, MaThuoc, SoLuong) VALUES
('PDV0000001', 'TH00000001', 2),
('PDV0000001', 'TH00000009', 1),
('PDV0000003', 'TH00000003', 3),
('PDV0000003', 'TH00000001', 1),
('PDV0000007', 'TH00000005', 2),
('PDV0000007', 'TH00000010', 1),
('PDV0000011', 'TH00000001', 2),
('PDV0000011', 'TH00000007', 1),
('PDV0000013', 'TH00000008', 2),
('PDV0000013', 'TH00000004', 1);
GO

-- 22. PHIẾU ĐĂNG KÝ GÓI TIÊM
INSERT INTO PHIEU_DANG_KY_GOI_TIEM (MaPhieuDichVu, NgayDangKy, MaGoiTiem, MaThuCung) VALUES
('PDV0000002', '2025-01-06', 'GT00000001', 'TC00000003'),
('PDV0000004', '2025-01-08', 'GT00000003', 'TC00000005'),
('PDV0000005', '2025-01-09', 'GT00000005', 'TC00000006'),
('PDV0000012', '2025-01-11', 'GT00000002', 'TC00000008');
GO

-- 23. PHIẾU TIÊM PHÒNG
INSERT INTO PHIEU_TIEM_PHONG (MaPhieuDichVu, NgayTiem, MaVacxin, LieuLuong, MaGoiTiem, MaThuCung, MaBacSi) VALUES
('PDV0000002', '2025-01-06', 'VX00000001', 1, 'GT00000001', 'TC00000003', 'NV00000005'),
('PDV0000004', '2025-01-08', 'VX00000003', 1, 'GT00000003', 'TC00000005', 'NV00000009'),
('PDV0000005', '2025-01-09', 'VX00000001', 1, 'GT00000005', 'TC00000006', 'NV00000005'),
('PDV0000012', '2025-01-11', 'VX00000002', 1, 'GT00000002', 'TC00000008', 'NV00000009');
GO

-- 24. PHIẾU MUA HÀNG
INSERT INTO PHIEU_MUA_HANG (MaPhieuDichVu) VALUES
('PDV0000006'),
('PDV0000008'),
('PDV0000009'),
('PDV0000010'),
('PDV0000014'),
('PDV0000015'),
('PDV0000016'),
('PDV0000017'),
('PDV0000018'),
('PDV0000019'),
('PDV0000020');
GO

-- 25. CHI TIẾT MUA HÀNG
INSERT INTO CHI_TIET_MUA_HANG (MaPhieuDichVu, SoThuTu, SoLuong, MaSanPham) VALUES
('PDV0000006', 1, 2, 'SP00000003'),
('PDV0000006', 2, 1, 'SP00000004'),
('PDV0000008', 1, 1, 'SP00000002'),
('PDV0000008', 2, 3, 'SP00000007'),
('PDV0000009', 1, 2, 'SP00000005'),
('PDV0000009', 2, 1, 'SP00000006'),
('PDV0000009', 3, 1, 'SP00000008'),
('PDV0000010', 1, 1, 'SP00000001'),
('PDV0000010', 2, 2, 'SP00000010'),
('PDV0000014', 1, 1, 'SP00000011'),
('PDV0000014', 2, 1, 'SP00000004'),
('PDV0000015', 1, 1, 'SP00000013'),
('PDV0000015', 2, 2, 'SP00000014'),
('PDV0000016', 1, 2, 'SP00000012'),
('PDV0000016', 2, 1, 'SP00000003'),
('PDV0000017', 1, 1, 'SP00000015'),
('PDV0000017', 2, 1, 'SP00000008'),
('PDV0000018', 1, 2, 'SP00000007'),
('PDV0000018', 2, 1, 'SP00000010'),
('PDV0000019', 1, 1, 'SP00000001'),
('PDV0000019', 2, 1, 'SP00000006'),
('PDV0000020', 1, 2, 'SP00000002'),
('PDV0000020', 2, 1, 'SP00000011');
GO

-- 26. HÓA ĐƠN
INSERT INTO HOA_DON (MaHoaDon, NgayLap, TongTienThanhToan, KhuyenMai, HinhThucThanhToan, MaPhieuDichVu, MaNhanVien, MaThuCung) VALUES
('HD00000001', '2025-01-05', 500000.00, 0, N'Tiền mặt', 'PDV0000001', 'NV00000015', 'TC00000001'),
('HD00000002', '2025-01-06', 225000.00, 0.1, N'Chuyển khoản', 'PDV0000002', 'NV00000015', 'TC00000003'),
('HD00000003', '2025-01-07', 800000.00, 0, N'Thẻ', 'PDV0000003', 'NV00000016', 'TC00000004'),
('HD00000004', '2025-01-08', 350000.00, 0, N'Tiền mặt', 'PDV0000004', 'NV00000017', 'TC00000005'),
('HD00000005', '2025-02-09', 1080000.00, 0.1, N'Chuyển khoản', 'PDV0000005', 'NV00000015', 'TC00000006'),
('HD00000006', '2025-04-10', 450000.00, 0, N'Tiền mặt', 'PDV0000006', 'NV00000016', 'TC00000001'),
('HD00000007', '2025-05-11', 600000.00, 0, N'Thẻ', 'PDV0000007', 'NV00000017', 'TC00000003'),
('HD00000008', '2025-06-12', 300000.00, 0, N'Tiền mặt', 'PDV0000008', 'NV00000015', 'TC00000007'),
('HD00000009', '2025-07-13', 855000.00, 0.1, N'Chuyển khoản', 'PDV0000009', 'NV00000016', 'TC00000008'),
('HD00000010', '2025-08-14', 400000.00, 0, N'Thẻ', 'PDV0000010', 'NV00000015', 'TC00000004'),
('HD00000011', '2025-09-15', 680000.00, 0, N'Tiền mặt', 'PDV0000011', 'NV00000018', 'TC00000009'),
('HD00000012', '2025-10-16', 520000.00, 0, N'Chuyển khoản', 'PDV0000012', 'NV00000017', 'TC00000008'),
('HD00000013', '2025-11-17', 675000.00, 0.1, N'Thẻ', 'PDV0000013', 'NV00000016', 'TC00000011'),
('HD00000014', '2025-12-18', 380000.00, 0, N'Tiền mặt', 'PDV0000014', 'NV00000015', 'TC00000005'),
('HD00000015', '2025-01-19', 890000.00, 0, N'Chuyển khoản', 'PDV0000015', 'NV00000018', 'TC00000006'),
('HD00000016', '2025-02-20', 420000.00, 0, N'Tiền mặt', 'PDV0000016', 'NV00000017', 'TC00000007'),
('HD00000017', '2025-03-21', 495000.00, 0.1, N'Thẻ', 'PDV0000017', 'NV00000016', 'TC00000008'),
('HD00000018', '2025-04-22', 310000.00, 0, N'Tiền mặt', 'PDV0000018', 'NV00000015', 'TC00000009'),
('HD00000019', '2025-05-23', 720000.00, 0, N'Chuyển khoản', 'PDV0000019', 'NV00000018', 'TC00000010'),
('HD00000020', '2025-06-24', 576000.00, 0.1, N'Thẻ', 'PDV0000020', 'NV00000016', 'TC00000011');
GO

-- 27. ĐÁNH GIÁ
INSERT INTO DANH_GIA (MaHoaDon, NgayLap, DiemChatLuongDichVu, ThaiDoNhanVien, MucDoHaiLong, BinhLuan, PhanHoi) VALUES
('HD00000001', '2025-01-05', 5, 5, 5, N'Dịch vụ rất tốt, bác sĩ nhiệt tình', N'Cảm ơn nhận xét của quý khách'),
('HD00000002', '2025-01-06', 4, 5, 4, N'Nhân viên thân thiện, tiêm nhanh', N'Cảm ơn nhận xét của quý khách'),
('HD00000003', '2025-01-07', 5, 4, 5, N'Khám kỹ càng, tư vấn chi tiết', N'Cảm ơn nhận xét của quý khách'),
('HD00000004', '2025-01-08', 4, 4, 4, N'Dịch vụ ổn, giá cả hợp lý', N'Cảm ơn nhận xét của quý khách'),
('HD00000005', '2025-02-09', 5, 5, 5, N'Rất hài lòng với gói tiêm', N'Cảm ơn nhận xét của quý khách'),
('HD00000006', '2025-04-10', 3, 4, 3, N'Thời gian chờ hơi lâu', N'Cảm ơn nhận xét của quý khách'),
('HD00000007', '2025-05-11', 4, 4, 4, N'Chẩn đoán chính xác', N'Cảm ơn nhận xét của quý khách'),
('HD00000008', '2025-06-12', 5, 5, 5, N'Mua hàng thuận lợi, tư vấn tốt', N'Cảm ơn nhận xét của quý khách'),
('HD00000009', '2025-07-13', 4, 5, 4, N'Sản phẩm chất lượng', N'Cảm ơn nhận xét của quý khách'),
('HD00000010', '2025-08-14', 5, 4, 5, N'Giá tốt, nhiều khuyến mãi', N'Cảm ơn nhận xét của quý khách'),
('HD00000011', '2025-09-15', 4, 4, 4, N'Bác sĩ giỏi, khám nhanh', N'Cảm ơn nhận xét của quý khách'),
('HD00000012', '2025-10-16', 5, 5, 5, N'Tiêm phòng an toàn', N'Cảm ơn nhận xét của quý khách'),
('HD00000013', '2025-11-17', 3, 3, 3, N'Bình thường', N'Cảm ơn nhận xét của quý khách'),
('HD00000014', '2025-12-18', 4, 5, 4, N'Nhân viên chu đáo', N'Cảm ơn nhận xét của quý khách'),
('HD00000015', '2025-01-19', 5, 5, 5, N'Cơ sở vật chất tốt', N'Cảm ơn nhận xét của quý khách'),
('HD00000016', '2025-02-20', 4, 4, 4, N'Sạch sẽ, gọn gàng', N'Cảm ơn nhận xét của quý khách'),
('HD00000017', '2025-03-21', 5, 4, 5, N'Sản phẩm đa dạng', N'Cảm ơn nhận xét của quý khách'),
('HD00000018', '2025-04-22', 4, 5, 4, N'Phục vụ nhanh chóng', N'Cảm ơn nhận xét của quý khách'),
('HD00000019', '2025-05-23', 5, 5, 5, N'Rất hài lòng, sẽ quay lại', N'Cảm ơn nhận xét của quý khách'),
('HD00000020', '2025-06-24', 4, 4, 4, N'Tốt, đáng tin cậy', N'Cảm ơn nhận xét của quý khách');
GO

--==============================================================
-- PHẦN 5: DỮ LIỆU TÀI KHOẢN (AUTHENTICATION)
-- Lưu ý: Mật khẩu ở đây đang để dạng thô để dễ test. 
-- Trong thực tế, Node.js sẽ lưu chuỗi đã Hash (bcrypt).
--==============================================================

-- 28. TÀI KHOẢN
-- =============================================================
-- PHẦN 1: TÀI KHOẢN ADMIN (CHỦ HỆ THỐNG - SUPER ADMIN)
-- =============================================================
INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, Email, VaiTro, MaKhachHang, MaNhanVien)
VALUES ('admin_root', 'admin123', 'admin@petcarex.com', N'Admin', NULL, NULL);

-- =============================================================
-- PHẦN 2: TÀI KHOẢN QUẢN LÝ (VAI TRÒ: QUANLI) - Liên kết NV01-NV04
-- =============================================================
INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, Email, VaiTro, MaNhanVien) VALUES
('an.nguyen',   'ql123', 'an.nguyen@petcarex.com',   N'QuanLi', 'NV00000001'),
('binh.tran',   'ql123', 'binh.tran@petcarex.com',   N'QuanLi', 'NV00000002'),
('cuong.le',    'ql123', 'cuong.le@petcarex.com',    N'QuanLi', 'NV00000003'),
('dung.pham',   'ql123', 'dung.pham@petcarex.com',   N'QuanLi', 'NV00000004');

-- =============================================================
-- PHẦN 3: TÀI KHOẢN NHÂN VIÊN (VAI TRÒ: NHANVIEN) - Liên kết NV05-NV18
-- =============================================================
-- Bác sĩ thú y (NV05 - NV10)
INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, Email, VaiTro, MaNhanVien) VALUES
('em.hoang',    'nv123', 'em.hoang@petcarex.com',    N'NhanVien', 'NV00000005'),
('phuong.vo',   'nv123', 'phuong.vo@petcarex.com',   N'NhanVien', 'NV00000006'),
('giang.dang',  'nv123', 'giang.dang@petcarex.com',  N'NhanVien', 'NV00000007'),
('hoa.bui',     'nv123', 'hoa.bui@petcarex.com',     N'NhanVien', 'NV00000008'),
('inh.truong',  'nv123', 'inh.truong@petcarex.com',  N'NhanVien', 'NV00000009'),
('kim.ly',      'nv123', 'kim.ly@petcarex.com',      N'NhanVien', 'NV00000010');

-- Tiếp tân (NV11 - NV14)
INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, Email, VaiTro, MaNhanVien) VALUES
('long.phan',   'nv123', 'long.phan@petcarex.com',   N'NhanVien', 'NV00000011'),
('mai.ngo',     'nv123', 'mai.ngo@petcarex.com',     N'NhanVien', 'NV00000012'),
('nam.do',      'nv123', 'nam.do@petcarex.com',      N'NhanVien', 'NV00000013'),
('oanh.nguyen', 'nv123', 'oanh.nguyen@petcarex.com', N'NhanVien', 'NV00000014');

-- Nhân viên bán hàng (NV15 - NV18)
INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, Email, VaiTro, MaNhanVien) VALUES
('phuc.huynh',  'nv123', 'phuc.huynh@petcarex.com',  N'NhanVien', 'NV00000015'),
('quynh.cao',   'nv123', 'quynh.cao@petcarex.com',   N'NhanVien', 'NV00000016'),
('rong.lam',    'nv123', 'rong.lam@petcarex.com',    N'NhanVien', 'NV00000017'),
('suong.dinh',  'nv123', 'suong.dinh@petcarex.com',  N'NhanVien', 'NV00000018');

-- =============================================================
-- PHẦN 4: TÀI KHOẢN KHÁCH HÀNG (VAI TRÒ: KHACHHANG) - Liên kết KH01-KH10
-- =============================================================
INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, Email, VaiTro, MaKhachHang) VALUES
('kh_lan',      'kh123', 'lan.nguyen@email.com',   N'KhachHang', 'KH00000001'),
('kh_minh',     'kh123', 'minh.tran@email.com',    N'KhachHang', 'KH00000002'),
('kh_nga',      'kh123', 'nga.le@email.com',       N'KhachHang', 'KH00000003'),
('kh_oanh',     'kh123', 'oanh.pham@email.com',    N'KhachHang', 'KH00000004'),
('kh_phuong',   'kh123', 'phuong.hoang@email.com', N'KhachHang', 'KH00000005'),
('kh_quang',    'kh123', 'quang.vo@email.com',     N'KhachHang', 'KH00000006'),
('kh_rang',     'kh123', 'rang.dang@email.com',    N'KhachHang', 'KH00000007'),
('kh_son',      'kh123', 'son.bui@email.com',      N'KhachHang', 'KH00000008'),
('kh_tam',      'kh123', 'tam.trinh@email.com',    N'KhachHang', 'KH00000009'),
('kh_uy',       'kh123', 'uy.duong@email.com',     N'KhachHang', 'KH00000010');
GO