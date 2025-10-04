import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// LIFF初期化
const LIFF_ID = '2007510292-EGZenBxd';

const firebaseConfig = {
  apiKey: "AIzaSyBW_0l5uScxeMeOtxq4WV2QKbCtkaqJMak",
  authDomain: "tanycoffee.firebaseapp.com",
  projectId: "tanycoffee"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const typeData = {
  SENSE: { emoji: '🎨', name: 'センステイスター', tagline: '感性で味わう、アートな一杯。' },
  ANALYTIC: { emoji: '📊', name: 'アナリティカルブリュワー', tagline: 'データと理論で淹れる、知的な一杯。' },
  EMOTIONAL: { emoji: '💞', name: 'エモーショナルドリンカー', tagline: '心のままに、寄り添う一杯。' },
  CURIOUS: { emoji: '🧪', name: 'キュリオシティシーカー', tagline: '新しい味に出会う冒険者。' },
  CASUAL: { emoji: '☕️', name: 'カジュアルコーヒーラバー', tagline: 'いつでもどこでも、気軽な一杯。' },
  TRADITIONAL: { emoji: '🏠', name: 'トラディショナルブリュワー', tagline: '変わらない安心感、定番の美味しさ。' }
};

async function renderResults() {
  const params = new URLSearchParams(window.location.search);
  let types = params.get('type')?.split('+') || [];
  const container = document.getElementById('resultsContainer');

  // typeパラメータがない場合：Firestoreから取得
  if (types.length === 0 || !params.get('type')) {
    // LIFFログイン（ユーザー判別）
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }
    const profile = await liff.getProfile();
    const userId = profile.userId;

    // Firestoreから診断情報取得
    const ref = doc(db, 'diagnosis', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      container.innerHTML = '<p class="body">診断結果が見つかりませんでした。<br><a href="diagnosis.html">診断を始める</a></p>';
      return;
    }
    const data = snap.data();
    types = data.type ? data.type.split('+') : [];
  }

  // おすすめ豆のデータ取得
  const snapshot = await getDocs(collection(db, 'recommendations'));
  const beanMap = {};
  snapshot.forEach(doc => beanMap[doc.id] = doc.data());

  // 結果表示
  types.forEach(type => {
    const t = typeData[type];
    const bean = beanMap[type];
    if (!t) return;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header" style="text-align:center;">
        <div class="h1">${t.emoji}</div>
        <h3 class="h3">${t.name}</h3>
        <p class="body-sm" style="color: var(--gray-600);">「${t.tagline}」</p>
      </div>
      <div class="card-content">
        ${
          bean
            ? `<h4 class="h4">おすすめの豆：${bean.name}（${bean.roast}）</h4>
               <p class="body">${bean.description}</p>
               <a href="${bean.link}" target="_blank" class="btn btn-outline">商品を見る</a>`
            : '<p class="body">おすすめの豆は現在準備中です。</p>'
        }
      </div>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', renderResults);
