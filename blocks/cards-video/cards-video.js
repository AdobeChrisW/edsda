import { createOptimizedPicture } from '../../scripts/aem.js';

const VIDEO_RE = /\.(mp4|webm|m3u8|mov)(\?|$)|\/is\/content\//i;

let dialog;

function closeOverlay() {
  if (!dialog) return;
  const video = dialog.querySelector('video');
  if (video) {
    video.pause();
    video.removeAttribute('src');
    video.load();
  }
  if (dialog.open) dialog.close();
}

function getDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'cards-video-overlay';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'cards-video-close';
  close.setAttribute('aria-label', 'Close video');
  close.addEventListener('click', closeOverlay);
  const video = document.createElement('video');
  video.className = 'cards-video-player';
  video.controls = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  dialog.append(close, video);
  // click on the backdrop closes the overlay
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeOverlay();
  });
  dialog.addEventListener('close', closeOverlay);
  // the overlay lives in its own wrapper so block styles still apply
  const host = document.createElement('div');
  host.className = 'cards-video cards-video-overlay-host';
  host.append(dialog);
  document.body.append(host);
  return dialog;
}

function openOverlay(src, label) {
  const overlay = getDialog();
  const video = overlay.querySelector('video');
  video.src = src;
  video.setAttribute('aria-label', label);
  overlay.showModal();
  video.play().catch(() => {});
}

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'cards-video-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-video-card';
    const cells = [...row.children];
    const media = cells.find((c) => c.querySelector('picture')) || cells[0];
    const caption = cells.find((c) => c !== media);
    if (media) {
      media.className = 'cards-video-media';
      li.append(media);
    }
    if (caption) {
      caption.className = 'cards-video-caption';
      li.append(caption);
    }

    const link = media ? media.querySelector('a[href]') : null;
    if (link) {
      const { href } = link;
      const label = caption ? caption.textContent.trim() : link.textContent.trim();
      const wrapper = link.closest('p');
      if (wrapper && wrapper.textContent.trim() === link.textContent.trim() && !wrapper.querySelector('picture')) {
        wrapper.remove();
      } else if (!link.querySelector('picture')) {
        link.remove();
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cards-video-play';
      button.setAttribute('aria-label', label ? `Play video: ${label}` : 'Play video');
      button.addEventListener('click', () => {
        if (VIDEO_RE.test(href)) openOverlay(href, label);
        else window.open(href, '_blank', 'noopener');
      });
      media.append(button);
    }
    list.append(li);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]));
  });

  // slider page indicators; the list is the cards' offsetParent (position: relative)
  // so offsetLeft maps directly to scrollLeft (dots shown on mobile only)
  const cards = [...list.children];
  const dots = document.createElement('div');
  dots.className = 'cards-video-dots';
  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'cards-video-dot';
    dot.dataset.index = i;
    dot.setAttribute('aria-label', `Show story ${i + 1} of ${cards.length}`);
    if (i === 0) dot.setAttribute('aria-current', 'true');
    dots.append(dot);
  });
  dots.addEventListener('click', (e) => {
    const dot = e.target.closest('.cards-video-dot');
    if (!dot) return;
    const card = cards[Number(dot.dataset.index)];
    list.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  });
  let ticking = false;
  list.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const { scrollLeft } = list;
      let active = 0;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - scrollLeft);
        if (dist < Math.abs(cards[active].offsetLeft - scrollLeft)) active = i;
      });
      [...dots.children].forEach((dot, i) => {
        if (i === active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    });
  }, { passive: true });

  block.replaceChildren(list, dots);
}
