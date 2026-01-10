const { connectDB, sql } = require('../config/db');
const { handleModelError } = require('../utils/errorHandler');
const { generateMaNhanVien } = require('../utils/idGenerator');

// Map role to default password
const rolePasswordMap = {
    'Bác sĩ thú y': 'bs123',
    'Tiếp tân': 'tt123',
    'Nhân viên bán hàng': 'bh123',
    'Quản lí': 'ql123'
};

// Map role to VaiTro for TAI_KHOAN
const roleVaiTroMap = {
    'Bác sĩ thú y': 'BacSi',
    'Tiếp tân': 'TiepTan',
    'Nhân viên bán hàng': 'BanHang',
    'Quản lí': 'QuanLi'
};

// Thêm nhân viên mới hoặc tái tuyển
async function addStaff(data) {
    try {
        const pool = await connectDB();
        
        // Kiểm tra nhân viên đã tồn tại
        const checkStaff = await pool.request()
            .input('Email', sql.NVarChar(50), data.email)
            .query(`
                SELECT MaNhanVien FROM NHAN_VIEN
                WHERE HoTen = (SELECT HoTen FROM NHAN_VIEN WHERE EXISTS (
                    SELECT 1 FROM TAI_KHOAN WHERE TenDangNhap = @Email
                ))
                OR EXISTS (SELECT 1 FROM TAI_KHOAN WHERE TenDangNhap = @Email)
            `);

        let maNhanVien;
        let isReturningStaff = false;

        if (checkStaff.recordset.length > 0) {
            // Nhân viên cũ trở lại
            isReturningStaff = true;
            maNhanVien = checkStaff.recordset[0].MaNhanVien;

            // Thêm lịch sử điều động
            await pool.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('MaChiNhanh', sql.Char(10), data.maChiNhanh)
                .input('NgayBatDau', sql.Date, new Date(data.ngayVaoLam))
                .input('ViTri', sql.NVarChar(20), data.chucVu)
                .query(`
                    INSERT INTO LICH_SU_DIEU_DONG (MaNhanVien, MaChiNhanh, NgayBatDau, NgayKetThuc, ViTri)
                    VALUES (@MaNhanVien, @MaChiNhanh, @NgayBatDau, NULL, @ViTri)
                `);

            // Cập nhật trạng thái tài khoản
            await pool.request()
                .input('Email', sql.NVarChar(50), data.email)
                .query(`
                    UPDATE TAI_KHOAN SET TrangThai = 'Hoạt động'
                    WHERE TenDangNhap = @Email
                `);
        } else {
            // Nhân viên mới
            maNhanVien = await generateMaNhanVien(pool);

            // Thêm vào bảng NHAN_VIEN
            await pool.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('HoTen', sql.NVarChar(30), data.hoTen)
                .input('NgaySinh', sql.Date, new Date(data.ngaySinh))
                .input('GioiTinh', sql.NVarChar(3), data.gioiTinh)
                .input('NgayVaoLam', sql.Date, new Date(data.ngayVaoLam))
                .input('ChucVu', sql.NVarChar(20), data.chucVu)
                .input('MaChiNhanh', sql.Char(10), data.maChiNhanh)
                .input('NguoiQuanLi', sql.Char(10), data.nguoiQuanLi || null)
                .query(`
                    INSERT INTO NHAN_VIEN (MaNhanVien, HoTen, NgaySinh, GioiTinh, NgayVaoLam, ChucVu, NguoiQuanLi, MaChiNhanh)
                    VALUES (@MaNhanVien, @HoTen, @NgaySinh, @GioiTinh, @NgayVaoLam, @ChucVu, @NguoiQuanLi, @MaChiNhanh)
                `);

            // Thêm vào LICH_SU_DIEU_DONG
            await pool.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('MaChiNhanh', sql.Char(10), data.maChiNhanh)
                .input('NgayBatDau', sql.Date, new Date(data.ngayVaoLam))
                .input('ViTri', sql.NVarChar(20), data.chucVu)
                .query(`
                    INSERT INTO LICH_SU_DIEU_DONG (MaNhanVien, MaChiNhanh, NgayBatDau, NgayKetThuc, ViTri)
                    VALUES (@MaNhanVien, @MaChiNhanh, @NgayBatDau, NULL, @ViTri)
                `);

            // Thêm vào bảng loại nhân viên tương ứng
            if (data.chucVu === 'Bác sĩ thú y') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .input('GioLamViec', sql.Time, data.gioLamViec)
                    .input('GioNghi', sql.Time, data.gioNghi)
                    .query(`
                        INSERT INTO BAC_SI_THU_Y (MaNhanVien, GioLamViec, GioNghi)
                        VALUES (@MaNhanVien, @GioLamViec, @GioNghi)
                    `);
            } else if (data.chucVu === 'Nhân viên bán hàng') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        INSERT INTO NHAN_VIEN_BAN_HANG (MaNhanVien)
                        VALUES (@MaNhanVien)
                    `);
            } else if (data.chucVu === 'Tiếp tân') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        INSERT INTO NHAN_VIEN_TIEP_TAN (MaNhanVien)
                        VALUES (@MaNhanVien)
                    `);
            } else if (data.chucVu === 'Quản lí') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .input('MaChiNhanhQuanLi', sql.Char(10), data.maChiNhanh)
                    .query(`
                        INSERT INTO QUAN_LI (MaNhanVien, MaChiNhanhQuanLi)
                        VALUES (@MaNhanVien, @MaChiNhanhQuanLi)
                    `);
            }

            // Tạo tài khoản
            const defaultPassword = rolePasswordMap[data.chucVu] || 'default123';
            const vaiTro = roleVaiTroMap[data.chucVu] || 'NhanVien';

            await pool.request()
                .input('TenDangNhap', sql.NVarChar(50), data.email)
                .input('MatKhau', sql.NVarChar(50), defaultPassword)
                .input('Email', sql.NVarChar(50), data.email)
                .input('VaiTro', sql.NVarChar(20), vaiTro)
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('TrangThai', sql.NVarChar(20), 'Hoạt động')
                .query(`
                    INSERT INTO TAI_KHOAN (TenDangNhap, MatKhau, Email, VaiTro, MaNhanVien, TrangThai)
                    VALUES (@TenDangNhap, @MatKhau, @Email, @VaiTro, @MaNhanVien, @TrangThai)
                `);
        }

        return {
            maNhanVien,
            hoTen: data.hoTen,
            chucVu: data.chucVu,
            isReturning: isReturningStaff
        };
    } catch (err) {
        handleModelError(err, 'addStaff');
    }
}

// Lấy danh sách nhân viên của chi nhánh
async function getStaffByBranch(maChiNhanh) {
    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('MaChiNhanh', sql.Char(10), maChiNhanh)
            .query(`
                SELECT 
                    nv.MaNhanVien,
                    nv.HoTen,
                    nv.NgaySinh,
                    nv.GioiTinh,
                    nv.NgayVaoLam,
                    nv.ChucVu,
                    lsdd.ViTri AS viTriLamViec,
                    bsty.GioLamViec,
                    bsty.GioNghi
                FROM NHAN_VIEN nv
                LEFT JOIN LICH_SU_DIEU_DONG lsdd ON nv.MaNhanVien = lsdd.MaNhanVien 
                    AND lsdd.MaChiNhanh = @MaChiNhanh 
                    AND lsdd.NgayKetThuc IS NULL
                LEFT JOIN BAC_SI_THU_Y bsty ON nv.MaNhanVien = bsty.MaNhanVien
                WHERE nv.MaChiNhanh = @MaChiNhanh
                ORDER BY nv.HoTen
            `);

        return result.recordset;
    } catch (err) {
        handleModelError(err, 'getStaffByBranch');
    }
}

// Lấy chi tiết nhân viên
async function getStaffDetail(maNhanVien) {
    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('MaNhanVien', sql.Char(10), maNhanVien)
            .query(`
                SELECT 
                    nv.MaNhanVien,
                    nv.HoTen,
                    nv.NgaySinh,
                    nv.GioiTinh,
                    nv.NgayVaoLam,
                    nv.ChucVu,
                    nv.MaChiNhanh,
                    bsty.GioLamViec,
                    bsty.GioNghi
                FROM NHAN_VIEN nv
                LEFT JOIN BAC_SI_THU_Y bsty ON nv.MaNhanVien = bsty.MaNhanVien
                WHERE nv.MaNhanVien = @MaNhanVien
            `);

        return result.recordset[0] || null;
    } catch (err) {
        handleModelError(err, 'getStaffDetail');
    }
}

// Lấy danh sách quản lí tại chi nhánh
async function getManagersByBranch(maChiNhanh) {
    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('MaChiNhanh', sql.Char(10), maChiNhanh)
            .query(`
                SELECT 
                    nv.MaNhanVien,
                    nv.HoTen
                FROM NHAN_VIEN nv
                INNER JOIN QUAN_LI ql ON nv.MaNhanVien = ql.MaNhanVien
                WHERE ql.MaChiNhanhQuanLi = @MaChiNhanh
                ORDER BY nv.HoTen
            `);

        return result.recordset;
    } catch (err) {
        handleModelError(err, 'getManagersByBranch');
    }
}

// Xóa nhân viên (soft delete - cập nhật trạng thái)
async function deleteStaff(maNhanVien, maChiNhanh) {
    try {
        const pool = await connectDB();

        // Kiểm tra nhân viên tồn tại
        const checkStaff = await pool.request()
            .input('MaNhanVien', sql.Char(10), maNhanVien)
            .input('MaChiNhanh', sql.Char(10), maChiNhanh)
            .query(`
                SELECT MaNhanVien FROM NHAN_VIEN 
                WHERE MaNhanVien = @MaNhanVien AND MaChiNhanh = @MaChiNhanh
            `);

        if (checkStaff.recordset.length === 0) {
            return null;
        }

        // Cập nhật NgayKetThuc trong LICH_SU_DIEU_DONG
        await pool.request()
            .input('MaNhanVien', sql.Char(10), maNhanVien)
            .input('MaChiNhanh', sql.Char(10), maChiNhanh)
            .input('NgayKetThuc', sql.Date, new Date())
            .query(`
                UPDATE LICH_SU_DIEU_DONG 
                SET NgayKetThuc = @NgayKetThuc
                WHERE MaNhanVien = @MaNhanVien 
                  AND MaChiNhanh = @MaChiNhanh 
                  AND NgayKetThuc IS NULL
            `);

        // Cập nhật trạng thái tài khoản
        await pool.request()
            .input('MaNhanVien', sql.Char(10), maNhanVien)
            .query(`
                UPDATE TAI_KHOAN 
                SET TrangThai = N'Ngừng hoạt động'
                WHERE MaNhanVien = @MaNhanVien
            `);

        return {
            maNhanVien,
            message: 'Xóa nhân viên thành công'
        };
    } catch (err) {
        handleModelError(err, 'deleteStaff');
    }
}

// Cập nhật thông tin nhân viên
async function updateStaff(data) {
    try {
        const pool = await connectDB();
        const { maNhanVien, chucVu, gioLamViec, gioNghi, maChiNhanh } = data;

        // Kiểm tra nhân viên tồn tại và lấy chức vụ cũ
        const checkStaff = await pool.request()
            .input('MaNhanVien', sql.Char(10), maNhanVien)
            .query(`
                SELECT ChucVu, MaChiNhanh FROM NHAN_VIEN 
                WHERE MaNhanVien = @MaNhanVien
            `);

        if (checkStaff.recordset.length === 0) {
            return null;
        }

        const oldChucVu = checkStaff.recordset[0].ChucVu;
        const staffMaChiNhanh = checkStaff.recordset[0].MaChiNhanh;

        // Nếu chức vụ thay đổi
        if (oldChucVu !== chucVu) {
            // Xóa khỏi bảng role cũ
            if (oldChucVu === 'Bác sĩ thú y') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`DELETE FROM BAC_SI_THU_Y WHERE MaNhanVien = @MaNhanVien`);
            } else if (oldChucVu === 'Tiếp tân') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`DELETE FROM NHAN_VIEN_TIEP_TAN WHERE MaNhanVien = @MaNhanVien`);
            } else if (oldChucVu === 'Nhân viên bán hàng') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`DELETE FROM NHAN_VIEN_BAN_HANG WHERE MaNhanVien = @MaNhanVien`);
            } else if (oldChucVu === 'Quản lí') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`DELETE FROM QUAN_LI WHERE MaNhanVien = @MaNhanVien`);
            }

            // Thêm vào bảng role mới
            if (chucVu === 'Bác sĩ thú y') {
                // Lấy giờ mở/đóng cửa của chi nhánh nếu không có input
                let gioMoCua = gioLamViec;
                let gioDongCua = gioNghi;

                if (!gioMoCua || !gioDongCua) {
                    const branchInfo = await pool.request()
                        .input('MaChiNhanh', sql.Char(10), staffMaChiNhanh)
                        .query(`
                            SELECT GioMoCua, GioDongCua FROM CHI_NHANH 
                            WHERE MaChiNhanh = @MaChiNhanh
                        `);
                    
                    if (branchInfo.recordset.length > 0) {
                        gioMoCua = gioMoCua || branchInfo.recordset[0].GioMoCua;
                        gioDongCua = gioDongCua || branchInfo.recordset[0].GioDongCua;
                    }
                }

                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .input('GioLamViec', sql.NVarChar(5), gioMoCua)
                    .input('GioNghi', sql.NVarChar(5), gioDongCua)
                    .query(`
                        INSERT INTO BAC_SI_THU_Y (MaNhanVien, GioLamViec, GioNghi)
                        VALUES (@MaNhanVien, @GioLamViec, @GioNghi)
                    `);
            } else if (chucVu === 'Tiếp tân') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        INSERT INTO NHAN_VIEN_TIEP_TAN (MaNhanVien)
                        VALUES (@MaNhanVien)
                    `);
            } else if (chucVu === 'Nhân viên bán hàng') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        INSERT INTO NHAN_VIEN_BAN_HANG (MaNhanVien)
                        VALUES (@MaNhanVien)
                    `);
            } else if (chucVu === 'Quản lí') {
                await pool.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .input('MaChiNhanhQuanLi', sql.Char(10), staffMaChiNhanh)
                    .query(`
                        INSERT INTO QUAN_LI (MaNhanVien, MaChiNhanhQuanLi)
                        VALUES (@MaNhanVien, @MaChiNhanhQuanLi)
                    `);
            }

            // Cập nhật LICH_SU_DIEU_DONG
            // Đóng lịch sử cũ
            await pool.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('NgayKetThuc', sql.Date, new Date())
                .query(`
                    UPDATE LICH_SU_DIEU_DONG 
                    SET NgayKetThuc = @NgayKetThuc
                    WHERE MaNhanVien = @MaNhanVien 
                      AND NgayKetThuc IS NULL
                `);

            // Thêm lịch sử mới
            await pool.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('MaChiNhanh', sql.Char(10), staffMaChiNhanh)
                .input('NgayBatDau', sql.Date, new Date())
                .input('ViTri', sql.NVarChar(20), chucVu)
                .query(`
                    INSERT INTO LICH_SU_DIEU_DONG (MaNhanVien, MaChiNhanh, NgayBatDau, NgayKetThuc, ViTri)
                    VALUES (@MaNhanVien, @MaChiNhanh, @NgayBatDau, NULL, @ViTri)
                `);

            // Cập nhật NHAN_VIEN
            await pool.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('ChucVu', sql.NVarChar(20), chucVu)
                .query(`
                    UPDATE NHAN_VIEN 
                    SET ChucVu = @ChucVu
                    WHERE MaNhanVien = @MaNhanVien
                `);

            // Cập nhật mật khẩu với giá trị mặc định cho role mới
            const newPassword = rolePasswordMap[chucVu];
            await pool.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('MatKhau', sql.NVarChar(50), newPassword)
                .query(`
                    UPDATE TAI_KHOAN 
                    SET MatKhau = @MatKhau
                    WHERE MaNhanVien = @MaNhanVien
                `);
        } else {
            // Chỉ cập nhật doctor fields nếu là bác sĩ và có input
            if (chucVu === 'Bác sĩ thú y' && (gioLamViec || gioNghi)) {
                const updateQuery = [];
                const request = pool.request().input('MaNhanVien', sql.Char(10), maNhanVien);
                
                if (gioLamViec) {
                    updateQuery.push('GioLamViec = @GioLamViec');
                    request.input('GioLamViec', sql.NVarChar(5), gioLamViec);
                }
                
                if (gioNghi) {
                    updateQuery.push('GioNghi = @GioNghi');
                    request.input('GioNghi', sql.NVarChar(5), gioNghi);
                }

                if (updateQuery.length > 0) {
                    await request.query(`
                        UPDATE BAC_SI_THU_Y 
                        SET ${updateQuery.join(', ')}
                        WHERE MaNhanVien = @MaNhanVien
                    `);
                }
            }
        }

        // Cập nhật VaiTro trong TAI_KHOAN
        const newVaiTro = roleVaiTroMap[chucVu];
        await pool.request()
            .input('MaNhanVien', sql.Char(10), maNhanVien)
            .input('VaiTro', sql.NVarChar(20), newVaiTro)
            .query(`
                UPDATE TAI_KHOAN 
                SET VaiTro = @VaiTro
                WHERE MaNhanVien = @MaNhanVien
            `);

        return {
            maNhanVien,
            message: 'Cập nhật nhân viên thành công'
        };
    } catch (err) {
        handleModelError(err, 'updateStaff');
    }
}

// Lấy lịch sử điều động của nhân viên
async function getStaffHistory(maNhanVien) {
    try {
        const pool = await connectDB();

        const result = await pool.request()
            .input('MaNhanVien', sql.Char(10), maNhanVien)
            .query(`
                SELECT 
                    MaNhanVien,
                    MaChiNhanh,
                    NgayBatDau,
                    NgayKetThuc,
                    ViTri
                FROM LICH_SU_DIEU_DONG
                WHERE MaNhanVien = @MaNhanVien
                ORDER BY NgayBatDau DESC
            `);

        return result.recordset;
    } catch (err) {
        handleModelError(err, 'getStaffHistory');
    }
}

module.exports = {
    addStaff,
    getStaffByBranch,
    getStaffDetail,
    getManagersByBranch,
    deleteStaff,
    updateStaff,
    getStaffHistory
};
