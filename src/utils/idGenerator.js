// Sinh ID tự động cho bảng
const generateId = async (pool, prefix, tableName, maxLength = 10) => {
    try {
        // Whitelist các table được phép
        const allowedTables = ['NHAN_VIEN', 'KHACH_HANG', 'LICH_HEN', 'PHIEU_DICH_VU', 'PHIEU_KHAM_BENH', 'PHIEU_TIEM_PHONG', 'THU_CUNG', 'HOA_DON'];
        
        if (!allowedTables.includes(tableName)) {
            throw new Error(`Table '${tableName}' không được phép`);
        }
        
        const result = await pool.request()
            .query(`SELECT COUNT(*) as count FROM ${tableName}`);
        
        const count = result.recordset[0].count + 1;
        const paddedNumber = String(count).padStart(maxLength - prefix.length, '0');
        
        return prefix + paddedNumber;
    } catch (err) {
        throw new Error(`Lỗi sinh ID cho ${tableName}: ${err.message}`);
    }
};

// Sinh mã khách hàng
const generateMaKhachHang = async (pool) => {
    return generateId(pool, 'KH', 'KHACH_HANG', 10);
};

// Sinh mã lịch hẹn
const generateMaLichHen = async (pool) => {
    return generateId(pool, 'LH', 'LICH_HEN', 10);
};

// Sinh mã phiếu dịch vụ
const generateMaPhieuDichVu = async (pool) => {
    return generateId(pool, 'PD', 'PHIEU_DICH_VU', 10);
};

// Sinh mã hóa đơn
const generateMaHoaDon = async (pool) => {
    return generateId(pool, 'HD', 'HOA_DON', 10);
};

// Sinh mã phiếu khám bệnh
const generateMaPhieuKham = async (pool) => {
    return generateId(pool, 'PK', 'PHIEU_KHAM_BENH', 10);
};

// Sinh mã phiếu tiêm phòng
const generateMaPhieuTiem = async (pool) => {
    return generateId(pool, 'PT', 'PHIEU_TIEM_PHONG', 10);
};

// Sinh mã thú cưng
const generateMaThuCung = async (pool) => {
    return generateId(pool, 'TC', 'THU_CUNG', 10);
};

// Sinh mã nhân viên
const generateMaNhanVien = async (pool) => {
    return generateId(pool, 'NV', 'NHAN_VIEN', 10);
};

module.exports = {
    generateId,
    generateMaKhachHang,
    generateMaLichHen,
    generateMaPhieuDichVu,
    generateMaHoaDon,
    generateMaPhieuKham,
    generateMaPhieuTiem,
    generateMaThuCung,
    generateMaNhanVien
};
