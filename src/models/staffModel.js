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
        
        // SỬA ĐỔI: Kiểm tra nhân viên tồn tại thông qua Email trong bảng TAI_KHOAN
        // Sử dụng TOP 1 để đảm bảo luôn chỉ trả về tối đa 1 kết quả
        const checkStaff = await pool.request()
            .input('Email', sql.NVarChar(50), data.email)
            .query(`
                SELECT TOP 1 MaNhanVien 
                FROM TAI_KHOAN 
                WHERE TenDangNhap = @Email OR Email = @Email
            `);

        let maNhanVien;
        let isReturningStaff = false;

        if (checkStaff.recordset.length > 0) {
            // Trường hợp: Nhân viên cũ quay trở lại làm việc
            isReturningStaff = true;
            maNhanVien = checkStaff.recordset[0].MaNhanVien;

            // Thêm lịch sử điều động mới cho nhân viên cũ này
            await pool.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('MaChiNhanh', sql.Char(10), data.maChiNhanh)
                .input('NgayBatDau', sql.Date, new Date(data.ngayVaoLam))
                .input('ViTri', sql.NVarChar(20), data.chucVu)
                .query(`
                    INSERT INTO LICH_SU_DIEU_DONG (MaNhanVien, MaChiNhanh, NgayBatDau, NgayKetThuc, ViTri)
                    VALUES (@MaNhanVien, @MaChiNhanh, @NgayBatDau, NULL, @ViTri)
                `);

            // Kích hoạt lại tài khoản
            await pool.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .query(`
                    UPDATE TAI_KHOAN SET TrangThai = N'Hoạt động'
                    WHERE MaNhanVien = @MaNhanVien
                `);
        } else {
            // Trường hợp: Thêm nhân viên mới hoàn toàn (Giữ nguyên logic tạo ID và INSERT của bạn)
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
async function getAllStaff() {
    try {
        const pool = await connectDB();

        const result = await pool.request()
            .query(`
                SELECT 
                    nv.MaNhanVien,
                    nv.HoTen,
                    nv.NgaySinh,
                    nv.GioiTinh,
                    nv.NgayVaoLam,
                    nv.ChucVu,
                    nv.MaChiNhanh,
                    cn.TenChiNhanh,
                    bsty.GioLamViec,
                    bsty.GioNghi
                FROM NHAN_VIEN nv
                LEFT JOIN CHI_NHANH cn ON nv.MaChiNhanh = cn.MaChiNhanh
                LEFT JOIN BAC_SI_THU_Y bsty ON nv.MaNhanVien = bsty.MaNhanVien
                ORDER BY nv.HoTen
            `);

        return result.recordset;
    } catch (err) {
        handleModelError(err, 'getAllStaff');
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
                    // Use maChiNhanh if provided, otherwise use old branch
                    const targetChiNhanh = maChiNhanh || staffMaChiNhanh;
                    const branchInfo = await pool.request()
                        .input('MaChiNhanh', sql.Char(10), targetChiNhanh)
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

// Điều động nhân viên sang chi nhánh khác
async function transferStaff(data) {
    try {
        const pool = await connectDB();
        const { maNhanVien, oldBranch, newBranch, newPosition } = data;

        // Lấy thông tin nhân viên hiện tại
        const staffResult = await pool.request()
            .input('MaNhanVien', sql.Char(10), maNhanVien)
            .query(`
                SELECT 
                    MaNhanVien,
                    HoTen,
                    ChucVu,
                    MaChiNhanh,
                    NgayVaoLam
                FROM NHAN_VIEN
                WHERE MaNhanVien = @MaNhanVien
            `);

        if (staffResult.recordset.length === 0) {
            return null;
        }

        const staff = staffResult.recordset[0];
        const transaction = pool.transaction();

        try {
            await transaction.begin();

            // 1. Cập nhật NHAN_VIEN
            await transaction.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('NewBranch', sql.Char(10), newBranch)
                .input('NewPosition', sql.NVarChar(20), newPosition || staff.ChucVu)
                .query(`
                    UPDATE NHAN_VIEN
                    SET MaChiNhanh = @NewBranch,
                        ChucVu = @NewPosition
                    WHERE MaNhanVien = @MaNhanVien
                `);

            // 2. Thêm bản ghi LICH_SU_DIEU_DONG cho chi nhánh cũ (đóng bản ghi cũ)
            await transaction.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('OldBranch', sql.Char(10), oldBranch)
                .query(`
                    UPDATE LICH_SU_DIEU_DONG
                    SET NgayKetThuc = CAST(GETDATE() AS DATE)
                    WHERE MaNhanVien = @MaNhanVien
                    AND MaChiNhanh = @OldBranch
                    AND NgayKetThuc IS NULL
                `);

            // 3. Thêm bản ghi LICH_SU_DIEU_DONG cho chi nhánh mới
            await transaction.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('NewBranch', sql.Char(10), newBranch)
                .input('NewPosition', sql.NVarChar(20), newPosition || staff.ChucVu)
                .input('NgayBatDau', sql.Date, new Date())
                .query(`
                    INSERT INTO LICH_SU_DIEU_DONG (MaNhanVien, MaChiNhanh, NgayBatDau, ViTri)
                    VALUES (@MaNhanVien, @NewBranch, @NgayBatDau, @NewPosition)
                `);

            // 4. Cập nhật các bảng phân loại nhân viên nếu cần
            if (newPosition === 'Tiếp tân') {
                // Xóa khỏi các bảng khác nếu có
                await transaction.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        DELETE FROM NHAN_VIEN_BAN_HANG WHERE MaNhanVien = @MaNhanVien;
                        DELETE FROM BAC_SI_THU_Y WHERE MaNhanVien = @MaNhanVien;
                        DELETE FROM QUAN_LI WHERE MaNhanVien = @MaNhanVien;
                    `);

                // Thêm vào NHAN_VIEN_TIEP_TAN nếu chưa có
                await transaction.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN_TIEP_TAN WHERE MaNhanVien = @MaNhanVien)
                            INSERT INTO NHAN_VIEN_TIEP_TAN (MaNhanVien) VALUES (@MaNhanVien)
                    `);
            } else if (newPosition === 'Nhân viên bán hàng') {
                await transaction.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        DELETE FROM NHAN_VIEN_TIEP_TAN WHERE MaNhanVien = @MaNhanVien;
                        DELETE FROM BAC_SI_THU_Y WHERE MaNhanVien = @MaNhanVien;
                        DELETE FROM QUAN_LI WHERE MaNhanVien = @MaNhanVien;
                    `);

                await transaction.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        IF NOT EXISTS (SELECT 1 FROM NHAN_VIEN_BAN_HANG WHERE MaNhanVien = @MaNhanVien)
                            INSERT INTO NHAN_VIEN_BAN_HANG (MaNhanVien) VALUES (@MaNhanVien)
                    `);
            } else if (newPosition === 'Bác sĩ thú y') {
                await transaction.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        DELETE FROM NHAN_VIEN_TIEP_TAN WHERE MaNhanVien = @MaNhanVien;
                        DELETE FROM NHAN_VIEN_BAN_HANG WHERE MaNhanVien = @MaNhanVien;
                        DELETE FROM QUAN_LI WHERE MaNhanVien = @MaNhanVien;
                    `);

                await transaction.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        IF NOT EXISTS (SELECT 1 FROM BAC_SI_THU_Y WHERE MaNhanVien = @MaNhanVien)
                            INSERT INTO BAC_SI_THU_Y (MaNhanVien, GioLamViec, GioNghi)
                            VALUES (@MaNhanVien, '08:00:00', '17:00:00')
                    `);
            } else if (newPosition === 'Quản lí') {
                await transaction.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`
                        DELETE FROM NHAN_VIEN_TIEP_TAN WHERE MaNhanVien = @MaNhanVien;
                        DELETE FROM NHAN_VIEN_BAN_HANG WHERE MaNhanVien = @MaNhanVien;
                        DELETE FROM BAC_SI_THU_Y WHERE MaNhanVien = @MaNhanVien;
                    `);

                // Kiểm tra nếu không phải quản lí hiện tại của chi nhánh cũ, thêm vào QUAN_LI
                const existingManager = await transaction.request()
                    .input('MaNhanVien', sql.Char(10), maNhanVien)
                    .query(`SELECT 1 FROM QUAN_LI WHERE MaNhanVien = @MaNhanVien`);

                if (existingManager.recordset.length === 0) {
                    // Nếu chi nhánh mới đã có quản lí, thay thế
                    await transaction.request()
                        .input('NewBranch', sql.Char(10), newBranch)
                        .query(`DELETE FROM QUAN_LI WHERE MaChiNhanhQuanLi = @NewBranch`);

                    await transaction.request()
                        .input('MaNhanVien', sql.Char(10), maNhanVien)
                        .input('NewBranch', sql.Char(10), newBranch)
                        .query(`
                            INSERT INTO QUAN_LI (MaNhanVien, MaChiNhanhQuanLi)
                            VALUES (@MaNhanVien, @NewBranch)
                        `);
                }
            }

            // 5. Cập nhật TAI_KHOAN
            await transaction.request()
                .input('MaNhanVien', sql.Char(10), maNhanVien)
                .input('NewBranch', sql.Char(10), newBranch)
                .query(`
                    UPDATE TAI_KHOAN
                    SET MaNhanVien = @MaNhanVien
                    WHERE MaNhanVien = @MaNhanVien
                `);

            await transaction.commit();

            return {
                maNhanVien,
                oldBranch,
                newBranch,
                newPosition: newPosition || staff.ChucVu,
                transferDate: new Date().toISOString().split('T')[0]
            };
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        handleModelError(err, 'transferStaff');
    }
}

// Lấy bảng lương (mức lương cơ bản theo chức vụ)
async function getSalaryTable() {
    try {
        const pool = await connectDB();

        const result = await pool.request()
            .query(`
                SELECT 
                    ChucVu,
                    LuongCoBan
                FROM BANG_LUONG
                ORDER BY ChucVu
            `);

        return result.recordset;
    } catch (err) {
        handleModelError(err, 'getSalaryTable');
    }
}

// Lấy danh sách bác sĩ khả dụng theo chi nhánh và thời gian
async function getAvailableDoctors(maChiNhanh, gioKham) {
    try {
        const pool = await connectDB();

        // Convert TIME object { hours, minutes, seconds } thành string HH:mm:ss
        const timeStr = `${String(gioKham.hours).padStart(2, '0')}:${String(gioKham.minutes).padStart(2, '0')}:${String(gioKham.seconds).padStart(2, '0')}`;

        // Lấy ngày hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Query kiểm tra: bác sĩ phải đang làm việc tại chi nhánh trong ngày (từ bảng LICH_SU_DIEU_DONG)
        const result = await pool.request()
            .input('MaChiNhanh', sql.Char(10), maChiNhanh)
            .input('HomNay', sql.Date, today)
            .query(`
                DECLARE @GioKham TIME = '${timeStr}'
                
                SELECT 
                    nv.MaNhanVien,
                    nv.HoTen,
                    bs.GioLamViec,
                    bs.GioNghi
                FROM NHAN_VIEN nv
                INNER JOIN BAC_SI_THU_Y bs ON nv.MaNhanVien = bs.MaNhanVien
                INNER JOIN LICH_SU_DIEU_DONG lsdd ON nv.MaNhanVien = lsdd.MaNhanVien
                WHERE lsdd.MaChiNhanh = @MaChiNhanh
                    AND lsdd.ViTri = N'Bác sĩ thú y'
                    AND lsdd.NgayBatDau <= @HomNay
                    AND (lsdd.NgayKetThuc IS NULL OR lsdd.NgayKetThuc >= @HomNay)
                    AND bs.GioLamViec <= @GioKham
                    AND @GioKham < bs.GioNghi
                ORDER BY nv.HoTen
            `);

        // Format lại giờ làm việc và giờ nghỉ để display đúng
        const formattedDoctors = result.recordset.map(doctor => ({
            ...doctor,
            GioLamViec: formatTimeForDisplay(doctor.GioLamViec),
            GioNghi: formatTimeForDisplay(doctor.GioNghi)
        }));

        return formattedDoctors;
    } catch (err) {
        handleModelError(err, 'getAvailableDoctors');
    }
}

// Helper: Format TIME để display
function formatTimeForDisplay(timeValue) {
    if (!timeValue) return '';
    
    // Nếu là string ISO (từ TIME database)
    if (typeof timeValue === 'string') {
        // Xử lý format HH:mm:ss.mmm
        return timeValue.substring(0, 5);
    }
    
    // Nếu là Date object
    if (timeValue instanceof Date) {
        const hours = String(timeValue.getHours()).padStart(2, '0');
        const minutes = String(timeValue.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    return timeValue;
}

// Helper: Convert TIME string "HH:mm:ss" to minutes
function timeStringToMinutes(timeStr) {
    if (typeof timeStr === 'string') {
        const [h, m, s] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }
    // Nếu là Date object từ DB
    const date = new Date(timeStr);
    return date.getHours() * 60 + date.getMinutes();
}

module.exports = {
    addStaff,
    getStaffByBranch,
    getStaffDetail,
    getManagersByBranch,
    deleteStaff,
    updateStaff,
    getStaffHistory,
    getAllStaff,
    getSalaryTable,
    transferStaff,
    getAvailableDoctors
};
