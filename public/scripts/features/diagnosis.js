export const typeCatalog = {
  SENSE: { emoji: "🎨", name: "センステイスター", tagline: "感性で味わう、アートな一杯。" },
  ANALYTIC: { emoji: "📊", name: "アナリティカルブリュワー", tagline: "データと理論で淹れる、知的な一杯。" },
  EMOTIONAL: { emoji: "💞", name: "エモーショナルドリンカー", tagline: "心のままに、寄り添う一杯。" },
  CURIOUS: { emoji: "🧪", name: "キュリオシティシーカー", tagline: "新しい味に出会う冒険者。" },
  CASUAL: { emoji: "☕️", name: "カジュアルコーヒーラバー", tagline: "いつでもどこでも、気軽な一杯。" },
  TRADITIONAL: { emoji: "🏠", name: "トラディショナルブリュワー", tagline: "変わらない安心感、定番の美味しさ。" },
};

export function parseType(type) {
  if (!type) return [];
  if (Array.isArray(type)) return type;
  return String(type)
    .split("+")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildDiagnosisCards(types, beanMap = {}) {
  return types.map((type) => {
    const catalog = typeCatalog[type];
    const bean = beanMap[type];
    if (!catalog) return "";
    const beanHtml = bean
      ? `
        <div class="recommendation">
          <h4>${bean.name}（${bean.roast}）</h4>
          <p>${bean.description || ""}</p>
          <a href="${bean.link}" target="_blank" rel="noreferrer" class="btn btn-outline">商品を見る</a>
        </div>
      `
      : '<p class="body-sm muted">おすすめの豆情報は準備中です。</p>';

    return `
      <article class="card diagnosis-card">
        <div class="diagnosis-identity">
          <div class="diagnosis-emoji">${catalog.emoji}</div>
          <h3>${catalog.name}</h3>
          <p class="body-sm">${catalog.tagline}</p>
        </div>
        ${beanHtml}
      </article>
    `;
  });
}
