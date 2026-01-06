const { connectDB } = require('../config/db');
const BranchModel = {
    getBranches: async () => {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM CHI_NHANH');
        return result.recordset;
    },
    getServices: async () => {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM DICH_VU');
        return result.recordset;
    }
};

module.exports = BranchModel;