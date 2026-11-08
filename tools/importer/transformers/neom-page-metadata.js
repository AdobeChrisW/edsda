/* eslint-disable */
/* global WebImporter */

/**
 * NEOM page metadata transformer (all templates).
 *
 * beforeTransform: picks the rows for the page path.
 * afterMetadata: adds section-specific fragment rows to the Metadata block, chosen by page path:
 * - /en-us/neom-sports-club and below: Nav + Footer point at the Sports Club sub-brand fragments
 * - /en-us/newsroom and below: Subnav points at the NEWS & MEDIA sub-menu bar fragment
 * The header/footer blocks read these rows (as <meta> tags on EDS, or from the block locally).
 */

const RULES = [
  {
    match: /^\/en-us\/neom-sports-club(\/|$)/,
    rows: [['Nav', '/en-us/neom-sports-club/nav'], ['Footer', '/en-us/neom-sports-club/footer']],
  },
  {
    match: /^\/en-us\/newsroom(\/|$)/,
    rows: [['Subnav', '/en-us/newsroom/subnav']],
  },
];

function pagePath(payload) {
  const raw = (payload.params && payload.params.originalURL) || payload.url || '';
  try {
    return new URL(raw).pathname.replace(/\.html?$/, '').replace(/\/$/, '');
  } catch (e) {
    return '';
  }
}

function findMetadataTable(element) {
  return [...element.querySelectorAll('table')].find((t) => {
    const first = t.querySelector('th, td');
    return first && first.textContent.trim().toLowerCase() === 'metadata';
  });
}

let pageRows = [];

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // each hook gets a fresh payload copy, so keep the rows in module state (one page per run)
    const path = pagePath(payload);
    pageRows = RULES.filter((r) => r.match.test(path)).flatMap((r) => r.rows);
    return;
  }
  if (hookName !== 'afterMetadata') return;
  const rows = pageRows;
  if (!rows.length) return;

  const document = element.ownerDocument;
  let table = findMetadataTable(element);
  if (!table) {
    table = WebImporter.DOMUtils.createTable([['Metadata']], document);
    element.append(table);
  }
  const body = table.querySelector('tbody') || table;
  const existing = new Set([...table.querySelectorAll('tr')]
    .map((tr) => (tr.querySelector('td, th') || {}).textContent)
    .filter(Boolean)
    .map((k) => k.trim().toLowerCase()));
  rows.forEach(([key, value]) => {
    if (existing.has(key.toLowerCase())) return;
    const tr = document.createElement('tr');
    const k = document.createElement('td');
    const v = document.createElement('td');
    k.textContent = key;
    v.textContent = value;
    tr.append(k, v);
    body.append(tr);
  });
}
