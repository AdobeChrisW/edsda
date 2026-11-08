import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'hero-banner-media';
  const content = document.createElement('div');
  content.className = 'hero-banner-content';

  // accepts one row per part (image row, text row) or one row with two cells
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !media.querySelector('picture')) {
        media.append(picture);
        // drop the now-empty wrapper paragraph left behind by the image
        cell.querySelectorAll('p').forEach((p) => {
          if (!p.textContent.trim() && !p.children.length) p.remove();
        });
      }
      content.append(...cell.childNodes);
    });
  });

  media.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]));
  });

  // keep the hero image eager: it is usually the LCP element
  const img = media.querySelector('img');
  if (img) {
    img.loading = 'eager';
    img.setAttribute('fetchpriority', 'high');
  }

  // trim stray whitespace text nodes so :empty can hide an unused wrapper
  [...content.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) node.remove();
  });

  block.replaceChildren(...[media.children.length ? media : null, content].filter(Boolean));
  if (!media.children.length) block.classList.add('hero-banner-no-image');
}
