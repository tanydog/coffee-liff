const { admin } = require("../firebase");

class DiagnosisService {
  constructor({ diagnosisRepository, logger }) {
    this.diagnosisRepository = diagnosisRepository;
    this.logger = logger;
  }

  async saveDiagnosis(userPayload, input) {
    await this.diagnosisRepository.save(userPayload.sub, {
      displayName: input.displayName || userPayload.name || null,
      pictureUrl: userPayload.picture || null,
      type: input.type,
      scoreMap: input.scoreMap || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    this.logger?.info("diagnosis_saved", { userId: userPayload.sub, type: input.type });

    return { ok: true };
  }

  async getDiagnosis(userPayload) {
    const result = (await this.diagnosisRepository.getByUser(userPayload.sub)) || {};
    if (result?.type) {
      this.logger?.info("diagnosis_loaded", { userId: userPayload.sub });
    }
    return result;
  }
}

module.exports = { DiagnosisService };
