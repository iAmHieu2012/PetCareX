const productModel = require('../models/productModel');
const { handleControllerError, successResponse } = require('../utils');

const productController = {
    // Lấy danh sách sản phẩm (có lọc theo tên/loại)
    getProducts: async (req, res) => {
        try {
            const { name, type } = req.query;
            // Gọi hàm getAll từ model
            const result = await productModel.getAll(name, type);
            return res.status(200).json(successResponse(result.recordset, 'Lấy danh sách sản phẩm thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    },

    // Lấy danh sách sản phẩm có tồn kho tại chi nhánh
    getProductsByBranch: async (req, res) => {
        try {
            const { branchId } = req.params;
            const { type } = req.query;
            
            if (!branchId) {
                return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã chi nhánh' });
            }
            
            const result = await productModel.getByBranch(branchId, type);
            return res.status(200).json(successResponse(result.recordset, 'Lấy danh sách sản phẩm tại chi nhánh thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    },

    // Lấy danh sách sản phẩm sắp hết hạn
    getExpiringProducts: async (req, res) => {
        try {
            const expiring = await productModel.getExpiring();
            return res.status(200).json(successResponse(expiring, 'Lấy danh sách sản phẩm sắp hết hạn thành công'));
        } catch (err) {
            return handleControllerError(err, res);;
        }
    },

    // Lấy danh sách dược phẩm
    getMedicines: async (req, res) => {
        try {
            const medicines = await productModel.getAllMedicines();
            return res.status(200).json(successResponse(medicines, 'Lấy danh sách dược phẩm thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'getMedicines');
        }
    },

    // Lấy danh sách vacxin
    getVaccines: async (req, res) => {
        try {
            const vaccines = await productModel.getAllVaccines();
            return res.status(200).json(successResponse(vaccines, 'Lấy danh sách vacxin thành công'));
        } catch (err) {
            return handleControllerError(err, res, 'getVaccines');
        }
    }
};

module.exports = productController;