const { randomUUID } = require('crypto');

const createReceiptNumber = (prefix = 'TS') => {
  const segment = randomUUID().split('-')[0].toUpperCase();
  return `${prefix}-${new Date().getFullYear()}-${segment}`;
};

module.exports = { createReceiptNumber };
