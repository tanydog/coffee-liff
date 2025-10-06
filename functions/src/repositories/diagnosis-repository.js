class DiagnosisRepository {
  constructor(db) {
    this.collection = db.collection("diagnosis");
  }

  async save(userId, payload) {
    return this.collection.doc(userId).set(payload, { merge: true });
  }

  async getByUser(userId) {
    const snapshot = await this.collection.doc(userId).get();
    if (!snapshot.exists) return null;
    return snapshot.data();
  }
}

module.exports = { DiagnosisRepository };
