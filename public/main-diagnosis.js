// public/main-diagnosis.js
const env = window.ENV || {};
const LIFF_ID = env?.LIFF?.DIAG || env?.LIFF_ID;
const API_BASE = env?.API_BASE;

if (!LIFF_ID || !API_BASE) {
  console.error("config.js の設定が不足しています (ENV.LIFF.DIAG または ENV.LIFF_ID / ENV.API_BASE)");
}

const typeData = {
  SENSE: { emoji: '🎨', name: 'センステイスター', tagline: '感性で味わう、アートな一杯。' },
  ANALYTIC: { emoji: '📊', name: 'アナリティカルブリュワー', tagline: 'データと理論で淹れる、知的な一杯。' },
  EMOTIONAL: { emoji: '💞', name: 'エモーショナルドリンカー', tagline: '心のままに、寄り添う一杯。' },
  CURIOUS: { emoji: '🧪', name: 'キュリオシティシーカー', tagline: '新しい味に出会う冒険者。' },
  CASUAL: { emoji: '☕️', name: 'カジュアルコーヒーラバー', tagline: 'いつでもどこでも、気軽な一杯。' },
  TRADITIONAL: { emoji: '🏠', name: 'トラディショナルブリュワー', tagline: '変わらない安心感、定番の美味しさ。' }
};

async function ensureLogin() {
  await liff.init({ liffId: LIFF_ID });
  if (!liff.isLoggedIn()) { liff.login(); throw new Error("redirecting"); }
}
function renderCards(container, types, beanMap) {
  container.innerHTML = "";
  types.forEach((type) => {
    const t = typeData[type];
    const bean = beanMap[type];
    if (!t) return;
    const card = document.createElement("div");
    card.className = "card";
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

async function renderResults() {
  if (!LIFF_ID || !API_BASE) {
    alert("設定が不足しています。管理者に連絡してください。");
    return;
  }

  const container = document.getElementById("resultsContainer");
  container.innerHTML = '<div class="body">読み込み中...</div>';

  try {
    await ensureLogin();
    const idToken = liff.getIDToken();
    if (!idToken) throw new Error("missing idToken");

    const res = await fetch(`${API_BASE}/diagnosis`, { headers: { Authorization: `Bearer ${idToken}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const diag = await res.json();

    if (!diag || !diag.type) {
      container.innerHTML = '<p class="body">診断結果が見つかりませんでした。<br><a href="diagnosis.html">診断を始める</a></p>';
      return;
    }

    const types = Array.isArray(diag.type) ? diag.type : String(diag.type).split("+").filter(Boolean);

    const recRes = await fetch(`${API_BASE}/recommendations`);
    if (!recRes.ok) throw new Error(`HTTP ${recRes.status}`);
    const beanMap = await recRes.json();

    renderCards(container, types, beanMap);
  } catch (err) {
    if (String(err).includes("redirecting")) return;
    console.error("診断表示エラー:", err);
    container.innerHTML = '<p class="body">診断結果の取得に失敗しました。</p>';
  }
}

document.addEventListener("DOMContentLoaded", renderResults);
