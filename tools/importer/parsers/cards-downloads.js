/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-downloads
 * Source: .cmp-c30-downloads (li.b-downloads__listItem > .m-downloadItem)
 * An optional .b-downloads__heading is default content before the block.
 * Block model: one row per file: cell 1 = thumbnail, cell 2 = h3 title
 * (+ optional description) + link to the file (text = file type and size).
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

export default function parse(element, { document }) {
  const cells = [];
  const defaultContent = [];

  const heading = cleanText(element.querySelector('.b-downloads__heading'));
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading;
    defaultContent.push(h2);
  }

  element.querySelectorAll('.b-downloads__listItem').forEach((item) => {
    const dl = item.querySelector('.m-downloadItem') || item;
    const img = buildImage(document, dl.querySelector('.m-downloadItem__image img'));
    const body = [];
    const title = cleanText(dl.querySelector('.m-downloadItem__content .a-heading, .m-downloadItem__content h3'));
    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title;
      body.push(h3);
    }
    const desc = cleanText(dl.querySelector('.m-downloadItem__description'));
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      body.push(p);
    }
    const link = dl.querySelector('a.m-downloadItem__link[href], .m-downloadItem__content a[href]');
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = absUrl(link.getAttribute('href'));
      a.textContent = cleanText(link) || title || 'Download';
      p.append(a);
      body.push(p);
    }
    if (img || body.length) cells.push([img ? [img] : '', body]);
  });

  if (defaultContent.length) element.before(...defaultContent);
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-downloads', cells });
  element.replaceWith(block);
}
