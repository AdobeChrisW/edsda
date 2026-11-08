import { createOptimizedPicture } from '../../scripts/aem.js';

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

function createButton(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `cards-timeline-${direction}`;
  button.setAttribute('aria-label', label);
  return button;
}

/* the year is the first paragraph made only of bold text (or a heading) */
function findYear(body) {
  const first = body.firstElementChild;
  if (!first) return null;
  if (/^H[1-6]$/.test(first.tagName)) return first;
  const strong = first.tagName === 'P' ? first.querySelector('strong, b') : null;
  if (strong && strong.textContent.trim() === first.textContent.trim()) return first;
  return null;
}

export default function decorate(block) {
  const rows = [...block.children];
  let background;
  const first = rows[0];
  if (first && first.children.length === 1 && isPictureOnly(first.children[0])) {
    [background] = first.children;
    background.className = 'cards-timeline-background';
    rows.shift();
  }

  const list = document.createElement('ul');
  list.className = 'cards-timeline-track';
  rows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-timeline-card';
    const body = document.createElement('div');
    body.className = 'cards-timeline-card-body';
    [...row.children].forEach((cell) => body.append(...cell.childNodes));
    const year = findYear(body);
    const label = document.createElement('div');
    label.className = 'cards-timeline-year';
    if (year) label.textContent = year.textContent.trim();
    if (year) year.remove();
    // inner wrapper keeps auto height so inactive cards can be line-clamped
    const content = document.createElement('div');
    content.className = 'cards-timeline-card-content';
    content.append(...body.childNodes);
    body.append(content);
    const marker = document.createElement('span');
    marker.className = 'cards-timeline-dot';
    marker.setAttribute('aria-hidden', 'true');
    label.append(marker);
    if (body.querySelector('picture')) li.classList.add('cards-timeline-card-media');
    li.append(label, body);
    list.append(li);
  });

  if (background) {
    background.querySelectorAll('picture > img').forEach((img) => {
      const url = new URL(img.src, window.location.href);
      if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
      img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
    });
  }

  const controls = document.createElement('div');
  controls.className = 'cards-timeline-controls';
  const prev = createButton('prev', 'Previous entry');
  const next = createButton('next', 'Next entry');
  controls.append(prev, next);

  block.replaceChildren(...[background, controls, list].filter(Boolean));
  if (background) block.classList.add('cards-timeline-has-background');

  const cards = [...list.children];
  let active = 0;

  const setActive = (index) => {
    active = Math.max(0, Math.min(cards.length - 1, index));
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === active);
      if (i === active) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });
    prev.disabled = active === 0;
    next.disabled = active === cards.length - 1;
  };

  // scroll position that brings a card to the start of the track (after its padding)
  const cardOffset = (card) => {
    const pad = parseFloat(getComputedStyle(list).paddingInlineStart) || 0;
    return card.offsetLeft - list.offsetLeft - pad;
  };

  const goTo = (index) => {
    setActive(index);
    const card = cards[active];
    if (card) list.scrollTo({ left: cardOffset(card), behavior: 'smooth' });
  };

  prev.addEventListener('click', () => goTo(active - 1));
  next.addEventListener('click', () => goTo(active + 1));
  cards.forEach((card, i) => card.addEventListener('click', () => goTo(i)));

  // keep the highlight on the left-most card when the user scrolls/swipes
  let scrollTimer;
  list.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const max = list.scrollWidth - list.clientWidth - 1;
      if (list.scrollLeft >= max) return;
      let nearest = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(cardOffset(card) - list.scrollLeft);
        if (dist < best) {
          best = dist;
          nearest = i;
        }
      });
      setActive(nearest);
    }, 100);
  }, { passive: true });

  setActive(0);
}
