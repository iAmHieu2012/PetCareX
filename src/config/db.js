const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
    }
};

const connectDB = async () => {
    try {
        const pool = await sql.connect(config);
        console.log('Đã kết nối thành công tới SQL Server: ' + process.env.DB_NAME);
        return pool;
    } catch (err) {
        console.error('Lỗi kết nối Database:', err.message);
        process.exit(1);
    }
};

module.exports = { sql, connectDB };