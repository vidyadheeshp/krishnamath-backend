// The four heads under which every rupee received is accounted. Seva bookings are always
// "Religious Seva"; the other three are recorded as receipts by the admins.
const CATEGORIES = {
  RELIGIOUS_SEVA: 'religious-seva',
  ANNADANA_SEVA: 'annadana-seva',
  DONATION: 'donation',
  HUNDI_COLLECTION: 'hundi-collection',
};

const CATEGORY_LABELS = {
  [CATEGORIES.RELIGIOUS_SEVA]: 'Religious Seva',
  [CATEGORIES.ANNADANA_SEVA]: 'Annadana Seva',
  [CATEGORIES.DONATION]: 'Donation',
  [CATEGORIES.HUNDI_COLLECTION]: 'Hundi Collection',
};

const ALL_CATEGORIES = Object.values(CATEGORIES);

// Categories an admin records directly (everything except bookings).
const RECEIPT_CATEGORIES = ALL_CATEGORIES.filter((category) => category !== CATEGORIES.RELIGIOUS_SEVA);

// Receipt-number prefixes (seva bookings keep "TS").
const RECEIPT_PREFIXES = {
  [CATEGORIES.ANNADANA_SEVA]: 'AN',
  [CATEGORIES.DONATION]: 'DN',
  [CATEGORIES.HUNDI_COLLECTION]: 'HC',
};

module.exports = { CATEGORIES, CATEGORY_LABELS, ALL_CATEGORIES, RECEIPT_CATEGORIES, RECEIPT_PREFIXES };
