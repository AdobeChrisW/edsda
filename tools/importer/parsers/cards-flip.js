/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-flip
 * Source: .cmp-c117-flip-cards (li.b-flipCards__item: photo, front title,
 * hidden back .b-flipCards__itemFlip with title + copy).
 * The group heading (Goalkeepers / Defenders / ...) is default content
 * before the block.
 * Block model: one row per card: cell 1 = photo, cell 2 = name heading +
 * bio paragraph(s) shown on the back.
 */

const ORIGIN = 'https://www.neom.com';

function absUrl(url) {
  if (!url) return '';
  const u = url.trim();
  if (/^(https?:|data:|mailto:|tel:|\.\/|#)/i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function cleanText(el) {
  if (!el) return '';
  let text = el.textContent || '';
  if (el.cloneNode && el.querySelectorAll) {
    const c = el.cloneNode(true);
    c.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
    text = c.textContent;
  }
  return text.replace(/\s+/g, ' ').trim();
}

function buildImage(document, img) {
  if (!img) return null;
  let src = img.getAttribute('src') || img.getAttribute('data-src') || '';
  if (!src || src.startsWith('data:')) {
    const pic = img.closest('picture');
    const s = pic && pic.querySelector('source[srcset]');
    if (s) src = s.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0];
  }
  if (!src || src.startsWith('data:')) return null;
  const out = document.createElement('img');
  out.src = absUrl(src);
  out.alt = (img.getAttribute('alt') || '').trim();
  return out;
}

function paragraphsFrom(document, container) {
  const out = [];
  if (!container) return out;
  const blocks = container.querySelectorAll(':scope > p, :scope > ul, :scope > ol');
  if (blocks.length) {
    blocks.forEach((b) => { if (cleanText(b)) out.push(b.cloneNode(true)); });
  } else if (cleanText(container)) {
    const p = document.createElement('p');
    p.innerHTML = container.innerHTML.trim();
    out.push(p);
  }
  out.forEach((el) => el.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href')))));
  return out;
}

export default function parse(element, { document }) {
  const cells = [];
  const defaultContent = [];

  const heading = cleanText(element.querySelector('.b-flipCards__header .a-heading'));
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading;
    defaultContent.push(h2);
  }

  element.querySelectorAll('.b-flipCards__item').forEach((item) => {
    const img = buildImage(document, item.querySelector(':scope > .a-image img') || item.querySelector('img'));
    const body = [];
    const name = cleanText(item.querySelector('.b-flipCards__itemFlip__title'))
      || cleanText(item.querySelector('.b-flipCards__itemContent__title'));
    if (name) {
      const h3 = document.createElement('h3');
      h3.textContent = name;
      body.push(h3);
    }
    body.push(...paragraphsFrom(document, item.querySelector('.b-flipCards__itemFlip__copy')));
    if (img || body.length) cells.push([img ? [img] : '', body]);
  });

  if (defaultContent.length) element.before(...defaultContent);
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-flip', cells });
  element.replaceWith(block);
}
