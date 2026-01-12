//UI Carrusel
import { loadActiveNotices } from './notices.controller.js';

let index = 0;
let notices = [];

export const initNoticesCarousel = async () => {
  notices = await loadActiveNotices();
  if (!notices.length) return;

  renderNotice();
  setInterval(nextNotice, 5000);
};

function renderNotice() {
  const notice = notices[index];
  const container = document.getElementById('notices-carousel');

  container.innerHTML = `
    <div class="notice-slide">
      ${notice.image_url ? `<img src="${notice.image_url}">` : ''}
      <div class="notice-text">
        <h3>${notice.title}</h3>
        <p>${notice.description}</p>
      </div>
    </div>
  `;
}

function nextNotice() {
  index = (index + 1) % notices.length;
  renderNotice();
}