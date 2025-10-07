import { renderNotice } from "../ui/feedback.js";
import { qs } from "../utils/dom.js";
import { buildDiagnosisCards, parseType } from "../features/diagnosis.js";
import { bootstrapSecurePage } from "../app/bootstrap.js";
import { handleBootstrapError, updateWelcomeName } from "../app/page.js";

async function bootstrap() {
  const container = qs("#resultsContainer");
  const feedback = qs("#feedback");

  renderNotice(container, { variant: "info", message: "診断結果を読み込み中です…" });

  let app;
  try {
    app = await bootstrapSecurePage({ liffKey: "diagnosis" });
  } catch (error) {
    handleBootstrapError(error, {
      feedbackEl: feedback,
      missingConfigMessage: "診断結果を取得できません。設定を確認してください。",
    });
  }

  if (!app) return;

  const { apiClient, profile } = app;
  const api = apiClient;
  updateWelcomeName(qs("#memberName"), profile);

  try {
    const [diagnosis, recommendations] = await Promise.all([
      api.request("/diagnosis"),
      api.request("/recommendations", { auth: false }),
    ]);

    if (!diagnosis || !diagnosis.type) {
      renderNotice(container, {
        variant: "warning",
        title: "診断が未実施です",
        message: '診断を行ってから結果を確認してください。<a href="/diagnosis.html">診断する</a>',
      });
      return;
    }

    const personas = parseType(diagnosis.type);
    const cards = buildDiagnosisCards(personas, recommendations);
    container.innerHTML = cards.join("");
  } catch (error) {
    if (String(error).includes("redirecting_to_login")) return;
    console.error(error);
    const errorId = error?.requestId ? ` (エラーID: ${error.requestId})` : "";
    renderNotice(container, {
      variant: "error",
      title: "診断結果を取得できませんでした",
      message: `通信状況を確認し、ページを再読み込みしてください。${errorId}`,
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((error) => {
    console.error("diagnosis results bootstrap error", error);
  });
});
