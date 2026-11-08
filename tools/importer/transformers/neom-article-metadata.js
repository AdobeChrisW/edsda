/* eslint-disable */
/* global WebImporter */

/**
 * NEOM article metadata transformer (article templates only).
 *
 * beforeTransform: reads the publication date and topic tags from the article component
 * (c44-article-content) and keeps them on the payload.
 * afterMetadata: appends Template / Publication Date / Tags rows to the Metadata block
 * that WebImporter.rules.createMetadata() built from the page head.
 */

const ARTICLE_TEMPLATES = ['newsroom-2', 'news'];

let articleMeta = null;

function toIsoDate(text) {
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readArticleMeta(document) {
  const article = document.querySelector('.cmp-c44-article-content');
  if (!article) return null;
  const dateEl = article.querySelector('.paragraph-date, .b-articleContent__datePublished');
  const date = dateEl ? toIsoDate(dateEl.textContent.trim()) : '';
  let tags = [...article.querySelectorAll('.b-articleContent__tags-row .tag-label')]
    .map((a) => a.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (!tags.length) {
    const keywords = document.querySelector('meta[name="keywords"]');
    if (keywords) tags = keywords.getAttribute('content').split(',').map((t) => t.trim()).filter(Boolean);
  }
  return { date, tags };
}

function addRow(document, table, key, value) {
  const tr = document.createElement('tr');
  const k = document.createElement('td');
  const v = document.createElement('td');
  k.textContent = key;
  v.textContent = value;
  tr.append(k, v);
  (table.querySelector('tbody') || table).append(tr);
}

export default function transform(hookName, element, payload) {
  if (!payload.template || !ARTICLE_TEMPLATES.includes(payload.template.name)) return;
  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    // each hook gets a fresh payload copy, so keep the values in module state (one page per run)
    articleMeta = readArticleMeta(document);
    return;
  }

  if (hookName === 'afterMetadata') {
    const meta = articleMeta || {};
    const table = [...element.querySelectorAll('table')].find((t) => {
      const first = t.querySelector('th, td');
      return first && first.textContent.trim().toLowerCase() === 'metadata';
    });
    if (!table) return;
    addRow(document, table, 'Template', 'article');
    if (meta.date) addRow(document, table, 'Publication Date', meta.date);
    if (meta.tags && meta.tags.length) addRow(document, table, 'Tags', meta.tags.join(', '));
  }
}
