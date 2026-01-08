const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Specific routes TRƯỚC generic routes để tránh conflict
router.get('/info/:maKhachHang', customerController.getCustomerInfo);

// Pets routes (specific trước generic)
router.get('/pets/detail/:maThuCung', customerController.getPetDetail);
router.get('/pets/history/:maThuCung', customerController.getPetMedicalHistory);
router.post('/pets', customerController.addPet);
router.get('/pets/:maKhachHang', customerController.getCustomerPets);

// Bookings routes (specific trước generic)
router.put('/bookings/:maLichHen/cancel', customerController.cancelBooking);
router.post('/bookings', customerController.createBooking);
router.get('/bookings/:maKhachHang', customerController.getCustomerBookings);

module.exports = router;
