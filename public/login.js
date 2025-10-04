// public/login.js
const LIFF_ID = window.ENV.LIFF_ID;

document.addEventListener("DOMContentLoaded", async () => {
  const loginBtn = document.getElementById("loginButton");
  const loadingBtn = document.getElementById("loadingBtn");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  const showLoading = (isLoading) => {
    if (!loginBtn || !loadingBtn) return;
    loginBtn.style.display = isLoading ? "none" : "inline-flex";
    loadingBtn.style.display = isLoading ? "inline-flex" : "none";
  };
  const showError = (msg) => {
    if (!errorMessage || !successMessage) return;
    errorMessage.textContent = msg;
    errorMessage.style.display = "block";
    successMessage.style.display = "none";
  };
  const showSuccess = (msg) => {
    if (!errorMessage || !successMessage) return;
    successMessage.textContent = msg;
    successMessage.style.display = "block";
    errorMessage.style.display = "none";
  };

  async function handleLoginSuccess() {
    try {
      const idToken = liff.getIDToken();
      if (!idToken) throw new Error("ID token missing");

      const profile = await liff.getProfile().catch(() => null);
      showSuccess(`ようこそ${profile?.displayName ? `、${profile.displayName}` : ""}！診断を開始します...`);

      setTimeout(() => { window.location.href = "/diagnosis.html"; }, 1500);
    } catch (err) {
      console.error("after login error:", err);
      showError("ユーザー情報の取得に失敗しました。");
      showLoading(false);
    }
  }

  try {
    await liff.init({ liffId: LIFF_ID });
    if (liff.isLoggedIn()) await handleLoginSuccess();

    loginBtn?.addEventListener("click", async () => {
      showLoading(true);
      try {
        if (!liff.isLoggedIn()) { liff.login(); return; }
        await handleLoginSuccess();
      } catch (err) {
        console.error("login error:", err);
        showError("ログインに失敗しました。");
        showLoading(false);
      }
    });
  } catch (err) {
    console.error("LIFF初期化エラー:", err);
    showError("LIFFの初期化に失敗しました。");
  }
});
