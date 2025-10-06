class LogRepository {
  constructor(db) {
    this.collection = db.collection("logs");
  }

  async add(entry) {
    return this.collection.add(entry);
  }

  async listByUser(userId, limit = 50) {
    const snapshot = await this.collection
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = { LogRepository };
