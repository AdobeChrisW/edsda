/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-gallery
 * Source: .cmp-c112-video-gallery (li.b-videoGallery__item > .o-galleryCard
 * with thumbnail image + .o-galleryCard__copy caption).
 * The component header (eyebrow + heading) is default content before the
 * block.
 * Block model: one row per item: cell 1 = image (opens lightbox), cell 2 =
 * caption paragraph. If a gallery item carries a video in its lightbox data,
 * a link to the video is added below the image.
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

function buildImage(document, img, fallbackAlt) {
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
  // the source CMS uses the literal placeholder "alt"
  out.alt = (!alt || /^(alt|null|image)$/i.test(alt)) ? (fallbackAlt || '') : alt;
  return out;
}

function lightboxVideo(card) {
  const raw = card.getAttribute('data-lightbox-item');
  if (!raw) return '';
  try {
    const data = JSON.parse(raw);
    const v = data.video || (data.props && data.props.video);
    if (!v) return '';
    const src = v.src || (v.sources && v.sources[0] && v.sources[0].src) || v.url;
    return src ? absUrl(src) : '';
  } catch (e) {
    return '';
  }
}

export default function parse(element, { document }) {
  const cells = [];
  const defaultContent = [];

  const header = element.querySelector('.m-componentHeader');
  if (header) {
    const eyebrow = cleanText(header.querySelector('.a-eyebrow'));
    if (eyebrow) {
      const p = document.createElement('p');
      p.textContent = eyebrow;
      defaultContent.push(p);
    }
    const heading = cleanText(header.querySelector('.a-heading'));
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading;
      defaultContent.push(h2);
    }
  }

  element.querySelectorAll('.b-videoGallery__item').forEach((item) => {
    const card = item.querySelector('.o-galleryCard') || item;
    const caption = cleanText(card.querySelector('.o-galleryCard__copy'));
    const media = [];
    const img = buildImage(document, card.querySelector('.o-galleryCard__thumbnail img, img'), caption);
    if (img) media.push(img);
    const video = lightboxVideo(card);
    if (video) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = video;
      a.textContent = video;
      p.append(a);
      media.push(p);
    }
    const body = [];
    if (caption) {
      const p = document.createElement('p');
      p.textContent = caption;
      body.push(p);
    }
    if (media.length || body.length) cells.push([media, body]);
  });

  if (defaultContent.length) element.before(...defaultContent);
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gallery', cells });
  element.replaceWith(block);
}
