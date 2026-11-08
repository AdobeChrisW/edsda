// the source shows the full horizontal nav from 1440px; below that it uses the hamburger panel
const isDesktop = window.matchMedia('(width >= 1440px)');

function textOf(el) {
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Reads a page metadata value. EDS turns the page's Metadata block into lowercase
 * <meta name> tags; the local preview keeps the authored case ("Nav") or leaves the
 * Metadata block in the page, so match names case-insensitively and fall back to the block rows.
 * @param {string} name metadata key, e.g. "nav"
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
 * .html extension) to a plain site path such as /en-us/newsroom/subnav.
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
 * Fetches the nav fragment. A page can point at its own nav with a "nav" metadata
 * row (e.g. the NEOM Sports Club sub-brand); otherwise, and whenever that override
 * does not resolve, the default nav loads from its fixed, metadata-independent paths:
 * /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<{html: string, url: string}|null>}
 */
async function fetchNavFragment() {
  const override = await fetchFragmentAt(toFragmentPath(pageMeta('nav')));
  if (override) return override;
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
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

function chevron(direction = 'down') {
  const span = document.createElement('span');
  span.className = `nav-chevron nav-chevron-${direction}`;
  span.setAttribute('aria-hidden', 'true');
  return span;
}

/**
 * Builds a panel link: zero-padded index + label.
 * @param {Element} target link or button to fill
 * @param {number} index position in the list
 * @param {string} label visible label
 */
function fillPanelLink(target, index, label) {
  // an authored leading number ("01 About US") is the index; otherwise number by position
  const m = label.match(/^(\d+)\s+(.+)$/);
  const num = document.createElement('span');
  num.className = 'nav-megamenu-index';
  num.textContent = m ? m[1] : String(index + 1).padStart(2, '0');
  const text = document.createElement('span');
  text.className = 'nav-megamenu-label';
  text.textContent = m ? m[2] : label;
  // the space keeps "01 Label" readable as text (layout spacing comes from CSS gap)
  target.append(num, ' ', text);
}

/**
 * Builds the icon grid shown beside the panel list for a nested category.
 * @param {Element} list nested <ul> from the fragment
 * @returns {Element}
 */
function buildSubGrid(list) {
  const grid = document.createElement('ul');
  grid.className = 'nav-sub-grid';
  list.querySelectorAll(':scope > li > a').forEach((a) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'nav-sub-link';
    link.href = a.getAttribute('href');
    const img = a.querySelector('img');
    if (img) {
      const icon = img.cloneNode(true);
      icon.className = 'nav-sub-icon';
      icon.alt = '';
      icon.loading = 'lazy';
      link.append(icon);
    }
    const label = document.createElement('span');
    label.textContent = textOf(a);
    link.append(label);
    li.append(link);
    grid.append(li);
  });
  return grid;
}

/**
 * Builds a full-width dropdown panel from a nested <ul>.
 * @param {Element} list nested <ul> of the top-level item
 * @param {string} id panel id
 * @returns {Element}
 */
function buildPanel(list, id) {
  const panel = document.createElement('div');
  panel.className = 'nav-megamenu';
  panel.id = id;
  const inner = document.createElement('div');
  inner.className = 'nav-megamenu-inner';
  const ol = document.createElement('ol');
  ol.className = 'nav-megamenu-list';
  const subs = document.createElement('div');
  subs.className = 'nav-megamenu-subs';

  const showSub = (subId) => {
    panel.classList.toggle('has-sub-open', !!subId);
    subs.querySelectorAll('.nav-megamenu-sub').forEach((s) => { s.hidden = s.id !== subId; });
    ol.querySelectorAll('.nav-megamenu-category').forEach((b) => {
      b.setAttribute('aria-expanded', b.getAttribute('aria-controls') === subId ? 'true' : 'false');
    });
  };

  [...list.children].forEach((li, i) => {
    const item = document.createElement('li');
    item.className = 'nav-megamenu-item';
    const nested = li.querySelector(':scope > ul');
    if (nested) {
      const subId = `${id}-sub-${i}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-megamenu-link nav-megamenu-category';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', subId);
      fillPanelLink(btn, i, textOf(li.querySelector(':scope > p')));
      btn.append(chevron('right'));
      const sub = document.createElement('div');
      sub.className = 'nav-megamenu-sub';
      sub.id = subId;
      sub.hidden = true;
      sub.append(buildSubGrid(nested));
      subs.append(sub);
      btn.addEventListener('pointerenter', () => { if (isDesktop.matches) showSub(subId); });
      btn.addEventListener('click', () => showSub(btn.getAttribute('aria-expanded') === 'true' ? null : subId));
      item.append(btn);
    } else {
      const a = li.querySelector('a');
      const link = document.createElement('a');
      link.className = 'nav-megamenu-link';
      link.href = a.getAttribute('href');
      fillPanelLink(link, i, textOf(a));
      link.addEventListener('pointerenter', () => { if (isDesktop.matches) showSub(null); });
      item.append(link);
    }
    ol.append(item);
  });

  inner.append(ol, subs);
  panel.append(inner);
  panel.resetSub = () => showSub(null);
  return panel;
}

/**
 * Turns the main navigation list into top-level items with dropdown panels.
 * @param {Element} section fragment section holding the top-level <ul>
 * @returns {Element}
 */
function buildSections(section) {
  const wrap = document.createElement('div');
  wrap.className = 'nav-sections';
  const ul = document.createElement('ul');
  ul.className = 'nav-list';
  const top = section.querySelector('ul');
  if (!top) return wrap;

  [...top.children].forEach((li, i) => {
    const item = document.createElement('li');
    item.className = 'nav-item';
    // label, toggle and panel are siblings so the toggle's next element is the panel it controls
    const head = item;
    // a panel item labels itself with a paragraph; a plain link item is just <li><a>
    const labelSrc = li.querySelector(':scope > p') || li.querySelector(':scope > a');
    const labelLink = labelSrc && (labelSrc.tagName === 'A' ? labelSrc : labelSrc.querySelector('a'));
    const labelText = textOf(labelLink) || textOf(labelSrc);
    const nested = li.querySelector(':scope > ul');
    const panelId = `nav-megamenu-${i}`;

    const makeToggle = (className) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = className;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', panelId);
      return btn;
    };

    if (labelLink) {
      // label navigates; the chevron beside it opens the panel
      const label = document.createElement('a');
      label.href = labelLink.getAttribute('href');
      label.className = 'nav-item-label';
      label.textContent = labelText;
      head.append(label);
      if (nested) {
        const toggle = makeToggle('nav-item-toggle nav-item-chevron');
        const srLabel = document.createElement('span');
        srLabel.className = 'nav-sr-only';
        srLabel.textContent = labelText;
        toggle.append(srLabel, chevron());
        head.append(toggle);
      }
    } else if (nested) {
      // a label without a link is the toggle itself
      const toggle = makeToggle('nav-item-toggle nav-item-label');
      toggle.append(labelText, chevron());
      head.append(toggle);
    } else {
      const label = document.createElement('span');
      label.className = 'nav-item-label';
      label.textContent = labelText;
      head.append(label);
    }

    if (nested) {
      item.classList.add('is-expandable');
      item.append(buildPanel(nested, panelId));
    }
    ul.append(item);
  });
  wrap.append(ul);
  return wrap;
}

/**
 * Describes a language link: its label, the same page in that language, and whether it is current.
 * @param {Element} a language link from the fragment (href is a locale root such as /ar-sa)
 * @returns {{label: string, href: string, lang: string, current: boolean}}
 */
function toLocale(a) {
  const target = a.getAttribute('href');
  const here = window.location.pathname.replace(/^\/content/, '');
  const m = here.match(/^(\/[a-z]{2}-[a-z]{2})(\/.*)?$/);
  const isRoot = /^\/[a-z]{2}-[a-z]{2}$/.test(target);
  return {
    label: textOf(a),
    // keep the reader on the same page in the other language (/en-us/x -> /ar-sa/x)
    href: isRoot && m && m[2] ? `${target}${m[2]}` : target,
    lang: isRoot ? target.slice(1, 3) : '',
    current: !!(isRoot && m && m[1] === target),
  };
}

function localeLink(locale, className) {
  const link = document.createElement('a');
  link.className = className;
  link.href = locale.href;
  link.textContent = locale.label;
  if (locale.lang) link.lang = locale.lang;
  if (locale.current) link.setAttribute('aria-current', 'true');
  return link;
}

/**
 * Builds the right-hand tools: search toggle + panel, language link, CTA pill.
 * @param {Element} section fragment section holding the tools list
 * @returns {{tools: Element, search: Element|null}}
 */
function buildTools(section) {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  // plain items, not a list: the source header bar tools are standalone controls
  let search = null;
  const locales = [];

  section.querySelectorAll('li').forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    const item = document.createElement('div');
    const img = a.querySelector('img');
    if (img) {
      // icon link = search: a toggle button plus a search form built from the link
      item.className = 'nav-tool-search';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'nav-search-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', 'nav-search');
      btn.setAttribute('aria-label', img.alt || textOf(a));
      const icon = img.cloneNode(true);
      icon.alt = '';
      btn.append(icon);
      item.append(btn);

      search = document.createElement('div');
      search.className = 'nav-search';
      search.id = 'nav-search';
      search.hidden = true;
      const form = document.createElement('form');
      form.action = a.getAttribute('href');
      form.method = 'get';
      form.setAttribute('role', 'search');
      const input = document.createElement('input');
      input.type = 'search';
      input.name = 'search';
      input.placeholder = textOf(a);
      input.setAttribute('aria-label', textOf(a));
      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.className = 'nav-search-submit';
      submit.setAttribute('aria-label', img.alt || 'Search');
      submit.append(img.cloneNode(true));
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'nav-search-close';
      close.setAttribute('aria-label', 'Close');
      form.append(input, submit, close);
      search.append(form);
    } else if (li.querySelector('strong a, em a')) {
      item.className = 'nav-tool-cta';
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.className = 'nav-cta';
      const label = document.createElement('span');
      label.className = 'nav-cta-label';
      label.textContent = textOf(a);
      link.append(label);
      item.append(link);
    } else {
      // language link: desktop shows only the other language; the drawer lists all of them
      const locale = toLocale(a);
      locales.push(locale);
      if (locale.current) return;
      item.className = 'nav-tool-locale';
      item.append(localeLink(locale, 'nav-locale'));
    }
    tools.append(item);
  });
  return { tools, search, locales };
}

/**
 * Builds one slide-in level of the drawer from a fragment list.
 * Rows with a nested list get a chevron that slides in the next level;
 * a row label that is a link still navigates (split link).
 * @param {Element} list fragment <ul>
 * @param {string} id level id
 * @param {string|null} backLabel label of the parent row (null for the first level)
 * @returns {Element}
 */
function buildDrawerLevel(list, id, backLabel) {
  const level = document.createElement('div');
  // nav-panel / data-depth / nav-panel-active|hidden: the standard slide-in panel convention
  level.className = 'nav-level nav-panel';
  level.id = id;
  const depth = id.split('-').length - 3;
  level.dataset.depth = String(depth);
  // deeper levels stack above their parents regardless of DOM order
  level.style.zIndex = String(depth + 1);
  if (backLabel) {
    level.classList.add('nav-level-sub', 'nav-panel-hidden');
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'nav-level-back nav-panel-back';
    back.dataset.back = id;
    const title = document.createElement('span');
    title.className = 'nav-panel-title';
    const text = document.createElement('span');
    text.textContent = backLabel;
    title.append(text);
    back.append(chevron('left'), title);
    level.append(back);
  } else {
    level.classList.add('nav-panel-active');
  }
  const ul = document.createElement('ul');
  [...list.children].forEach((li, i) => {
    const row = document.createElement('li');
    row.className = 'nav-level-item';
    const nested = li.querySelector(':scope > ul');
    const labelEl = li.querySelector(':scope > p') || li.querySelector(':scope > a');
    const link = labelEl && (labelEl.tagName === 'A' ? labelEl : labelEl.querySelector('a'));
    // the drawer drops the "01" index the desktop panels show
    const label = textOf(labelEl).replace(/^\d+\s+/, '');
    if (nested) {
      const childId = `${id}-${i}`;
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'nav-level-next';
      next.dataset.next = childId;
      next.setAttribute('aria-controls', childId);
      next.setAttribute('aria-expanded', 'false');
      if (link) {
        const a = document.createElement('a');
        a.className = 'nav-level-label';
        a.href = link.getAttribute('href');
        a.textContent = label;
        const sr = document.createElement('span');
        sr.className = 'nav-sr-only';
        sr.textContent = label;
        next.append(sr, chevron('right'));
        row.append(a, next);
      } else {
        // no link of its own: the whole row opens the next level
        next.classList.add('nav-level-label');
        next.append(label, chevron('right'));
        row.append(next);
      }
      // the next level lives inside its row (positioned over the whole drawer by CSS)
      row.append(buildDrawerLevel(nested, childId, label));
    } else if (link && !backLabel) {
      // a first-level row with no sub-level: a plain link, still with the source's gold chevron
      const a = document.createElement('a');
      a.className = 'nav-level-label nav-level-leaf';
      a.href = link.getAttribute('href');
      a.append(label, chevron('right'));
      row.append(a);
    } else if (link) {
      const a = document.createElement('a');
      a.className = 'nav-level-link';
      a.href = link.getAttribute('href');
      const img = link.querySelector('img');
      if (img) {
        const icon = img.cloneNode(true);
        icon.className = 'nav-sub-icon';
        icon.alt = '';
        icon.loading = 'lazy';
        a.append(icon);
      }
      const span = document.createElement('span');
      span.textContent = label;
      a.append(span);
      row.append(a);
    }
    ul.append(row);
  });
  level.append(ul);
  return level;
}

/**
 * Builds the mobile/tablet drawer: search row, slide-in levels, language dropdown.
 * @param {Element} navSection fragment section with the main list
 * @param {Element|undefined} toolsSection fragment section with search/locale/CTA
 * @param {Array} locales language links from buildTools
 * @returns {Element}
 */
function buildDrawer(navSection, toolsSection, locales) {
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.id = 'nav-drawer';

  const levels = document.createElement('div');
  levels.className = 'nav-levels';
  const top = navSection && navSection.querySelector('ul');
  if (top) levels.prepend(buildDrawerLevel(top, 'nav-level-0', null));
  drawer.append(levels);

  // the search row is the first row of the first level, as on the source
  const searchLink = toolsSection && [...toolsSection.querySelectorAll('a')].find((a) => a.querySelector('img'));
  const firstList = levels.querySelector('#nav-level-0 > ul');
  if (searchLink && firstList) {
    const form = document.createElement('form');
    form.className = 'nav-drawer-search';
    form.action = searchLink.getAttribute('href');
    form.method = 'get';
    form.setAttribute('role', 'search');
    const icon = searchLink.querySelector('img').cloneNode(true);
    icon.alt = '';
    const input = document.createElement('input');
    input.type = 'search';
    input.name = 'search';
    input.placeholder = textOf(searchLink);
    input.setAttribute('aria-label', textOf(searchLink));
    form.append(icon, input);
    const row = document.createElement('li');
    row.className = 'nav-level-search';
    row.append(form);
    firstList.prepend(row);
  }

  const others = locales.filter((l) => !l.current);
  if (locales.length) {
    const lang = document.createElement('div');
    lang.className = 'nav-drawer-lang';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-drawer-lang-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'nav-drawer-lang-list');
    const shown = document.createElement('span');
    shown.textContent = (others[0] || locales[0]).label;
    if ((others[0] || locales[0]).lang) shown.lang = (others[0] || locales[0]).lang;
    toggle.append(shown, chevron('up'));
    const list = document.createElement('ul');
    list.id = 'nav-drawer-lang-list';
    list.hidden = true;
    locales.forEach((l) => {
      const li = document.createElement('li');
      li.append(localeLink(l, 'nav-drawer-lang-link'));
      list.append(li);
    });
    toggle.addEventListener('click', () => {
      const open = list.hidden;
      list.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    lang.append(list, toggle);
    drawer.append(lang);
  }

  // slide-in navigation between levels
  const setLevel = (id, open) => {
    const target = levels.querySelector(`#${id}`);
    if (target) {
      target.classList.toggle('nav-panel-active', open);
      target.classList.toggle('nav-panel-hidden', !open);
    }
    levels.querySelectorAll(`[data-next="${id}"]`).forEach((b) => b.setAttribute('aria-expanded', open ? 'true' : 'false'));
  };
  levels.addEventListener('click', (e) => {
    const next = e.target.closest('[data-next]');
    const back = e.target.closest('[data-back]');
    if (next) setLevel(next.dataset.next, true);
    if (back) setLevel(back.dataset.back, false);
  });
  drawer.reset = () => {
    levels.querySelectorAll('.nav-level-sub').forEach((l) => setLevel(l.id, false));
  };
  return drawer;
}

/**
 * Whether a link points at the page being viewed (ignores /content, .html and a trailing slash).
 * @param {string} href link href
 * @returns {boolean}
 */
function isCurrentPage(href) {
  const norm = (p) => p.replace(/^\/content(?=\/)/, '').replace(/(\.plain)?\.html$/, '').replace(/\/$/, '');
  return norm(new URL(href, window.location.href).pathname) === norm(window.location.pathname);
}

/**
 * Builds the section sub-menu bar shown under the header (e.g. the newsroom's
 * NEWS & MEDIA bar): a title and a row of links, collapsed into a dropdown below
 * the desktop breakpoint. The link for the current page is marked active.
 * @param {{html: string}} fragment sub-menu fragment: a title paragraph and a list of links
 * @returns {Element|null}
 */
function buildSubnav(fragment) {
  const src = document.createElement('div');
  src.innerHTML = fragment.html;
  const list = src.querySelector('ul');
  if (!list) return null;
  const titleText = textOf(src.querySelector('p, h2, h3'));

  const bar = document.createElement('div');
  bar.className = 'nav-subnav';
  const inner = document.createElement('div');
  inner.className = 'nav-subnav-inner';

  const title = document.createElement('span');
  title.className = 'nav-subnav-title';
  title.textContent = titleText;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-subnav-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'nav-subnav-list');
  const toggleChevron = chevron();
  toggleChevron.classList.add('nav-subnav-chevron');
  toggle.append(titleText, toggleChevron);

  const ul = document.createElement('ul');
  ul.className = 'nav-subnav-list';
  ul.id = 'nav-subnav-list';
  list.querySelectorAll(':scope > li > a').forEach((a) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'nav-subnav-link';
    link.href = a.getAttribute('href');
    link.textContent = textOf(a);
    if (isCurrentPage(link.href)) link.setAttribute('aria-current', 'page');
    li.append(link);
    ul.append(li);
  });

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    bar.classList.toggle('is-expanded', open);
  });
  bar.collapse = () => {
    toggle.setAttribute('aria-expanded', 'false');
    bar.classList.remove('is-expanded');
  };

  if (titleText) inner.append(title, toggle);
  inner.append(ul);
  bar.append(inner);
  return bar;
}

export default async function decorate(block) {
  const [fragment, subnavFragment] = await Promise.all([
    fetchNavFragment(),
    fetchFragmentAt(toFragmentPath(pageMeta('subnav'))),
  ]);
  block.textContent = '';
  if (!fragment) return;

  const src = document.createElement('div');
  src.innerHTML = fragment.html;
  resolveImages(src, fragment.url);
  const sections = [...src.children].filter((el) => el.tagName === 'DIV');

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');
  nav.dataset.drawer = 'closed';

  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (sections[0]) {
    const link = sections[0].querySelector('a');
    if (link) {
      const a = link.cloneNode(true);
      a.setAttribute('aria-label', textOf(link) || (link.querySelector('img') || {}).alt || 'Home');
      brand.append(a);
    }
  }

  const navSections = sections[1] ? buildSections(sections[1]) : document.createElement('div');
  const { tools, search, locales } = sections[2] ? buildTools(sections[2]) : { tools: document.createElement('div'), search: null, locales: [] };
  const drawer = buildDrawer(sections[1], sections[2], locales);

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = '<button type="button" aria-controls="nav-drawer" aria-expanded="false" aria-label="Open navigation"><span class="nav-hamburger-icon"></span></button>';

  nav.append(brand, navSections, tools, hamburger);
  // the drawer only exists below the desktop breakpoint
  const placeDrawer = () => {
    if (isDesktop.matches) drawer.remove();
    else if (!drawer.isConnected) nav.insertBefore(drawer, hamburger);
  };
  placeDrawer();
  if (search) nav.append(search);

  const mask = document.createElement('div');
  mask.className = 'nav-mask';

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-wrapper';
  // transparent over a full-bleed hero (matches the header-overlay rule in styles.css)
  if (document.querySelector('main > .section:first-child :is(.carousel-hero-video, .hero-banner), main > .section.cover:first-child')) {
    wrapper.classList.add('is-transparent');
  }
  const subnav = subnavFragment ? buildSubnav(subnavFragment) : null;
  wrapper.append(...[nav, subnav, mask].filter(Boolean));
  block.append(wrapper);

  const items = [...navSections.querySelectorAll('.nav-item.is-expandable')];
  const searchToggle = tools.querySelector('.nav-search-toggle');
  let closeTimer;

  const syncOpen = () => {
    const open = items.some((i) => i.classList.contains('is-open')) || (search && !search.hidden);
    wrapper.classList.toggle('is-open', !!open);
  };

  const closeItem = (item) => {
    item.classList.remove('is-open');
    item.querySelector('.nav-item-toggle').setAttribute('aria-expanded', 'false');
    const panel = item.querySelector('.nav-megamenu');
    if (panel.resetSub) panel.resetSub();
  };

  const closeSearch = () => {
    if (!search) return;
    search.hidden = true;
    searchToggle.setAttribute('aria-expanded', 'false');
  };

  const closeAll = () => {
    items.forEach(closeItem);
    closeSearch();
    syncOpen();
  };

  const openItem = (item) => {
    items.forEach((i) => { if (i !== item) closeItem(i); });
    closeSearch();
    item.classList.add('is-open');
    item.querySelector('.nav-item-toggle').setAttribute('aria-expanded', 'true');
    syncOpen();
  };

  items.forEach((item) => {
    const toggle = item.querySelector('.nav-item-toggle');
    item.addEventListener('pointerenter', () => {
      if (!isDesktop.matches) return;
      clearTimeout(closeTimer);
      openItem(item);
    });
    item.addEventListener('pointerleave', () => {
      if (!isDesktop.matches) return;
      closeTimer = setTimeout(() => { closeItem(item); syncOpen(); }, 120);
    });
    toggle.addEventListener('click', (e) => {
      // on desktop the pointer has already opened the panel on hover; a mouse click keeps it open
      const pointerClick = e.detail > 0 && isDesktop.matches;
      if (item.classList.contains('is-open') && !pointerClick) {
        closeItem(item);
        syncOpen();
      } else {
        openItem(item);
      }
    });
  });

  if (searchToggle && search) {
    searchToggle.addEventListener('click', () => {
      const opening = search.hidden;
      items.forEach(closeItem);
      search.hidden = !opening;
      searchToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
      syncOpen();
      if (opening) search.querySelector('input').focus();
    });
    search.querySelector('.nav-search-close').addEventListener('click', () => {
      closeSearch();
      syncOpen();
      searchToggle.focus();
    });
  }

  mask.addEventListener('click', closeAll);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wrapper.classList.contains('is-open')) closeAll();
  });

  // hamburger (below the desktop breakpoint)
  const hamburgerBtn = hamburger.querySelector('button');
  const setDrawer = (open) => {
    nav.dataset.drawer = open ? 'open' : 'closed';
    hamburgerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburgerBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.style.overflowY = open ? 'hidden' : '';
    if (subnav) subnav.collapse();
    if (!open) {
      drawer.reset();
      closeAll();
    }
  };
  // listen on the wrapper so a click anywhere on the hamburger area toggles the drawer
  hamburger.addEventListener('click', () => setDrawer(nav.dataset.drawer !== 'open'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.dataset.drawer === 'open') {
      setDrawer(false);
      hamburgerBtn.focus();
    } else if (e.key === 'Escape' && subnav && subnav.classList.contains('is-expanded')) {
      subnav.collapse();
      subnav.querySelector('.nav-subnav-toggle').focus();
    }
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    setDrawer(false);
    placeDrawer();
    if (subnav) subnav.collapse();
  });

  // solid bar once the page scrolls under the header;
  // the sub-menu bar folds away while scrolling down and returns when scrolling up
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    wrapper.classList.toggle('is-scrolled', y > 0);
    if (subnav && !subnav.classList.contains('is-expanded') && y !== lastY) {
      subnav.classList.toggle('is-folded', y > 0 && y > lastY);
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
