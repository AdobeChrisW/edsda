import { createOptimizedPicture } from '../../scripts/aem.js';

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

function isOptimizable(src) {
  const url = new URL(src, window.location.href);
  return url.origin === window.location.origin && !/\.svg$/i.test(url.pathname);
}

let dialog;

function getDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'cards-gallery-lightbox';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'cards-gallery-close';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', () => dialog.close());
  const figure = document.createElement('figure');
  figure.className = 'cards-gallery-figure';
  dialog.append(close, figure);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  // the lightbox lives in its own wrapper so block styles still apply
  const host = document.createElement('div');
  host.className = 'cards-gallery cards-gallery-lightbox-host';
  host.append(dialog);
  document.body.append(host);
  return dialog;
}

function openLightbox(img, captionText) {
  const lightbox = getDialog();
  const figure = lightbox.querySelector('figure');
  const src = img.currentSrc || img.src;
  let picture;
  if (isOptimizable(src)) {
    picture = createOptimizedPicture(src, img.alt, true, [{ width: '2000' }]);
  } else {
    // remote or SVG image: reuse the authored source as is
    picture = img.closest('picture').cloneNode(true);
  }
  const caption = document.createElement('figcaption');
  caption.textContent = captionText;
  figure.replaceChildren(picture);
  if (captionText) figure.append(caption);
  lightbox.setAttribute('aria-label', captionText || img.alt || 'Image');
  lightbox.showModal();
}

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'cards-gallery-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-gallery-item';
    [...row.children].forEach((cell) => {
      cell.className = isPictureOnly(cell) ? 'cards-gallery-image' : 'cards-gallery-caption';
      li.append(cell);
    });
    list.append(li);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  // wrap each image in a button that opens the lightbox
  list.querySelectorAll('.cards-gallery-item').forEach((item) => {
    const media = item.querySelector('.cards-gallery-image');
    const picture = media && media.querySelector('picture');
    if (!picture) return;
    const caption = item.querySelector('.cards-gallery-caption');
    const captionText = caption ? caption.textContent.trim() : '';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cards-gallery-open';
    button.setAttribute('aria-label', captionText ? `Enlarge image: ${captionText}` : 'Enlarge image');
    picture.replaceWith(button);
    button.append(picture);
    button.addEventListener('click', () => openLightbox(picture.querySelector('img'), captionText));
  });

  block.replaceChildren(list);
}
