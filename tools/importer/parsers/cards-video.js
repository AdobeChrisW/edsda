/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-video
 * Source: .cmp-c29-stories (ul.o-stories__list > li.o-stories__item > .o-storyCard)
 * The video URL lives in the JSON data-video attribute
 * (props.sources[].src, fallback props.eventTracking.video.src).
 * The stories heading ("MATCH MOMENTS") is default content before the block.
 * Block model: one row per story: cell 1 = poster image + link to the video,
 * cell 2 = caption paragraph.
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

function videoUrlFrom(card) {
  const holders = [card, ...card.querySelectorAll('[data-video]')];
  for (const h of holders) {
    const raw = h.getAttribute && h.getAttribute('data-video');
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      const props = data.props || data;
      const src = (props.sources && props.sources.find((s) => s && s.src) || {}).src
        || (props.eventTracking && props.eventTracking.video && props.eventTracking.video.src);
      if (src) return absUrl(src);
    } catch (e) {
      // ignore malformed JSON
    }
  }
  const video = card.querySelector('video');
  if (video) {
    const src = video.getAttribute('src') || [...video.querySelectorAll('source')].map((s) => s.getAttribute('src') || s.getAttribute('data-src')).find(Boolean);
    if (src) return absUrl(src);
  }
  return '';
}

export default function parse(element, { document }) {
  const cells = [];
  const defaultContent = [];

  const heading = element.querySelector('.o-stories__heading .a-heading, .o-stories__heading h2');
  if (heading && cleanText(heading)) {
    const h2 = document.createElement('h2');
    h2.textContent = cleanText(heading);
    defaultContent.push(h2);
  }

  element.querySelectorAll('.o-stories__item').forEach((item) => {
    const card = item.querySelector('.o-storyCard') || item;
    const media = [];
    const img = buildImage(document, card.querySelector('.o-storyCard__figure img, img'));
    if (img) media.push(img);
    const url = videoUrlFrom(card);
    const caption = cleanText(card.querySelector('.o-storyCard__title, .o-storyCard__copy'));
    if (url) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = url;
      a.textContent = url;
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
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-video', cells });
  element.replaceWith(block);
}
