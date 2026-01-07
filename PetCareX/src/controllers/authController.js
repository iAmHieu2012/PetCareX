const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

// --- ĐĂNG KÝ (Không mã hóa) ---
exports.register = async (req, res) => {
    try {
        const { username, password, email, fullName, phone, cccd, gender } = req.body;

        // 1. Kiểm tra username tồn tại chưa
        const existingUser = await userModel.findByUsername(username);
        if (existingUser) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });

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

        res.status(201).json({ 
            message: "Đăng ký thành công!", 
            maKhachHang: nextMaKH // Trả về mã để khách biết
        });
    } // Trong authController.js
    catch (err) {
        console.error("--- LỖI SERVER CHI TIẾT ---");
        console.error(err); // Dòng này sẽ in lỗi đỏ lòm ở Terminal Node.js
        res.status(500).json({ 
            message: "Lỗi hệ thống!", 
            errorDetail: err.message // Trả lỗi về cho trình duyệt xem luôn
        });
    }
};

// --- ĐĂNG NHẬP (So sánh trực tiếp) ---
exports.login = async (req, res) => {
    try {
        const { loginIdentifier, password } = req.body;

        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
        }

        const user = await userModel.findUserDetailed(loginIdentifier);
        if (!user) return res.status(404).json({ message: "Tài khoản không tồn tại!" });

        // SO SÁNH TRỰC TIẾP CHUỖI VĂN BẢN
        if (password !== user.MatKhau) {
            return res.status(400).json({ message: "Mật khẩu không chính xác" });
        }

        const token = jwt.sign(
            { id: user.MaTaiKhoan, role: user.VaiTro, name: user.HoTen },
            process.env.JWT_SECRET || 'PETCAREX_SECRET_KEY',
            { expiresIn: '1d' }
        );

        res.json({
            message: "Đăng nhập thành công!",
            token,
            user: { name: user.HoTen, role: user.VaiTro }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};