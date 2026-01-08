const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

// General routes
router.get('/', branchController.getAllBranches);
router.get('/services', branchController.getAllServices);

// Staff routes (specific TRƯỚC generic)
router.get('/staff/count', branchController.getStaffCount);
router.get('/staff/doctors/:maChiNhanh', branchController.getDoctorsByBranch);
router.get('/staff/performance/all', branchController.getAllEmployeesPerformance);
router.get('/staff/:maNV/transfers', branchController.getTransferHistory);
router.get('/staff/:maNV/income', branchController.getEmployeeIncome);
router.get('/staff/:maNV/performance', branchController.getEmployeePerformance);
router.get('/staff', branchController.getAllStaff);

// Customers
router.get('/customers/count', branchController.getCustomersCount);

// Pets
router.get('/pets/:maThuCung', branchController.getPetDetails);

module.exports = router;