const express = require('express');
const router = express.Router();
const { createBooking, updateBookingStatus, getBookingsByEmail } = require('../controllers/bookingController');

router.post('/', createBooking);
router.patch('/:id/status', updateBookingStatus);
router.get('/', getBookingsByEmail);

module.exports = router;
