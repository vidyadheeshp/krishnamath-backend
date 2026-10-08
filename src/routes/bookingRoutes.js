const express = require('express');

const { cancelBooking, createBooking, listBookings, updateBooking } = require('../controllers/bookingController');
const { cancelBookingRules, createBookingRules, updateBookingRules } = require('../validators');

const router = express.Router();

router.get('/', listBookings);
router.post('/', createBookingRules, createBooking);
router.put('/:id', updateBookingRules, updateBooking);
router.post('/:id/cancel', cancelBookingRules, cancelBooking);

module.exports = router;
