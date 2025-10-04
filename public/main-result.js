// public/main-result.js
const LIFF_ID = window.ENV?.LIFF?.DIAG;   // 診断用 LIFF
const API_BASE = window.ENV?.API_BASE;    // Functions のベースURL

if (!LIFF_ID || !API_BASE) {
  console.error("config.js の設定が不足しています");
  alert("設定が不足しています。管理者に連絡してください。");
}

const typeData = {
  SENSE:{emoji:'🎨',name:'センステイスター',tagline:'感性で味わう、アートな一杯。'},
  ANALYTIC:{emoji:'📊',name:'アナリティカルブリュワー',tagline:'データと理論で淹れる、知的な一杯。'},
  EMOTIONAL:{emoji:'💞',name:'エモーショナルドリンカー',tagline:'心のままに、寄り添う一杯。'},
  CURIOUS:{emoji:'🧪',name:'キュリオシティシーカー',tagline:'新しい味に出会う冒険者。'},
  CASUAL:{emoji:'☕️',name:'カジュアルコーヒーラバー',tagline:'いつでもどこでも、気軽な一杯。'},
  TRADITIONAL:{emoji:'🏠',name:'トラディショナルブリュワー',tagline:'変わらない安心感、定番の美味しさ。'}
};

async function renderResults() {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = '<div class="body">読み込み中...</div>';

  try {
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isLoggedIn()) { liff.login(); return; }
    const idToken = liff.getIDToken();
    if (!idToken) throw new Error("missing idToken");

    const [diagRes, recRes] = await Promise.all([
      fetch(`${API_BASE}/diagnosis`, { headers: { Authorization: `Bearer ${idToken}` } }),
      fetch(`${API_BASE}/recommendations`)
    ]);
    if (!diagRes.ok) throw new Error(`diagnosis HTTP ${diagRes.status}`);
    if (!recRes.ok) throw new Error(`recommendations HTTP ${recRes.status}`);

    const diag = await diagRes.json();
    const beanMap = await recRes.json();

    if (!diag || !diag.type) {
      container.innerHTML = '<p class="body">診断結果が見つかりませんでした。<br><a href="diagnosis.html">診断を始める</a></p>';
      return;
    }

    const types = Array.isArray(diag.type)
      ? diag.type
      : String(diag.type).split('+').filter(Boolean);

    container.innerHTML = "";
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
          ${bean ? `
            <h4 class="h4">おすすめの豆：${bean.name}（${bean.roast}）</h4>
            <p class="body">${bean.description}</p>
            <a href="${bean.link}" target="_blank" class="btn btn-outline">商品を見る</a>`
          : '<p class="body">おすすめの豆は現在準備中です。</p>'}
        </div>`;
      container.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p class="body">診断結果の取得に失敗しました。</p>';
  }
}
document.addEventListener('DOMContentLoaded', renderResults);
