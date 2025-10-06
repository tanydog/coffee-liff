import { appConfig, assertConfig } from "../core/env.js";
import { LiffClient } from "../core/liff-client.js";
import { ApiClient } from "../core/api-client.js";
import { renderNotice, clearNotice } from "../ui/feedback.js";
import { withButtonLoading } from "../ui/loading.js";
import { qs, createElement } from "../utils/dom.js";
import { questions } from "../features/diagnosis-questions.js";

function renderQuestions(container) {
  container.innerHTML = "";
  questions.forEach((question, index) => {
    const section = createElement("section", "question");
    section.innerHTML = `
      <div class="question-header">
        <span class="badge">Q${index + 1}</span>
        <h2 id="${question.id}-label">${question.title}</h2>
      </div>
      <div class="options" role="radiogroup" aria-labelledby="${question.id}-label"></div>
    `;
    const optionsContainer = section.querySelector(".options");
    question.options.forEach((option) => {
      const label = createElement("label", "option-card");
      label.innerHTML = `
        <input type="radio" name="${question.id}" value="${option.value}" />
        <span>${option.label}</span>
      `;
      optionsContainer.appendChild(label);
    });
    container.appendChild(section);
  });
}

function aggregateScores(formData) {
  const scores = {};
  formData.forEach((value) => {
    scores[value] = (scores[value] || 0) + 1;
  });
  return scores;
}

function determinePersona(scores) {
  const entries = Object.entries(scores);
  if (!entries.length) return [];
  entries.sort((a, b) => b[1] - a[1]);
  const highestScore = entries[0][1];
  return entries.filter(([, score]) => score === highestScore).map(([key]) => key);
}

async function bootstrap() {
  const form = qs("#diagnosisForm");
  const questionsContainer = qs("#questions");
  const feedback = qs("#feedback");

  try {
    assertConfig(["liff.diagnosis", "apiBase"]);
  } catch (error) {
    renderNotice(feedback, {
      variant: "error",
      title: "設定エラー",
      message: "診断を開始できません。設定を確認してください。",
    });
    throw error;
  }

  renderQuestions(questionsContainer);

  const liffClient = new LiffClient({ liffId: appConfig.liff.diagnosis });
  const api = new ApiClient({ baseUrl: appConfig.apiBase, tokenProvider: () => liffClient.getIdToken() });

  await liffClient.ensureLogin();
  const profile = await liffClient.getProfile();
  if (profile?.displayName) {
    const heroName = qs("#memberName");
    if (heroName) heroName.textContent = profile.displayName;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearNotice(feedback);

    const formData = new FormData(form);
    const answers = [];
    questions.forEach((question) => {
      const value = formData.get(question.id);
      if (!value) {
        answers.push(null);
      } else {
        answers.push(value);
      }
    });

    if (answers.includes(null)) {
      renderNotice(feedback, {
        variant: "warning",
        title: "未回答の質問があります",
        message: "すべての質問に回答してから診断を完了してください。",
      });
      return;
    }

    const scores = aggregateScores(answers);
    const personas = determinePersona(scores);

    const submitButton = qs("button[type='submit']", form);
    withButtonLoading(submitButton, async () => {
      try {
        await api.request("/webhook-diagnosis", {
          method: "POST",
          body: {
            type: personas.join("+"),
            scoreMap: scores,
            displayName: profile?.displayName,
          },
        });
        renderNotice(feedback, {
          variant: "success",
          title: "診断が完了しました",
          message: "あなたのコーヒーパーソナを分析結果ページに保存しました。",
        });
        setTimeout(() => {
          window.location.href = "/result.html";
        }, 1400);
      } catch (error) {
        console.error(error);
        renderNotice(feedback, {
          variant: "error",
          title: "診断結果を保存できませんでした",
          message: "通信状況を確認して、再度お試しください。",
        });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch((error) => {
    console.error("diagnosis bootstrap error", error);
  });
});
