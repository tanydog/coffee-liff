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
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userId = event.source.userId;

  // LINEのプロフィール情報を取得
  return client.getProfile(userId)
    .then(profile => {
      const { displayName, pictureUrl } = profile;

      // Firestoreに保存
      return db.collection('users').doc(userId).set({
        displayName,
        pictureUrl,
        createdAt: new Date()
      }, { merge: true }) // 既存ドキュメントがある場合は上書きせずに更新
      .then(() => {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: `こんにちは、${displayName}さん！情報を記録しました☕`
        });
      });
    })
    .catch(err => {
      console.error('ユーザー情報取得エラー', err);
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'プロフィールの取得に失敗しました。'
      });
    });
}

app.listen(3000, () => {
  console.log('listening on 3000');
});
