const { admin } = require("../firebase");

class UserService {
  constructor({ db, logger }) {
    this.collection = db.collection("users");
    this.logger = logger;
  }

  async upsertProfile(userId, profile) {
    const docRef = this.collection.doc(userId);
    const snapshot = await docRef.get();
    await docRef.set(
      {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    if (!snapshot.exists) {
      await docRef.set(
        { createdAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      this.logger?.info("user_created", { userId });
    }
    this.logger?.info("user_profile_updated", { userId });
  }
}

module.exports = { UserService };
