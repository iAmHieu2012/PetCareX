const BookingModel = require('../models/bookingModel');
const { validateRequired, handleControllerError, successResponse } = require('../utils');

const bookingController = {
    // ========== KHÁCH HÀNG ==========
    createBooking: async (req, res) => {
        try {
            const { MaKhachHang, MaThuCung, MaChiNhanh, LoaiLichHen, ThoiGian, GhiChu } = req.body;
            
            // Validate dữ liệu
            const validation = validateRequired(['MaKhachHang', 'MaThuCung', 'MaChiNhanh', 'LoaiLichHen', 'ThoiGian'], {
                MaKhachHang, MaThuCung, MaChiNhanh, LoaiLichHen, ThoiGian
            });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            
            // KIỂM TRA GÓI TIÊM NẾU LÀ LỊCH TIÊM PHÒNG
            if (LoaiLichHen === 'Tiêm phòng') {
                const packages = await BookingModel.checkVaccinePackages(MaThuCung);
                
                if (packages.length === 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Thú cưng này chưa mua gói tiêm nào. Vui lòng mua gói tiêm trước khi đăng ký lịch tiêm phòng.'
                    });
                }
                
                // Kiểm tra mỗi gói tiêm xem còn liều không
                let hasAvailablePackage = false;
                for (const pkg of packages) {
                    const progress = await BookingModel.checkVaccineProgress(MaThuCung, pkg.MaGoiTiem);
                    if (progress.conLai > 0) {
                        hasAvailablePackage = true;
                        break;
                    }
                }
                
                if (!hasAvailablePackage) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Tất cả gói tiêm của thú cưng này đã tiêm hết. Vui lòng mua gói tiêm mới.'
                    });
                }
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
            return res.status(201).json(successResponse(result, 'Đặt lịch hẹn thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getMyBookings: async (req, res) => {
        try {
            const { maKhachHang } = req.params;
            
            const validation = validateRequired(['maKhachHang'], { maKhachHang });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            
            const bookings = await BookingModel.getBookingsByCustomer(maKhachHang);
            return res.status(200).json(successResponse(bookings, 'Lấy lịch hẹn thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getAllBookings: async (req, res) => {
        try {
            const bookings = await BookingModel.getAllBookings();
            return res.status(200).json(successResponse(bookings, 'Lấy tất cả lịch hẹn thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    confirmBooking: async (req, res) => {
        try {
            const { maLichHen, maChiNhanh, maKhachHang } = req.body;
            
            const validation = validateRequired(['maLichHen', 'maChiNhanh', 'maKhachHang'], {
                maLichHen, maChiNhanh, maKhachHang
            });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            
            const result = await BookingModel.confirmBooking(maLichHen, maChiNhanh, maKhachHang);
            return res.status(200).json(successResponse(result, 'Xác nhận lịch hẹn thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    cancelBooking: async (req, res) => {
        try {
            const { maLichHen, maChiNhanh } = req.body;
            
            const validation = validateRequired(['maLichHen', 'maChiNhanh'], {
                maLichHen, maChiNhanh
            });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            
            const result = await BookingModel.cancelBooking(maLichHen, maChiNhanh);
            return res.status(200).json(successResponse(result, 'Hủy lịch hẹn thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    // ========== NHÂN VIÊN TIẾP TÂN ==========
    createBookingStaff: async (req, res) => {
        try {
            const { MaKhachHang, MaThuCung, MaChiNhanh, LoaiLichHen, ThoiGian, MaNhanVienXacNhan, TrangThai } = req.body;
            
            // Validate dữ liệu
            const validation = validateRequired(['MaKhachHang', 'MaThuCung', 'MaChiNhanh', 'LoaiLichHen', 'ThoiGian'], {
                MaKhachHang, MaThuCung, MaChiNhanh, LoaiLichHen, ThoiGian
            });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            
            // KIỂM TRA GÓI TIÊM NẾU LÀ LỊCH TIÊM PHÒNG
            if (LoaiLichHen === 'Tiêm phòng') {
                const packages = await BookingModel.checkVaccinePackages(MaThuCung);
                
                if (packages.length === 0) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Thú cưng này chưa mua gói tiêm nào. Vui lòng mua gói tiêm trước khi đăng ký lịch tiêm phòng.'
                    });
                }
                
                // Kiểm tra mỗi gói tiêm xem còn liều không
                let hasAvailablePackage = false;
                for (const pkg of packages) {
                    const progress = await BookingModel.checkVaccineProgress(MaThuCung, pkg.MaGoiTiem);
                    if (progress.conLai > 0) {
                        hasAvailablePackage = true;
                        break;
                    }
                }
                
                if (!hasAvailablePackage) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Tất cả gói tiêm của thú cưng này đã tiêm hết. Vui lòng mua gói tiêm mới.'
                    });
                }
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
            return res.status(201).json(successResponse(result, 'Tạo lịch hẹn thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getBookingsByBranch: async (req, res) => {
        try {
            const { maChiNhanh } = req.params;
            
            const validation = validateRequired(['maChiNhanh'], { maChiNhanh });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            
            const bookings = await BookingModel.getBookingsByBranch(maChiNhanh);
            return res.status(200).json(successResponse(bookings, 'Lấy lịch hẹn theo chi nhánh thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    }
};

module.exports = bookingController;
