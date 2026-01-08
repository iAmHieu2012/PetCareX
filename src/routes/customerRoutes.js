const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Customer routes
router.get('/info/:maKhachHang', customerController.getCustomerInfo);
router.get('/pets/:maKhachHang', customerController.getCustomerPets);
router.get('/pets/detail/:maThuCung', customerController.getPetDetail);
router.post('/pets', customerController.addPet);

router.get('/bookings/:maKhachHang', customerController.getCustomerBookings);
router.post('/bookings', customerController.createBooking);
router.put('/bookings/:maLichHen/cancel', customerController.cancelBooking);

module.exports = router;
