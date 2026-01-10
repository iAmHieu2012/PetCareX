const { connectDB, sql } = require('../config/db');
const { handleModelError } = require('../utils');
const { generateMaPhieuDichVu, generateMaHoaDon } = require('../utils/idGenerator');

const vaccinationModel = {
    // Tạo phiếu tiêm phòng
    createVaccinationForm: async (data) => {
        try {
            const pool = await connectDB();
            
            // B1: Sinh mã phiếu dịch vụ nếu chưa có
            const maPDV = await generateMaPhieuDichVu(pool);
            
            // B2: Tạo phiếu dịch vụ từ lịch hẹn
            const pdvResult = await pool.request()
                .input('MaLichHen', sql.Char(10), data.maLichHen)
                .input('MaChiNhanh', sql.Char(10), data.maChiNhanh)
                .input('MaPhieuDichVu', sql.Char(10), maPDV)
                .execute('SP_TaoPhieuDichVuTuLichHen');
            
            
            // B3: Lấy MaPhieuDichVu từ output parameter hoặc dari recordset
            let maPhieuDichVu = maPDV;
            if (pdvResult.recordset && pdvResult.recordset[0]) {
                maPhieuDichVu = pdvResult.recordset[0].MaPhieuDichVu || maPDV;
            }
            
            // B4: Tạo phiếu tiêm phòng (với ngày tiêm từ lịch hẹn)
            // Note: NgayTiem sẽ được cập nhật sau khi bác sĩ nhập liệu chi tiết tiêm
            const result = await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPhieuDichVu)
                .input('MaThuCung', sql.Char(10), data.maThuCung)
                .input('MaBacSi', sql.Char(10), data.maBacSi)
                .input('MaGoiTiem', sql.Char(10), data.maGoiTiem)
                .execute('SP_TaoPhieuTiemPhong');
            
            
            return {
                vaccinationFormId: maPhieuDichVu,
                success: true,
                message: 'Tạo phiếu tiêm phòng thành công'
            };
        } catch (err) {
            console.error('❌ createVaccinationForm error:', err);
            handleModelError(err, 'createVaccinationForm');
        }
    },

    // Lấy danh sách gói tiêm
    getAllVaccinationPackages: async () => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .query(`
                    SELECT 
                        gt.MaGoiTiem,
                        gt.ChuKi,
                        gt.UuDai,
                        gt.LoaiGoiTiem,
                        COUNT(ctgt.MaVacxin) as SoVacxin,
                        STRING_AGG(vx.TenVacxin, ', ') as DanhSachVacxin,
                        SUM(vx.GiaTien) as TongGia
                    FROM GOI_TIEM gt
                    LEFT JOIN CHI_TIET_GOI_TIEM ctgt ON gt.MaGoiTiem = ctgt.MaGoiTiem
                    LEFT JOIN VACXIN vx ON ctgt.MaVacxin = vx.MaVacxin
                    GROUP BY gt.MaGoiTiem, gt.ChuKi, gt.UuDai, gt.LoaiGoiTiem
                    ORDER BY gt.MaGoiTiem
                `);
            return result.recordset;
        } catch (err) {
            handleModelError(err, 'getAllVaccinationPackages');
        }
    },

    // Lấy chi tiết gói tiêm
    getPackageDetail: async (maGoiTiem) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaGoiTiem', sql.Char(10), maGoiTiem)
                .query(`
                    SELECT 
                        gt.MaGoiTiem,
                        gt.ChuKi,
                        gt.UuDai,
                        gt.LoaiGoiTiem,
                        ctgt.SoThuTuVacxin,
                        vx.MaVacxin,
                        vx.TenVacxin,
                        vx.GiaTien,
                        vx.MoTa
                    FROM GOI_TIEM gt
                    LEFT JOIN CHI_TIET_GOI_TIEM ctgt ON gt.MaGoiTiem = ctgt.MaGoiTiem
                    LEFT JOIN VACXIN vx ON ctgt.MaVacxin = vx.MaVacxin
                    WHERE gt.MaGoiTiem = @MaGoiTiem
                    ORDER BY ctgt.SoThuTuVacxin
                `);
            return result.recordset;
        } catch (err) {
            handleModelError(err, 'getPackageDetail');
        }
    },

    // Lấy danh sách vacxin còn lại trong gói (chưa tiêm hết)
    getAvailableVaccinesInPackage: async (maThuCung, maGoiTiem) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaThuCung', sql.Char(10), maThuCung)
                .input('MaGoiTiem', sql.Char(10), maGoiTiem)
                .query(`
                    SELECT 
                        vx.MaVacxin,
                        vx.TenVacxin,
                        vx.LieuLuongToiDa,
                        ctgt.SoThuTuVacxin,
                        ISNULL(COUNT(ptp.MaPhieuDichVu), 0) as DaTiem,
                        (1 - ISNULL(COUNT(ptp.MaPhieuDichVu), 0)) as ConLai
                    FROM GOI_TIEM gt
                    JOIN CHI_TIET_GOI_TIEM ctgt ON gt.MaGoiTiem = ctgt.MaGoiTiem
                    JOIN VACXIN vx ON ctgt.MaVacxin = vx.MaVacxin
                    LEFT JOIN PHIEU_TIEM_PHONG ptp ON ptp.MaThuCung = @MaThuCung 
                        AND ptp.MaVacxin = vx.MaVacxin 
                        AND ptp.MaGoiTiem = @MaGoiTiem
                    WHERE gt.MaGoiTiem = @MaGoiTiem
                    GROUP BY vx.MaVacxin, vx.TenVacxin, vx.LieuLuongToiDa, ctgt.SoThuTuVacxin
                    HAVING (1 - ISNULL(COUNT(ptp.MaPhieuDichVu), 0)) > 0
                    ORDER BY ctgt.SoThuTuVacxin
                `);
            return result.recordset;
        } catch (err) {
            handleModelError(err, 'getAvailableVaccinesInPackage');
        }
    },

    // Đăng ký gói tiêm cho thú cưng
    registerVaccinationPackage: async (data) => {
        try {
            const pool = await connectDB();
            
            // B1: Sinh mã phiếu dịch vụ
            const maPDV = await generateMaPhieuDichVu(pool);
            
            if (!maPDV) {
                throw new Error('Không thể sinh mã phiếu dịch vụ');
            }

            const ngayDangKy = new Date();
            
            // B2: Tạo phiếu dịch vụ
            await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPDV)
                .input('MaChiNhanh', sql.Char(10), data.maChiNhanh)
                .input('MaKhachHang', sql.Char(10), data.maKhachHang)
                .execute('SP_ThemPhieuDichVu');
            
            // B3: Tính tổng tiền từ gói tiêm
            const giaResult = await pool.request()
                .input('MaGoiTiem', sql.Char(10), data.maGoiTiem)
                .query(`
                    SELECT ISNULL(SUM(vx.GiaTien), 0) as TongGia
                    FROM CHI_TIET_GOI_TIEM ctgt
                    LEFT JOIN VACXIN vx ON ctgt.MaVacxin = vx.MaVacxin
                    WHERE ctgt.MaGoiTiem = @MaGoiTiem
                `);
            
            const tongGia = giaResult.recordset[0].TongGia || 0;
            
            // B4: Cập nhật tổng tiền phiếu dịch vụ
            await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPDV)
                .input('TongTien', sql.Decimal(11, 2), tongGia)
                .query(`UPDATE PHIEU_DICH_VU SET TongTien = @TongTien WHERE MaPhieuDichVu = @MaPhieuDichVu`);
            
            // B5: Thêm phiếu đăng ký gói tiêm
            await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPDV)
                .input('NgayDangKy', sql.Date, ngayDangKy)
                .input('MaGoiTiem', sql.Char(10), data.maGoiTiem)
                .input('MaThuCung', sql.Char(10), data.maThuCung)
                .query(`INSERT INTO PHIEU_DANG_KY_GOI_TIEM (MaPhieuDichVu, NgayDangKy, MaGoiTiem, MaThuCung) 
                        VALUES (@MaPhieuDichVu, @NgayDangKy, @MaGoiTiem, @MaThuCung)`);
            
            return {
                maPDV,
                tongGia,
                success: true,
                message: 'Đăng ký gói tiêm thành công'
            };
        } catch (err) {
            handleModelError(err, 'registerVaccinationPackage');
        }
    },

    // Tạo hóa đơn thanh toán gói tiêm
    createVaccinationInvoice: async (data) => {
        try {
            const pool = await connectDB();
            
            // Sinh mã hóa đơn
            const maHD = await generateMaHoaDon(pool);
            
            if (!maHD) {
                throw new Error('Không thể sinh mã hóa đơn');
            }

            const ngayLap = new Date();
            
            // Lấy thông tin phiếu dịch vụ
            const pdvInfo = await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), data.maPDV)
                .query('SELECT TongTien FROM PHIEU_DICH_VU WHERE MaPhieuDichVu = @MaPhieuDichVu');
            
            if (pdvInfo.recordset.length === 0) {
                throw new Error('Không tìm thấy phiếu dịch vụ');
            }

            const tongTien = pdvInfo.recordset[0].TongTien || 0;
            const khuyenMai = data.khuyenMai || 0;
            const tongThanhToan = tongTien * (1 - khuyenMai);
            
            // Tạo hóa đơn
            const result = await pool.request()
                .input('MaHoaDon', sql.Char(10), maHD)
                .input('NgayLap', sql.Date, ngayLap)
                .input('TongTienThanhToan', sql.Decimal(11, 2), tongThanhToan)
                .input('KhuyenMai', sql.Float, khuyenMai)
                .input('HinhThucThanhToan', sql.NVarChar(20), data.hinhThucThanhToan || null)
                .input('MaPhieuDichVu', sql.Char(10), data.maPDV)
                .input('MaNhanVien', sql.Char(10), null)
                .query(`INSERT INTO HOA_DON (MaHoaDon, NgayLap, TongTienThanhToan, KhuyenMai, HinhThucThanhToan, MaPhieuDichVu, MaNhanVien)
                        VALUES (@MaHoaDon, @NgayLap, @TongTienThanhToan, @KhuyenMai, @HinhThucThanhToan, @MaPhieuDichVu, @MaNhanVien)`);
            
            return {
                maHD,
                tongTien,
                khuyenMai,
                tongThanhToan,
                success: true,
                message: 'Tạo hóa đơn thành công'
            };
        } catch (err) {
            handleModelError(err, 'createVaccinationInvoice');
        }
    },

    // Lấy phiếu tiêm hôm nay
    getTodayVaccinationForms: async (maBacSi) => {
        try {
            const pool = await connectDB();
            const today = new Date().toISOString().split('T')[0];
            
            const result = await pool.request()
                .input('MaBacSi', sql.Char(10), maBacSi)
                .input('Today', sql.Date, today)
                .query(`
                    SELECT 
                        ptp.MaPhieuDichVu,
                        ptp.NgayTiem,
                        ptp.MaVacxin,
                        ptp.LieuLuong,
                        ptp.MaGoiTiem,
                        ptp.MaThuCung,
                        ptp.MaBacSi,
                        pdv.MaChiNhanh,
                        pdv.MaKhachHang,
                        tc.TenThuCung,
                        tc.Loai,
                        kh.TenKhachHang,
                        lh.ThoiGian,
                        gt.LoaiGoiTiem,
                        vx.TenVacxin,
                        vx.LieuLuongToiDa
                    FROM PHIEU_TIEM_PHONG ptp
                    JOIN PHIEU_DICH_VU pdv ON ptp.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN THU_CUNG tc ON ptp.MaThuCung = tc.MaThuCung
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    JOIN GOI_TIEM gt ON ptp.MaGoiTiem = gt.MaGoiTiem
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    LEFT JOIN VACXIN vx ON ptp.MaVacxin = vx.MaVacxin
                    WHERE ptp.MaBacSi = @MaBacSi 
                    AND CAST(lh.ThoiGian AS DATE) = @Today
                    ORDER BY lh.ThoiGian ASC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getTodayVaccinationForms');
        }
    },

    // Lấy phiếu tiêm đã hoàn tất (đã tiêm)
    getCompletedVaccinationForms: async (maBacSi) => {
        try {
            const pool = await connectDB();
            
            const result = await pool.request()
                .input('MaBacSi', sql.Char(10), maBacSi)
                .query(`
                    SELECT 
                        ptp.MaPhieuDichVu,
                        ptp.NgayTiem,
                        ptp.MaVacxin,
                        ptp.LieuLuong,
                        ptp.MaGoiTiem,
                        ptp.MaThuCung,
                        ptp.MaBacSi,
                        pdv.MaChiNhanh,
                        pdv.MaKhachHang,
                        tc.TenThuCung,
                        tc.Loai,
                        kh.TenKhachHang,
                        lh.ThoiGian,
                        gt.LoaiGoiTiem,
                        vx.TenVacxin,
                        vx.LieuLuongToiDa
                    FROM PHIEU_TIEM_PHONG ptp
                    JOIN PHIEU_DICH_VU pdv ON ptp.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN THU_CUNG tc ON ptp.MaThuCung = tc.MaThuCung
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    JOIN GOI_TIEM gt ON ptp.MaGoiTiem = gt.MaGoiTiem
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    LEFT JOIN VACXIN vx ON ptp.MaVacxin = vx.MaVacxin
                    WHERE ptp.MaBacSi = @MaBacSi 
                    AND ptp.NgayTiem IS NOT NULL
                    ORDER BY ptp.NgayTiem DESC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getCompletedVaccinationForms');
        }
    },

    // Lấy phiếu tiêm chưa tới ngày
    getUpcomingVaccinationForms: async (maBacSi) => {
        try {
            const pool = await connectDB();
            const today = new Date().toISOString().split('T')[0];
            
            const result = await pool.request()
                .input('MaBacSi', sql.Char(10), maBacSi)
                .input('Today', sql.Date, today)
                .query(`
                    SELECT 
                        ptp.MaPhieuDichVu,
                        ptp.NgayTiem,
                        ptp.MaVacxin,
                        ptp.LieuLuong,
                        ptp.MaGoiTiem,
                        ptp.MaThuCung,
                        ptp.MaBacSi,
                        pdv.MaChiNhanh,
                        pdv.MaKhachHang,
                        tc.TenThuCung,
                        tc.Loai,
                        kh.TenKhachHang,
                        lh.ThoiGian,
                        gt.LoaiGoiTiem,
                        vx.TenVacxin,
                        vx.LieuLuongToiDa
                    FROM PHIEU_TIEM_PHONG ptp
                    JOIN PHIEU_DICH_VU pdv ON ptp.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN THU_CUNG tc ON ptp.MaThuCung = tc.MaThuCung
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    JOIN GOI_TIEM gt ON ptp.MaGoiTiem = gt.MaGoiTiem
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    LEFT JOIN VACXIN vx ON ptp.MaVacxin = vx.MaVacxin
                    WHERE ptp.MaBacSi = @MaBacSi 
                    AND CAST(lh.ThoiGian AS DATE) > @Today
                    ORDER BY lh.ThoiGian ASC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getUpcomingVaccinationForms');
        }
    },

    // Lấy tất cả phiếu tiêm phòng của bác sĩ
    getPhieuTiemPhongByDoctor: async (maBacSi) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaBacSi', sql.Char(10), maBacSi)
                .query(`
                    SELECT 
                        ptp.MaPhieuDichVu,
                        ptp.NgayTiem,
                        ptp.MaVacxin,
                        ptp.LieuLuong,
                        ptp.MaGoiTiem,
                        ptp.MaThuCung,
                        ptp.MaBacSi,
                        pdv.MaChiNhanh,
                        pdv.MaKhachHang,
                        tc.TenThuCung,
                        kh.TenKhachHang,
                        lh.ThoiGian,
                        gt.LoaiGoiTiem,
                        vx.TenVacxin,
                        vx.LieuLuongToiDa
                    FROM PHIEU_TIEM_PHONG ptp
                    JOIN PHIEU_DICH_VU pdv ON ptp.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN THU_CUNG tc ON ptp.MaThuCung = tc.MaThuCung
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    JOIN GOI_TIEM gt ON ptp.MaGoiTiem = gt.MaGoiTiem
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    LEFT JOIN VACXIN vx ON ptp.MaVacxin = vx.MaVacxin
                    WHERE ptp.MaBacSi = @MaBacSi
                    ORDER BY lh.ThoiGian DESC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getPhieuTiemPhongByDoctor');
        }
    },

    // Lấy danh sách vacxin trong gói tiêm
    getVaccinesInPackage: async (maGoiTiem) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaGoiTiem', sql.Char(10), maGoiTiem)
                .query(`
                    SELECT 
                        vx.MaVacxin,
                        vx.TenVacxin,
                        vx.LieuLuongToiDa
                    FROM CHI_TIET_GOI_TIEM ctgt
                    JOIN VACXIN vx ON ctgt.MaVacxin = vx.MaVacxin
                    WHERE ctgt.MaGoiTiem = @MaGoiTiem
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getVaccinesInPackage');
        }
    },

    // Cập nhật phiếu tiêm phòng
    updatePhieuTiemPhong: async (data) => {
        try {
            const pool = await connectDB();
            
            await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), data.maPhieuDichVu)
                .input('NgayTiem', sql.Date, data.ngayTiem)
                .input('MaVacxin', sql.Char(10), data.maVacxin)
                .input('LieuLuong', sql.Int, data.lieuLuong)
                .query(`
                    UPDATE PHIEU_TIEM_PHONG
                    SET NgayTiem = @NgayTiem,
                        MaVacxin = @MaVacxin,
                        LieuLuong = @LieuLuong
                    WHERE MaPhieuDichVu = @MaPhieuDichVu
                `);

            return {
                success: true,
                message: 'Cập nhật phiếu tiêm phòng thành công'
            };
        } catch (err) {
            handleModelError(err, 'updatePhieuTiemPhong');
        }
    },

    // Lấy lịch sử tiêm phòng của thú cưng
    getPetVaccinationHistory: async (maThuCung) => {
        try {
            const pool = await connectDB();
            
            const result = await pool.request()
                .input('MaThuCung', sql.Char(10), maThuCung)
                .query(`
                    SELECT 
                        ptp.MaPhieuDichVu,
                        ptp.NgayTiem,
                        vx.TenVacxin,
                        ptp.LieuLuong,
                        nv.HoTen,
                        lh.ThoiGian
                    FROM PHIEU_TIEM_PHONG ptp
                    JOIN PHIEU_DICH_VU pdv ON ptp.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN VACXIN vx ON ptp.MaVacxin = vx.MaVacxin
                    JOIN NHAN_VIEN nv ON ptp.MaBacSi = nv.MaNhanVien
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    WHERE ptp.MaThuCung = @MaThuCung
                    ORDER BY ISNULL(ptp.NgayTiem, lh.ThoiGian) DESC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getPetVaccinationHistory');
        }
    }
};

module.exports = vaccinationModel;