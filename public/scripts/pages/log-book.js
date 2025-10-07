import { renderNotice, clearNotice } from "../ui/feedback.js";
import { withButtonLoading } from "../ui/loading.js";
import { qs } from "../utils/dom.js";
import { renderLogList } from "../features/logbook.js";
import { bootstrapSecurePage } from "../app/bootstrap.js";
import { handleBootstrapError, updateWelcomeName } from "../app/page.js";

async function bootstrap() {
  const feedback = qs("#feedback");
  let app;
  try {
    app = await bootstrapSecurePage({ liffKey: "log" });
  } catch (error) {
    handleBootstrapError(error, {
      feedbackEl: feedback,
      missingConfigMessage: "必要な接続情報が設定されていません。管理者にお問い合わせください。",
    });
  }

  if (!app) return;

  const { apiClient, profile } = app;
  const api = apiClient;

  const form = qs("#logForm");
  const listContainer = qs("#logList");
  const summaryName = qs("#memberName");

  updateWelcomeName(summaryName, profile);

  async function refresh() {
    renderNotice(listContainer, { variant: "info", message: "読み込み中です..." });
    try {
      const logs = await api.request("/logs");
      renderLogList(listContainer, logs);
    } catch (error) {
      console.error(error);
      const errorId = error?.requestId ? ` (エラーID: ${error.requestId})` : "";
      renderNotice(listContainer, {
        variant: "error",
        title: "取得に失敗しました",
        message: `ネットワーク環境を確認し、再読み込みしてください。${errorId}`,
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
        const errorId = error?.requestId ? ` (エラーID: ${error.requestId})` : "";
        renderNotice(feedback, {
          variant: "error",
          title: "保存できませんでした",
          message: `通信状況を確認して、再度お試しください。${errorId}`,
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
