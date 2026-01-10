const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Get all customers (for manager dashboard)
router.get('/all', customerController.getAllCustomers);

// Search customers
router.get('/search', customerController.searchCustomers);

// Specific routes TRƯỚC generic routes để tránh conflict
router.get('/info/:maKhachHang', customerController.getCustomerInfo);

// Pets routes
router.get('/pets/:maKhachHang', customerController.getCustomerPets);

// Bookings routes (specific trước generic)
router.get('/bookings/:maKhachHang', customerController.getCustomerBookings);

module.exports = router;
