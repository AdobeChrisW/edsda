/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-share
 * Sources:
 *  - .b-articleContent__share-list (newsroom article): "SHARE THIS ARTICLE" label + social links
 *  - .b-articleContent__buttons (Sports Club article): Back link + collapsed Share button
 * Block model (Columns convention): one row with two columns,
 * column 1 = label, column 2 = list of network links.
 * The block rebuilds share URLs from the current page at runtime, so links only name the network.
 * Link text = the source network label kept verbatim (a[data-label] / aria-label on the
 * share list, items[].label of the Share button's data-share JSON in the modal variant,
 * e.g. "Twitter"); the NETWORKS text is only a fallback when the source has no label.
 */

const NETWORKS = [
  { test: /twitter\.com|x\.com/i, text: 'X', href: 'https://twitter.com/intent/tweet' },
  { test: /linkedin/i, text: 'LinkedIn', href: 'https://www.linkedin.com/shareArticle' },
  { test: /facebook/i, text: 'Facebook', href: 'https://www.facebook.com/sharer/sharer.php' },
  { test: /wa\.me|whatsapp/i, text: 'WhatsApp', href: 'https://wa.me/' },
  { test: /^mailto:|email/i, text: 'Email', href: 'mailto:' },
  { test: /copy|clipboard/i, text: 'Copy link', href: '#copy' },
];

function cleanText(el) {
  return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
}

function linkList(document, items) {
  const ul = document.createElement('ul');
  items.forEach(({ text, href }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    li.append(a);
    ul.append(li);
  });
  return ul;
}

function sourceLabel(link) {
  const attr = ['data-label', 'aria-label', 'title']
    .map((a) => (link.getAttribute(a) || '').replace(/\s+/g, ' ').trim())
    .find(Boolean);
  return attr || cleanText(link);
}

function addNetwork(found, key, label) {
  const net = NETWORKS.find((n) => n.test.test(key));
  if (!net || found.some((f) => f.net === net)) return;
  found.push({ net, text: label || net.text, href: net.href });
}

// Share button of the modal variant: <button data-share='{"heading":{"text":"Share"},"items":[{id,label,href}]}'>
function shareData(element) {
  const btn = element.querySelector('[data-share]');
  if (!btn) return null;
  try {
    return JSON.parse(btn.getAttribute('data-share'));
  } catch (e) {
    return null;
  }
}

function networksFrom(element, data) {
  const found = [];
  element.querySelectorAll('.m-social__item').forEach((item) => {
    const link = item.querySelector('a, button');
    if (!link) return;
    const key = `${link.getAttribute('href') || ''} ${link.getAttribute('data-share-type') || ''} ${link.getAttribute('aria-label') || ''} ${link.className || ''} ${cleanText(link)}`;
    addNetwork(found, key, sourceLabel(link));
  });
  if (!found.length && data && Array.isArray(data.items)) {
    data.items.forEach((it) => {
      if (!it) return;
      const label = (it.label || '').replace(/\s+/g, ' ').trim();
      addNetwork(found, `${it.href || ''} ${it.id || ''} ${label}`, label);
    });
  }
  return found.length ? found : NETWORKS;
}

export default function parse(element, { document }) {
  const isModal = element.classList.contains('b-articleContent__buttons');
  const data = shareData(element);
  const modalLabel = (data && data.heading && (data.heading.text || '').trim()) || 'Share';
  const label = isModal ? modalLabel : (cleanText(element.querySelector('.b-articleContent__share-label')) || 'Share this article');

  if (isModal) {
    // the Back link stays as default content before the block
    const back = element.querySelector('a[href]');
    if (back) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = back.getAttribute('href');
      a.textContent = cleanText(back) || 'Back';
      p.append(a);
      element.before(p);
    }
  }

  const cells = [[label, linkList(document, networksFrom(element, data))]];
  const block = WebImporter.Blocks.createBlock(document, { name: isModal ? 'Columns Share (modal)' : 'columns-share', cells });
  element.replaceWith(block);
}
