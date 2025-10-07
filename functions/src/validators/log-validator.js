const { createHttpError } = require('../utils/http-error');

function normalizeString(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

function validateAmount(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 2000) {
    throw createHttpError(400, 'amount_out_of_range');
  }
  return parsed;
}

function validateLogPayload(payload = {}) {
  const beanType = normalizeString(payload.beanType);
  const taste = normalizeString(payload.taste);
  if (!beanType || !taste) {
    throw createHttpError(400, 'beanType_and_taste_required');
  }
  const amount = validateAmount(payload.amount);
  const displayName = normalizeString(payload.displayName) || null;
  return { beanType, taste, amount, displayName };
}

module.exports = { validateLogPayload };
