import { createOptimizedPicture } from '../../scripts/aem.js';

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'cards-downloads-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-downloads-item';
    [...row.children].forEach((cell) => {
      cell.className = isPictureOnly(cell) ? 'cards-downloads-thumb' : 'cards-downloads-body';
      li.append(cell);
    });
    const body = li.querySelector('.cards-downloads-body');
    if (body) {
      const title = body.querySelector('h1, h2, h3, h4, h5, h6');
      body.querySelectorAll('a[href]').forEach((a) => {
        const p = a.closest('p');
        if (p && p.textContent.trim() === a.textContent.trim()) {
          p.classList.remove('button-container');
          p.classList.add('cards-downloads-link');
        }
        // source renders a plain gold text link, not the global pill button
        a.classList.remove('button', 'primary', 'secondary');
        a.classList.add('cards-downloads-file');
        a.setAttribute('download', '');
        // "PDF file 19.2MB" alone is ambiguous for screen readers: add the title
        if (title && !a.hasAttribute('aria-label')) {
          a.setAttribute('aria-label', `${title.textContent.trim()}, ${a.textContent.trim()}`);
        }
      });
    }
    list.append(li);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
  });

  block.replaceChildren(list);
}
