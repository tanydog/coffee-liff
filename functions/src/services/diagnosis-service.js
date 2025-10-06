const { admin } = require("../firebase");
const { createHttpError } = require("../utils/http-error");

class DiagnosisService {
  constructor({ diagnosisRepository }) {
    this.diagnosisRepository = diagnosisRepository;
  }

  async saveDiagnosis(userPayload, requestBody) {
    const { type, scoreMap, displayName } = requestBody || {};
    if (!type) {
      throw createHttpError(400, "type_required");
    }

    await this.diagnosisRepository.save(userPayload.sub, {
      displayName: displayName || userPayload.name || null,
      pictureUrl: userPayload.picture || null,
      type,
      scoreMap: scoreMap || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { ok: true };
  }

  async getDiagnosis(userPayload) {
    return this.diagnosisRepository.getByUser(userPayload.sub) || {};
  }
}

module.exports = { DiagnosisService };
