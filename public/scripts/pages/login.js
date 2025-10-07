import { renderNotice } from "../ui/feedback.js";
import { withButtonLoading } from "../ui/loading.js";
import { qs } from "../utils/dom.js";
import { bootstrapPublicPage } from "../app/bootstrap.js";
import { handleBootstrapError } from "../app/page.js";

async function bootstrap() {
  const feedback = qs("#feedback");
  const loginButton = qs("#loginButton");

  let app;
  try {
    app = await bootstrapPublicPage({ liffKey: "login" });
  } catch (error) {
    handleBootstrapError(error, {
      feedbackEl: feedback,
      missingConfigMessage: "ログイン設定が無効です。管理者にお問い合わせください。",
    });
  }

  if (!app) return;

  const { liffClient } = app;

  try {
    if (liffClient) {
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
        const errorId = error?.requestId ? ` (エラーID: ${error.requestId})` : "";
        renderNotice(feedback, {
          variant: "error",
          title: "ログインに失敗しました",
          message: `通信状況を確認して再度お試しください。${errorId}`,
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
