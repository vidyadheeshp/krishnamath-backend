const express = require('express');

const authRoutes = require('./authRoutes');
const bookingRoutes = require('./bookingRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const expenditureRoutes = require('./expenditureRoutes');
const metadataRoutes = require('./metadataRoutes');
const reportRoutes = require('./reportRoutes');
const sevaRoutes = require('./sevaRoutes');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/metadata', authenticate, authorize('admin', 'super-admin'), metadataRoutes);
router.use('/sevas', authenticate, authorize('admin', 'super-admin'), sevaRoutes);
router.use('/bookings', authenticate, authorize('admin', 'super-admin'), bookingRoutes);
router.use('/expenditures', authenticate, authorize('admin', 'super-admin'), expenditureRoutes);
router.use('/reports', authenticate, authorize('admin', 'super-admin'), reportRoutes);

module.exports = router;
