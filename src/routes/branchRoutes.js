const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const staffController = require('../controllers/staffController');
const authMiddleware = require('../middlewares/authMiddleware');

// General routes
router.get('/', branchController.getAllBranches);
router.get('/services', branchController.getAllServices);

// PHẢI ĐẶT SPECIFIC ROUTES TRƯỚC GENERIC ROUTES
// Salary table route (MUST be before /staff/:maNV/* patterns)
router.get('/salary-table', authMiddleware.verifyToken, staffController.getSalaryTable);

// Staff routes (Đặt specific pattern TRƯỚC generic pattern)
router.get('/staff/count', branchController.getStaffCount);
router.get('/staff/doctors/:maChiNhanh', branchController.getDoctorsByBranch);
router.get('/staff/by-branch/:maChiNhanh', branchController.getStaffByBranch);
router.get('/staff/performance/all', branchController.getAllEmployeesPerformance);
router.get('/staff/:maNV/transfers', branchController.getTransferHistory);
router.get('/staff/:maNV/income', branchController.getEmployeeIncome);
router.get('/staff/:maNV/performance', branchController.getEmployeePerformance);
router.get('/staff', branchController.getAllStaff);

// Customers
router.get('/customers/count', branchController.getCustomersCount);

module.exports = router;