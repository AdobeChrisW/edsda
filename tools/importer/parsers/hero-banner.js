/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-banner
 * Source: .cmp-c26-hero-banner (section.b-heroBanner > .o-heroContent)
 * Block model: row 1 = background image; row 2 = h1 + subline paragraph
 * (+ optional CTA links).
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
  const alt = (img.getAttribute('alt') || '').trim();
  // placeholder alt from the source CMS carries no meaning
  out.alt = /^background image alt text$/i.test(alt) ? '' : alt;
  return out;
}

export default function parse(element, { document }) {
  const cells = [];

  const img = buildImage(document, element.querySelector('.m-componentBackground img, .a-image img'));
  if (img) cells.push([[img]]);

  const content = [];
  const heading = element.querySelector('.o-heroContent__content .a-heading, .o-heroContent__content h1, .o-heroContent__content h2');
  if (heading && cleanText(heading)) {
    const h1 = document.createElement('h1');
    h1.textContent = cleanText(heading);
    content.push(h1);
  }
  // the subline can lose its .a-moustache class when split-text cleanup rebuilds the paragraph
  element.querySelectorAll('.o-heroContent__content .a-eyebrow, .o-heroContent__content .a-moustache, .o-heroContent__content .m-componentHeader p, .o-heroContent__content .m-paragraph__content').forEach((el) => {
    const t = cleanText(el);
    if (!t) return;
    const p = document.createElement('p');
    p.textContent = t;
    content.push(p);
  });
  element.querySelectorAll('.o-heroContent__buttons a[href]').forEach((a) => {
    const t = cleanText(a.querySelector('.a-label') || a) || (a.getAttribute('title') || '').trim();
    if (!t) return;
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = absUrl(a.getAttribute('href'));
    link.textContent = t;
    p.append(link);
    content.push(p);
  });
  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
