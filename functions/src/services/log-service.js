const { admin } = require("../firebase");

class LogService {
  constructor({ logRepository, logger }) {
    this.logRepository = logRepository;
    this.logger = logger;
  }

  async recordLog(userPayload, logInput) {
    await this.logRepository.add({
      userId: userPayload.sub,
      displayName: logInput.displayName || userPayload.name || null,
      pictureUrl: userPayload.picture || null,
      beanType: logInput.beanType,
      taste: logInput.taste,
      amount: logInput.amount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    this.logger?.info("log_recorded", {
      userId: userPayload.sub,
      beanType: logInput.beanType,
    });

    return { ok: true };
  }

  async listLogs(userPayload) {
    const logs = await this.logRepository.listByUser(userPayload.sub, 50);
    this.logger?.info("log_listed", { userId: userPayload.sub, count: logs.length });
    return logs;
  }
}

module.exports = { LogService };
