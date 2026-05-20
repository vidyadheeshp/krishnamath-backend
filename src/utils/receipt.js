const { randomUUID } = require('crypto');

const createReceiptNumber = () => {
  const segment = randomUUID().split('-')[0].toUpperCase();
  return `TS-${new Date().getFullYear()}-${segment}`;
};

module.exports = { createReceiptNumber };
