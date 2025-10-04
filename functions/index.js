// functions/index.js
const functions = require("firebase-functions");
const express = require("express");
const line = require("@line/bot-sdk");
const admin = require("firebase-admin");
const cors = require("cors");
// Node18ならグローバルfetch可。Node16なら: const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

const CFG = functions.config();
const LINE_ACCESS_TOKEN = (CFG.line && CFG.line.channel_access_token) || process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_CHANNEL_SECRET = (CFG.line && CFG.line.channel_secret) || process.env.LINE_CHANNEL_SECRET;
const LINE_CHANNEL_ID = (CFG.line && CFG.line.channel_id) || process.env.LINE_CHANNEL_ID;

const lineConfig = { channelAccessToken: LINE_ACCESS_TOKEN, channelSecret: LINE_CHANNEL_SECRET };
const client = new line.Client(lineConfig);

const app = express();

// 必要なオリジンだけ許可（本番に合わせて置換）
const ALLOWED_ORIGINS = [
  "https://<your-hosting>.web.app",
  "https://<your-custom-domain>"
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json());

// LINE IDトークン検証
async function verifyLineIdToken(idToken) {
  if (!idToken) throw new Error("missing idToken");
  const params = new URLSearchParams({ id_token: idToken, client_id: LINE_CHANNEL_ID });
  const resp = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  if (!resp.ok) throw new Error(`verify ${resp.status} ${await resp.text()}`);
  const payload = await resp.json();
  if (!payload.sub) throw new Error("no sub");
  return payload; // { sub, name?, picture?, ... }
}

// LINE Webhook（署名検証はSDKが実施）
app.post("/webhook", line.middleware(lineConfig), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error("webhook error:", err);
      res.status(500).end();
    });
});

// コーヒーログ保存（本人）
app.post("/webhook-log", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const p = await verifyLineIdToken(idToken);
    const userId = p.sub;

    const { beanType, taste } = req.body || {};
    let { amount, displayName } = req.body || {};
    if (!beanType || !taste) return res.status(400).json({ error: "beanType/taste required" });

    amount = parseInt(amount, 10);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 2000) {
      return res.status(400).json({ error: "invalid amount" });
    }

    await db.collection("logs").add({
      userId,
      displayName: displayName || p.name || null,
      pictureUrl: p.picture || null,
      beanType, taste, amount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ ok: true });
  } catch (e) {
    console.error("webhook-log:", e.message);
    res.status(401).json({ error: "unauthorized" });
  }
});

// 診断結果保存（本人）
app.post("/webhook-diagnosis", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const p = await verifyLineIdToken(idToken);
    const userId = p.sub;

    const { type, scoreMap, displayName } = req.body || {};
    if (!type) return res.status(400).json({ error: "type required" });

    await db.collection("diagnosis").doc(userId).set({
      displayName: displayName || p.name || null,
      pictureUrl: p.picture || null,
      type, scoreMap: scoreMap || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.json({ ok: true });
  } catch (e) {
    console.error("webhook-diagnosis:", e.message);
    res.status(401).json({ error: "unauthorized" });
  }
});

// ログ取得（本人）
app.get("/logs", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const p = await verifyLineIdToken(idToken);
    const userId = p.sub;

    const snap = await db.collection("logs")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.error("logs:", e.message);
    res.status(401).json({ error: "unauthorized" });
  }
});

// 診断結果取得（本人）
app.get("/diagnosis", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const p = await verifyLineIdToken(idToken);
    const userId = p.sub;

    const snap = await db.collection("diagnosis").doc(userId).get();
    if (!snap.exists) return res.json({});
    res.json(snap.data());
  } catch (e) {
    console.error("diagnosis:", e.message);
    res.status(401).json({ error: "unauthorized" });
  }
});

// おすすめ豆一覧（公開でOK）
app.get("/recommendations", async (_req, res) => {
  try {
    const snapshot = await db.collection("recommendations").get();
    const map = {};
    snapshot.forEach(d => (map[d.id] = d.data()));
    res.json(map);
  } catch (e) {
    console.error("recommendations:", e.message);
    res.status(500).json({ error: "failed to load" });
  }
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
        displayName, pictureUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true }).then(() =>
        client.replyMessage(event.replyToken, {
          type: "text", text: `こんにちは、${displayName}さん！情報を記録しました☕`,
        })
      );
    })
    .catch((err) => {
      console.error("getProfile error", err);
      return client.replyMessage(event.replyToken, {
        type: "text", text: "プロフィールの取得に失敗しました。",
      });
    });
}

exports.app = functions.region("asia-northeast1").https.onRequest(app);
