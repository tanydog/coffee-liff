const { admin } = require("../firebase");
const { createHttpError } = require("../utils/http-error");

class LogService {
  constructor({ logRepository }) {
    this.logRepository = logRepository;
  }

  async recordLog(userPayload, requestBody) {
    const { beanType, taste } = requestBody || {};
    let { amount, displayName } = requestBody || {};

    if (!beanType || !taste) {
      throw createHttpError(400, "beanType_and_taste_required");
    }

    amount = parseInt(amount, 10);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 2000) {
      throw createHttpError(400, "amount_out_of_range");
    }

    await this.logRepository.add({
      userId: userPayload.sub,
      displayName: displayName || userPayload.name || null,
      pictureUrl: userPayload.picture || null,
      beanType,
      taste,
      amount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { ok: true };
  }

  async listLogs(userPayload) {
    return this.logRepository.listByUser(userPayload.sub, 50);
  }
}

module.exports = { LogService };
