const BranchModel = require('../models/branchModel');
const { validateRequired, validateMonth, validateYear, handleControllerError, successResponse } = require('../utils');

const branchController = {
    getAllBranches: async (req, res) => {
        try {
            const branches = await BranchModel.getBranches();
            return res.status(200).json(successResponse(branches, 'Lấy danh sách chi nhánh thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getAllServices: async (req, res) => {
        try {
            const services = await BranchModel.getServices();
            return res.status(200).json(successResponse(services, 'Lấy danh sách dịch vụ thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getStaffCount: async (req, res) => {
        try {
            const count = await BranchModel.getStaffCount();
            return res.status(200).json(successResponse({ count }, 'Lấy số lượng nhân viên thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getDoctorsByBranch: async (req, res) => {
        try {
            const { maChiNhanh } = req.params;
            
            const validation = validateRequired(['maChiNhanh'], { maChiNhanh });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            
            const doctors = await BranchModel.getDoctorsByBranch(maChiNhanh);
            return res.status(200).json(successResponse(doctors, 'Lấy danh sách bác sĩ thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getCustomersCount: async (req, res) => {
        try {
            const count = await BranchModel.getCustomersCount();
            return res.status(200).json(successResponse({ count }, 'Lấy số lượng khách hàng thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getAllStaff: async (req, res) => {
        try {
            const maNV = req.query.maNV || null; // Optional query parameter
            const staff = await BranchModel.getAllStaff(maNV);
            return res.status(200).json(successResponse(staff, 'Lấy danh sách nhân viên thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getTransferHistory: async (req, res) => {
        try {
            const { maNV } = req.params;
            
            const validation = validateRequired(['maNV'], { maNV });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            const history = await BranchModel.getTransferHistory(maNV);
            return res.status(200).json(successResponse(history, 'Lấy lịch sử điều động thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getEmployeeIncome: async (req, res) => {
        try {
            const { maNV } = req.params;
            const { thang, nam } = req.query;
            
            const validation = validateRequired(['maNV', 'thang', 'nam'], { maNV, thang, nam });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            if (!validateMonth(thang) || !validateYear(nam)) {
                return res.status(400).json({ success: false, message: 'Tháng hoặc năm không hợp lệ' });
            }

            const income = await BranchModel.getEmployeeIncome(maNV, parseInt(thang), parseInt(nam));
            return res.status(200).json(successResponse(income, 'Lấy doanh thu nhân viên thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getEmployeePerformance: async (req, res) => {
        try {
            const { maNV } = req.params;
            const { thang, nam } = req.query;
            
            const validation = validateRequired(['maNV', 'thang', 'nam'], { maNV, thang, nam });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            if (!validateMonth(thang) || !validateYear(nam)) {
                return res.status(400).json({ success: false, message: 'Tháng hoặc năm không hợp lệ' });
            }

            const performance = await BranchModel.getEmployeePerformance(maNV, parseInt(thang), parseInt(nam));
            return res.status(200).json(successResponse(performance, 'Lấy hiệu suất nhân viên thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getAllEmployeesPerformance: async (req, res) => {
        try {
            const { thang, nam, maNV } = req.query;
            
            const validation = validateRequired(['thang', 'nam'], { thang, nam });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }

            if (!validateMonth(thang) || !validateYear(nam)) {
                return res.status(400).json({ success: false, message: 'Tháng hoặc năm không hợp lệ' });
            }

            const maNVParam = maNV && maNV.trim() !== '' ? maNV.trim() : null;
            const performance = await BranchModel.getAllEmployeesPerformance(parseInt(thang), parseInt(nam), maNVParam);
            return res.status(200).json(successResponse(performance, 'Lấy hiệu suất tất cả nhân viên thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    },

    getStaffByBranch: async (req, res) => {
        try {
            const { maChiNhanh } = req.params;
            
            const validation = validateRequired(['maChiNhanh'], { maChiNhanh });
            if (!validation.isValid) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            
            const staff = await BranchModel.getStaffByBranch(maChiNhanh);
            return res.status(200).json(successResponse(staff, 'Lấy danh sách nhân viên chi nhánh thành công'));
        } catch (err) {
            return handleControllerError(res, err);
        }
    }
};

module.exports = branchController;