const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');

router.get('/', branchController.getAllBranches);
router.get('/services', branchController.getAllServices);
router.get('/staff/count', branchController.getStaffCount);
router.get('/customers/count', branchController.getCustomersCount);
router.get('/staff', branchController.getAllStaff);
router.get('/staff/:maNV/transfers', branchController.getTransferHistory);
router.get('/staff/:maNV/income', branchController.getEmployeeIncome);
router.get('/staff/:maNV/performance', branchController.getEmployeePerformance);
router.get('/staff/performance/all', branchController.getAllEmployeesPerformance);
router.get('/pets/:maThuCung', branchController.getPetDetails);

module.exports = router;