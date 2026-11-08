import { createOptimizedPicture, toClassName } from '../../scripts/aem.js';

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]));
  });
}

/**
 * Hotspot centres as a percentage of the map image (source coordinates,
 * c95 transition slider at 1440x900), keyed by toClassName(label).
 */
const HOTSPOTS = {
  trojena: [45.06, 42],
  'the-line': [46.65, 61.5],
  oxagon: [48.64, 79],
  'islands-of-neom': [37.09, 63],
  magna: [37.68, 47],
  'marine-landscapes': [36.69, 66],
  'lower-desert': [41.07, 57],
  mountain: [45.06, 48],
  'upper-valley': [49.04, 40],
};

function isPictureOnly(el) {
  if (el.tagName === 'PICTURE') return true;
  return el.querySelector('picture') && el.textContent.trim() === '';
}

/**
 * EDS wraps a cell in a <p> when its first child is inline (e.g. a <picture>
 * built from a Dynamic Media link); unwrap it so each authored element is a
 * direct child of the cell again.
 */
function unwrapCell(cell) {
  const only = cell.children.length === 1 && cell.firstElementChild;
  if (only && only.tagName === 'P' && only.querySelector(':scope > p, :scope > ul, :scope > ol')) {
    only.replaceWith(...only.childNodes);
  }
}

function decorateHotspot(li, i) {
  li.classList.add('tabs-map-stats-hotspot');
  li.dataset.hotspot = i + 1;
  const link = li.querySelector('a');
  const target = link || document.createElement('span');
  const label = document.createElement('span');
  label.className = 'tabs-map-stats-hotspot-label';
  label.textContent = li.textContent.trim();
  target.className = 'tabs-map-stats-hotspot-link';
  target.replaceChildren(label);
  li.replaceChildren(target);
  const pos = HOTSPOTS[toClassName(label.textContent)];
  if (!pos) return false;
  li.style.setProperty('--hotspot-x', `${pos[0]}%`);
  li.style.setProperty('--hotspot-y', `${pos[1]}%`);
  return true;
}

/**
 * A stat is a paragraph that starts with a <strong> value followed by a caption,
 * or a <strong>-only paragraph followed by a caption paragraph.
 */
function isStat(el) {
  if (el.tagName !== 'P') return false;
  const first = el.firstElementChild;
  if (!first || first.tagName !== 'STRONG') return false;
  const before = el.textContent.slice(0, el.textContent.indexOf(first.textContent));
  return before.trim() === '';
}

function buildStat(p) {
  const stat = document.createElement('div');
  stat.className = 'tabs-map-stats-stat';
  const value = document.createElement('p');
  value.className = 'tabs-map-stats-stat-value';
  const strong = p.firstElementChild;
  // split "26,500 km²" into the figure and its measure
  const match = strong.children.length === 0 && strong.textContent.trim().match(/^([\d.,]+)\s*([^\d\s.,].*)$/);
  if (match) {
    const measure = document.createElement('span');
    measure.className = 'tabs-map-stats-stat-measure';
    const [, figure, unit] = match;
    measure.textContent = unit;
    strong.replaceChildren(figure, ' ', measure);
  }
  value.append(strong);
  const caption = document.createElement('p');
  caption.className = 'tabs-map-stats-stat-caption';
  // drop a leading <br> left after the value
  while (p.firstChild && (p.firstChild.nodeName === 'BR' || (p.firstChild.nodeType === 3 && !p.firstChild.textContent.trim()))) {
    p.firstChild.remove();
  }
  caption.append(...p.childNodes);
  stat.append(value);
  if (caption.textContent.trim()) stat.append(caption);
  return stat;
}

function decoratePanel(panel) {
  unwrapCell(panel);
  const map = document.createElement('div');
  map.className = 'tabs-map-stats-map';
  const canvas = document.createElement('div');
  canvas.className = 'tabs-map-stats-map-canvas';
  map.append(canvas);
  const details = document.createElement('div');
  details.className = 'tabs-map-stats-details';
  let stats = null;

  [...panel.children].forEach((el) => {
    if (isPictureOnly(el)) {
      const image = document.createElement('div');
      image.className = 'tabs-map-stats-map-image';
      image.append(el);
      canvas.append(image);
      return;
    }
    if ((el.tagName === 'UL' || el.tagName === 'OL') && el.querySelector('li')) {
      el.classList.add('tabs-map-stats-hotspots');
      const placed = [...el.children].map((li, i) => decorateHotspot(li, i));
      if (placed.every(Boolean)) el.classList.add('tabs-map-stats-hotspots-placed');
      canvas.append(el);
      return;
    }
    if (isStat(el)) {
      if (!stats) {
        stats = document.createElement('div');
        stats.className = 'tabs-map-stats-stats';
        details.append(stats);
      }
      // caption may be in the following paragraph when the value stands alone
      const onlyValue = el.textContent.trim() === el.firstElementChild.textContent.trim();
      const next = el.nextElementSibling;
      if (onlyValue && next && next.tagName === 'P' && !isStat(next) && !next.querySelector('a')) {
        el.append(document.createElement('br'), ...next.childNodes);
        next.remove();
      }
      stats.append(buildStat(el));
      return;
    }
    stats = null;
    const link = el.tagName === 'P' && el.children.length === 1 && el.querySelector('a');
    if (link && el.textContent.trim() === link.textContent.trim()) {
      el.classList.add('tabs-map-stats-link');
    }
    details.append(el);
  });

  panel.replaceChildren();
  if (canvas.children.length) panel.append(map);
  if (details.children.length) panel.append(details);
}

export default function decorate(block) {
  const intro = document.createElement('div');
  intro.className = 'tabs-map-stats-intro';
  const background = document.createElement('div');
  background.className = 'tabs-map-stats-background';
  const tablist = document.createElement('div');
  tablist.className = 'tabs-map-stats-list';
  tablist.setAttribute('role', 'tablist');
  tablist.setAttribute('aria-orientation', 'vertical');
  const panels = document.createElement('div');
  panels.className = 'tabs-map-stats-panels';

  const tabRows = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) {
      // single-cell row: intro heading/text, or a background image
      const cell = cells[0];
      if (!cell) return;
      [...cell.children].forEach((el) => {
        if (isPictureOnly(el)) background.append(el);
        else intro.append(el);
      });
      return;
    }
    tabRows.push(cells);
  });

  const buttons = [];
  const panelEls = [];
  tabRows.forEach(([label, content], i) => {
    const id = `${toClassName(label.textContent) || 'tab'}-${i}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tabs-map-stats-tab';
    button.id = `tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', i === 0);
    button.tabIndex = i === 0 ? 0 : -1;
    button.textContent = label.textContent.trim();

    content.className = 'tabs-map-stats-panel';
    content.id = `tabpanel-${id}`;
    content.setAttribute('role', 'tabpanel');
    content.setAttribute('aria-labelledby', button.id);
    content.setAttribute('aria-hidden', i !== 0);
    decoratePanel(content);

    buttons.push(button);
    panelEls.push(content);
    tablist.append(button);
    panels.append(content);
  });

  function select(index, focus = false) {
    buttons.forEach((btn, i) => {
      const selected = i === index;
      btn.setAttribute('aria-selected', selected);
      btn.tabIndex = selected ? 0 : -1;
      panelEls[i].setAttribute('aria-hidden', !selected);
    });
    block.dataset.activeTab = index;
    if (focus) buttons[index].focus();
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => select(i));
    btn.addEventListener('keydown', (e) => {
      const keys = {
        ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1,
      };
      if (keys[e.key]) {
        e.preventDefault();
        select((i + keys[e.key] + buttons.length) % buttons.length, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        select(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        select(buttons.length - 1, true);
      }
    });
  });

  const nav = document.createElement('div');
  nav.className = 'tabs-map-stats-nav';
  if (intro.children.length) nav.append(intro);
  nav.append(tablist);

  block.replaceChildren();
  if (background.children.length) block.append(background);
  block.append(nav, panels);
  optimizeImages(block);
  if (buttons.length) select(0);
}
