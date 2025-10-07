// public/main-result.js
const env = window.ENV || {};
const LIFF_ID = env?.LIFF?.DIAG || env?.LIFF_ID;   // 診断用 LIFF
const API_BASE = env?.API_BASE;    // Functions のベースURL

if (!LIFF_ID || !API_BASE) {
  console.error("config.js の設定が不足しています (ENV.LIFF.DIAG または ENV.LIFF_ID / ENV.API_BASE)");
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

function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('ja-JP');
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' });
}

function renderInsightSummary(insight) {
  const summaryEl = document.getElementById('insightSummary');
  const trendEl = document.getElementById('insightTrend');
  const beanEl = document.getElementById('beanBreakdown');

  if (!summaryEl || !trendEl || !beanEl) return;

  if (!insight || insight.totalCups === 0) {
    summaryEl.innerHTML = '<p class="body">まだ十分なデータがありません。コーヒーを記録すると傾向が表示されます。</p>';
    trendEl.innerHTML = '';
    beanEl.innerHTML = '';
    return;
  }

  summaryEl.innerHTML = `
    <div class="metric-card">
      <span class="metric-label">合計カップ数</span>
      <span class="metric-value">${formatNumber(insight.totalCups)}杯</span>
      <span class="metric-subtext">${formatDate(insight.rangeStart)}〜${formatDate(insight.rangeEnd)}</span>
    </div>
    <div class="metric-card">
      <span class="metric-label">総量</span>
      <span class="metric-value">${formatNumber(insight.totalVolume)}ml</span>
      <span class="metric-subtext">1杯あたり平均 ${formatNumber(insight.avgCupVolume)}ml / 1日 ${formatNumber(insight.avgDailyVolume)}ml</span>
    </div>
    <div class="metric-card">
      <span class="metric-label">アクティブ日数</span>
      <span class="metric-value">${formatNumber(insight.daysActive)}日</span>
      <span class="metric-subtext">直近の連続記録 ${formatNumber(insight.streakDays)}日</span>
    </div>
    <div class="metric-card">
      <span class="metric-label">人気の豆</span>
      <span class="metric-value">${insight.favouriteBean?.name || '記録なし'}</span>
      <span class="metric-subtext">${insight.favouriteBean ? `${insight.favouriteBean.count}回注文` : '記録を増やして傾向を確認'}</span>
    </div>`;

  if (Array.isArray(insight.volumeByDay) && insight.volumeByDay.length > 0) {
    const maxVolume = insight.volumeByDay.reduce((max, d) => Math.max(max, d.totalVolume), 0) || 1;
    const latestSeven = insight.volumeByDay.slice(-7);
    trendEl.innerHTML = latestSeven.map((item) => `
      <div class="trend-item">
        <div class="trend-header">
          <span>${formatDate(item.date)}</span>
          <span>${formatNumber(item.cups)}杯 / ${formatNumber(item.totalVolume)}ml</span>
        </div>
        <div class="progress-bar" role="progressbar" aria-valuenow="${item.totalVolume}" aria-valuemin="0" aria-valuemax="${maxVolume}">
          <div class="progress-fill" style="width:${Math.min(100, Math.max(6, Math.round((item.totalVolume / maxVolume) * 100)))}%"></div>
        </div>
      </div>
    `).join('');
  } else {
    trendEl.innerHTML = '<p class="body-sm">直近のデータがありません。</p>';
  }

  if (Array.isArray(insight.beanBreakdown) && insight.beanBreakdown.length > 0) {
    beanEl.innerHTML = insight.beanBreakdown.slice(0, 5).map((item) => `
      <div class="bean-item">
        <span>${item.name}</span>
        <span class="bean-count">${item.count}回</span>
      </div>
    `).join('');
  } else {
    beanEl.innerHTML = '<p class="body-sm">豆の記録がまだありません。</p>';
  }
}

function renderEngagementPlans(insight) {
  const container = document.getElementById('engagementGrid');
  if (!container) return;
  const plans = [];

  const avgDailyVolume = insight?.avgDailyVolume || 0;
  const streak = insight?.streakDays || 0;
  const favouriteBean = insight?.favouriteBean?.name || '人気銘柄';

  plans.push({
    title: 'パートナー Success ベーシック',
    price: '月額 ¥2,980',
    description: 'ログデータと顧客診断を一元管理。スタッフの運用負担を抑えつつ、確実に記録を積み上げます。',
    features: [
      `平均 ${formatNumber(avgDailyVolume)}ml/日 の消費傾向を自動レポート`,
      'LINE 連携 CRM と顧客セグメントを自動生成',
      'パフォーマンスダッシュボードと CSV エクスポート',
    ],
    cta: '無料トライアルを申し込む'
  });

  plans.push({
    title: 'リピート強化プレミアム',
    price: '売上の 3% 成功報酬',
    description: `連続記録 ${formatNumber(streak)}日以上の優良顧客に、${favouriteBean} を軸にしたリワードを自動提案。`,
    features: [
      'AI クーポン配信とパーソナルメッセージ',
      '会員ステージ別のロイヤルティ KPI モニタリング',
      'POS・EC 連携による在庫最適化アラート'
    ],
    cta: '営業担当に相談する'
  });

  container.innerHTML = plans.map((plan) => `
    <div class="plan-card">
      <h3 class="h3" style="margin-bottom:0;">${plan.title}</h3>
      <div class="plan-price">${plan.price}</div>
      <p class="body-sm">${plan.description}</p>
      <div>
        ${plan.features.map((feature) => `<div class="plan-feature"><span>✔️</span><span>${feature}</span></div>`).join('')}
      </div>
      <button class="btn btn-secondary btn-full">${plan.cta}</button>
    </div>
  `).join('');
}

async function renderResults() {
  const container = document.getElementById('resultsContainer');
  container.innerHTML = '<div class="body">読み込み中...</div>';

  try {
    await liff.init({ liffId: LIFF_ID });
    if (!liff.isLoggedIn()) { liff.login(); return; }
    const idToken = liff.getIDToken();
    if (!idToken) throw new Error("missing idToken");

    const [diagRes, recRes, insightRes] = await Promise.all([
      fetch(`${API_BASE}/diagnosis`, { headers: { Authorization: `Bearer ${idToken}` } }),
      fetch(`${API_BASE}/recommendations`),
      fetch(`${API_BASE}/insights`, { headers: { Authorization: `Bearer ${idToken}` } })
    ]);
    if (!diagRes.ok) throw new Error(`diagnosis HTTP ${diagRes.status}`);
    if (!recRes.ok) throw new Error(`recommendations HTTP ${recRes.status}`);
    if (!insightRes.ok) throw new Error(`insights HTTP ${insightRes.status}`);

    const diag = await diagRes.json();
    const beanMap = await recRes.json();
    const insight = await insightRes.json();

    renderInsightSummary(insight);
    renderEngagementPlans(insight);

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
