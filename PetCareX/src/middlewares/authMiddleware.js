const jwt = require('jsonwebtoken');

const authMiddleware = {
    // Kiểm tra đã đăng nhập chưa
    verifyToken: (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Vui lòng đăng nhập!" });

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET || 'PETCAREX_SECRET_KEY');
            req.user = verified;
            next();
        } catch (err) {
            res.status(403).json({ message: "Phiên đăng nhập hết hạn!" });
        }
    },

    // Kiểm tra quyền Quản lý hoặc Admin
    isManager: (req, res, next) => {
        if (req.user.role === 'Admin' || req.user.role === 'QuanLi') {
            next();
        } else {
            res.status(403).json({ message: "Chỉ Quản lý mới có quyền thực hiện!" });
        }
    },

    // Kiểm tra quyền Admin tối cao
    isAdmin: (req, res, next) => {
        if (req.user.role === 'Admin') {
            next();
        } else {
            res.status(403).json({ message: "Quyền này chỉ dành cho Admin hệ thống!" });
        }
    }
};

module.exports = authMiddleware;