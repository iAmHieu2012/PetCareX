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