const express = require('express');
const line = require('@line/bot-sdk');
const admin = require('firebase-admin');
const serviceAccount = require('./tanycoffee-firebase-adminsdk-fbsvc-2c3a74b43b'); // ← Firebaseからダウンロードした鍵を指定

// Firebase 初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// LINE設定
const config = {
  channelAccessToken: 'I/zeDLw7y0rEXZJWAOlN7VCV/OxdBSq+pg6aYlDUJb7qIDTYSoP5EuYM2jTMixnsu+8U+4ke0cuPtr9i2JHW/TK/uuRHvnRO5OzZGB7vMn3YiYUeD6GRF6ANzvGsG7uot83yNCEg08xlK6OkeD6YIwdB04t89/1O/w1cDnyilFU=',
  channelSecret: '35234cf09a71d1c6d89a68e489071768'
};
const client = new line.Client(config);
const app = express();

// Webhookハンドラ
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// イベント処理
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userId = event.source.userId;

  // Firestore にユーザー情報を保存（既存なら上書き）
  await db.collection('users').doc(userId).set({
    registeredAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // 応答メッセージ
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `ユーザーID ${userId} を登録しました！☕`
  });
}

app.listen(3000, () => {
  console.log('listening on 3000');
});
