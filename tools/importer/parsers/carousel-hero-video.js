/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel-hero-video
 * Source: .cmp-c12-hero-slider (section.b-heroSliderV2)
 * Block model: one row per slide
 *   cell 1 = background media (img and/or link to the .mp4 / Scene7 video)
 *   cell 2 = optional eyebrow + title (h1 when the source heading is an h1,
 *            else h2) + description + CTA link
 * Option: the "-disableFullScreen" slider modifier (short, non full-height
 * hero) -> block option "short" ('Carousel Hero Video (short)').
 * Eyebrows hidden by the source (.b-heroSliderV2 .m-componentHeader__container
 * > .a-eyebrow is display:none on the live site) or empty are skipped.
 * Handles both hydrated DOM (video[src], source[src]) and server HTML
 * (source[data-src]).
 */

const ORIGIN = 'https://www.neom.com';

function absUrl(url) {
  if (!url) return '';
  const u = url.trim();
  if (/^(https?:|data:)/i.test(u)) return u;
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

function videoUrl(scope) {
  const video = scope.querySelector('video');
  if (!video) return '';
  const candidates = [
    video.getAttribute('src'),
    video.getAttribute('data-src'),
    ...[...video.querySelectorAll('source')].map((s) => s.getAttribute('src') || s.getAttribute('data-src')),
  ];
  const found = candidates.find((c) => c && c.trim());
  return found ? absUrl(found) : '';
}

function buildHeading(document, srcHeading) {
  // keep the page h1 (e.g. /regions/theline, /about/social-responsibility); h2 otherwise
  const h2 = document.createElement(srcHeading.tagName === 'H1' ? 'h1' : 'h2');
  const extras = [];
  [...srcHeading.childNodes].forEach((n) => {
    if (n.nodeType === 1 && n.tagName === 'BR') {
      h2.append(document.createElement('br'));
    } else if (n.nodeType === 1 && /^(DIV|P|SPAN)$/.test(n.tagName) && n.tagName !== 'SPAN') {
      // e.g. "RIYADH, SAUDI ARABIA" nested in the heading -> separate paragraph
      const t = cleanText(n);
      if (t) {
        const p = document.createElement('p');
        p.textContent = t;
        extras.push(p);
      }
    } else if (n.nodeType === 3 || n.nodeType === 1) {
      const t = n.textContent.replace(/\s+/g, ' ');
      if (t.trim()) h2.append(document.createTextNode(t.trim()));
    }
  });
  return { h2, extras };
}

// The source hides the slide-header eyebrow of the V2 slider via CSS
// (.b-heroSliderV2 .m-componentHeader__container > .a-eyebrow { display: none }),
// so it renders 0x0; also honour explicit hidden states.
function isHiddenEyebrow(el) {
  if (el.closest('.b-heroSliderV2') && el.parentElement
    && el.parentElement.classList.contains('m-componentHeader__container')) return true;
  if (el.closest('[hidden], [aria-hidden="true"], .-isHidden')) return true;
  const style = (el.getAttribute('style') || '').replace(/\s+/g, '');
  return /display:none|visibility:hidden/i.test(style);
}

export default function parse(element, { document }) {
  const cells = [];
  const slides = element.querySelectorAll('.b-heroSliderV2__slide');

  // legacy slider (b-heroSlider, e.g. /regions/theline): each slide is an o-heroContent
  element.querySelectorAll('.b-heroSlider__item .o-heroContent').forEach((slide) => {
    const media = [];
    const img = buildImage(document, slide.querySelector('.m-componentBackground .a-image img, picture img'));
    if (img) media.push(img);
    const vUrl = videoUrl(slide);
    if (vUrl) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = vUrl;
      a.textContent = vUrl;
      p.append(a);
      media.push(p);
    }
    const content = [];
    const heading = slide.querySelector('.o-heroContent__content .a-heading, .o-heroContent__content h1, .o-heroContent__content h2');
    if (heading && cleanText(heading)) {
      const { h2, extras } = buildHeading(document, heading);
      content.push(h2, ...extras);
    }
    slide.querySelectorAll('.o-heroContent__content .m-componentHeader p').forEach((el) => {
      if (!cleanText(el)) return;
      const p = document.createElement('p');
      p.textContent = cleanText(el);
      content.push(p);
    });
    slide.querySelectorAll('.o-heroContent__buttons a.m-button[href]').forEach((btn) => {
      const label = cleanText(btn.querySelector('.a-label') || btn);
      if (!label) return;
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = absUrl(btn.getAttribute('href'));
      a.textContent = label;
      p.append(a);
      content.push(p);
    });
    if (media.length || content.length) cells.push([media, content]);
  });

  slides.forEach((slide) => {
    // media cell
    const media = [];
    const img = buildImage(document, slide.querySelector('.a-image img, picture img'));
    if (img) media.push(img);
    const vUrl = videoUrl(slide);
    if (vUrl) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = vUrl;
      a.textContent = vUrl;
      p.append(a);
      media.push(p);
    }

    // content cell
    const content = [];
    const copy = slide.querySelector('.b-heroSliderV2__copy') || slide;
    const eyebrow = copy.querySelector('.m-componentHeader .a-eyebrow');
    if (eyebrow && cleanText(eyebrow) && !isHiddenEyebrow(eyebrow)) {
      const p = document.createElement('p');
      p.textContent = cleanText(eyebrow);
      content.push(p);
    }
    const heading = copy.querySelector('.a-heading, h1, h2, h3, h4, h5, h6');
    if (heading && cleanText(heading)) {
      const { h2, extras } = buildHeading(document, heading);
      content.push(h2, ...extras);
    }
    const desc = copy.querySelector('.b-heroSliderV2__copyDescription');
    if (desc && cleanText(desc)) {
      const p = document.createElement('p');
      p.textContent = cleanText(desc);
      content.push(p);
    }
    copy.querySelectorAll('.b-heroSliderV2__buttons a.m-button[href], .b-heroSliderV2__buttons button.m-button').forEach((btn) => {
      const label = cleanText(btn.querySelector('.a-label') || btn) || (btn.getAttribute('title') || '').trim();
      if (!label) return;
      const p = document.createElement('p');
      const href = btn.getAttribute('href');
      if (btn.tagName === 'A' && href) {
        const a = document.createElement('a');
        a.href = absUrl(href);
        a.textContent = label;
        p.append(a);
      } else if (vUrl) {
        // "Watch full video" overlay button: no URL in the DOM, link to the slide video
        const a = document.createElement('a');
        a.href = vUrl;
        a.textContent = label;
        p.append(a);
      } else {
        p.textContent = label;
      }
      content.push(p);
    });

    if (media.length || content.length) cells.push([media, content]);
  });

  const slider = element.matches('.b-heroSliderV2, .b-heroSlider')
    ? element : element.querySelector('.b-heroSliderV2, .b-heroSlider');
  // block options from source modifiers (see blocks/carousel-hero-video/README.md)
  const options = [];
  if (slider && slider.classList.contains('-disableFullScreen')) options.push('short');
  if (slider && slider.classList.contains('b-heroSlider') && !slider.classList.contains('b-heroSliderV2')) options.push('classic');
  const firstHeading = element.querySelector('.b-heroSliderV2__copy .a-heading, .o-heroContent__content .a-heading');
  if (firstHeading && firstHeading.classList.contains('-h4')) options.push('large-title');
  if (firstHeading && firstHeading.classList.contains('-h5')) options.push('small-title');
  // sub-line rendered inside the heading element (e.g. fii-2025 "RIYADH, SAUDI ARABIA")
  if (firstHeading && [...firstHeading.children].some((c) => !/^BR$/i.test(c.tagName) && cleanText(c)
    && cleanText(c) !== cleanText(firstHeading))) options.push('inline-subtitle');
  const name = options.length ? `Carousel Hero Video (${options.join(', ')})` : 'carousel-hero-video';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
