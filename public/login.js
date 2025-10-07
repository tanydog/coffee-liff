// public/login.js
const env = window.ENV || {};
const LIFF_ID = env?.LIFF?.LOGIN || env?.LIFF_ID;

document.addEventListener("DOMContentLoaded", async () => {
  if (!LIFF_ID) {
    console.error("config.js の設定が不足しています (ENV.LIFF.LOGIN または ENV.LIFF_ID)");
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
      errorMessage.textContent = "設定が不足しています。管理者に連絡してください。";
      errorMessage.style.display = "block";
    }
    return;
  }

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

  const redirectUri = window.location.href;

  try {
    const state = await LiffHelper.ensureLogin({
      liffId: LIFF_ID,
      autoLogin: false,
      redirectUri
    });

    if (state.redirected) return;
    if (state.loggedIn) {
      await handleLoginSuccess();
      return;
    }

    loginBtn?.addEventListener("click", async () => {
      showLoading(true);
      try {
        const loginState = await LiffHelper.ensureLogin({
          liffId: LIFF_ID,
          autoLogin: true,
          redirectUri
        });
        if (loginState.redirected) return;
        if (!loginState.loggedIn) {
          showError("ログインに失敗しました。");
          showLoading(false);
          return;
        }
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
