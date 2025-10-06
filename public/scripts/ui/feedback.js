export function renderNotice(container, { variant = "info", title, message }) {
  if (!container) return;
  container.innerHTML = `
    <div class="notice notice-${variant}">
      <div class="notice-icon" aria-hidden="true"></div>
      <div class="notice-content">
        ${title ? `<p class="notice-title">${title}</p>` : ""}
        ${message ? `<p class="notice-message">${message}</p>` : ""}
      </div>
    </div>
  `;
}

export function clearNotice(container) {
  if (container) {
    container.innerHTML = "";
  }
}
