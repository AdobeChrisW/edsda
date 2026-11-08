import { createOptimizedPicture } from '../../scripts/aem.js';

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

function optimizeImages(root, width) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width }]));
  });
}

// Scene7 renditions keep the authored `hei` while swapping `wid`, and Scene7 pads
// (white bars) instead of upscaling when `wid` exceeds the asset width. Drop `hei`
// and allow upscaling so the background photo keeps its aspect ratio.
function fixScene7Background(root) {
  const strip = (url) => {
    // edit the query verbatim: Scene7 template params use a literal `$`
    const [base, query = ''] = url.split('?');
    const params = query.split('&').filter((p) => p && !/^(hei|fit)=/.test(p));
    params.push('fit=constrain,1');
    return `${base}?${params.join('&')}`;
  };
  root.querySelectorAll('source[srcset*="/is/image/"]').forEach((source) => {
    source.srcset = strip(source.srcset);
  });
  root.querySelectorAll('img[src*="/is/image/"]').forEach((img) => {
    img.src = strip(img.getAttribute('src'));
  });
}

function markLink(body) {
  const last = body.lastElementChild;
  const link = last && last.tagName === 'P' ? last.querySelector('a') : null;
  if (link && last.textContent.trim() === link.textContent.trim()) {
    last.classList.add('cards-boxed-card-link');
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  let background;
  const first = rows[0];
  if (first && first.children.length === 1 && isPictureOnly(first.children[0])) {
    // optional first row: background photo for the whole block
    [background] = first.children;
    background.className = 'cards-boxed-background';
    rows.shift();
  }

  const list = document.createElement('ul');
  list.className = 'cards-boxed-list';
  rows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-boxed-card';
    [...row.children].forEach((cell) => {
      // skip empty cells (e.g. icon cell left blank when the source icon was a font glyph)
      if (!cell.children.length && !cell.textContent.trim()) return;
      cell.className = isPictureOnly(cell) ? 'cards-boxed-card-icon' : 'cards-boxed-card-body';
      li.append(cell);
    });
    const body = li.querySelector('.cards-boxed-card-body');
    if (body) markLink(body);
    list.append(li);
  });

  optimizeImages(list, '200');
  if (background) {
    optimizeImages(background, '2000');
    fixScene7Background(background);
  }

  // dot pagination, shown only when the list scrolls (mobile slider)
  const dots = document.createElement('ol');
  dots.className = 'cards-boxed-dots';
  const cards = [...list.children];
  cards.forEach((card, idx) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show item ${idx + 1} of ${cards.length}`);
    button.addEventListener('click', () => {
      list.scrollTo({ left: card.offsetLeft - list.offsetLeft, behavior: 'smooth' });
    });
    li.append(button);
    dots.append(li);
  });

  block.replaceChildren(...[background, list, dots].filter(Boolean));
  if (background) block.classList.add('cards-boxed-has-background');

  const update = () => {
    const scrollable = list.scrollWidth - list.clientWidth > 1;
    block.classList.toggle('cards-boxed-scrollable', scrollable);
    if (!scrollable) return;
    let active = 0;
    let best = Infinity;
    cards.forEach((card, idx) => {
      const dist = Math.abs(card.offsetLeft - list.offsetLeft - list.scrollLeft);
      if (dist < best) {
        best = dist;
        active = idx;
      }
    });
    [...dots.children].forEach((dot, idx) => {
      dot.classList.toggle('active', idx === active);
      if (idx === active) dot.firstElementChild.setAttribute('aria-current', 'true');
      else dot.firstElementChild.removeAttribute('aria-current');
    });
  };

  list.addEventListener('scroll', update, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(list);
  update();
}
