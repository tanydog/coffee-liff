const { admin } = require("../firebase");

class UserService {
  constructor({ db }) {
    this.collection = db.collection("users");
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
    }
  }
}

module.exports = { UserService };
