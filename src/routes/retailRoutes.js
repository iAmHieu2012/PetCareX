const express = require('express');
const router = express.Router();
const retailController = require('../controllers/retailController');

router.post('/checkout', retailController.checkout);

// Hóa đơn chưa xác nhận
router.get('/unconfirmed/:maChiNhanh', retailController.getUnconfirmedInvoices);

// Hóa đơn đã xác nhận
router.get('/confirmed/:maChiNhanh', retailController.getConfirmedInvoices);

// Chi tiết hóa đơn
router.get('/invoice-details/:maPhieuDichVu', retailController.getInvoiceDetails);

// Kho hàng
router.get('/warehouse/:maChiNhanh', retailController.getWarehouseInventory);

// Kho hàng - danh sách sản phẩm
router.get('/warehouse-products/:maChiNhanh', retailController.getWarehouseProducts);

// Kho hàng - danh sách lô hàng
router.get('/warehouse-batches/:maChiNhanh', retailController.getWarehouseBatches);

// Thêm sản phẩm
router.post('/add-product', retailController.addProduct);

// Nhập lô hàng
router.post('/import-batch', retailController.importBatch);

// Xác nhận thanh toán
router.post('/confirm-payment', retailController.confirmPayment);

module.exports = router;