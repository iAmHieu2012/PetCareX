const BranchModel = require('../models/branchModel');

exports.getAllBranches = async (req, res) => {
    try {
        const branches = await BranchModel.getBranches();
        res.status(200).json(branches);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};
exports.getAllServices = async (req, res) => {
    try {
        const services = await BranchModel.getServices();
        res.status(200).json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getStaffCount = async (req, res) => {
    try {
        const count = await BranchModel.getStaffCount();
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};

exports.getDoctorsByBranch = async (req, res) => {
    try {
        const { maChiNhanh } = req.params;
        
        if (!maChiNhanh) {
            return res.status(400).json({
                success: false,
                message: 'Mã chi nhánh là bắt buộc'
            });
        }
        
        const doctors = await BranchModel.getDoctorsByBranch(maChiNhanh);
        res.status(200).json({
            success: true,
            data: doctors
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.getCustomersCount = async (req, res) => {
    try {
        const count = await BranchModel.getCustomersCount();
        res.status(200).json({ count });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};
exports.getAllStaff = async (req, res) => {
    try {
        const maNV = req.query.maNV || null; // Optional query parameter
        const staff = await BranchModel.getAllStaff(maNV);
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};
exports.getTransferHistory = async (req, res) => {
    try {
        const { maNV } = req.params;
        if (!maNV) {
            return res.status(400).json({ message: "Mã nhân viên là bắt buộc" });
        }
        const history = await BranchModel.getTransferHistory(maNV);
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};
exports.getEmployeeIncome = async (req, res) => {
    try {
        const { maNV } = req.params;
        const { thang, nam } = req.query;
        if (!maNV || !thang || !nam) {
            return res.status(400).json({ message: "Mã nhân viên, tháng và năm là bắt buộc" });
        }
        const income = await BranchModel.getEmployeeIncome(maNV, parseInt(thang), parseInt(nam));
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};
exports.getEmployeePerformance = async (req, res) => {
    try {
        const { maNV } = req.params;
        const { thang, nam } = req.query;
        if (!maNV || !thang || !nam) {
            return res.status(400).json({ message: "Mã nhân viên, tháng và năm là bắt buộc" });
        }
        const performance = await BranchModel.getEmployeePerformance(maNV, parseInt(thang), parseInt(nam));
        res.status(200).json(performance);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};
exports.getAllEmployeesPerformance = async (req, res) => {
    try {
        const { thang, nam, maNV } = req.query;
        if (!thang || !nam) {
            return res.status(400).json({ message: "Tháng và năm là bắt buộc" });
        }
        const maNVParam = maNV && maNV.trim() !== '' ? maNV.trim() : null;
        const performance = await BranchModel.getAllEmployeesPerformance(parseInt(thang), parseInt(nam), maNVParam);
        res.status(200).json(performance);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};
exports.getPetDetails = async (req, res) => {
    try {
        const { maThuCung } = req.params;
        if (!maThuCung) {
            return res.status(400).json({ message: "Mã thú cưng là bắt buộc" });
        }
        const petDetails = await BranchModel.getPetDetails(maThuCung);
        if (!petDetails) {
            return res.status(404).json({ message: "Không tìm thấy thú cưng với mã này" });
        }
        res.status(200).json(petDetails);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server", error: err.message });
    }
};