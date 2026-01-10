const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { validateRequired, validateEmail, handleControllerError, successResponse } = require('../utils');

const authController = {
    // --- ĐĂNG KÝ (Không mã hóa) ---
    register: async (req, res) => {
        try {
            const { username, password, email, fullName, phone, cccd, gender } = req.body;

            // Validate input
            const validation = validateRequired(
                ['username', 'password', 'email', 'fullName', 'phone'],
                { username, password, email, fullName, phone }
            );
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            if (!validateEmail(email)) {
                return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
            }

            // 1. Kiểm tra username tồn tại chưa
            const existingUser = await userModel.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại!" });
            }

            // 2. Tự sinh mã khách hàng mới
            const nextMaKH = await userModel.generateNextMaKH();

            // 3. Thực hiện đăng ký 2 bảng
            await userModel.registerFullCustomer({
                maKH: nextMaKH,
                fullName,
                phone,
                username,
                password,
                email,
                cccd,
                gender
            });

            return res.status(201).json(successResponse(
                { maKhachHang: nextMaKH },
                "Đăng ký thành công!"
            ));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    // --- ĐĂNG NHẬP (So sánh trực tiếp) ---
    login: async (req, res) => {
        try {
            const { loginIdentifier, password } = req.body;

            const validation = validateRequired(['loginIdentifier', 'password'], {
                loginIdentifier, password
            });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const user = await userModel.findUserDetailed(loginIdentifier);
            if (!user) {
                return res.status(404).json({ success: false, message: "Tài khoản không tồn tại!" });
            }

            // SO SÁNH TRỰC TIẾP CHUỖI VĂN BẢN
            if (password !== user.MatKhau) {
                return res.status(400).json({ success: false, message: "Mật khẩu không chính xác" });
            }

            const token = jwt.sign(
                { id: user.MaTaiKhoan, role: user.VaiTro, name: user.HoTen },
                process.env.JWT_SECRET || 'PETCAREX_SECRET_KEY',
                { expiresIn: '1d' }
            );

            return res.json(successResponse({
                token,
                user: { name: user.HoTen, role: user.VaiTro },
                maKhachHang: user.MaKhachHang || '',
                maNhanVien: user.MaNhanVien || '',
                maChiNhanh: user.MaChiNhanh || ''
            }, "Đăng nhập thành công!"));
        } catch (err) {
            return handleControllerError(res, err);
        }
    }
};

module.exports = authController;