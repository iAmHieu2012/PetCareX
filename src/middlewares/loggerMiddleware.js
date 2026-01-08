const logger = (req, res, next) => {
    // Lấy thời gian bắt đầu
    const start = Date.now();
    const timestamp = new Date().toLocaleString('vi-VN');

    // Khi request xử lý xong (finish), mới ghi log
    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        
        // Tô màu cho đẹp: Lỗi (đỏ), Thành công (xanh)
        let color = status >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red or Green
        let reset = '\x1b[0m';

        console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${color}${status}${reset} - ${duration}ms`);
    });

    next(); // Cho phép chạy tiếp
};

module.exports = logger;