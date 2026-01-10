const { connectDB, sql } = require('../config/db');
const { handleModelError } = require('../utils');
const { generateMaPhieuDichVu } = require('../utils/idGenerator');

const medicalFormModel = {
    // Tạo phiếu khám bệnh
    createMedicalForm: async (data) => {
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
            
            // B4: Tạo phiếu khám bệnh
            const result = await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPhieuDichVu)
                .input('MaThuCung', sql.Char(10), data.maThuCung)
                .input('MaBacSi', sql.Char(10), data.maBacSi)
                .execute('SP_TaoPhieuKhamBenh');
            
            
            return {
                medicalFormId: maPhieuDichVu,
                success: true,
                message: 'Tạo phiếu khám bệnh thành công'
            };
        } catch (err) {
            handleModelError(err, 'createMedicalForm');
        }
    },

    // Lấy chi tiết phiếu khám bệnh (để tạo hóa đơn)
    getMedicalFormDetail: async (maPhieuDichVu) => {
        try {
            const pool = await connectDB();
            
            // Lấy thông tin phiếu khám bệnh
            const examRes = await pool.request()
                .input('MaPhieuDichVu', sql.Char(10), maPhieuDichVu)
                .query(`
                    SELECT 
                        pkb.MaPhieuDichVu,
                        pkb.TrieuChung,
                        pkb.ChuanDoan,
                        pkb.NgayHenTaiKham,
                        pkb.MaBacSi,
                        pkb.MaThuCung
                    FROM PHIEU_KHAM_BENH pkb
                    WHERE pkb.MaPhieuDichVu = @MaPhieuDichVu
                `);
            
            if (examRes.recordset.length === 0) {
                return null;
            }

            // Lấy chi tiết toa thuốc
            const prescRes = await pool.request()
                .input('MaPhieuKhamBenh', sql.Char(10), maPhieuDichVu)
                .query(`
                    SELECT 
                        c.MaThuoc,
                        dm.TenThuoc AS TenSanPham,
                        c.SoLuong
                    FROM CHI_TIET_TOA_THUOC c
                    JOIN DANH_MUC_THUOC dm ON c.MaThuoc = dm.MaThuoc
                    WHERE c.MaPhieuKhamBenh = @MaPhieuKhamBenh
                `);

            return {
                exam: examRes.recordset[0],
                prescriptions: prescRes.recordset || []
            };
        } catch (err) {
            handleModelError(err, 'getMedicalFormDetail');
        }
    },

    // Lấy phiếu khám hôm nay
    getTodayMedicalForms: async (maBacSi) => {
        try {
            const pool = await connectDB();
            const today = new Date().toISOString().split('T')[0];
            
            const result = await pool.request()
                .input('MaBacSi', sql.Char(10), maBacSi)
                .input('Today', sql.Date, today)
                .query(`
                    SELECT 
                        pkb.MaPhieuDichVu,
                        pkb.TrieuChung,
                        pkb.ChuanDoan,
                        pkb.NgayHenTaiKham,
                        pdv.MaChiNhanh,
                        pdv.MaKhachHang,
                        tc.MaThuCung,
                        tc.TenThuCung,
                        tc.Loai,
                        kh.TenKhachHang,
                        lh.ThoiGian,
                        pkb.MaBacSi,
                        CASE 
                            WHEN pkb.TrieuChung IS NOT NULL AND pkb.ChuanDoan IS NOT NULL THEN 'Đã khám'
                            ELSE N'Chưa khám'
                        END AS TrangThaiKham
                    FROM PHIEU_KHAM_BENH pkb
                    JOIN PHIEU_DICH_VU pdv ON pkb.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN THU_CUNG tc ON pkb.MaThuCung = tc.MaThuCung
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    WHERE pkb.MaBacSi = @MaBacSi 
                    AND CAST(lh.ThoiGian AS DATE) = @Today
                    ORDER BY lh.ThoiGian ASC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getTodayMedicalForms');
        }
    },

    // Lấy phiếu khám đã hoàn tất (đã có triệu chứng và chuẩn đoán)
    getCompletedMedicalForms: async (maBacSi) => {
        try {
            const pool = await connectDB();
            
            const result = await pool.request()
                .input('MaBacSi', sql.Char(10), maBacSi)
                .query(`
                    SELECT 
                        pkb.MaPhieuDichVu,
                        pkb.TrieuChung,
                        pkb.ChuanDoan,
                        pkb.NgayHenTaiKham,
                        pdv.MaChiNhanh,
                        pdv.MaKhachHang,
                        tc.MaThuCung,
                        tc.TenThuCung,
                        tc.Loai,
                        kh.TenKhachHang,
                        lh.ThoiGian,
                        pkb.MaBacSi
                    FROM PHIEU_KHAM_BENH pkb
                    JOIN PHIEU_DICH_VU pdv ON pkb.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN THU_CUNG tc ON pkb.MaThuCung = tc.MaThuCung
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    WHERE pkb.MaBacSi = @MaBacSi 
                    AND pkb.TrieuChung IS NOT NULL 
                    AND pkb.ChuanDoan IS NOT NULL
                    ORDER BY lh.ThoiGian DESC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getCompletedMedicalForms');
        }
    },

    // Lấy phiếu khám chưa tới ngày
    getUpcomingMedicalForms: async (maBacSi) => {
        try {
            const pool = await connectDB();
            const today = new Date().toISOString().split('T')[0];
            
            const result = await pool.request()
                .input('MaBacSi', sql.Char(10), maBacSi)
                .input('Today', sql.Date, today)
                .query(`
                    SELECT 
                        pkb.MaPhieuDichVu,
                        tc.TenThuCung,
                        tc.Loai,
                        kh.TenKhachHang,
                        lh.ThoiGian,
                        pkb.MaBacSi
                    FROM PHIEU_KHAM_BENH pkb
                    JOIN PHIEU_DICH_VU pdv ON pkb.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN THU_CUNG tc ON pkb.MaThuCung = tc.MaThuCung
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    WHERE pkb.MaBacSi = @MaBacSi 
                    AND CAST(lh.ThoiGian AS DATE) > @Today
                    ORDER BY lh.ThoiGian ASC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getUpcomingMedicalForms');
        }
    },

    // Lấy tất cả phiếu khám bệnh của bác sĩ
    getPhieuKhamBenhByDoctor: async (maBacSi) => {
        try {
            const pool = await connectDB();
            const result = await pool.request()
                .input('MaBacSi', sql.Char(10), maBacSi)
                .query(`
                    SELECT 
                        pkb.MaPhieuDichVu,
                        pkb.TrieuChung,
                        pkb.ChuanDoan,
                        pkb.NgayHenTaiKham,
                        pdv.MaChiNhanh,
                        pdv.MaKhachHang,
                        tc.MaThuCung,
                        tc.TenThuCung,
                        kh.TenKhachHang,
                        lh.ThoiGian,
                        pkb.MaBacSi
                    FROM PHIEU_KHAM_BENH pkb
                    JOIN PHIEU_DICH_VU pdv ON pkb.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN THU_CUNG tc ON pkb.MaThuCung = tc.MaThuCung
                    JOIN KHACH_HANG kh ON pdv.MaKhachHang = kh.MaKhachHang
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    WHERE pkb.MaBacSi = @MaBacSi
                    ORDER BY lh.ThoiGian DESC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getPhieuKhamBenhByDoctor');
        }
    },

    // Cập nhật phiếu khám bệnh, toa thuốc và tự động tính tổng tiền
    updatePhieuKhamBenh: async (data) => {
        const pool = await connectDB();
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();
            
            // 1. Cập nhật PHIEU_KHAM_BENH
            const reqBasic = new sql.Request(transaction);
            await reqBasic
                .input('MaPDV', sql.Char(10), data.maPhieuDichVu)
                .input('TrieuChung', sql.NVarChar(sql.MAX), data.trieuChung)
                .input('ChuanDoan', sql.NVarChar(sql.MAX), data.chuanDoan)
                .input('NgayHen', sql.Date, data.ngayHenTaiKham || null)
                .query(`
                    UPDATE PHIEU_KHAM_BENH
                    SET TrieuChung = @TrieuChung,
                        ChuanDoan = @ChuanDoan,
                        NgayHenTaiKham = @NgayHen
                    WHERE MaPhieuDichVu = @MaPDV
                `);

            // 2. Cập nhật Phí khám vào PHIEU_DICH_VU
            const reqFee = new sql.Request(transaction);
            await reqFee
                .input('MaPDV', sql.Char(10), data.maPhieuDichVu)
                .input('PhiKham', sql.Decimal(11, 2), data.phiKhamBenh)
                .query(`
                    UPDATE PHIEU_DICH_VU 
                    SET TongTien = @PhiKham
                    WHERE MaPhieuDichVu = @MaPDV
                `);

            // 3. Xử lý Toa thuốc
            if (data.prescriptions && data.prescriptions.length > 0) {
                for (const med of data.prescriptions) {
                    // Tạo request mới cho mỗi món thuốc để tránh lỗi lặp tham số
                    const reqMed = new sql.Request(transaction);
                    await reqMed
                        .input('MaPhieuKhamBenh', sql.Char(10), data.maPhieuDichVu)
                        .input('MaThuoc', sql.Char(10), med.maThuoc)
                        .input('SL', sql.Int, med.soLuong)
                        .query(`
                            INSERT INTO CHI_TIET_TOA_THUOC (MaPhieuKhamBenh, MaThuoc, SoLuong)
                            VALUES (@MaPhieuKhamBenh, @MaThuoc, @SL)
                        `);
                }
            }

            await transaction.commit();
            return { success: true };

        } catch (err) {
            if (transaction) await transaction.rollback();
            handleModelError(err, 'updatePhieuKhamBenh');
        }
    },

    // Lấy lịch sử khám bệnh của thú cưng
    getPetMedicalHistory: async (maThuCung) => {
        try {
            const pool = await connectDB();
            
            const result = await pool.request()
                .input('MaThuCung', sql.Char(10), maThuCung)
                .query(`
                    SELECT 
                        pkb.MaPhieuDichVu,
                        pkb.TrieuChung,
                        pkb.ChuanDoan,
                        pkb.NgayHenTaiKham,
                        pdv.MaKhachHang,
                        tc.TenThuCung,
                        tc.Loai,
                        nv.HoTen,
                        lh.ThoiGian as NgayKham
                    FROM PHIEU_KHAM_BENH pkb
                    JOIN PHIEU_DICH_VU pdv ON pkb.MaPhieuDichVu = pdv.MaPhieuDichVu
                    JOIN THU_CUNG tc ON pkb.MaThuCung = tc.MaThuCung
                    JOIN NHAN_VIEN nv ON pkb.MaBacSi = nv.MaNhanVien
                    LEFT JOIN LICH_HEN lh ON pdv.MaPhieuDichVu = lh.MaPhieuDichVu
                    WHERE pkb.MaThuCung = @MaThuCung
                    ORDER BY ISNULL(lh.ThoiGian, GETDATE()) DESC
                `);
            
            return result.recordset || [];
        } catch (err) {
            handleModelError(err, 'getPetMedicalHistory');
        }
    }
};

module.exports = medicalFormModel;