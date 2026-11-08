/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-split
 * Source: .cmp-c58-highlight-slideshow (section.b-highlightSlideshow)
 * Slides: .b-highlightSlideshow__items > .b-highlightSlideshow__slide
 * Block model: one row per slide: cell 1 = image, cell 2 = eyebrow paragraph
 * + h2 + paragraph(s) + CTA link (the h2 also labels the slide tab).
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

  element.querySelectorAll('.b-highlightSlideshow__slide').forEach((slide) => {
    const img = buildImage(document, slide.querySelector('.b-highlightSlideshow__images img'));
    const content = [];
    const eyebrow = cleanText(slide.querySelector('.m-componentHeader .a-eyebrow'));
    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow;
      content.push(p);
    }
    const heading = cleanText(slide.querySelector('.m-componentHeader .a-heading'));
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading;
      content.push(h2);
    }
    content.push(...paragraphsFrom(document, slide.querySelector('.b-highlightSlideshow__copyDescription')));
    slide.querySelectorAll('.b-highlightSlideshow__buttons a[href]').forEach((a) => {
      const t = cleanText(a.querySelector('.a-label') || a) || (a.getAttribute('title') || '').trim();
      if (!t) return;
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.href = absUrl(a.getAttribute('href'));
      link.textContent = t;
      p.append(link);
      content.push(p);
    });
    if (img || content.length) cells.push([img ? [img] : '', content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-split', cells });
  element.replaceWith(block);
}
