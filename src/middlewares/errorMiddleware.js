// 1. Xử lý lỗi 404 (Không tìm thấy đường dẫn)
const notFound = (req, res, next) => {
    const error = new Error(`❌ Không tìm thấy đường dẫn: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// 2. Xử lý lỗi chung (500 hoặc lỗi logic)
const errorHandler = (err, req, res, next) => {
    // Nếu status code đang là 200 mà có lỗi, thì đổi thành 500 (Lỗi server)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    console.error("🔥 Lỗi Server:", err.message); // In lỗi ra terminal để dev xem

    res.status(statusCode);
    res.json({
        message: err.message, // Thông báo lỗi
        // Nếu không phải môi trường 'production' thì hiện chi tiết dòng lỗi (stack trace)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };