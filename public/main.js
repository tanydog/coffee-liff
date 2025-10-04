// public/main.js
const LIFF_ID = window.ENV.LIFF_ID;
const API_BASE = window.ENV.API_BASE;

async function ensureLogin() {
  await liff.init({ liffId: LIFF_ID });
  if (!liff.isLoggedIn()) {
    liff.login();
    throw new Error("redirecting");
  }
}
function setLoading(btn, on) {
  if (!btn) return;
  if (on) { btn.dataset.original = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="loading"></span> 送信中...`; }
  else { btn.disabled = false; if (btn.dataset.original) btn.innerHTML = btn.dataset.original; }
}

window.onload = async () => {
  try {
    await ensureLogin();
    const idToken = liff.getIDToken();
    const profile = await liff.getProfile().catch(() => null);
    const displayName = profile?.displayName || null;

    const form = document.getElementById("coffeeForm");
    const resultContainer = document.getElementById("result");
    const logsContainer = document.getElementById("logsList");

    await fetchLogs();

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const beanType = document.getElementById("beanType")?.value?.trim();
      const taste = document.getElementById("taste")?.value?.trim();
      const amount = document.getElementById("amount")?.value;
      const submitBtn = form.querySelector("button[type='submit']");

      const n = parseInt(amount, 10);
      if (!beanType || !taste || !Number.isFinite(n) || n <= 0 || n > 2000) {
        resultContainer.innerHTML = `<div class="alert alert-error"><span>⚠️</span><span>入力を確認してください（量は1〜2000ml）</span></div>`;
        return;
      }

      setLoading(submitBtn, true);
      try {
        const res = await fetch(`${API_BASE}/webhook-log`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
          body: JSON.stringify({ beanType, taste, amount: n, displayName }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await res.json();
        form.reset();
        resultContainer.innerHTML = `<div class="alert alert-success"><span>✅</span><span>コーヒーログを保存しました！</span></div>`;
        await fetchLogs();
      } catch (err) {
        console.error("送信エラー:", err);
        resultContainer.innerHTML = `<div class="alert alert-error"><span>❌</span><span>保存に失敗しました。</span></div>`;
      } finally {
        setLoading(submitBtn, false);
      }
    });

    async function fetchLogs() {
      if (!logsContainer) return;
      logsContainer.innerHTML = '<div class="body-sm">読み込み中...</div>';
      try {
        const res = await fetch(`${API_BASE}/logs`, { headers: { "Authorization": `Bearer ${idToken}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const logs = await res.json();
        if (!Array.isArray(logs) || logs.length === 0) {
          logsContainer.innerHTML = '<div class="body-sm">まだ記録がありません</div>';
          return;
        }
        logsContainer.innerHTML = logs.map(log => `
          <div class="card" style="margin-top:1rem;">
            <div style="display:flex; align-items:center; gap:1rem;">
              <img src="${log.pictureUrl || 'https://placehold.co/48x48'}" style="width:48px; height:48px; border-radius:50%;">
              <div>
                <div class="body-lg" style="font-weight:600;">${log.beanType}</div>
                <div class="body-sm">
                  ${log.createdAt?.__seconds ? new Date(log.createdAt.__seconds*1000).toLocaleString('ja-JP') : (log.createdAt?._seconds ? new Date(log.createdAt._seconds*1000).toLocaleString('ja-JP') : '')}
                </div>
              </div>
            </div>
            <div class="body" style="margin:0.5em 0;">${log.taste}</div>
            <div style="display:flex; gap:0.5rem;">
              <span class="tag">量 ${log.amount}ml</span>
            </div>
          </div>
        `).join('');
      } catch (err) {
        console.error("ログ取得エラー:", err);
        logsContainer.innerHTML = '<div class="alert alert-error">記録の取得に失敗しました</div>';
      }
    }
  } catch (e) {
    if (String(e).includes("redirecting")) return;
    console.error("LIFF初期化エラー:", e);
    alert("LIFFの初期化に失敗しました。");
  }
};
