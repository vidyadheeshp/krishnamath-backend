const express = require('express');

const { createBooking, deleteBooking, listBookings, updateBooking } = require('../controllers/bookingController');

const router = express.Router();

router.get('/', listBookings);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
