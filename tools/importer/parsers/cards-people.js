/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-people
 * Source: .cmp-c70-card-grid (section.b-cardGrid) with a search filter and
 * ul.b-cardGrid__items > li.b-cardGrid__item > .m-personCard.
 * Block model: optional first single-cell row = search placeholder text
 * (enables the filter); then one row per person: cell 1 = portrait,
 * cell 2 = name paragraph + role paragraph (+ bio link when present),
 * cell 3 = bio (clean semantic HTML: paragraphs / lists, links kept).
 * Person cards open a bio side panel whose content comes from the JSON list in
 * section.b-cardGrid[data-items] (name, role, copy = bio HTML, image, social);
 * the bio of each card is taken from that list (matched by name, else by
 * position). No bio URL exists in the DOM; a link is only emitted if the card
 * carries an href.
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

function readItems(element) {
  const grid = element.matches('[data-items]')
    ? element : element.querySelector('section.b-cardGrid[data-items], [data-items]');
  if (!grid) return [];
  try {
    const items = JSON.parse(grid.getAttribute('data-items'));
    return Array.isArray(items) ? items : [];
  } catch (e) {
    return [];
  }
}

const normName = (t) => (t || '').replace(/\s+/g, ' ').trim().toLowerCase();

const KEEP_INLINE = /^(A|STRONG|EM|B|I|BR|SUP|SUB)$/;

// Copy inline content into target: keep links and emphasis, unwrap everything else.
function cleanInline(document, nodes, target) {
  nodes.forEach((n) => {
    if (n.nodeType === 3) {
      target.append(document.createTextNode(n.textContent));
    } else if (n.nodeType === 1) {
      if (KEEP_INLINE.test(n.tagName)) {
        const el = document.createElement(n.tagName.toLowerCase());
        if (n.tagName === 'A') {
          const href = n.getAttribute('href');
          if (href) el.href = absUrl(href);
        }
        cleanInline(document, [...n.childNodes], el);
        if (n.tagName === 'BR' || el.textContent.trim()) target.append(el);
      } else {
        cleanInline(document, [...n.childNodes], target);
      }
    }
  });
  return target;
}

function isBlank(n) {
  return n && ((n.nodeType === 3 && !n.textContent.trim()) || n.nodeName === 'BR');
}

function trimEdges(el) {
  while (isBlank(el.firstChild)) el.firstChild.remove();
  while (isBlank(el.lastChild)) el.lastChild.remove();
  if (el.firstChild && el.firstChild.nodeType === 3) el.firstChild.textContent = el.firstChild.textContent.replace(/^\s+/, '');
  if (el.lastChild && el.lastChild.nodeType === 3) el.lastChild.textContent = el.lastChild.textContent.replace(/\s+$/, '');
  return el;
}

// Bio copy -> array of <p> / <ul> / <ol> elements (source text kept verbatim).
function buildBio(document, copy) {
  if (!copy || !copy.trim()) return [];
  const out = [];
  if (!/<[a-z][^>]*>/i.test(copy)) {
    // plain text: line breaks separate paragraphs
    copy.split(/\n+/).map((t) => t.trim()).filter(Boolean).forEach((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      out.push(p);
    });
    return out;
  }
  const src = document.createElement('div');
  src.innerHTML = copy;
  let loose = null; // inline content outside block elements
  const flush = () => {
    if (loose && trimEdges(loose).textContent.trim()) out.push(loose);
    loose = null;
  };
  [...src.childNodes].forEach((n) => {
    if (n.nodeType === 1 && /^(UL|OL)$/.test(n.tagName)) {
      flush();
      const list = document.createElement(n.tagName.toLowerCase());
      [...n.children].filter((c) => c.tagName === 'LI').forEach((li) => {
        const item = trimEdges(cleanInline(document, [...li.childNodes], document.createElement('li')));
        if (item.textContent.trim()) list.append(item);
      });
      if (list.children.length) out.push(list);
    } else if (n.nodeType === 1 && /^(P|DIV|H[1-6]|BLOCKQUOTE)$/.test(n.tagName)) {
      flush();
      const p = trimEdges(cleanInline(document, [...n.childNodes], document.createElement('p')));
      if (p.textContent.trim()) out.push(p);
    } else if (n.nodeType === 1 || (n.nodeType === 3 && n.textContent.trim())) {
      if (!loose) loose = document.createElement('p');
      cleanInline(document, [n], loose);
    }
  });
  flush();
  return out;
}

function textP(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

export default function parse(element, { document }) {
  const cells = [];

  const search = element.querySelector('.b-cardGrid__filters input[placeholder], .m-searchField input[placeholder]');
  if (search) {
    const placeholder = (search.getAttribute('placeholder') || '').trim();
    if (placeholder) cells.push([placeholder]);
  }

  const items = readItems(element);
  const cards = element.querySelectorAll('.b-cardGrid__item');
  cards.forEach((item, idx) => {
    const card = item.querySelector('.m-personCard') || item;
    const img = buildImage(document, card.querySelector('.m-personCard__image img, img'));
    const body = [];
    const name = cleanText(card.querySelector('.m-personCard__name'));
    if (name) body.push(textP(document, name));
    const role = cleanText(card.querySelector('.m-personCard__role'));
    if (role) body.push(textP(document, role));
    const link = card.closest('a[href]') || card.querySelector('a[href]');
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = absUrl(link.getAttribute('href'));
      a.textContent = '→';
      p.append(a);
      body.push(p);
    }
    const data = items.find((d) => name && normName(d.name) === normName(name))
      || (items.length === cards.length ? items[idx] : null);
    const bio = data ? buildBio(document, data.copy) : [];
    if (img || body.length) cells.push([img ? [img] : '', body, bio.length ? bio : '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-people', cells });
  element.replaceWith(block);
}
