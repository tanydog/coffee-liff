const LIFF_ID = "2007510292-Y5g8j4NO"; // 実際のLIFF IDに置き換え済み

document.addEventListener("DOMContentLoaded", async () => {
  const loginBtn = document.getElementById("loginButton");
  const loadingBtn = document.getElementById("loadingBtn");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  // 表示制御：ローディング切り替え
  const showLoading = (isLoading) => {
    loginBtn.style.display = isLoading ? "none" : "inline-flex";
    loadingBtn.style.display = isLoading ? "inline-flex" : "none";
  };

  // 表示制御：エラー表示
  const showError = (msg) => {
    errorMessage.textContent = msg;
    errorMessage.style.display = "block";
    successMessage.style.display = "none";
  };

  // 表示制御：成功表示
  const showSuccess = (msg) => {
    successMessage.textContent = msg;
    successMessage.style.display = "block";
    errorMessage.style.display = "none";
  };

  // ログイン成功後の処理
  const handleLoginSuccess = async () => {
    try {
      const profile = await liff.getProfile();
      console.log("👤 ユーザープロフィール:", profile);

      const userData = {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        loginDate: new Date().toISOString(),
      };

      // セッションストレージに保存
      sessionStorage.setItem("userData", JSON.stringify(userData));

      showSuccess("ログインに成功しました！診断を開始します...");

      setTimeout(() => {
        window.location.href = "/diagnosis.html";
      }, 2000);
    } catch (err) {
      console.error("❌ プロフィール取得エラー:", err);
      showError("ユーザー情報の取得に失敗しました。");
    } finally {
      showLoading(false);
    }
  };

  // 初期化とログイン処理
  try {
    await liff.init({ liffId: LIFF_ID });
    console.log("✅ LIFF initialized");

    if (liff.isLoggedIn()) {
      await handleLoginSuccess(); // すでにログイン済みの場合
    }

    // ログインボタンのクリックイベント
    loginBtn.addEventListener("click", async () => {
      showLoading(true);
      try {
        if (!liff.isLoggedIn()) {
          liff.login(); // 自動でリダイレクト
          return;
        }
        await handleLoginSuccess();
      } catch (err) {
        console.error("❌ ログインエラー:", err);
        showError("ログインに失敗しました。もう一度お試しください。");
        showLoading(false);
      }
    });
  } catch (err) {
    console.error("❌ LIFF初期化エラー:", err);
    showError("LIFFの初期化に失敗しました。");
  }
});
