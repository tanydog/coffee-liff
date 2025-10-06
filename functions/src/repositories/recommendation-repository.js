class RecommendationRepository {
  constructor(db) {
    this.collection = db.collection("recommendations");
  }

  async getAll() {
    const snapshot = await this.collection.get();
    const map = {};
    snapshot.forEach((doc) => {
      map[doc.id] = doc.data();
    });
    return map;
  }
}

module.exports = { RecommendationRepository };
