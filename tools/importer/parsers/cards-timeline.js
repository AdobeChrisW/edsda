/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-timeline
 * Source: .cmp-c33-grouped-content-slider (section.b-groupedContentSlider)
 * Items: .b-groupedContentSlider__items holds alternating
 *   .b-groupedContentSlider__itemLabel (year / group label) and one or more
 *   .b-groupedContentSlider__item (.o-timelineCard) siblings; labels are
 *   paired with the following items by document order.
 * The eyebrow ("Our Story") is default content before the block.
 * Block model: optional first single-cell row = background image; then one
 * single-cell row per entry: bold label paragraph + paragraph(s)
 * (+ optional logo image and CTA link for match cards).
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
  return text.replace(/[\sㅤ]+/g, ' ').trim();
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

/**
 * Converts rich-text content into paragraphs: block boundaries and double
 * <br> split paragraphs, a single <br> stays a line break.
 */
function contentParagraphs(document, container) {
  if (!container) return [];
  const clone = container.cloneNode(true);
  clone.querySelectorAll('span, font').forEach((n) => n.replaceWith(...n.childNodes));
  let html = clone.innerHTML;
  html = html.replace(/<\/?(div|p|section)[^>]*>/gi, '\n\n');
  html = html.replace(/(<br\s*\/?>\s*){2,}/gi, '\n\n');
  html = html.replace(/<br\s*\/?>/gi, '<br>');
  return html.split(/\n\s*\n/).map((seg) => {
    const p = document.createElement('p');
    p.innerHTML = seg.replace(/ㅤ/g, ' ').trim();
    while (p.firstChild && (p.firstChild.nodeName === 'BR' || (p.firstChild.nodeType === 3 && !p.firstChild.textContent.trim()))) p.firstChild.remove();
    while (p.lastChild && (p.lastChild.nodeName === 'BR' || (p.lastChild.nodeType === 3 && !p.lastChild.textContent.trim()))) p.lastChild.remove();
    p.querySelectorAll('a[href]').forEach((a) => a.setAttribute('href', absUrl(a.getAttribute('href'))));
    return p;
  }).filter((p) => cleanText(p));
}

export default function parse(element, { document }) {
  const cells = [];
  const defaultContent = [];
  const section = element.querySelector('.b-groupedContentSlider') || element;

  const eyebrow = cleanText(section.querySelector('.b-groupedContentSlider__eyebrow'));
  if (eyebrow) {
    const h2 = document.createElement('h2');
    h2.textContent = eyebrow;
    defaultContent.push(h2);
  }

  const bg = buildImage(document, section.querySelector(':scope > .m-componentBackground img'));
  if (bg) cells.push([[bg]]);

  const container = section.querySelector('.b-groupedContentSlider__items');
  let pendingLabel = '';
  if (container) {
    [...container.children].forEach((child) => {
      if (child.classList.contains('b-groupedContentSlider__itemLabel')) {
        pendingLabel = cleanText(child);
        return;
      }
      if (!child.classList.contains('b-groupedContentSlider__item')) return;
      const card = child.querySelector('.o-timelineCard') || child;
      const entry = [];
      // label: group/year label, else the card's own heading
      const label = pendingLabel || cleanText(card.querySelector('.o-timelineCard__heading'));
      pendingLabel = '';
      if (label) {
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = label;
        p.append(strong);
        entry.push(p);
      }
      const ownHeading = cleanText(card.querySelector('.o-timelineCard__heading'));
      if (ownHeading && ownHeading !== label) {
        const p = document.createElement('p');
        p.textContent = ownHeading;
        entry.push(p);
      }
      const logo = buildImage(document, card.querySelector('.o-timelineCard__logo img'));
      if (logo) {
        const p = document.createElement('p');
        p.append(logo);
        entry.push(p);
      }
      entry.push(...contentParagraphs(document, card.querySelector('.o-timelineCard__content')));
      card.querySelectorAll('.o-timelineCard__button a[href]').forEach((a) => {
        const t = cleanText(a.querySelector('.a-label') || a) || (a.getAttribute('title') || '').trim();
        if (!t) return;
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = absUrl(a.getAttribute('href'));
        link.textContent = t;
        p.append(link);
        entry.push(p);
      });
      if (entry.length) cells.push([entry]);
    });
  }

  if (defaultContent.length) element.before(...defaultContent);
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-timeline', cells });
  element.replaceWith(block);
}
