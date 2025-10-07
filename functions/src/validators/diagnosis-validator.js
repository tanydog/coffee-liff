const { createHttpError } = require('../utils/http-error');

function normalizeString(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

function normalizeScoreMap(input) {
  if (!input || typeof input !== 'object') {
    return {};
  }
  const result = {};
  for (const [key, value] of Object.entries(input)) {
    const normalizedKey = normalizeString(key);
    if (!normalizedKey) continue;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) continue;
    result[normalizedKey] = numeric;
  }
  return result;
}

function validateDiagnosisPayload(payload = {}) {
  const type = normalizeString(payload.type);
  if (!type) {
    throw createHttpError(400, 'type_required');
  }
  const scoreMap = normalizeScoreMap(payload.scoreMap);
  const displayName = normalizeString(payload.displayName) || null;
  return { type, scoreMap, displayName };
}

module.exports = { validateDiagnosisPayload };
