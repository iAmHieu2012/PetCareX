const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

// Khách nào cũng xem được sản phẩm
router.get('/', productController.getProducts);

// Lấy sản phẩm có tồn kho tại chi nhánh cụ thể
router.get('/by-branch/:branchId', productController.getProductsByBranch);

// Lấy danh sách dược phẩm (cho toa thuốc)
router.get('/medicines', productController.getMedicines);

// Lấy danh sách vacxin
router.get('/vaccines', productController.getVaccines);

// Chỉ Admin/Quản lý mới xem được hàng sắp hết hạn
router.get('/expiring', authMiddleware.verifyToken, authMiddleware.isManager, productController.getExpiringProducts);

module.exports = router;