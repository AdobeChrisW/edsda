/* eslint-disable */
/* global WebImporter */

/**
 * NEOM cleanup transformer.
 *
 * beforeTransform: strips non-authorable site chrome that would otherwise be
 * picked up as default content or interfere with block matching.
 * afterTransform: final sweep of leftover non-content tags and tracking
 * attributes (after parsers have consumed data-* hints they need).
 *
 * All selectors were taken from migration-work/cleaned.html and
 * migration-work/source-html/*.html.
 */

// Site chrome outside the authorable main grid.
const CHROME_SELECTORS = [
  // Global navigation (server placeholder and hydrated version)
  'nav.o-navigationPlaceholder',
  'nav.b-navigation',
  '.b-navigation',
  '.b-navigation__search-container',
  // Global footer
  'footer.b-footer',
  // Breadcrumbs (.c98-breadcrumbs) are kept: they are imported as the "breadcrumbs" block.
  // Global overlays / modals / lightboxes / drawers / spinners
  'section.b-overlay',
  'section.b-map-overlay',
  '.o-downloadDrawer',
  '.o-loadingSpinner',
  // Custom cursor
  'div.m-cursor',
  // OneTrust / cookielaw consent
  '#onetrust-consent-sdk',
  '#onetrust-banner-sdk',
  '#onetrust-pc-sdk',
  '#ot-sdk-btn-floating',
  '.onetrust-pc-dark-filter',
  'iframe.ot-text-resize',
  'script[src*="cookielaw"]',
  'script[src*="onetrust"]',
  'link[href*="cookielaw"]',
];

// Newsletter success / error message panels (not authorable form content).
const NEWSLETTER_PANEL_SELECTORS = [
  '.cmp-c96-newsletter-subscription .b-newsletterSubscription__header.-isHidden',
  '.cmp-c96-newsletter-subscription .o-form__submitView',
  '.cmp-c96-newsletter-subscription .o-submitStep',
  '.cmp-c96-newsletter-subscription .o-form__responseWrapper',
  '.cmp-c96-newsletter-subscription .b-newsletterSubscription__response',
];

// Mobile-only duplicate CTAs, hidden (0x0) on desktop; the desktop copy sits in the
// component header (e.g. .b-newsroomDch__btnMobile "all news", .b-featuredDownload__btnMobile).
const MOBILE_DUPLICATE_SELECTORS = [
  '[class*="__btnMobile"]',
];

// Third-party tracking pixels injected at the end of <body> after load.
const TRACKING_PIXEL_HOSTS = /(^|\.)(t\.co|twitter\.com|adnxs\.com|creativecdn\.com|teads\.tv|doubleclick\.net|facebook\.com|google-analytics\.com|bing\.com|linkedin\.com)$/i;

function isTrackingPixel(img) {
  if (!img.closest('#app-content')) return true;
  try {
    return TRACKING_PIXEL_HOSTS.test(new URL(img.getAttribute('src') || '', 'https://www.neom.com/').hostname);
  } catch (e) {
    return false;
  }
}

// The source animates text by splitting it into one inline-block <div> per word/line.
// Captured mid-animation, those divs become one paragraph per word, so flatten them back.
function unsplitText(root) {
  const doc = root.ownerDocument;
  root.querySelectorAll('h1, h2, h3, h4, h5, h6, p').forEach((el) => {
    if (!el.querySelector('div[style*="inline-block"], div[style*="display: block"]')) return;
    el.textContent = el.textContent.replace(/\s+/g, ' ').trim();
  });
  // A <div> inside <p> closes the paragraph when the HTML is parsed, so the line wrappers end up
  // after an empty <p> (or with no <p> at all). Put each line's text back into a paragraph:
  // the empty <p> just before it when there is one, otherwise a new <p>.
  const isWord = (k) => k.tagName === 'DIV' && /inline-block/.test(k.getAttribute('style') || '') && !k.children.length;
  root.querySelectorAll('div').forEach((line) => {
    if (!line.isConnected) return;
    const kids = [...line.children];
    if (!kids.length || !kids.every(isWord)) return;
    const text = line.textContent.replace(/\s+/g, ' ').trim();
    const prev = line.previousElementSibling;
    if (prev && prev.tagName === 'P' && (!prev.textContent.trim() || prev.dataset.excatUnsplit)) {
      prev.textContent = `${prev.textContent} ${text}`.trim();
      prev.dataset.excatUnsplit = 'true';
      line.remove();
      return;
    }
    const p = doc.createElement('p');
    p.textContent = text;
    p.dataset.excatUnsplit = 'true';
    // the original paragraph (and its class) is gone; in a component header its position tells
    // which one it was: eyebrow before the heading, moustache (subline) after it
    if (line.parentElement && line.parentElement.classList.contains('m-componentHeader__container')) {
      const next = line.nextElementSibling;
      const prev = line.previousElementSibling;
      if (next && next.classList.contains('m-componentHeader__headingWrapper')) p.className = 'a-eyebrow';
      else if (prev && prev.classList.contains('m-componentHeader__headingWrapper')) p.className = 'a-moustache';
    }
    line.replaceWith(p);
  });
  root.querySelectorAll('[data-excat-unsplit]').forEach((p) => p.removeAttribute('data-excat-unsplit'));
}

// Grid placeholders that render nothing in the captured DOM; removed only if empty.
const EMPTY_PLACEHOLDER_SELECTORS = [
  '.c63-m18-paragraph',
  '.cmp-c103-vertical-carousel',
];

// Tracking / runtime-only attributes stripped after parsing.
const TRACKING_ATTRIBUTES = [
  'data-navigation-click',
  'data-event-tracking',
  'data-component',
  'data-component-name',
  'data-navigation-template',
  'data-navigation-data-endpoint',
  'data-domain-script',
  'data-document-language',
  'onload',
  'onclick',
];

function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    let nodes = [];
    try {
      nodes = root.querySelectorAll(sel);
    } catch (e) {
      return;
    }
    nodes.forEach((n) => n.remove());
  });
}

function isEmptyPlaceholder(el) {
  if (el.textContent.trim()) return false;
  return !el.querySelector('img, picture, video, iframe, source, form, a[href]');
}

export default function transform(hookName, element, payload) {
  const root = element;

  if (hookName === 'beforeTransform') {
    removeAll(root, CHROME_SELECTORS);
    removeAll(root, NEWSLETTER_PANEL_SELECTORS);
    removeAll(root, MOBILE_DUPLICATE_SELECTORS);
    root.querySelectorAll('img').forEach((img) => { if (isTrackingPixel(img)) img.remove(); });
    unsplitText(root);

    EMPTY_PLACEHOLDER_SELECTORS.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => {
        if (isEmptyPlaceholder(el)) el.remove();
      });
    });

    // Non-content tags that can confuse block matching.
    removeAll(root, ['script', 'style', 'noscript', 'link']);
  }

  if (hookName === 'afterTransform') {
    // Final sweep. Do NOT touch HTML comments (field hints may live there).
    removeAll(root, CHROME_SELECTORS);
    removeAll(root, ['script', 'style', 'noscript', 'link', 'meta', 'iframe.ot-text-resize']);
    // pixels can be injected after beforeTransform ran; #app-content is gone by now, so match by host
    root.querySelectorAll('img').forEach((img) => {
      try {
        const { hostname } = new URL(img.getAttribute('src') || '', 'https://www.neom.com/');
        if (TRACKING_PIXEL_HOSTS.test(hostname)) img.remove();
      } catch (e) { /* keep */ }
    });
    root.querySelectorAll('p').forEach((p) => { if (!p.textContent.trim() && !p.children.length) p.remove(); });

    // Links to migrated en-us pages become site-relative; assets (/content/dam) stay absolute.
    root.querySelectorAll('a[href]').forEach((a) => {
      const m = a.getAttribute('href').match(/^https?:\/\/(?:www\.)?neom\.com(\/en-us(?:[/?#][^]*)?)$/i);
      if (m) a.setAttribute('href', m[1]);
    });

    TRACKING_ATTRIBUTES.forEach((attr) => {
      root.querySelectorAll(`[${attr}]`).forEach((el) => el.removeAttribute(attr));
    });
  }
}
