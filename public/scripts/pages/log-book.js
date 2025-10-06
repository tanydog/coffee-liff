import { appConfig, assertConfig } from "../core/env.js";
import { LiffClient } from "../core/liff-client.js";
import { ApiClient } from "../core/api-client.js";
import { renderNotice, clearNotice } from "../ui/feedback.js";
import { withButtonLoading } from "../ui/loading.js";
import { qs } from "../utils/dom.js";
import { renderLogList } from "../features/logbook.js";

async function bootstrap() {
  try {
    assertConfig(["liff.log", "apiBase"]);
  } catch (error) {
    renderNotice(qs("#feedback"), {
      variant: "error",
      title: "設定エラー",
      message: "必要な接続情報が設定されていません。管理者にお問い合わせください。",
    });
    throw error;
  }

  const liffClient = new LiffClient({ liffId: appConfig.liff.log });
  const api = new ApiClient({ baseUrl: appConfig.apiBase, tokenProvider: () => liffClient.getIdToken() });

  await liffClient.ensureLogin();
  const profile = await liffClient.getProfile();

  const form = qs("#logForm");
  const feedback = qs("#feedback");
  const listContainer = qs("#logList");
  const summaryName = qs("#memberName");

  if (summaryName && profile?.displayName) {
    summaryName.textContent = profile.displayName;
  }

  async function refresh() {
    renderNotice(listContainer, { variant: "info", message: "読み込み中です..." });
    try {
      const logs = await api.request("/logs");
      renderLogList(listContainer, logs);
    } catch (error) {
      console.error(error);
      renderNotice(listContainer, {
        variant: "error",
        title: "取得に失敗しました",
        message: "ネットワーク環境を確認し、再読み込みしてください。",
      });
    }
  }

  await refresh();

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    clearNotice(feedback);

    const beanType = qs("[name='beanType']", form)?.value.trim();
    const taste = qs("[name='taste']", form)?.value.trim();
    const amount = parseInt(qs("[name='amount']", form)?.value || "", 10);

    if (!beanType || !taste || !Number.isFinite(amount) || amount <= 0 || amount > 2000) {
      renderNotice(feedback, {
        variant: "warning",
        title: "入力を確認してください",
        message: "豆の種類、味わい、量（1〜2000ml）を正しく入力してください。",
      });
      return;
    }

    const submitButton = qs("button[type='submit']", form);
    withButtonLoading(submitButton, async () => {
      try {
        await api.request("/webhook-log", {
          method: "POST",
          body: { beanType, taste, amount, displayName: profile?.displayName },
        });
        form.reset();
        renderNotice(feedback, {
          variant: "success",
          title: "保存しました",
          message: "コーヒーログを記録しました。",
        });
        await refresh();
      } catch (error) {
        console.error(error);
        renderNotice(feedback, {
          variant: "error",
          title: "保存できませんでした",
          message: "通信状況を確認して、再度お試しください。",
        });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((error) => {
    console.error("log page bootstrap error", error);
  });
});
