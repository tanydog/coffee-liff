import { renderNotice } from '../ui/feedback.js';

export function handleBootstrapError(error, { feedbackEl, missingConfigMessage }) {
  if (!feedbackEl) {
    throw error;
  }
  if (error?.message?.includes('Missing configuration values')) {
    renderNotice(feedbackEl, {
      variant: 'error',
      title: '設定エラー',
      message: missingConfigMessage || '必要な設定が不足しているためページを表示できません。',
    });
  } else if (error?.message === 'redirecting_to_login') {
    renderNotice(feedbackEl, {
      variant: 'info',
      title: 'LINEにリダイレクトしています',
      message: 'ログイン後に自動で元のページに戻ります。',
    });
  } else {
    renderNotice(feedbackEl, {
      variant: 'error',
      title: 'ページを読み込めませんでした',
      message: 'ネットワーク状況を確認し、もう一度お試しください。',
    });
  }
  return null;
}

export function updateWelcomeName(element, profile) {
  if (element && profile?.displayName) {
    element.textContent = profile.displayName;
  }
}
