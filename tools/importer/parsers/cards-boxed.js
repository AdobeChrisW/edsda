/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-boxed
 * Source: .cmp-c18-boxed-list (section.b-boxedList)
 * Header (eyebrow + h2 + moustache) is default content before the block.
 * Block model: optional first single-cell row = background image; then one
 * row per box: cell 1 = icon image, cell 2 = h3 + text + link.
 * Option: cards carrying .o-boxedCard.-center (e.g. /regions/theline) ->
 * block option "centered" ('Cards Boxed (centered)').
 * Icons: either an <img> in .o-boxedCard__asset, or a font/SVG icon
 * span.a-icon[data-icon=<name>] that the source fetches from
 * /content/dam/neom/svg/<name>.svg and inlines at runtime; the latter is
 * emitted as <img src="https://www.neom.com/content/dam/neom/svg/<name>.svg">
 * (absolute source URL, like every other image in these parsers; local
 * copies live in content/images/boxed-icon-<name>.svg).
 */

const ICON_SVG_BASE = 'https://www.neom.com/content/dam/neom/svg/';

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

function buildIcon(document, box) {
  const img = buildImage(document, box.querySelector('.o-boxedCard__asset img'));
  if (img) return img;
  const span = box.querySelector('.o-boxedCard__asset .a-icon[data-icon]');
  const name = span && (span.getAttribute('data-icon') || '').trim();
  if (!name || !/^[a-z0-9-]+$/i.test(name)) return null;
  const out = document.createElement('img');
  out.src = `${ICON_SVG_BASE}${name}.svg`;
  out.alt = '';
  return out;
}

function textEl(document, tag, text) {
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
}

export default function parse(element, { document }) {
  const cells = [];
  const defaultContent = [];
  const section = element.querySelector('.b-boxedList') || element;

  // header -> default content
  const header = section.querySelector('.b-boxedList__header');
  if (header) {
    const eyebrow = cleanText(header.querySelector('.a-eyebrow'));
    if (eyebrow) defaultContent.push(textEl(document, 'p', eyebrow));
    const heading = cleanText(header.querySelector('.a-heading'));
    if (heading) defaultContent.push(textEl(document, 'h2', heading));
    const moustache = cleanText(header.querySelector('.a-moustache'));
    if (moustache) defaultContent.push(textEl(document, 'p', moustache));
  }

  // optional background image row
  const bgImg = section.querySelector(':scope > .m-componentBackground img')
    || section.querySelector('.b-boxedList__background img');
  const bg = buildImage(document, bgImg);
  if (bg) cells.push([[bg]]);

  section.querySelectorAll('.b-boxedList__card').forEach((card) => {
    const box = card.querySelector('.o-boxedCard') || card;
    const icon = buildIcon(document, box);
    const body = [];
    const title = cleanText(box.querySelector('.o-boxedCard__heading'));
    if (title) body.push(textEl(document, 'h3', title));
    const copy = box.querySelector('.o-boxedCard__copy');
    if (copy && cleanText(copy)) {
      const p = document.createElement('p');
      p.innerHTML = copy.innerHTML.trim();
      while (p.firstChild && (p.firstChild.nodeName === 'BR' || (p.firstChild.nodeType === 3 && !p.firstChild.textContent.trim()))) p.firstChild.remove();
      body.push(p);
    }
    box.querySelectorAll('.o-boxedCard__link a[href]').forEach((a) => {
      const t = cleanText(a.querySelector('.a-label') || a) || (a.getAttribute('title') || '').trim();
      if (!t) return;
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = absUrl(a.getAttribute('href'));
      link.textContent = t;
      p.append(link);
      body.push(p);
    });
    if (icon || body.length) cells.push([icon ? [icon] : '', body]);
  });

  if (defaultContent.length) element.before(...defaultContent);
  const centered = !!section.querySelector('.o-boxedCard.-center');
  const name = centered ? 'Cards Boxed (centered)' : 'cards-boxed';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
