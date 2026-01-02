const app = require('./src/app');
const { connectDB } = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Kết nối Database trước, sau đó mới start Server
const startServer = async () => {
    try {
        // Gọi hàm kết nối từ db.js
        await connectDB();

        // Lắng nghe các yêu cầu
        app.listen(PORT, () => {
            console.log(`-----------------------------------------`);
            console.log(`Server đang chạy tại: http://localhost:${PORT}`);
            console.log(`-----------------------------------------`);
        });
    } catch (error) {
        console.error('Không thể khởi động server:', error.message);
    }
};

startServer();