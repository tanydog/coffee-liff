const functions = require("firebase-functions");
const express = require("express");
const line = require("@line/bot-sdk");
const admin = require("firebase-admin");
const cors = require("cors");

// Firebase Admin 初期化（serviceAccount不要。Cloud Functions上ならOK）
admin.initializeApp();
const db = admin.firestore();

// LINE設定
const config = {
  channelAccessToken: "I/zeDLw7y0rEXZJWAOlN7VCV/OxdBSq+pg6aYlDUJb7qIDTYSoP5EuYM2jTMixnsu+8U+4ke0cuPtr9i2JHW/TK/uuRHvnRO5OzZGB7vMn3YiYUeD6GRF6ANzvGsG7uot83yNCEg08xlK6OkeD6YIwdB04t89/1O/w1cDnyilFU=",
  channelSecret: "35234cf09a71d1c6d89a68e489071768",
};
const client = new line.Client(config);

// Expressアプリ
const app = express();
app.use(cors({ origin: true }));

// Webhookハンドラ
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.use(express.json());

// 診断結果を Firestore に保存
app.post("/webhook-diagnosis", (req, res) => {
  const { userId, displayName, type, scoreMap } = req.body;
  if (!userId || !displayName || !type) {
    console.error("❗必須フィールドが不足:", req.body);
    return res.status(400).json({ status: "error", message: "Missing fields" });
  }
  db.collection("diagnosis").doc(userId).set({
    displayName,
    type,
    scoreMap,
    createdAt: new Date(),
  })
    .then(() => res.json({ status: "success" }))
    .catch((err) => {
      console.error("❌ Firestore 保存エラー:", err);
      res.status(500).json({ status: "error", message: err.message });
    });
});

// コーヒーログ保存
app.post("/webhook-log", (req, res) => {
  const { userId, displayName, beanType, taste, amount } = req.body;
  if (!userId || !displayName || !beanType || !taste || !amount) {
    return res.status(400).json({ status: "error", message: "Missing fields" });
  }
  db.collection("logs").add({
    userId,
    displayName,
    beanType,
    taste,
    amount: parseInt(amount),
    createdAt: new Date(),
  })
    .then(() => res.json({ status: "success" }))
    .catch((err) => {
      console.error("Firestore保存エラー:", err);
      res.status(500).json({ status: "error" });
    });
});

// LINEメッセージイベント
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }
  const userId = event.source.userId;
  return client.getProfile(userId)
    .then((profile) => {
      const { displayName, pictureUrl } = profile;
      return db.collection("users").doc(userId).set({
        displayName,
        pictureUrl,
        createdAt: new Date(),
      }, { merge: true }).then(() => {
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: `こんにちは、${displayName}さん！情報を記録しました☕`,
        });
      });
    })
    .catch((err) => {
      console.error("ユーザー情報取得エラー", err);
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: "プロフィールの取得に失敗しました。",
      });
    });
}

// コーヒーログ取得
app.get("/logs", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const snapshot = await db.collection("logs")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(logs);
  } catch (err) {
    console.error("ログ取得エラー:", err);
    res.status(500).json({ error: "ログの取得に失敗しました" });
  }
});

// Functionsとしてエクスポート
exports.app = functions.region('asia-northeast1').https.onRequest(app);
