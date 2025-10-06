import { appConfig, assertConfig } from "../core/env.js";
import { LiffClient } from "../core/liff-client.js";
import { renderNotice } from "../ui/feedback.js";
import { withButtonLoading } from "../ui/loading.js";
import { qs } from "../utils/dom.js";

async function bootstrap() {
  const feedback = qs("#feedback");
  const loginButton = qs("#loginButton");

  try {
    assertConfig(["liff.login"]);
  } catch (error) {
    renderNotice(feedback, {
      variant: "error",
      title: "設定エラー",
      message: "ログイン設定が無効です。管理者にお問い合わせください。",
    });
    throw error;
  }

  const liffClient = new LiffClient({ liffId: appConfig.liff.login, autoLogin: false });

  try {
    await liffClient.init();
    if (liff.isLoggedIn()) {
      renderNotice(feedback, {
        variant: "success",
        title: "ログイン済みです",
        message: "診断に進みます。",
      });
      setTimeout(() => {
        window.location.href = "/diagnosis.html";
      }, 800);
    }
  } catch (error) {
    if (String(error).includes("redirecting_to_login")) return;
    console.error(error);
    renderNotice(feedback, {
      variant: "error",
      title: "LIFFの初期化に失敗しました",
      message: "アプリを再起動してもう一度お試しください。",
    });
    return;
  }

  loginButton?.addEventListener("click", () => {
    withButtonLoading(loginButton, async () => {
      try {
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }
        renderNotice(feedback, {
          variant: "success",
          title: "ログイン済みです",
          message: "診断に進みます。",
        });
        setTimeout(() => {
          window.location.href = "/diagnosis.html";
        }, 800);
      } catch (error) {
        console.error(error);
        renderNotice(feedback, {
          variant: "error",
          title: "ログインに失敗しました",
          message: "通信状況を確認して再度お試しください。",
        });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((error) => {
    console.error("login bootstrap error", error);
  });
});
