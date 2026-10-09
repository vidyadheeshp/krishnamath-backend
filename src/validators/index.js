const { body, query, validationResult } = require('express-validator');

const { ALL_ROLES } = require('../config/roles');
const { ALL_CATEGORIES, CATEGORIES, RECEIPT_CATEGORIES } = require('../config/paymentCategories');
const { EXPENSE_CATEGORIES } = require('../config/expenseCategories');

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const MOBILE_PATTERN = /^\+?[0-9][0-9\s-]{6,16}$/;
const MAX_MONEY = 10000000;

// "cancelled" is not settable here: a booking is cancelled only through the cancel endpoint (with a reason).
const BOOKING_STATUSES = ['confirmed', 'pending', 'completed'];
const SEVA_STATUSES = ['active', 'inactive'];

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const messages = result.array().map((item) => item.msg);
  return res.status(400).json({ success: false, message: messages[0], data: null, errors: messages });
};

// `required` fields must be present on create; on update they are only checked when sent.
const field = (name, required) => (required ? body(name) : body(name).optional());

const text = (name, label, { required = false, max = 200, allowEmpty = false } = {}) => {
  let chain = field(name, required).isString().withMessage(`${label} must be text`).bail().trim();

  if (required && !allowEmpty) {
    chain = chain.notEmpty().withMessage(`${label} is required`).bail();
  }

  return chain.isLength({ max }).withMessage(`${label} must be at most ${max} characters`);
};

const money = (name, label, { required = false, min = 0 } = {}) =>
  field(name, required)
    .isFloat({ min, max: MAX_MONEY })
    .withMessage(`${label} must be a number between ${min} and ${MAX_MONEY}`);

const isoDate = (name, label, required) =>
  field(name, required)
    .isString()
    .matches(DATE_PATTERN)
    .withMessage(`${label} must be a date in YYYY-MM-DD format`)
    .bail()
    .isISO8601({ strict: true })
    .withMessage(`${label} is not a valid date`);

const loginRules = [
  body('email').isString().trim().isEmail().withMessage('Valid email is required').isLength({ max: 254 }),
  body('password').isString().withMessage('Password is required').notEmpty().withMessage('Password is required').isLength({ max: 200 }),
];

const bookingRules = (isCreate) => [
  ...(isCreate
    ? [
        text('devoteeName', 'Devotee name', { required: true, max: 120 }),
        body('mobileNumber')
          .isString()
          .trim()
          .matches(MOBILE_PATTERN)
          .withMessage('Mobile number is not valid'),
        text('address', 'Address', { max: 500 }),
        text('gotra', 'Gotra', { max: 200 }),
        text('nakshatra', 'Nakshatra', { max: 200 }),
        text('raashi', 'Raashi', { max: 200 }),
      ]
    : []),
  body('sevaId').optional({ values: 'falsy' }).isString().isLength({ max: 64 }).withMessage('sevaId is invalid'),
  body('sevaIds').optional().isArray({ max: 20 }).withMessage('sevaIds must be a list of at most 20 sevas'),
  body('sevaIds.*').isString().isLength({ max: 64 }).withMessage('sevaIds contains an invalid value'),
  isoDate('bookingDate', 'Booking date', isCreate),
  body('bookingTime').optional().matches(TIME_PATTERN).withMessage('Booking time must be HH:MM'),
  text('paymentMode', 'Payment mode', { required: isCreate, max: 50 }),
  text('paymentReferenceNumber', 'Payment reference', { max: 100 }),
  money('amountPayable', 'Amount payable').optional({ values: 'falsy' }),
  money('donation', 'Donation').optional({ values: 'falsy' }),
  body('status').optional().isIn(BOOKING_STATUSES).withMessage(`Status must be one of ${BOOKING_STATUSES.join(', ')}`),
  text('notes', 'Notes', { max: 1000 }),
  validate,
];

const cancelBookingRules = [
  body('reason')
    .isString()
    .withMessage('Give a reason for the cancellation')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('The reason must be 3-500 characters'),
  validate,
];

const panchangRules = [
  query('from').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('From date is invalid'),
  query('to').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('To date is invalid'),
  validate,
];

const listBlockedDatesRules = [
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Year is invalid'),
  validate,
];

const addBlockedDatesRules = [
  body('dates').isArray({ min: 1, max: 400 }).withMessage('Choose between 1 and 400 dates'),
  body('dates.*')
    .isString()
    .matches(DATE_PATTERN)
    .withMessage('Dates must be in YYYY-MM-DD format')
    .bail()
    .isISO8601({ strict: true })
    .withMessage('One of the dates is not a valid date'),
  body('reason').optional().isString().withMessage('Reason must be text').trim().isLength({ max: 200 }).withMessage('Reason must be at most 200 characters'),
  validate,
];

const updateBlockedDateRules = [
  body('reason').isString().withMessage('Reason must be text').trim().isLength({ max: 200 }).withMessage('Reason must be at most 200 characters'),
  validate,
];

const sevaListRules = [
  query('day').optional().isIn(['today', 'tomorrow']).withMessage('Day must be today or tomorrow'),
  validate,
];

const sevaRules = (isCreate) => [
  text('name', 'Seva name', { required: isCreate, max: 150 }),
  text('nameKn', 'Kannada name', { max: 150 }),
  text('description', 'Description', { max: 1000 }),
  money('amount', 'Amount', { required: isCreate }),
  text('category', 'Category', { required: isCreate, max: 100 }),
  field('availabilityStatus', false).isIn(SEVA_STATUSES).withMessage(`Status must be one of ${SEVA_STATUSES.join(', ')}`),
  text('instructions', 'Instructions', { max: 1000 }),
  validate,
];

const expenditureRules = (isCreate) => [
  text('expenseTitle', 'Expense title', { required: isCreate, max: 200 }),
  field('expenseCategory', isCreate)
    .isIn(EXPENSE_CATEGORIES)
    .withMessage(`Expense category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),
  money('expenseAmount', 'Expense amount', { required: isCreate, min: 0.01 }),
  isoDate('expenseDate', 'Expense date', isCreate),
  text('paymentMode', 'Payment mode', { required: isCreate, max: 50 }),
  text('vendorDetails', 'Vendor details', { max: 500 }),
  text('notes', 'Notes', { max: 1000 }),
  validate,
];

const metadataRules = (isCreate) => [
  text('name', 'Name', { required: isCreate, max: 100 }),
  text('nameKn', 'Kannada name', { max: 100 }),
  body('enabled').optional().isBoolean().withMessage('Enabled must be true or false').toBoolean(),
  validate,
];

const passwordRule = (name) =>
  body(name)
    .isString()
    .withMessage('Password is required')
    .isLength({ min: 10, max: 128 })
    .withMessage('Password must be 10-128 characters');

const createUserRules = [
  text('name', 'Name', { required: true, max: 100 }),
  body('email').isString().trim().isEmail().withMessage('Valid email is required').isLength({ max: 254 }),
  body('role').isIn(ALL_ROLES).withMessage(`Role must be one of ${ALL_ROLES.join(', ')}`),
  passwordRule('password'),
  validate,
];

const updateUserRules = [
  text('name', 'Name', { max: 100 }),
  body('email').optional().isString().trim().isEmail().withMessage('Valid email is required').isLength({ max: 254 }),
  body('role').optional().isIn(ALL_ROLES).withMessage(`Role must be one of ${ALL_ROLES.join(', ')}`),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false').toBoolean(),
  validate,
];

const resetPasswordRules = [passwordRule('password'), validate];

// A user editing their own profile: role and active status are deliberately not accepted here.
const profileRules = [
  body('name').optional().isString().withMessage('Name must be text').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name must be at most 100 characters'),
  body('email').optional().isString().trim().isEmail().withMessage('Valid email is required').isLength({ max: 254 }),
  body('phone')
    .optional()
    .isString()
    .trim()
    .custom((value) => value === '' || MOBILE_PATTERN.test(value))
    .withMessage('Mobile number is not valid'),
  body('currentPassword').optional().isString().isLength({ max: 200 }),
  validate,
];

const changePasswordRules = [
  body('currentPassword').isString().withMessage('Current password is required').notEmpty().withMessage('Current password is required').isLength({ max: 200 }),
  passwordRule('newPassword'),
  validate,
];

const periodRules = [
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Year is invalid'),
  query('month').optional({ values: 'falsy' }).isInt({ min: 1, max: 12 }).withMessage('Month must be 1-12'),
  query('category').optional({ values: 'falsy' }).isIn(ALL_CATEGORIES).withMessage(`Category must be one of ${ALL_CATEGORIES.join(', ')}`),
  validate,
];

const receiptRules = (isCreate) => [
  ...(isCreate
    ? [body('category').isIn(RECEIPT_CATEGORIES).withMessage(`Category must be one of ${RECEIPT_CATEGORIES.join(', ')}`)]
    : []),
  isoDate('receiptDate', 'Receipt date', isCreate),
  // Hundi collections are anonymous; every other receipt needs the devotee's name.
  isCreate
    ? body('devoteeName')
        .if((value, { req }) => req.body.category !== CATEGORIES.HUNDI_COLLECTION)
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Devotee name is required')
        .isLength({ max: 120 })
        .withMessage('Devotee name must be at most 120 characters')
    : text('devoteeName', 'Devotee name', { max: 120 }),
  body('mobileNumber')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .matches(MOBILE_PATTERN)
    .withMessage('Mobile number is not valid'),
  money('amount', 'Amount', { required: isCreate, min: 0.01 }),
  text('paymentMode', 'Payment mode', { required: isCreate, max: 50 }),
  text('paymentReferenceNumber', 'Payment reference', { max: 100 }),
  text('notes', 'Notes', { max: 1000 }),
  validate,
];

module.exports = {
  validate,
  createUserRules,
  updateUserRules,
  resetPasswordRules,
  profileRules,
  changePasswordRules,
  periodRules,
  createReceiptRules: receiptRules(true),
  updateReceiptRules: receiptRules(false),
  loginRules,
  createBookingRules: bookingRules(true),
  updateBookingRules: bookingRules(false),
  cancelBookingRules,
  sevaListRules,
  panchangRules,
  listBlockedDatesRules,
  addBlockedDatesRules,
  updateBlockedDateRules,
  createSevaRules: sevaRules(true),
  updateSevaRules: sevaRules(false),
  createExpenditureRules: expenditureRules(true),
  updateExpenditureRules: expenditureRules(false),
  createMetadataRules: metadataRules(true),
  updateMetadataRules: metadataRules(false),
};
