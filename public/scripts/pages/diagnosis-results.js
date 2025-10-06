import { appConfig, assertConfig } from "../core/env.js";
import { LiffClient } from "../core/liff-client.js";
import { ApiClient } from "../core/api-client.js";
import { renderNotice } from "../ui/feedback.js";
import { qs } from "../utils/dom.js";
import { buildDiagnosisCards, parseType } from "../features/diagnosis.js";

async function bootstrap() {
  const container = qs("#resultsContainer");
  const feedback = qs("#feedback");

  try {
    assertConfig(["liff.diagnosis", "apiBase"]);
  } catch (error) {
    renderNotice(feedback, {
      variant: "error",
      title: "設定エラー",
      message: "診断結果を取得できません。設定を確認してください。",
    });
    throw error;
  }

  renderNotice(container, { variant: "info", message: "診断結果を読み込み中です…" });

  const liffClient = new LiffClient({ liffId: appConfig.liff.diagnosis });
  const api = new ApiClient({ baseUrl: appConfig.apiBase, tokenProvider: () => liffClient.getIdToken() });

  try {
    await liffClient.ensureLogin();
    const profile = await liffClient.getProfile();
    if (profile?.displayName) {
      const summaryName = qs("#memberName");
      if (summaryName) summaryName.textContent = profile.displayName;
    }

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
    renderNotice(container, {
      variant: "error",
      title: "診断結果を取得できませんでした",
      message: "通信状況を確認し、ページを再読み込みしてください。",
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((error) => {
    console.error("diagnosis results bootstrap error", error);
  });
});
