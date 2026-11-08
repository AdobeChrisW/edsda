import { createOptimizedPicture } from '../../scripts/aem.js';

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

function createButton(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `cards-slider-${direction}`;
  button.setAttribute('aria-label', label);
  return button;
}

export default async function decorate(block) {
  const header = document.createElement('div');
  header.className = 'cards-slider-header';
  const intro = document.createElement('div');
  intro.className = 'cards-slider-intro';
  const list = document.createElement('ul');
  list.className = 'cards-slider-track';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const hasImage = cells.some((c) => isPictureOnly(c));
    if (cells.length === 1 && !hasImage) {
      // optional intro row (eyebrow + lead text)
      intro.append(...cells[0].childNodes);
      return;
    }
    const li = document.createElement('li');
    li.className = 'cards-slider-card';
    cells.forEach((cell) => {
      // photo-only cards are authored with an empty second cell; drop it
      if (!cell.children.length && !cell.textContent.trim()) return;
      cell.className = isPictureOnly(cell) ? 'cards-slider-card-image' : 'cards-slider-card-body';
      li.append(cell);
    });
    const body = li.querySelector('.cards-slider-card-body');
    if (body) {
      const last = body.lastElementChild;
      if (last && last.tagName === 'P' && last.querySelector('a')
        && last.textContent.trim() === last.querySelector('a').textContent.trim()) {
        last.classList.add('cards-slider-card-link');
      }
    }
    list.append(li);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  const controls = document.createElement('div');
  controls.className = 'cards-slider-controls';
  const prev = createButton('prev', 'Previous cards');
  const next = createButton('next', 'Next cards');
  controls.append(prev, next);

  const hasIntro = !!intro.childNodes.length;
  if (hasIntro) header.append(intro);
  header.append(controls);
  block.replaceChildren(header, list);
  block.classList.toggle('cards-slider-has-intro', hasIntro);

  // heading authored as default content right above the block (source slider title row):
  // the arrows sit on that heading's row, at the right
  const wrapper = block.parentElement;
  const prevContent = wrapper?.previousElementSibling;
  const title = !hasIntro && prevContent?.classList.contains('default-content-wrapper')
    ? [...prevContent.querySelectorAll(':scope > :is(h1, h2, h3, h4, h5, h6)')].pop()
    : null;

  // card style: square image + gold link under a section heading (homepage sectors);
  // landscape image + pill CTA when the slider stands alone (about regions).
  // An authored "landscape" / "square" variant wins over this default.
  if (!block.classList.contains('landscape') && !block.classList.contains('square')) {
    block.classList.add(!hasIntro && !title ? 'landscape' : 'square');
  }

  if (title) {
    block.classList.add('cards-slider-titled');
    const align = () => {
      const offset = title.getBoundingClientRect().top - block.getBoundingClientRect().top;
      block.style.setProperty('--cards-slider-title-offset', `${Math.round(offset)}px`);
    };
    align();
    if (window.ResizeObserver) new ResizeObserver(align).observe(prevContent);
    window.addEventListener('resize', align, { passive: true });
  }

  const step = () => {
    const card = list.querySelector('.cards-slider-card');
    if (!card) return list.clientWidth;
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const update = () => {
    const max = list.scrollWidth - list.clientWidth - 1;
    prev.disabled = list.scrollLeft <= 0;
    next.disabled = list.scrollLeft >= max;
    block.classList.toggle('cards-slider-static', max <= 0);
  };

  prev.addEventListener('click', () => list.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => list.scrollBy({ left: step(), behavior: 'smooth' }));
  list.addEventListener('scroll', update, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(list);
  update();
}
