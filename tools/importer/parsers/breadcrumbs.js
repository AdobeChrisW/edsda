/* eslint-disable */
/* global WebImporter */

/**
 * Parser: breadcrumbs
 * Source: .c98-breadcrumbs (section.b-breadcrumbs > .m-breadcrumbs >
 *   ul.m-breadcrumbs__items > li.m-breadcrumbs__item > a[href]).
 *   The chevron dividers (span.a-icon) and the JSON-LD BreadcrumbList script
 *   are not content and are dropped.
 * Block model: one row, one cell holding an unordered list. Each <li> holds a
 * link (relative /en-us/... href, label verbatim, e.g. "HOME", "About US");
 * the LAST item (the current page, li.-isActive) is plain text without a link.
 * Registration: the import scripts are generated from the page-templates.json
 * block names, so this file name (breadcrumbs.js) is all that is needed.
 */

const ORIGIN_RE = /^https?:\/\/(www\.)?neom\.com(?=\/|$)/i;

function cleanText(el) {
  return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
}

// keep site links relative (/en-us/...), as authored on the source
function relHref(href) {
  const h = (href || '').trim();
  if (!h) return '';
  const rel = h.replace(ORIGIN_RE, '');
  return rel || '/';
}

export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.m-breadcrumbs__items > .m-breadcrumbs__item, ul.m-breadcrumbs__items > li')]
    .filter((li, i, all) => all.indexOf(li) === i);

  const ul = document.createElement('ul');
  items.forEach((item, idx) => {
    const link = item.querySelector('a[href]');
    const label = cleanText(link || item);
    if (!label) return;
    const li = document.createElement('li');
    const isLast = idx === items.length - 1;
    if (link && !isLast) {
      const a = document.createElement('a');
      a.href = relHref(link.getAttribute('href'));
      a.textContent = label;
      li.append(a);
    } else {
      li.textContent = label;
    }
    ul.append(li);
  });

  const cells = [[ul.children.length ? [ul] : '']];
  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumbs', cells });
  element.replaceWith(block);
}
