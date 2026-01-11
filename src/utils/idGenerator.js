// Sinh ID tự động cho bảng
const generateId = async (pool, prefix, tableName, maxLength = 10) => {
    try {
        // Whitelist các table được phép
        const allowedTables = ['NHAN_VIEN', 'KHACH_HANG', 'LICH_HEN', 'PHIEU_DICH_VU', 'PHIEU_KHAM_BENH', 'PHIEU_TIEM_PHONG', 'THU_CUNG', 'HOA_DON'];
        
        if (!allowedTables.includes(tableName)) {
            throw new Error(`Table '${tableName}' không được phép`);
        }
        
        // Map table name to primary key column name
        const pkColumnMap = {
            'NHAN_VIEN': 'MaNhanVien',
            'KHACH_HANG': 'MaKhachHang',
            'LICH_HEN': 'MaLichHen',
            'PHIEU_DICH_VU': 'MaPhieuDichVu',
            'PHIEU_KHAM_BENH': 'MaPhieuDichVu', // PHIEU_KHAM_BENH dùng MaPhieuDichVu làm PK
            'PHIEU_TIEM_PHONG': 'MaPhieuDichVu', // PHIEU_TIEM_PHONG dùng MaPhieuDichVu làm PK
            'THU_CUNG': 'MaThuCung',
            'HOA_DON': 'MaHoaDon'
        };
        
        const pkColumn = pkColumnMap[tableName];
        
        // Lấy mã ID cao nhất hiện tại
        const result = await pool.request()
            .query(`SELECT MAX(${pkColumn}) as maxId FROM ${tableName}`);
        
        const maxId = result.recordset[0]?.maxId;
        
        // Nếu chưa có bản ghi nào, bắt đầu từ 1 với prefix mặc định
        if (!maxId || maxId === null) {
            const paddedNumber = String(1).padStart(maxLength - prefix.length, '0');
            return prefix + paddedNumber;
        }
        
        // Tự động detect prefix từ mã ID hiện có
        // Tìm phần chữ cái ở đầu (prefix thực tế)
        const prefixMatch = maxId.match(/^([A-Z]+)/);
        const actualPrefix = prefixMatch ? prefixMatch[1] : prefix;
        
        // Nếu prefix thực tế khác với prefix mong đợi, dùng prefix thực tế
        const usedPrefix = actualPrefix || prefix;
        
        // Lấy số từ mã ID hiện tại
        const numberPart = maxId.replace(usedPrefix, '');
        const currentNumber = parseInt(numberPart, 10);
        
        // Kiểm tra parse thành công
        if (isNaN(currentNumber)) {
            throw new Error(`Không thể parse số từ mã ID: ${maxId}. Prefix phát hiện: ${usedPrefix}, Prefix mong đợi: ${prefix}`);
        }
        
        const nextNumber = currentNumber + 1;
        const paddedNumber = String(nextNumber).padStart(maxLength - usedPrefix.length, '0');
        
        return usedPrefix + paddedNumber;
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
