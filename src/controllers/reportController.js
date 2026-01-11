const reportModel = require('../models/reportModel');
const { handleControllerError, successResponse } = require('../utils');

const reportController = {
    getRevenueReport: async (req, res) => {
        try {
            const { branchId, type, value, year } = req.query;
            let result;

            // Nếu branchId là 'ALL', gọi Procedure thống kê toàn hệ thống
            if (branchId === 'ALL') {
                result = await reportModel.getTopRevenue(); // Sử dụng procedure SP_TopDoanhThuHeThong
            } else {
                // Ngược lại, gọi procedure báo cáo theo chi nhánh cụ thể
                result = await reportModel.getBranchRevenue(
                    branchId, 
                    type, 
                    parseInt(value), 
                    parseInt(year)
                );
            }
            
            return res.status(200).json(successResponse(result.recordset, 'Lấy báo cáo doanh thu thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    },

    getStaffStats: async (req, res) => {
        try {
            const { branchId } = req.query;
            const result = await reportModel.getStaffPerformance(branchId);
            return res.status(200).json(successResponse(result.recordset, 'Lấy thống kê nhân viên thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    },

    getAdvancedStats: async (req, res) => {
        try {
            const { branchId, type, value, year } = req.query;
            // Gọi hàm từ model
            const data = await reportModel.getAdvancedReport(
                branchId, type, parseInt(value), parseInt(year)
            );
            // Gửi về { stats: {...}, doctors: [...] }
            return res.status(200).json(successResponse(data, 'Lấy thống kê nâng cao thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    }
};

module.exports = reportController;