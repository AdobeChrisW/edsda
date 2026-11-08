/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-news
 * Source: .cmp-c123-featured-news (section.b-newsroomDch). Items are rendered
 * client-side into ul.b-newsroomDch__items > li.b-newsroomDch__item.
 * Header (h2 + description + "Explore more" link) is default content placed
 * before the block (authoring-analysis rc6-s1).
 * Block model: one row per article: cell 1 = image, cell 2 = type label
 * paragraph + h3 title link + optional excerpt + date paragraph.
 */

const ORIGIN = 'https://www.neom.com';

function absUrl(url) {
  if (!url) return '';
  const u = url.trim();
  if (/^(https?:|data:|mailto:|tel:|\.\/)/i.test(u)) return u;
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
  out.alt = alt === 'null' || alt === 'undefined' ? '' : alt;
  return out;
}

function textP(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function linkP(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  p.append(a);
  return p;
}

export default function parse(element, { document }) {
  const cells = [];
  const defaultContent = [];

  // header -> default content
  const header = element.querySelector('.b-newsroomDch__header');
  if (header) {
    const h = header.querySelector('.a-heading, h1, h2, h3');
    if (h && cleanText(h)) {
      const h2 = document.createElement('h2');
      h2.textContent = cleanText(h);
      defaultContent.push(h2);
    }
    const desc = header.querySelector('.a-moustache, .header-desc p');
    if (desc && cleanText(desc)) defaultContent.push(textP(document, cleanText(desc)));
    const more = header.querySelector('a.m-button[href]');
    if (more) {
      const t = cleanText(more.querySelector('.a-label') || more);
      if (t) defaultContent.push(linkP(document, absUrl(more.getAttribute('href')), t));
    }
  }

  const items = element.querySelectorAll('.b-newsroomDch__items > li, li.b-newsroomDch__item');
  [...new Set(items)].forEach((item) => {
    const titleLink = item.querySelector('.b-newsroomDch__headingText');
    const anyLink = item.querySelector('a[href]');
    const href = absUrl((titleLink && titleLink.getAttribute('href')) || (anyLink && anyLink.getAttribute('href')) || '');
    const title = cleanText(titleLink || item.querySelector('h2, h3, h4'));

    const img = buildImage(document, item.querySelector('.b-newsroomDch__itemImage, img'));

    const body = [];
    const tag = cleanText(item.querySelector('.b-newsroomDch__tag'));
    if (tag) body.push(textP(document, tag));
    if (title) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = title;
        h3.append(a);
      } else {
        h3.textContent = title;
      }
      body.push(h3);
    }
    const excerpt = cleanText(item.querySelector('.b-newsroomDch__description'));
    if (excerpt) body.push(textP(document, excerpt));
    const date = cleanText(item.querySelector('.b-newsroomDch__date'));
    if (date) body.push(textP(document, date));

    if (img || body.length) cells.push([img ? [img] : '', body]);
  });

  if (defaultContent.length) element.before(...defaultContent);
  // carousel lists (e.g. Related Articles) have no featured first card
  const isSlider = !!element.querySelector('.b-newsroomDch.-carousel');
  const block = WebImporter.Blocks.createBlock(document, { name: isSlider ? 'Cards News (slider)' : 'cards-news', cells });
  element.replaceWith(block);
}
