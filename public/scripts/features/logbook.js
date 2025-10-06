import { createElement } from "../utils/dom.js";

export function renderLogList(container, items = []) {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = '<p class="body-sm muted">まだ記録がありません。最初の一杯を記録しましょう。</p>';
    return;
  }

  container.innerHTML = "";
  items.forEach((item) => {
    const card = createElement("article", "card entry-card");
    const date = item?.createdAt?.seconds || item?.createdAt?._seconds;
    const time = date ? new Date(date * 1000).toLocaleString("ja-JP") : "";
    card.innerHTML = `
      <div class="entry-header">
        <div class="entry-bean">${item.beanType}</div>
        <span class="entry-amount">${item.amount}ml</span>
      </div>
      <p class="entry-taste">${item.taste}</p>
      <footer class="entry-footer">
        <span>${time}</span>
        ${item.displayName ? `<span class="entry-user">${item.displayName}</span>` : ""}
      </footer>
    `;
    container.appendChild(card);
  });
}
