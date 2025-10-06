export function withButtonLoading(button, run) {
  if (!button) return run();
  const originalLabel = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span class="spinner"></span><span>処理中...</span>';
  return Promise.resolve(run())
    .finally(() => {
      button.disabled = false;
      button.innerHTML = originalLabel;
    });
}
