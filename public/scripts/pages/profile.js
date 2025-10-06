import { appConfig, assertConfig } from "../core/env.js";
import { LiffClient } from "../core/liff-client.js";
import { renderNotice } from "../ui/feedback.js";
import { qs } from "../utils/dom.js";

function maskUserId(uid) {
  if (!uid) return "";
  if (uid.length <= 10) return uid;
  return `${uid.slice(0, 6)}…${uid.slice(-4)}`;
}

async function bootstrap() {
  const feedback = qs("#feedback");
  const name = qs("#displayName");
  const avatar = qs("#avatar");
  const userId = qs("#userIdMasked");
  const tokenState = qs("#tokenState");
  const logoutButton = qs("#logoutButton");
  const refreshButton = qs("#refreshButton");

  try {
    assertConfig(["liff.diagnosis"]);
  } catch (error) {
    renderNotice(feedback, {
      variant: "error",
      title: "設定エラー",
      message: "ユーザー情報を取得できません。設定を確認してください。",
    });
    throw error;
  }

  const liffClient = new LiffClient({ liffId: appConfig.liff.diagnosis });

  async function loadProfile() {
    renderNotice(feedback, { variant: "info", message: "プロフィールを読み込み中です…" });
    try {
      await liffClient.ensureLogin();
      const profile = await liffClient.getProfile();
      const idToken = liffClient.getIdToken();
      if (name) name.textContent = profile?.displayName || "不明";
      if (avatar) avatar.src = profile?.pictureUrl || "https://placehold.co/80x80";
      if (userId) userId.textContent = maskUserId(profile?.userId);
      if (tokenState) tokenState.textContent = idToken ? "IDトークン: 発行済み" : "IDトークン: 未発行";
      feedback.innerHTML = "";
    } catch (error) {
      if (String(error).includes("redirecting_to_login")) return;
      console.error(error);
      renderNotice(feedback, {
        variant: "error",
        title: "プロフィールを取得できませんでした",
        message: "通信状況を確認して再度お試しください。",
      });
    }
  }

  await loadProfile();

  refreshButton?.addEventListener("click", loadProfile);
  logoutButton?.addEventListener("click", () => {
    try {
      liffClient.logout();
    } finally {
      window.location.href = "/login.html";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((error) => {
    console.error("profile bootstrap error", error);
  });
});
