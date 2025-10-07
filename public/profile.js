// public/profile.js
// 診断/結果と同じ LIFF（アプリ内ページなので DIAG を利用）
const env = window.ENV || {};
const LIFF_ID = env?.LIFF?.DIAG || env?.LIFF_ID;

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
    const session = await LiffHelper.ensureLogin({
      liffId: LIFF_ID,
      redirectUri: window.location.href
    });
    if (session.redirected) return;
    if (!session.loggedIn) {
      document.getElementById('notice').style.display = 'flex';
      return;
    }

    const prof = await liff.getProfile();
    nameEl.textContent = prof.displayName || '不明';
    avatarEl.src = prof.pictureUrl || 'https://placehold.co/80x80';

    uidEl.textContent = `ユーザーID: ${maskUserId(prof.userId)}`;

    const idToken = liff.getIDToken();
    tokenInfoEl.textContent = idToken ? `IDトークン: 取得済み` : 'IDトークン: 未取得';
  } catch (e) {
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
