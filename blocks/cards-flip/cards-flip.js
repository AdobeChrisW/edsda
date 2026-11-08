import { createOptimizedPicture } from '../../scripts/aem.js';

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

let instance = 0;

export default function decorate(block) {
  instance += 1;
  const list = document.createElement('ul');
  list.className = 'cards-flip-list';

  [...block.children].forEach((row, idx) => {
    const cells = [...row.children];
    const image = cells.find((c) => isPictureOnly(c));
    const body = cells.find((c) => c !== image) || document.createElement('div');

    const li = document.createElement('li');
    li.className = 'cards-flip-card';
    const inner = document.createElement('div');
    inner.className = 'cards-flip-inner';

    // the name: first heading, else first paragraph of the text cell
    const nameEl = body.querySelector('h1, h2, h3, h4, h5, h6') || body.firstElementChild;
    const name = nameEl ? nameEl.textContent.trim() : '';

    const front = document.createElement('div');
    front.className = 'cards-flip-front';
    if (image) {
      image.className = 'cards-flip-image';
      front.append(image);
    }
    if (name) {
      // visual copy of the name; the real heading stays on the back face
      const label = document.createElement('p');
      label.className = 'cards-flip-name';
      label.setAttribute('aria-hidden', 'true');
      label.textContent = name;
      front.append(label);
    }

    const back = document.createElement('div');
    back.className = 'cards-flip-back';
    back.id = `cards-flip-${instance}-${idx}`;
    body.className = 'cards-flip-body';
    if (nameEl) nameEl.classList.add('cards-flip-title');
    back.append(body);

    inner.append(front, back);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'cards-flip-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', back.id);
    toggle.setAttribute('aria-label', name ? `About ${name}` : 'Show details');

    const setFlipped = (flipped) => {
      li.classList.toggle('flipped', flipped);
      toggle.setAttribute('aria-expanded', flipped);
      // only the visible face is exposed to assistive tech / keyboard
      back.inert = !flipped;
      front.inert = flipped;
    };
    // like the source, a click anywhere on the card (front or back) toggles it;
    // the button's own clicks (mouse or keyboard) bubble up to this handler
    li.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (e.target !== toggle && window.getSelection().toString()) return;
      setFlipped(!li.classList.contains('flipped'));
    });
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && li.classList.contains('flipped')) {
        setFlipped(false);
        toggle.focus();
      }
    });

    li.append(inner, toggle);
    setFlipped(false);
    list.append(li);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]));
  });

  block.replaceChildren(list);
}
