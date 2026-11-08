/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-media
 * Sources:
 *   .cmp-c09-content-group  -> ul.b-contentGroup__items > li.b-contentGroup__item > .o-textAsset
 *                              (one row per item; .-assetFirst = image left)
 *   .cmp-c24-content:has(img) -> section.b-content > .o-contentGrid (single row;
 *                              .-assetLast = image right)
 * Block model: one row per media/text pair; one cell = image, other cell =
 * eyebrow paragraph + h2 + paragraph(s) + CTA link. Image cell first or last
 * selects its side.
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
  const blocks = container.querySelectorAll(':scope > p, :scope > ul, :scope > ol, :scope > h3, :scope > h4, :scope > blockquote');
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

function buildHeading(document, src) {
  const h2 = document.createElement('h2');
  h2.innerHTML = src.innerHTML.trim();
  h2.querySelectorAll('span:not([class]), div').forEach((n) => n.replaceWith(...n.childNodes));
  while (h2.lastChild && (h2.lastChild.nodeName === 'BR' || (h2.lastChild.nodeType === 3 && !h2.lastChild.textContent.trim()))) {
    h2.lastChild.remove();
  }
  return h2;
}

function buildContent(document, contentEl, buttonsEl) {
  const content = [];
  if (!contentEl) return content;
  const eyebrow = contentEl.querySelector('.a-eyebrow');
  if (eyebrow && cleanText(eyebrow)) {
    const p = document.createElement('p');
    p.textContent = cleanText(eyebrow);
    content.push(p);
  }
  const heading = contentEl.querySelector('.m-paragraph__heading .a-heading, .m-paragraph__heading h1, .m-paragraph__heading h2, .m-paragraph__heading h3, .m-paragraph__heading h4');
  if (heading && cleanText(heading)) content.push(buildHeading(document, heading));
  content.push(...paragraphsFrom(document, contentEl.querySelector('.m-paragraph__content')));
  const btnScope = buttonsEl || contentEl;
  btnScope.querySelectorAll('a.m-button[href]').forEach((btn) => {
    const text = cleanText(btn.querySelector('.a-label') || btn) || (btn.getAttribute('title') || '').trim();
    if (!text) return;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = absUrl(btn.getAttribute('href'));
    a.textContent = text;
    p.append(a);
    content.push(p);
  });
  return content;
}

function pushRow(cells, imageEl, content, imageFirst) {
  const imageCell = imageEl ? [imageEl] : [];
  if (!imageEl) {
    cells.push([content]);
    return;
  }
  cells.push(imageFirst ? [imageCell, content] : [content, imageCell]);
}

export default function parse(element, { document }) {
  const cells = [];

  const groupItems = element.querySelectorAll('.b-contentGroup__item');
  if (groupItems.length) {
    // c09 content group: one row per text/asset item
    groupItems.forEach((item) => {
      const ta = item.querySelector('.o-textAsset') || item;
      const contentItem = ta.querySelector('.o-textAsset__item.-content') || ta;
      const assetItem = ta.querySelector('.o-textAsset__item.-asset');
      const img = buildImage(document, assetItem && assetItem.querySelector('img'));
      const content = buildContent(document, contentItem, ta.querySelector('.o-textAsset__buttons'));
      const imageFirst = ta.classList.contains('-assetFirst');
      if (img || content.length) pushRow(cells, img, content, imageFirst);
    });
  } else {
    // c24 content: single text/asset row
    const section = element.querySelector('.b-content') || element;
    const contentItem = section.querySelector('.o-contentGrid__item.-paragraph') || section;
    const assetItem = section.querySelector('.o-contentGrid__item.-asset');
    const img = buildImage(document, (assetItem || section).querySelector('img'));
    const buttons = section.querySelector('.o-contentGrid__buttons');
    const content = buildContent(document, contentItem, buttons);
    let imageFirst;
    if (section.classList.contains('-assetLast')) imageFirst = false;
    else if (section.classList.contains('-assetFirst')) imageFirst = true;
    else {
      // fall back to DOM order
      const items = [...section.querySelectorAll('.o-contentGrid__item')];
      imageFirst = assetItem ? items.indexOf(assetItem) === 0 : false;
    }
    if (img || content.length) pushRow(cells, img, content, imageFirst);
  }

  // block options from source modifiers (see blocks/columns-media/README.md)
  const options = [];
  if (element.querySelector('figure.m-figure.-square')) options.push('square');
  const rows = [...element.querySelectorAll('.b-contentGroup__item .o-textAsset')];
  if (rows.length) {
    const pulled = rows.filter((r) => r.classList.contains('-assetPull')).length;
    if (pulled === rows.length) options.push('pull');
    else if (pulled === 0) options.push('inset');
  }
  if (element.querySelector('h2.a-heading.-h5, h3.a-heading.-h5')) options.push('large-heading');
  const name = options.length ? `Columns Media (${options.join(', ')})` : 'columns-media';
  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
