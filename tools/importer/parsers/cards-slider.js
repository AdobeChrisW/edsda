/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-slider
 * Sources:
 *   .cmp-c11-slider  -> .o-genericSlider: header (eyebrow + lead heading) and
 *                       li.swiper-slide > .o-contentCard (image, h3, text, CTA)
 *   .cmp-c113-simple-card-carousel -> .o-dynamicCarousel: first slide is a
 *                       text card (heading + paragraph), remaining slides are
 *                       .o-galleryCard photos.
 * Block model: optional single-cell intro row (c113 text card); then one row per card:
 *   cell 1 = image, cell 2 = title + short text + arrow link (empty for photos).
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

function copyHeading(document, src, tag) {
  const h = document.createElement(tag);
  h.innerHTML = src.innerHTML.trim();
  h.querySelectorAll('span, div, p').forEach((n) => n.replaceWith(...n.childNodes));
  h.querySelectorAll('strong').forEach((s) => { s.textContent = cleanText(s); });
  h.querySelectorAll('br').forEach((br) => { if (!br.nextSibling || !cleanText({ textContent: br.nextSibling.textContent || '' })) br.remove(); });
  return cleanText(h) ? h : null;
}

function parseGenericSlider(document, element, cells, defaultContent) {
  // eyebrow + lead heading are default content before the block
  // (authoring-analysis rc5-s1)
  const header = element.querySelector('.o-genericSlider__header');
  const intro = [];
  if (header) {
    const eyebrow = header.querySelector('.a-eyebrow');
    if (eyebrow && cleanText(eyebrow)) {
      const p = document.createElement('p');
      p.textContent = cleanText(eyebrow);
      intro.push(p);
    }
    const lead = header.querySelector('.o-genericSlider__titleWrapper .a-heading, .o-genericSlider__titleWrapper h2');
    if (lead && cleanText(lead)) {
      const h = copyHeading(document, lead, 'h2');
      if (h) intro.push(h);
    }
  }
  defaultContent.push(...intro);

  element.querySelectorAll('.o-genericSlider__content .swiper-slide').forEach((slide) => {
    const card = slide.querySelector('.o-contentCard') || slide;
    const img = buildImage(document, card.querySelector('.o-contentCard__preview img, img'));
    const overlay = card.querySelector('a.o-contentCard__link[href]');
    const href = overlay ? absUrl(overlay.getAttribute('href')) : '';
    const body = [];
    const title = card.querySelector('.o-contentCard__heading');
    if (title && cleanText(title)) {
      const h3 = document.createElement('h3');
      h3.textContent = cleanText(title);
      body.push(h3);
    }
    body.push(...paragraphsFrom(document, card.querySelector('.o-contentCard__description')));
    const cta = card.querySelector('.o-contentCard__content .m-button');
    const ctaText = cta ? (cleanText(cta.querySelector('.a-label') || cta) || (cta.getAttribute('title') || '').trim()) : '';
    const ctaHref = (cta && cta.getAttribute('href')) ? absUrl(cta.getAttribute('href')) : href;
    if (ctaHref) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = ctaHref;
      a.textContent = ctaText || cleanText(title) || ctaHref;
      p.append(a);
      body.push(p);
    } else if (ctaText) {
      const p = document.createElement('p');
      p.textContent = ctaText;
      body.push(p);
    }
    if (img || body.length) cells.push([img ? [img] : '', body]);
  });
}

function parseSimpleCardCarousel(document, element, cells) {
  const slides = element.querySelectorAll('.swiper-slide');
  slides.forEach((slide) => {
    const textCard = slide.querySelector('.b-simpleCardCarousel__textCard');
    if (textCard) {
      const intro = [];
      const heading = textCard.querySelector('.m-paragraph__heading .a-heading, .m-paragraph__heading h1, .m-paragraph__heading h2, .m-paragraph__heading h3, .m-paragraph__heading h4');
      if (heading) {
        const h = copyHeading(document, heading, 'h4');
        if (h) intro.push(h);
      }
      intro.push(...paragraphsFrom(document, textCard.querySelector('.m-paragraph__content')));
      textCard.querySelectorAll('.b-simpleCardCarousel__buttonsWrapper a[href]').forEach((btn) => {
        const t = cleanText(btn.querySelector('.a-label') || btn);
        if (!t) return;
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = absUrl(btn.getAttribute('href'));
        a.textContent = t;
        p.append(a);
        intro.push(p);
      });
      if (intro.length) cells.push([intro]);
      return;
    }
    const img = buildImage(document, slide.querySelector('img'));
    if (!img) return;
    const body = [];
    const caption = slide.querySelector('.o-galleryCard__caption, .o-galleryCard__title, figcaption');
    if (caption && cleanText(caption)) {
      const p = document.createElement('p');
      p.textContent = cleanText(caption);
      body.push(p);
    }
    cells.push([[img], body.length ? body : '']);
  });
}

export default function parse(element, { document }) {
  const cells = [];
  const defaultContent = [];

  if (element.querySelector('.o-genericSlider')) {
    parseGenericSlider(document, element, cells, defaultContent);
  } else {
    parseSimpleCardCarousel(document, element, cells);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-slider', cells });
  if (defaultContent.length) element.before(...defaultContent);
  element.replaceWith(block);
}
