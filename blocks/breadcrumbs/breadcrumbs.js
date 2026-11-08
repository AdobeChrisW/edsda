/**
 * breadcrumbs: source .c98-breadcrumbs (neom.com).
 * Authored model: one row, one cell holding a <ul>; each <li> holds a link,
 * except the last one (the current page), which is plain text.
 * Renders <nav aria-label="Breadcrumb"><ol>…</ol></nav>; the chevron
 * separators are drawn in CSS so screen readers do not announce them.
 */

function readItems(block) {
  const lis = [...block.querySelectorAll('li')];
  if (lis.length) {
    return lis.map((li) => {
      const link = li.querySelector('a[href]');
      return {
        label: (link || li).textContent.replace(/\s+/g, ' ').trim(),
        href: link ? link.getAttribute('href') : '',
      };
    });
  }
  // fallback: links / paragraphs authored without a list
  return [...block.querySelectorAll('a[href], p')]
    .filter((el) => el.tagName === 'A' || !el.querySelector('a'))
    .map((el) => ({
      label: el.textContent.replace(/\s+/g, ' ').trim(),
      href: el.tagName === 'A' ? el.getAttribute('href') : '',
    }));
}

export default function decorate(block) {
  const items = readItems(block).filter((item) => item.label);

  const nav = document.createElement('nav');
  nav.className = 'breadcrumbs-nav';
  nav.setAttribute('aria-label', 'Breadcrumb');

  const list = document.createElement('ol');
  list.className = 'breadcrumbs-list';

  items.forEach(({ label, href }, idx) => {
    const li = document.createElement('li');
    li.className = 'breadcrumbs-item';
    const isLast = idx === items.length - 1;
    if (href && !isLast) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      li.append(a);
    } else {
      const span = document.createElement('span');
      span.className = 'breadcrumbs-current';
      span.textContent = label;
      li.append(span);
    }
    if (isLast) li.setAttribute('aria-current', 'page');
    list.append(li);
  });

  nav.append(list);
  block.replaceChildren(nav);
}
