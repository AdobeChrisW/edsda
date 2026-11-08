import { createOptimizedPicture } from '../../scripts/aem.js';

const DATE_RE = /^(\d{1,2}[\s/.-])?[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}$|^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}$|^\d{4}-\d{2}-\d{2}$|^\d{1,2}[/.]\d{1,2}[/.]\d{2,4}$/;

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

function decorateBody(body) {
  const children = [...body.children];
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  let titleEl = heading;
  if (!titleEl) {
    // title authored as a strong link paragraph or first link paragraph
    titleEl = children.find((el) => el.tagName === 'P' && el.querySelector('a')
      && el.textContent.trim() === el.querySelector('a').textContent.trim());
  }
  if (titleEl) titleEl.classList.add('cards-news-card-title');

  const titleIndex = titleEl ? children.indexOf(titleEl) : -1;
  children.forEach((el, idx) => {
    if (el === titleEl || el.tagName !== 'P') return;
    const text = el.textContent.trim();
    if (DATE_RE.test(text) || el.querySelector('time')) {
      el.classList.add('cards-news-card-date');
    } else if (idx < titleIndex) {
      // text before the title is the type label (e.g. "Article")
      el.classList.add('cards-news-card-label');
    } else {
      el.classList.add('cards-news-card-excerpt');
    }
  });
  return titleEl;
}

function createButton(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `cards-news-${direction}`;
  button.setAttribute('aria-label', label);
  return button;
}

/** slider option: prev/next buttons that page the horizontal scroll-snap track */
function decorateSlider(block, list) {
  const controls = document.createElement('div');
  controls.className = 'cards-news-controls';
  const prev = createButton('prev', 'Previous articles');
  const next = createButton('next', 'Next articles');
  controls.append(prev, next);

  // mobile page dots, one per card (source swiper pagination)
  const cards = [...list.querySelectorAll('.cards-news-card')];
  const dots = document.createElement('div');
  dots.className = 'cards-news-dots';
  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'cards-news-dot';
    dot.dataset.index = i;
    dot.setAttribute('aria-label', `Show article ${i + 1} of ${cards.length}`);
    dots.append(dot);
  });
  block.replaceChildren(controls, list, dots);

  const step = () => {
    const card = cards[0];
    if (!card) return list.clientWidth;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const update = () => {
    const max = list.scrollWidth - list.clientWidth - 1;
    prev.disabled = list.scrollLeft <= 0;
    next.disabled = list.scrollLeft >= max;
    block.classList.toggle('cards-news-static', max <= 0);
    const active = list.scrollLeft >= max ? cards.length - 1 : Math.round(list.scrollLeft / step());
    [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
  };

  prev.addEventListener('click', () => list.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => list.scrollBy({ left: step(), behavior: 'smooth' }));
  dots.addEventListener('click', (e) => {
    const dot = e.target.closest('button[data-index]');
    if (dot) list.scrollTo({ left: Number(dot.dataset.index) * step(), behavior: 'smooth' });
  });
  list.addEventListener('scroll', update, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(list);
  update();
}

export default function decorate(block) {
  const isSlider = block.classList.contains('slider');
  const ul = document.createElement('ul');
  ul.className = 'cards-news-list';
  [...block.children].forEach((row, i) => {
    const li = document.createElement('li');
    li.className = 'cards-news-card';
    if (i === 0 && !isSlider) li.classList.add('cards-news-card-featured');
    [...row.children].forEach((cell) => {
      cell.className = isPictureOnly(cell) ? 'cards-news-card-image' : 'cards-news-card-body';
      li.append(cell);
    });
    const body = li.querySelector('.cards-news-card-body');
    const title = body && decorateBody(body);
    // the title link is stretched over the whole card (CSS), so the card is one click target
    // while assistive tech still hears a single link named by the title
    const link = title && title.querySelector('a');
    if (link) {
      li.classList.add('cards-news-card-linked');
      link.classList.add('cards-news-card-link');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  if (isSlider) {
    decorateSlider(block, ul);
    return;
  }
  block.replaceChildren(ul);
}
