const express = require('express');

const authRoutes = require('./authRoutes');
const blockedDateRoutes = require('./blockedDateRoutes');
const bookingRoutes = require('./bookingRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const expenditureRoutes = require('./expenditureRoutes');
const financeRoutes = require('./financeRoutes');
const metadataRoutes = require('./metadataRoutes');
const panchangRoutes = require('./panchangRoutes');
const receiptRoutes = require('./receiptRoutes');
const reportRoutes = require('./reportRoutes');
const sevaListRoutes = require('./sevaListRoutes');
const sevaRoutes = require('./sevaRoutes');
const userRoutes = require('./userRoutes');
const { ROLES } = require('../config/roles');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const { SUPER_ADMIN, ADMIN, FINANCE } = ROLES;
const operations = authorize(SUPER_ADMIN, ADMIN);

const router = express.Router();

router.use('/auth', authRoutes);

// Super admin: portal configuration and user management.
router.use('/users', authenticate, authorize(SUPER_ADMIN), userRoutes);

// Super admin + admins: configure the portal and run day-to-day bookings and expenditure.
router.use('/dashboard', authenticate, operations, dashboardRoutes);
router.use('/metadata', authenticate, operations, metadataRoutes);
router.use('/sevas', authenticate, operations, sevaRoutes);
router.use('/bookings', authenticate, operations, bookingRoutes);
router.use('/blocked-dates', authenticate, operations, blockedDateRoutes);
router.use('/panchang', authenticate, operations, panchangRoutes);
router.use('/seva-list', authenticate, operations, sevaListRoutes);
router.use('/expenditures', authenticate, operations, expenditureRoutes);
router.use('/receipts', authenticate, operations, receiptRoutes);

// Accounts & finance head (read-only reporting) and super admin.
router.use('/finance', authenticate, authorize(SUPER_ADMIN, FINANCE), financeRoutes);
router.use('/reports', authenticate, authorize(SUPER_ADMIN, ADMIN, FINANCE), reportRoutes);

module.exports = router;
