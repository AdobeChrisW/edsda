const CHEVRON_SVG = '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M15.4 3.7c-.2-.2-.4-.2-.7-.1L8 8.1 1.3 3.6c-.2-.2-.5-.1-.7.1-.2.2-.2.5 0 .7l7 8c.1.1.2.2.4.2s.3-.1.4-.2l7-8c.1-.3.1-.5 0-.7z"/></svg>';

function textOf(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Reads a page metadata value. EDS turns the page's Metadata block into lowercase
 * <meta name> tags; the local preview keeps the authored case ("Footer") or leaves the
 * Metadata block in the page, so match names case-insensitively and fall back to the block rows.
 * @param {string} name metadata key, e.g. "footer"
 * @returns {string}
 */
function pageMeta(name) {
  const tag = [...document.head.querySelectorAll('meta[name]')]
    .find((m) => m.getAttribute('name').toLowerCase() === name);
  if (tag) return tag.content.trim();
  const row = [...document.querySelectorAll('main .metadata > div')]
    .find((r) => textOf(r.children[0]).toLowerCase().replace(/\s+/g, '-') === name);
  return row && row.children[1] ? textOf(row.children[1]) : '';
}

/**
 * Normalizes an authored fragment reference (absolute URL, /content prefix or
 * .html extension) to a plain site path such as /en-us/neom-sports-club/footer.
 * Stripping /content keeps the two fetches below distinct: the site-root fallback
 * never collapses onto the /content copy, so the fragment still resolves on DA/EDS.
 * @param {string} value metadata value
 * @returns {string} site path, or '' when the value is not a same-site path
 */
function toFragmentPath(value) {
  if (!value) return '';
  let url;
  try {
    url = new URL(value, window.location.origin);
  } catch {
    return '';
  }
  if (url.origin !== window.location.origin && !/\.(aem|hlx)\.(page|live)$/.test(url.hostname)) return '';
  const path = url.pathname
    .replace(/^\/content(?=\/)/, '')
    .replace(/(\.plain)?\.html$/, '')
    .replace(/\/$/, '');
  return /^(\/[\w-]+)+$/.test(path) ? path : '';
}

/**
 * Fetches a fragment by site path: /content first (local preview), then the site root (DA/EDS).
 * @param {string} path site path from toFragmentPath()
 * @returns {Promise<{html: string, url: string}|null>}
 */
async function fetchFragmentAt(path) {
  if (!path) return null;
  const localUrl = `/content${path}.plain.html`;
  const rootUrl = `${path}.plain.html`;
  let resp = await fetch(localUrl);
  if (!resp.ok) resp = await fetch(rootUrl);
  if (!resp.ok) return null;
  return { html: await resp.text(), url: resp.url };
}

/**
 * Fetches the footer fragment. A page can point at its own footer with a "footer"
 * metadata row (e.g. the NEOM Sports Club sub-brand); otherwise, and whenever that
 * override does not resolve, the default footer loads from its fixed,
 * metadata-independent paths: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, url: string}|null>}
 */
async function fetchFooterFragment() {
  const override = await fetchFragmentAt(toFragmentPath(pageMeta('footer')));
  if (override) return override;
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), url: resp.url };
}

/**
 * Resolves image paths relative to the fragment, not the current page.
 * @param {Element} root fragment root
 * @param {string} baseUrl fragment URL
 */
function resolveImages(root, baseUrl) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), baseUrl).href;
  });
}

/**
 * Opens off-site links in a new tab.
 * @param {Element} root container
 */
function decorateExternalLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href, window.location.href);
    if (url.origin !== window.location.origin) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

/**
 * Builds one link group: a heading (static on desktop, an accordion toggle on mobile) + its list.
 * @param {Element} heading authored heading
 * @param {Element} list authored list
 * @param {string} id unique id for aria-controls
 * @returns {Element} group element
 */
function buildGroup(heading, list, id) {
  const group = document.createElement('div');
  group.className = 'footer-group';

  const title = document.createElement('h3');
  title.className = 'footer-group-heading';
  const label = document.createElement('span');
  label.className = 'footer-group-label';
  label.textContent = textOf(heading);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'footer-group-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', id);
  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'footer-group-toggle-label';
  toggleLabel.textContent = label.textContent;
  toggle.append(toggleLabel);
  toggle.insertAdjacentHTML('beforeend', CHEVRON_SVG);
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    // groups expand independently; the list animates its max-height to the content height
    list.style.setProperty('--footer-links-height', `${list.scrollHeight}px`);
    toggle.setAttribute('aria-expanded', String(open));
    group.classList.toggle('is-open', open);
  });

  title.append(label, toggle);
  list.id = id;
  list.className = 'footer-links';
  group.append(title, list);
  return group;
}

/**
 * Builds a sitemap column from an authored section of heading + list pairs.
 * @param {Element} section authored section
 * @param {number} index column index
 * @returns {Element} column element
 */
function buildColumn(section, index) {
  const column = document.createElement('li');
  column.className = 'footer-column';
  [...section.querySelectorAll(':scope > h2, :scope > h3, :scope > h4')].forEach((heading, i) => {
    const list = heading.nextElementSibling;
    if (!list || list.tagName !== 'UL') return;
    column.append(buildGroup(heading, list, `footer-group-${index}-${i}`));
  });
  return column;
}

/**
 * Swaps social icon images for inline SVG so the icon colour can follow hover state.
 * Falls back to the image when the SVG can't be fetched.
 * @param {Element} img icon image
 */
async function inlineSvg(img) {
  try {
    const resp = await fetch(img.src);
    if (!resp.ok) return;
    const doc = new DOMParser().parseFromString(await resp.text(), 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return;
    svg.removeAttribute('fill');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    img.replaceWith(svg);
  } catch {
    // keep the <img>
  }
}

/**
 * Builds the social row: label + icon links.
 * @param {Element} section authored section
 * @returns {Element[]} label and icons list items
 */
function buildSocial(section) {
  const label = document.createElement('li');
  label.className = 'footer-social-label';
  const p = section.querySelector('p');
  if (p) label.textContent = textOf(p);

  const icons = document.createElement('li');
  icons.className = 'footer-social';
  const list = section.querySelector('ul');
  if (list) {
    list.className = 'footer-social-list';
    list.querySelectorAll('a').forEach((a) => {
      const img = a.querySelector('img');
      const name = a.getAttribute('title') || (img && img.alt) || '';
      if (name) a.setAttribute('aria-label', name);
      if (img) inlineSvg(img);
    });
    icons.append(list);
  }
  return [label, icons];
}

/**
 * Builds the bottom band: legal links + copyright on the left, notice on the right.
 * @param {Element} section authored section
 * @returns {Element} marginalia band
 */
function buildMarginalia(section) {
  const band = document.createElement('div');
  band.className = 'footer-marginalia';

  const legal = document.createElement('ul');
  legal.className = 'footer-legal';
  const list = section.querySelector('ul');
  if (list) [...list.children].forEach((li) => legal.append(li));

  const paragraphs = [...section.querySelectorAll(':scope > p')];
  // a paragraph without links is the copyright line; it sits at the end of the legal list
  paragraphs.filter((p) => !p.querySelector('a')).forEach((p) => {
    const li = document.createElement('li');
    li.className = 'footer-copyright';
    li.append(...p.childNodes);
    legal.append(li);
  });
  band.append(legal);

  paragraphs.filter((p) => p.querySelector('a')).forEach((p) => {
    p.className = 'footer-notice';
    band.append(p);
  });
  return band;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooterFragment();
  if (!fragment) return;

  const root = document.createElement('div');
  root.innerHTML = fragment.html;
  resolveImages(root, fragment.url);

  const sections = [...root.children].filter((el) => el.tagName === 'DIV');
  const marginaliaSection = sections.pop();
  const socialIndex = sections.findIndex((s) => s.querySelector('ul a img'));
  const socialSection = socialIndex >= 0 ? sections.splice(socialIndex, 1)[0] : null;

  const main = document.createElement('div');
  main.className = 'footer-main';
  const sitemap = document.createElement('ul');
  sitemap.className = 'footer-sitemap';
  sections.forEach((section, i) => sitemap.append(buildColumn(section, i)));
  if (socialSection) sitemap.append(...buildSocial(socialSection));
  main.append(sitemap);

  block.textContent = '';
  block.append(main);
  if (marginaliaSection) block.append(buildMarginalia(marginaliaSection));
  decorateExternalLinks(block);
}
