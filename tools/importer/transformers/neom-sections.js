/* eslint-disable */
/* global WebImporter */

/**
 * NEOM sections transformer.
 *
 * Reads payload.template.sections (selector arrays tried in order) and:
 *  - beforeTransform: inserts <hr> section breaks before every non-first
 *    matched section element (while the source elements still exist), and
 *    marks breaks of styled sections with temporary data attributes. A
 *    styled first section gets a temporary marked <hr> too.
 *  - afterTransform: inserts a Section Metadata block after each marked <hr>,
 *    strips the marker attributes, and removes the first section's temporary
 *    <hr> so it does not open an empty section.
 *
 * Template sections describe component types, so one section definition may
 * match several elements on a page (e.g. several .cmp-c24-content). Every
 * match becomes its own section, in document order.
 *
 * Style special cases (style depends on the matched source element):
 *  - rc4  (.cmp-c24-content with an inline asset): "dark" only if element has t-dark
 *  - gap1 (.cmp-c24-content:not(:has(img))): "centered" only when the paragraph item is
 *    centred in the source (.o-contentGrid__item.-center; left-aligned ones use -start /
 *    -extremeStart), plus "dark" if t-dark
 *  - rc7  (newsletter): "dark, background" when the component has a background photo
 *    (.m-componentBackground img), otherwise the template style ("dark, split")
 *  - gap2 (boxed list): "centered" added when the header is centred
 *    (.b-boxedList__header .m-componentHeader.-center)
 *  - any section: "dark" is added when the element has t-dark
 *
 * Background photos (newsletter with photo, gap12 background banner) are hoisted in
 * beforeTransform into a <p><picture> that becomes the first child of the component,
 * so the image is the first default-content element of the section.
 */

const MARKER_ID = 'data-excat-section-id';
const MARKER_STYLE = 'data-excat-section-style';
const MARKER_FIRST = 'data-excat-section-first';

const BACKGROUND_IMG = '.m-componentBackground img[src]';
const HOIST_BACKGROUND_SECTIONS = ['rc7', 'gap12'];

function addStyle(style, name) {
  if (!name || new RegExp(`(^|,)\\s*${name}\\s*(,|$)`).test(style)) return style;
  return style ? `${style}, ${name}` : name;
}

function resolveStyle(section, el) {
  const isDark = el.classList.contains('t-dark');
  let style = section.style || '';
  if (section.id === 'rc4') style = '';
  if (section.id === 'gap1') {
    style = el.querySelector('.o-contentGrid__item.-paragraph.-center, .o-contentGrid__item.-center') ? 'centered' : '';
  }
  if (section.id === 'rc7' && el.querySelector(BACKGROUND_IMG)) style = 'dark, background';
  if (section.id === 'gap2' && el.querySelector('.b-boxedList__header .m-componentHeader.-center')) {
    style = addStyle(style, 'centered');
  }
  // the source themes components with t-dark (e.g. featured news, boxed list); keep that as a section style
  if (isDark) style = addStyle(style, 'dark');
  return style || null;
}

// Move the component's background photo into a leading <p><picture> and drop the
// (now empty) background wrappers, so the photo is the section's first element.
function hoistBackgroundImage(el, doc) {
  const img = el.querySelector(BACKGROUND_IMG);
  if (!img) return;
  const picture = img.closest('picture') || img;
  const p = doc.createElement('p');
  p.append(picture);
  el.querySelectorAll('.m-componentBackground').forEach((bg) => bg.remove());
  el.prepend(p);
}

function queryFirstMatchingSelector(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (let i = 0; i < list.length; i += 1) {
    const sel = list[i];
    if (!sel) continue;
    let nodes = [];
    try {
      nodes = Array.from(root.querySelectorAll(sel));
    } catch (e) {
      nodes = [];
    }
    if (nodes.length) return nodes;
  }
  return [];
}

function collectMatches(root, sections) {
  const matches = [];
  const seen = new Set();
  sections.forEach((section) => {
    queryFirstMatchingSelector(root, section.selector).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      matches.push({ el, section });
    });
  });
  // Drop matches nested inside another matched element.
  const top = matches.filter((m) => !matches.some((o) => o !== m && o.el.contains(m.el)));
  // Document order.
  top.sort((a, b) => {
    if (a.el === b.el) return 0;
    // eslint-disable-next-line no-bitwise
    return a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1;
  });
  return top;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && template.sections;
  if (!Array.isArray(sections) || sections.length < 2) return;

  const doc = (payload && payload.document) || element.ownerDocument;

  if (hookName === 'beforeTransform') {
    const matches = collectMatches(element, sections);
    for (let i = matches.length - 1; i >= 0; i -= 1) {
      const { el, section } = matches[i];
      const style = resolveStyle(section, el);
      if (HOIST_BACKGROUND_SECTIONS.includes(section.id)) hoistBackgroundImage(el, doc);
      if (i === 0 && !style) continue;
      const hr = doc.createElement('hr');
      if (style) {
        hr.setAttribute(MARKER_ID, section.id);
        hr.setAttribute(MARKER_STYLE, style);
      }
      if (i === 0) hr.setAttribute(MARKER_FIRST, 'true');
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    const markers = Array.from(element.querySelectorAll(`hr[${MARKER_ID}]`));
    for (let i = markers.length - 1; i >= 0; i -= 1) {
      const hr = markers[i];
      const id = hr.getAttribute(MARKER_ID);
      const section = sections.find((s) => s.id === id);
      const style = hr.getAttribute(MARKER_STYLE) || (section && section.style);
      if (style) {
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style },
        });
        hr.after(metadata);
      }
      hr.removeAttribute(MARKER_ID);
      hr.removeAttribute(MARKER_STYLE);
      if (hr.hasAttribute(MARKER_FIRST)) hr.remove();
    }
    // Safety: drop any leftover temporary first-section break.
    element.querySelectorAll(`hr[${MARKER_FIRST}]`).forEach((hr) => hr.remove());
  }
}
