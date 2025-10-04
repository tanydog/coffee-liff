// public/profile.js
// 診断/結果と同じ LIFF（アプリ内ページなので DIAG を利用）
const LIFF_ID = window.ENV?.LIFF?.DIAG;

async function ensureLogin() {
  await liff.init({ liffId: LIFF_ID });
  if (!liff.isLoggedIn()) {
    document.getElementById('notice').style.display = 'flex';
    // 直接ログインへ誘導（必要ならボタンを別で用意してもOK）
    liff.login();
    throw new Error('redirecting');
  }
}

function maskUserId(uid) {
  if (!uid) return '';
  if (uid.length <= 10) return uid;
  return `${uid.slice(0,6)}…${uid.slice(-4)}`;
}

async function loadProfile() {
  const nameEl = document.getElementById('displayName');
  const avatarEl = document.getElementById('avatar');
  const uidEl = document.getElementById('userIdMasked');
  const tokenInfoEl = document.getElementById('tokenInfo');

  try {
    await ensureLogin();

    const prof = await liff.getProfile();
    nameEl.textContent = prof.displayName || '不明';
    avatarEl.src = prof.pictureUrl || 'https://placehold.co/80x80';

    uidEl.textContent = `ユーザーID: ${maskUserId(prof.userId)}`;

    const idToken = liff.getIDToken();
    tokenInfoEl.textContent = idToken ? `IDトークン: 取得済み` : 'IDトークン: 未取得';
  } catch (e) {
    if (String(e).includes('redirecting')) return;
    console.error(e);
    document.getElementById('notice').style.display = 'flex';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();

  document.getElementById('copyUserId').addEventListener('click', async () => {
    try {
      const prof = await liff.getProfile();
      await navigator.clipboard.writeText(prof.userId);
      alert('ユーザーIDをコピーしました');
    } catch (e) {
      alert('コピーに失敗しました');
    }
  });

  document.getElementById('refreshBtn').addEventListener('click', () => {
    loadProfile();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    try {
      if (liff.isLoggedIn()) {
        liff.logout();
      }
    } finally {
      // ログアウト後にログインページへ遷移（必要に応じて変更）
      window.location.href = '/login.html';
    }
  });
});
