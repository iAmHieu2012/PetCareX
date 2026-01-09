USE PETCAREX;
GO

--==============================================================
-- PHẦN 2: TẠO CÁC BẢNG VÀ RÀNG BUỘC KHÓA NGOẠI
--==============================================================
--==============================================================
-- PHẦN 2.1: TẠO CƠ SỞ DỮ LIỆU MỚI: PETCAREX & HẠ TẦNG PHÂN VÙNG
--==============================================================

-- 1. Tạo hàm phân vùng theo Quý cho bảng HOA_DON
CREATE PARTITION FUNCTION PF_HoaDon_TheoQuy (DATE)
AS RANGE RIGHT FOR VALUES ('2025-01-01', '2025-04-01', '2025-07-01', '2025-10-01');
GO

-- 2. Tạo sơ đồ phân vùng gán vào PRIMARY
CREATE PARTITION SCHEME PS_HoaDon_TheoQuy
AS PARTITION PF_HoaDon_TheoQuy
ALL TO ([PRIMARY]);
GO

-- 3. Tạo hàm phân vùng theo Chi nhánh cho LICH_HEN, KHO_HANG
CREATE PARTITION FUNCTION PF_TheoChiNhanh (CHAR(10))
AS RANGE LEFT FOR VALUES ('CN00000001', 'CN00000002', 'CN00000003', 'CN00000004', 'CN00000005', 'CN00000006', 'CN00000007', 'CN00000008', 'CN00000009', 'CN00000010');
GO

CREATE PARTITION SCHEME PS_TheoChiNhanh
AS PARTITION PF_TheoChiNhanh
ALL TO ([PRIMARY]);
GO


--==============================================================
-- PHẦN 2.2: THIẾT LẬP CÁC TABLE
--==============================================================

-- Bảng: DICH_VU
CREATE TABLE DICH_VU (
    MaDichVu CHAR(10) PRIMARY KEY,
    TenDichVu NVARCHAR(20) NOT NULL,
    MoTa NVARCHAR(50)
);
GO

-- Bảng: CHI_NHANH
CREATE TABLE CHI_NHANH (
    MaChiNhanh CHAR(10) PRIMARY KEY,
    TenChiNhanh NVARCHAR(50) NOT NULL,
    DiaChi NVARCHAR(50) NOT NULL,
    DienThoai CHAR(10) NOT NULL,
    GioMoCua TIME NOT NULL,
    GioDongCua TIME NOT NULL,
	CONSTRAINT CHK_ChiNhanh_GioMoCua_GioDongCua CHECK (GioMoCua < GioDongCua)
);
GO

-- Bảng: DICH_VU_CHI_NHANH
CREATE TABLE DICH_VU_CHI_NHANH (
    MaDichVu CHAR(10),
    MaChiNhanh CHAR(10),
    PRIMARY KEY (MaDichVu, MaChiNhanh)
);
GO

-- Bảng: NHAN_VIEN
CREATE TABLE NHAN_VIEN (
    MaNhanVien CHAR(10) PRIMARY KEY,
    HoTen NVARCHAR(30) NOT NULL,
    NgaySinh DATE NOT NULL,
    GioiTinh NVARCHAR(3) NOT NULL,
    NgayVaoLam DATE NOT NULL,
    ChucVu NVARCHAR(20) NOT NULL,
    NguoiQuanLi CHAR(10), -- Có thể NULL cho người quản lí cấp cao nhất
    MaChiNhanh CHAR(10) NOT NULL,
    CONSTRAINT CHK_NhanVien_GioiTinh CHECK (GioiTinh IN (N'Nam', N'Nữ')),
    CONSTRAINT CHK_NhanVien_ChucVu CHECK (ChucVu IN (N'Bác sĩ thú y', N'Nhân viên bán hàng', N'Quản lí', N'Tiếp tân')),
	CONSTRAINT CHK_NhanVien_NgaySinh_NgayVaoLam CHECK (NgaySinh < NgayVaoLam)
);
GO

-- Bảng: BANG_LUONG
CREATE TABLE BANG_LUONG (
    ChucVu NVARCHAR(20) PRIMARY KEY,
    LuongCoBan DECIMAL(11, 2) NOT NULL,
    CONSTRAINT CHK_BangLuong_ChucVu CHECK (ChucVu IN (N'Bác sĩ thú y', N'Nhân viên bán hàng', N'Quản lí', N'Tiếp tân')),
	CONSTRAINT CHK_BangLuong_LuongCoBan CHECK (LuongCoBan > 0)
);
GO

-- Bảng: LICH_SU_DIEU_DONG
CREATE TABLE LICH_SU_DIEU_DONG (
    MaNhanVien CHAR(10),
    MaChiNhanh CHAR(10),
    NgayBatDau DATE NOT NULL,
    NgayKetThuc DATE,
    ViTri NVARCHAR(20) NOT NULL,
    PRIMARY KEY (MaNhanVien, MaChiNhanh, NgayBatDau),
    CONSTRAINT CHK_LichSuDieuDong_ViTri CHECK (ViTri IN (N'Bác sĩ thú y', N'Nhân viên bán hàng', N'Quản lí', N'Tiếp tân')),
	CONSTRAINT CHK_LichSuDieuDong_NgayBatDau_NgayKetThuc CHECK (NgayKetThuc IS NULL OR NgayBatDau < NgayKetThuc)
);
GO

-- Bảng: NHAN_VIEN_BAN_HANG
CREATE TABLE NHAN_VIEN_BAN_HANG (
    MaNhanVien CHAR(10) PRIMARY KEY
);
GO

-- Bảng: NHAN_VIEN_TIEP_TAN
CREATE TABLE NHAN_VIEN_TIEP_TAN (
    MaNhanVien CHAR(10) PRIMARY KEY
);
GO

-- Bảng: QUAN_LI
CREATE TABLE QUAN_LI (
    MaNhanVien CHAR(10) PRIMARY KEY,
    MaChiNhanhQuanLi CHAR(10) NOT NULL
);
GO

-- Bảng: BAC_SI_THU_Y
CREATE TABLE BAC_SI_THU_Y (
    MaNhanVien CHAR(10) PRIMARY KEY,
    GioLamViec TIME NOT NULL,
    GioNghi TIME NOT NULL,
    CONSTRAINT CHK_BacSiThuY_GioLamViec_GioNghi CHECK (GioLamViec < GioNghi)
);
GO

-- Bảng: KHACH_HANG
CREATE TABLE KHACH_HANG (
    MaKhachHang CHAR(10) PRIMARY KEY,
    TenKhachHang NVARCHAR(30) NOT NULL,
    SoDienThoai CHAR(10) NOT NULL UNIQUE,
    Email CHAR(30) NOT NULL UNIQUE,
    CCCD CHAR(12) NOT NULL UNIQUE,
    GioiTinh NVARCHAR(3) NOT NULL,
    NgaySinh DATE,
    DiemTichLuy INT NOT NULL DEFAULT 0, -- Cột phi chuẩn hóa
    CONSTRAINT CHK_KhachHang_GioiTinh CHECK (GioiTinh IN (N'Nam', N'Nữ')),
    CONSTRAINT CHK_KhachHang_DiemTichLuy CHECK (DiemTichLuy >= 0)
);
GO

-- Bảng: PHAN_LOAI_KHACH_HANG
CREATE TABLE PHAN_LOAI_KHACH_HANG (
    MaKhachHang CHAR(10),
    Nam INT,
    MucChiTieu DECIMAL(11, 2) NOT NULL,
    TenLoai NVARCHAR(10) NOT NULL,
    PRIMARY KEY (MaKhachHang, Nam),
    CONSTRAINT CHK_PhanLoaiKhachHang_Nam CHECK (Nam >= 2000 AND Nam <= YEAR(GETDATE())),
    CONSTRAINT CHK_PhanLoaiKhachHang_TenLoai CHECK (TenLoai IN (N'Cơ bản', N'Thân thiết', N'VIP')),
	CONSTRAINT CHK_PhanLoaiKhachHang_MucChiTieu CHECK (MucChiTieu >= 0)
);
GO

-- Bảng: THU_CUNG
CREATE TABLE THU_CUNG (
    MaThuCung CHAR(10) PRIMARY KEY,
    TenThuCung NVARCHAR(30) NOT NULL,
    Loai NVARCHAR(20) NOT NULL,
    Giong NVARCHAR(20),
    NgaySinh DATE,
    GioiTinh NVARCHAR(3),
    TinhTrang NVARCHAR(20),
    MaKhachHang CHAR(10) NOT NULL,
    CONSTRAINT CHK_ThuCung_GioiTinh CHECK (GioiTinh IN (N'Đực', N'Cái'))
);
GO

-- Bảng: LICH_HEN (ÁP DỤNG PHÂN VÙNG THEO CHI NHÁNH)
CREATE TABLE LICH_HEN (
    MaLichHen CHAR(10),
    ThoiGian DATETIME NOT NULL,
    TrangThai NVARCHAR(15) NOT NULL,
    LoaiLichHen NVARCHAR(10) NOT NULL,
    MaKhachHang CHAR(10) NOT NULL,
    MaThuCung CHAR(10) NOT NULL,
    MaChiNhanh CHAR(10) NOT NULL,
    MaNhanVienXacNhan CHAR(10),
    MaPhieuDichVu CHAR(10),
    CONSTRAINT PK_LICH_HEN PRIMARY KEY CLUSTERED (MaLichHen, MaChiNhanh),
    CONSTRAINT CHK_LichHen_TrangThai CHECK (TrangThai IN (N'Chờ xác nhận', N'Đã xác nhận', N'Đã hủy')),
    CONSTRAINT CHK_LichHen_Loai CHECK (LoaiLichHen IN (N'Khám bệnh', N'Tiêm phòng'))
) ON PS_TheoChiNhanh(MaChiNhanh);
GO

-- Bảng: PHIEU_DICH_VU
CREATE TABLE PHIEU_DICH_VU (
    MaPhieuDichVu CHAR(10) PRIMARY KEY,
    TongTien DECIMAL(11, 2), -- Cột phi chuẩn hóa
    MaChiNhanh CHAR(10) NOT NULL,
    MaKhachHang CHAR(10) NOT NULL,
	CONSTRAINT CHK_PhieuDichVu_TongTien CHECK (TongTien >= 0)
);
GO

-- Bảng: HOA_DON (ÁP DỤNG PHÂN VÙNG THEO THỜI GIAN)
CREATE TABLE HOA_DON (
    MaHoaDon CHAR(10),
    NgayLap DATE,
    TongTienThanhToan DECIMAL(11, 2) NOT NULL, -- Cột phi chuẩn hóa
    KhuyenMai FLOAT,
    HinhThucThanhToan NVARCHAR(20), -- NULL = Chờ thanh toán, 'Đã hủy' = Hủy, Khác = Đã thanh toán
    MaPhieuDichVu CHAR(10) NOT NULL,
    MaNhanVien CHAR(10) NOT NULL,
    MaThuCung CHAR(10), -- Cột phi chuẩn hóa
    CONSTRAINT PK_HOA_DON PRIMARY KEY CLUSTERED (MaHoaDon, NgayLap),
	CONSTRAINT CHK_HoaDon_TongTienThanhToan CHECK (TongTienThanhToan >= 0),
    CONSTRAINT CHK_HoaDon_KhuyenMai CHECK (KhuyenMai >= 0),
    CONSTRAINT CHK_HoaDon_HinhThucThanhToan CHECK (HinhThucThanhToan IS NULL OR HinhThucThanhToan IN (N'Tiền mặt', N'Thẻ tín dụng', N'Chuyển khoản', N'Đã hủy'))
) ON PS_HoaDon_TheoQuy(NgayLap);
GO

-- Bảng: DANH_GIA
CREATE TABLE DANH_GIA (
    MaHoaDon CHAR(10),
    NgayLap DATE,
    DiemChatLuongDichVu INT,
    ThaiDoNhanVien INT,
    MucDoHaiLong INT,
    BinhLuan NVARCHAR(100),
    PhanHoi NVARCHAR(100),
    CONSTRAINT PK_DANH_GIA PRIMARY KEY (MaHoaDon, NgayLap),
    CONSTRAINT CHK_DanhGia_DiemChatLuong CHECK (DiemChatLuongDichVu IN (1, 2, 3, 4, 5)),
    CONSTRAINT CHK_DanhGia_ThaiDo CHECK (ThaiDoNhanVien IN (1, 2, 3, 4, 5)),
    CONSTRAINT CHK_DanhGia_HaiLong CHECK (MucDoHaiLong IN (1, 2, 3, 4, 5))
);
GO

-- Bảng: PHIEU_MUA_HANG
CREATE TABLE PHIEU_MUA_HANG (
    MaPhieuDichVu CHAR(10) PRIMARY KEY
);
GO

-- Bảng: CHI_TIET_MUA_HANG
CREATE TABLE CHI_TIET_MUA_HANG (
    MaPhieuDichVu CHAR(10),
    SoThuTu INT,
    SoLuong INT NOT NULL,
    MaSanPham CHAR(10) NOT NULL,
    PRIMARY KEY (MaPhieuDichVu, SoThuTu),
	CONSTRAINT CHK_ChiTietMuaHang_SoLuong CHECK (SoLuong > 0)
);
GO

-- Bảng: SAN_PHAM
CREATE TABLE SAN_PHAM (
    MaSanPham CHAR(10) PRIMARY KEY,
    TenSanPham NVARCHAR(30) NOT NULL,
    LoaiSanPham NVARCHAR(10),
    GiaBan DECIMAL(11,2),
    CONSTRAINT CHK_SanPham_Loai CHECK (LoaiSanPham IN (N'thức ăn', N'thuốc', N'phụ kiện')),
	CONSTRAINT CHK_SanPham_GiaBan CHECK (GiaBan > 0)
);
GO

-- Bảng: KHO_HANG (ÁP DỤNG PHÂN VÙNG THEO CHI NHÁNH)
CREATE TABLE KHO_HANG (
    MaChiNhanh CHAR(10),
    MaSanPham CHAR(10),
    NgaySanXuat DATETIME,
    SoLuongTonKho INT,
    PRIMARY KEY (MaChiNhanh, MaSanPham, NgaySanXuat),
    CONSTRAINT CHK_KhoHang_SoLuongTonKho CHECK (SoLuongTonKho >= 0)
) ON PS_TheoChiNhanh(MaChiNhanh);
GO

-- Bảng: LO_HANG
CREATE TABLE LO_HANG (
    MaSanPham CHAR(10),
    NgaySanXuat DATETIME,
    HanSuDung DATETIME,
    PRIMARY KEY (MaSanPham, NgaySanXuat),
	CONSTRAINT CHK_LoHang_HanSuDung CHECK (HanSuDung IS NULL OR HanSuDung > NgaySanXuat) 
);
GO

-- Bảng: PHIEU_KHAM_BENH
CREATE TABLE PHIEU_KHAM_BENH (
    MaPhieuDichVu CHAR(10) PRIMARY KEY,
    TrieuChung NVARCHAR(50),
    ChuanDoan NVARCHAR(50),
    NgayHenTaiKham DATE,
    MaBacSi CHAR(10) NOT NULL,
    MaThuCung CHAR(10) NOT NULL
);
GO

-- Bảng: CHI_TIET_TOA_THUOC
CREATE TABLE CHI_TIET_TOA_THUOC (
    MaPhieuKhamBenh CHAR(10),
    MaThuoc CHAR(10) NOT NULL,
    SoLuong INT NOT NULL,
    PRIMARY KEY (MaPhieuKhamBenh, MaThuoc),
	CONSTRAINT CHK_ChiTietToaThuoc_SoLuong CHECK (SoLuong > 0)
);
GO

-- Bảng: DANH_MUC_THUOC
CREATE TABLE DANH_MUC_THUOC (
    MaThuoc CHAR(10) PRIMARY KEY,
    TenThuoc NVARCHAR(30) NOT NULL
);
GO

-- Bảng: PHIEU_DANG_KY_GOI_TIEM
CREATE TABLE PHIEU_DANG_KY_GOI_TIEM (
    MaPhieuDichVu CHAR(10) PRIMARY KEY,
    NgayDangKy DATE NOT NULL,
    MaGoiTiem CHAR(10) NOT NULL,
    MaThuCung CHAR(10) NOT NULL
);
GO

-- Bảng: GOI_TIEM
CREATE TABLE GOI_TIEM (
    MaGoiTiem CHAR(10) PRIMARY KEY,
    ChuKi INT NOT NULL,
    UuDai FLOAT,
    LoaiGoiTiem NVARCHAR(10),
    CONSTRAINT CHK_GoiTiem_Loai CHECK (LoaiGoiTiem IN (N'Lẻ', N'Theo tháng')),
	CONSTRAINT CHK_GoiTiem_ChuKi CHECK (ChuKi >= 0),
	CONSTRAINT CHK_GoiTiem_UuDai CHECK (UuDai >= 0)
);
GO

-- Bảng: CHI_TIET_GOI_TIEM
CREATE TABLE CHI_TIET_GOI_TIEM (
    MaGoiTiem CHAR(10),
    SoThuTuVacxin INT,
    MaVacxin CHAR(10) NOT NULL,
    PRIMARY KEY (MaGoiTiem, SoThuTuVacxin)
);
GO

-- Bảng: VACXIN
CREATE TABLE VACXIN (
    MaVacxin CHAR(10) PRIMARY KEY,
    TenVacxin NVARCHAR(30) NOT NULL,
    LieuLuongToiDa INT NOT NULL,
    MoTa NVARCHAR(50) NOT NULL,
    GiaTien DECIMAL(11,2) NOT NULL,
	CONSTRAINT CHK_Vacxin_GiaTien CHECK (GiaTien > 0),
    CONSTRAINT CHK_Vacxin_LieuLuongToiDa CHECK (LieuLuongToiDa > 0)
);
GO

-- Bảng: PHIEU_TIEM_PHONG
CREATE TABLE PHIEU_TIEM_PHONG (
    MaPhieuDichVu CHAR(10) PRIMARY KEY,
    NgayTiem DATE NOT NULL,
    MaVacxin CHAR(10) NOT NULL,
    LieuLuong INT,
    MaGoiTiem CHAR(10) NOT NULL,
    MaThuCung CHAR(10) NOT NULL,
    MaBacSi CHAR(10) NOT NULL,
	CONSTRAINT CHK_PhieuTiemPhong_LieuLuong CHECK (LieuLuong > 0)
);
GO

-- Bảng: TAI_KHOAN (Quản lý đăng nhập cho cả Khách hàng và Nhân viên)
CREATE TABLE TAI_KHOAN (
    MaTaiKhoan INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap VARCHAR(50) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL, -- Lưu Hash Password
    Email VARCHAR(50) NOT NULL UNIQUE,
    VaiTro NVARCHAR(20) NOT NULL, -- 'Admin', 'BanHang', 'TiepTan', 'QuanLi', 'BacSi', 'KhachHang'
    MaKhachHang CHAR(10) NULL,    -- Link tới bảng KHACH_HANG
    MaNhanVien CHAR(10) NULL,     -- Link tới bảng NHAN_VIEN
    TrangThai NVARCHAR(20) DEFAULT N'Hoạt động',
    NgayTao DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_TaiKhoan_VaiTro CHECK (VaiTro IN (N'Admin', N'BanHang', N'TiepTan', N'QuanLi', N'BacSi', N'KhachHang')),
    CONSTRAINT CHK_TaiKhoan_LienKet CHECK (
        (MaKhachHang IS NOT NULL AND MaNhanVien IS NULL) OR 
        (MaNhanVien IS NOT NULL AND MaKhachHang IS NULL) OR
        (MaKhachHang IS NULL AND MaNhanVien IS NULL AND VaiTro = N'Admin')
    )
);
GO

--==============================================================
-- PHẦN 2.3: THIẾT LẬP RÀNG BUỘC KHÓA NGOẠI (FOREIGN KEY)
--==============================================================

-- Ràng buộc cho DICH_VU_CHI_NHANH
ALTER TABLE DICH_VU_CHI_NHANH ADD CONSTRAINT FK_DVCN_DichVu FOREIGN KEY (MaDichVu) REFERENCES DICH_VU(MaDichVu); 
ALTER TABLE DICH_VU_CHI_NHANH ADD CONSTRAINT FK_DVCN_ChiNhanh FOREIGN KEY (MaChiNhanh) REFERENCES CHI_NHANH(MaChiNhanh); 

-- Ràng buộc cho NHAN_VIEN
ALTER TABLE NHAN_VIEN ADD CONSTRAINT FK_NhanVien_BangLuong FOREIGN KEY (ChucVu) REFERENCES BANG_LUONG(ChucVu); 
ALTER TABLE NHAN_VIEN ADD CONSTRAINT FK_NhanVien_QuanLi FOREIGN KEY (NguoiQuanLi) REFERENCES NHAN_VIEN(MaNhanVien); 
ALTER TABLE NHAN_VIEN ADD CONSTRAINT FK_NhanVien_ChiNhanh FOREIGN KEY (MaChiNhanh) REFERENCES CHI_NHANH(MaChiNhanh); 

-- Ràng buộc cho các bảng phân loại nhân viên
ALTER TABLE NHAN_VIEN_BAN_HANG ADD CONSTRAINT FK_NVBH_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien); 
ALTER TABLE NHAN_VIEN_TIEP_TAN ADD CONSTRAINT FK_NVTT_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien); 
ALTER TABLE BAC_SI_THU_Y ADD CONSTRAINT FK_BSTY_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien); 
ALTER TABLE QUAN_LI ADD CONSTRAINT FK_QuanLi_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien); 

-- Ràng buộc cho QUAN_LI
ALTER TABLE QUAN_LI ADD CONSTRAINT FK_QuanLi_ChiNhanh FOREIGN KEY (MaChiNhanhQuanLi) REFERENCES CHI_NHANH(MaChiNhanh); 
ALTER TABLE QUAN_LI ADD CONSTRAINT UQ_QuanLi_ChiNhanh UNIQUE (MaChiNhanhQuanLi); 

-- Ràng buộc cho LICH_SU_DIEU_DONG
ALTER TABLE LICH_SU_DIEU_DONG ADD CONSTRAINT FK_LSDD_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien); 
ALTER TABLE LICH_SU_DIEU_DONG ADD CONSTRAINT FK_LSDD_ChiNhanh FOREIGN KEY (MaChiNhanh) REFERENCES CHI_NHANH(MaChiNhanh); 

-- Ràng buộc cho PHAN_LOAI_KHACH_HANG
ALTER TABLE PHAN_LOAI_KHACH_HANG ADD CONSTRAINT FK_PLKH_KhachHang FOREIGN KEY (MaKhachHang) REFERENCES KHACH_HANG(MaKhachHang); 

-- Ràng buộc cho THU_CUNG
ALTER TABLE THU_CUNG ADD CONSTRAINT FK_ThuCung_KhachHang FOREIGN KEY (MaKhachHang) REFERENCES KHACH_HANG(MaKhachHang); 

-- Ràng buộc cho LO_HANG
ALTER TABLE LO_HANG ADD CONSTRAINT FK_LoHang_SanPham FOREIGN KEY (MaSanPham) REFERENCES SAN_PHAM(MaSanPham); 

-- Ràng buộc cho KHO_HANG
ALTER TABLE KHO_HANG ADD CONSTRAINT FK_KhoHang_ChiNhanh FOREIGN KEY (MaChiNhanh) REFERENCES CHI_NHANH(MaChiNhanh); 
ALTER TABLE KHO_HANG ADD CONSTRAINT FK_KhoHang_LoHang FOREIGN KEY (MaSanPham, NgaySanXuat) REFERENCES LO_HANG(MaSanPham, NgaySanXuat); 

-- Ràng buộc cho LICH_HEN
ALTER TABLE LICH_HEN ADD CONSTRAINT FK_LichHen_KhachHang FOREIGN KEY (MaKhachHang) REFERENCES KHACH_HANG(MaKhachHang); 
ALTER TABLE LICH_HEN ADD CONSTRAINT FK_LichHen_ThuCung FOREIGN KEY (MaThuCung) REFERENCES THU_CUNG(MaThuCung); 
ALTER TABLE LICH_HEN ADD CONSTRAINT FK_LichHen_ChiNhanh FOREIGN KEY (MaChiNhanh) REFERENCES CHI_NHANH(MaChiNhanh);
ALTER TABLE LICH_HEN ADD CONSTRAINT FK_LichHen_NhanVien FOREIGN KEY (MaNhanVienXacNhan) REFERENCES NHAN_VIEN_TIEP_TAN(MaNhanVien); 
ALTER TABLE LICH_HEN ADD CONSTRAINT FK_LichHen_PhieuDichVu FOREIGN KEY (MaPhieuDichVu) REFERENCES PHIEU_DICH_VU(MaPhieuDichVu); 

-- Ràng buộc cho PHIEU_DICH_VU
ALTER TABLE PHIEU_DICH_VU ADD CONSTRAINT FK_PDV_ChiNhanh FOREIGN KEY (MaChiNhanh) REFERENCES CHI_NHANH(MaChiNhanh);
ALTER TABLE PHIEU_DICH_VU ADD CONSTRAINT FK_PDV_KhachHang FOREIGN KEY (MaKhachHang) REFERENCES KHACH_HANG(MaKhachHang); 

-- Ràng buộc cho HOA_DON
ALTER TABLE HOA_DON ADD CONSTRAINT FK_HoaDon_PhieuDichVu FOREIGN KEY (MaPhieuDichVu) REFERENCES PHIEU_DICH_VU(MaPhieuDichVu); 
ALTER TABLE HOA_DON ADD CONSTRAINT FK_HoaDon_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien); 
ALTER TABLE HOA_DON ADD CONSTRAINT FK_HoaDon_ThuCung FOREIGN KEY (MaThuCung) REFERENCES THU_CUNG(MaThuCung); 

-- Ràng buộc cho DANH_GIA
ALTER TABLE DANH_GIA ADD CONSTRAINT FK_DanhGia_HoaDon FOREIGN KEY (MaHoaDon, NgayLap) REFERENCES HOA_DON(MaHoaDon, NgayLap);

-- Ràng buộc cho PHIEU_MUA_HANG
ALTER TABLE PHIEU_MUA_HANG ADD CONSTRAINT FK_PMH_PhieuDichVu FOREIGN KEY (MaPhieuDichVu) REFERENCES PHIEU_DICH_VU(MaPhieuDichVu);

-- Ràng buộc cho CHI_TIET_MUA_HANG
ALTER TABLE CHI_TIET_MUA_HANG ADD CONSTRAINT FK_CTMH_PhieuMuaHang FOREIGN KEY (MaPhieuDichVu) REFERENCES PHIEU_MUA_HANG(MaPhieuDichVu); 
ALTER TABLE CHI_TIET_MUA_HANG ADD CONSTRAINT FK_CTMH_SanPham FOREIGN KEY (MaSanPham) REFERENCES SAN_PHAM(MaSanPham); 

-- Ràng buộc cho PHIEU_KHAM_BENH
ALTER TABLE PHIEU_KHAM_BENH ADD CONSTRAINT FK_PKB_PhieuDichVu FOREIGN KEY (MaPhieuDichVu) REFERENCES PHIEU_DICH_VU(MaPhieuDichVu); 
ALTER TABLE PHIEU_KHAM_BENH ADD CONSTRAINT FK_PKB_BacSi FOREIGN KEY (MaBacSi) REFERENCES BAC_SI_THU_Y(MaNhanVien); 
ALTER TABLE PHIEU_KHAM_BENH ADD CONSTRAINT FK_PKB_ThuCung FOREIGN KEY (MaThuCung) REFERENCES THU_CUNG(MaThuCung); 

-- Ràng buộc cho CHI_TIET_TOA_THUOC
ALTER TABLE CHI_TIET_TOA_THUOC ADD CONSTRAINT FK_CTTT_PhieuKhamBenh FOREIGN KEY (MaPhieuKhamBenh) REFERENCES PHIEU_KHAM_BENH(MaPhieuDichVu); 
ALTER TABLE CHI_TIET_TOA_THUOC ADD CONSTRAINT FK_CTTT_DanhMucThuoc FOREIGN KEY (MaThuoc) REFERENCES DANH_MUC_THUOC(MaThuoc);

-- Ràng buộc cho PHIEU_DANG_KY_GOI_TIEM
ALTER TABLE PHIEU_DANG_KY_GOI_TIEM ADD CONSTRAINT FK_PDKGT_PhieuDichVu FOREIGN KEY (MaPhieuDichVu) REFERENCES PHIEU_DICH_VU(MaPhieuDichVu); 
ALTER TABLE PHIEU_DANG_KY_GOI_TIEM ADD CONSTRAINT FK_PDKGT_GoiTiem FOREIGN KEY (MaGoiTiem) REFERENCES GOI_TIEM(MaGoiTiem); 
ALTER TABLE PHIEU_DANG_KY_GOI_TIEM ADD CONSTRAINT FK_PDKGT_ThuCung FOREIGN KEY (MaThuCung) REFERENCES THU_CUNG(MaThuCung); 

-- Ràng buộc cho CHI_TIET_GOI_TIEM
ALTER TABLE CHI_TIET_GOI_TIEM ADD CONSTRAINT FK_CTGT_GoiTiem FOREIGN KEY (MaGoiTiem) REFERENCES GOI_TIEM(MaGoiTiem); 
ALTER TABLE CHI_TIET_GOI_TIEM ADD CONSTRAINT FK_CTGT_Vacxin FOREIGN KEY (MaVacxin) REFERENCES VACXIN(MaVacxin); 

-- Ràng buộc cho PHIEU_TIEM_PHONG
ALTER TABLE PHIEU_TIEM_PHONG ADD CONSTRAINT FK_PTP_PhieuDichVu FOREIGN KEY (MaPhieuDichVu) REFERENCES PHIEU_DICH_VU(MaPhieuDichVu);
ALTER TABLE PHIEU_TIEM_PHONG ADD CONSTRAINT FK_PTP_Vacxin FOREIGN KEY (MaVacxin) REFERENCES VACXIN(MaVacxin);
ALTER TABLE PHIEU_TIEM_PHONG ADD CONSTRAINT FK_PTP_GoiTiem FOREIGN KEY (MaGoiTiem) REFERENCES GOI_TIEM(MaGoiTiem);
ALTER TABLE PHIEU_TIEM_PHONG ADD CONSTRAINT FK_PTP_ThuCung FOREIGN KEY (MaThuCung) REFERENCES THU_CUNG(MaThuCung);
ALTER TABLE PHIEU_TIEM_PHONG ADD CONSTRAINT FK_PTP_BacSi FOREIGN KEY (MaBacSi) REFERENCES BAC_SI_THU_Y(MaNhanVien);
GO

-- Ràng buộc cho TAI_KHOAN
ALTER TABLE TAI_KHOAN ADD CONSTRAINT FK_TaiKhoan_KhachHang FOREIGN KEY (MaKhachHang) REFERENCES KHACH_HANG(MaKhachHang);
ALTER TABLE TAI_KHOAN ADD CONSTRAINT FK_TaiKhoan_NhanVien FOREIGN KEY (MaNhanVien) REFERENCES NHAN_VIEN(MaNhanVien);
GO