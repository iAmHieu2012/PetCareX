const BookingModel = require('../models/bookingModel');

// ========== KHÁCH HÀNG ==========
exports.createBooking = async (req, res) => {
    try {
        const { MaKhachHang, MaThuCung, MaChiNhanh, LoaiLichHen, ThoiGian, GhiChu } = req.body;
        
        // Validate dữ liệu
        if (!MaKhachHang || !MaThuCung || !MaChiNhanh || !LoaiLichHen || !ThoiGian) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin' 
            });
        }
        
        const booking = {
            MaKhachHang,
            MaThuCung,
            MaChiNhanh,
            LoaiLichHen,
            ThoiGian,
            GhiChu
        };
        
        const result = await BookingModel.createBooking(booking);
        res.status(201).json({
            success: true,
            message: result.message,
            maLichHen: result.maLichHen
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const { maKhachHang } = req.params;
        
        if (!maKhachHang) {
            return res.status(400).json({
                success: false,
                message: 'Mã khách hàng không hợp lệ'
            });
        }
        
        const bookings = await BookingModel.getBookingsByCustomer(maKhachHang);
        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await BookingModel.getAllBookings();
        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.confirmBooking = async (req, res) => {
    try {
        const { maLichHen, maChiNhanh } = req.body;
        
        if (!maLichHen || !maChiNhanh) {
            return res.status(400).json({
                success: false,
                message: 'Mã lịch hẹn và chi nhánh không hợp lệ'
            });
        }
        
        const result = await BookingModel.updateBookingStatus(maLichHen, maChiNhanh, 'Đã xác nhận');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { maLichHen, maChiNhanh } = req.body;
        
        if (!maLichHen || !maChiNhanh) {
            return res.status(400).json({
                success: false,
                message: 'Mã lịch hẹn và chi nhánh không hợp lệ'
            });
        }
        
        const result = await BookingModel.cancelBooking(maLichHen, maChiNhanh);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ========== NHÂN VIÊN TIẾP TÂN ==========
exports.createBookingStaff = async (req, res) => {
    try {
        const { MaKhachHang, MaThuCung, MaChiNhanh, LoaiLichHen, ThoiGian, MaNhanVienXacNhan, TrangThai } = req.body;
        
        // Validate dữ liệu
        if (!MaKhachHang || !MaThuCung || !MaChiNhanh || !LoaiLichHen || !ThoiGian) {
            return res.status(400).json({ 
                success: false,
                message: 'Vui lòng cung cấp đầy đủ thông tin' 
            });
        }
        
        const booking = {
            MaKhachHang,
            MaThuCung,
            MaChiNhanh,
            LoaiLichHen,
            ThoiGian,
            MaNhanVienXacNhan: MaNhanVienXacNhan || null,
            TrangThai: TrangThai || 'Chờ xác nhận'
        };
        
        const result = await BookingModel.createBookingStaff(booking);
        res.status(201).json({
            success: true,
            message: result.message,
            maLichHen: result.maLichHen,
            maPhieuDichVu: result.maPhieuDichVu
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getBookingsByBranch = async (req, res) => {
    try {
        const { maChiNhanh } = req.params;
        
        if (!maChiNhanh) {
            return res.status(400).json({
                success: false,
                message: 'Mã chi nhánh không hợp lệ'
            });
        }
        
        const bookings = await BookingModel.getBookingsByBranch(maChiNhanh);
        res.status(200).json({
            success: true,
            data: bookings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
