/* eslint-disable */
/* global WebImporter */

/**
 * NEOM Dynamic Media / Scene7 transformer (afterTransform only).
 *
 * Rewrites Scene7 (neom.scene7.com/is/image/...) and DM Open API <img>
 * elements into anchors that survive the markdown/docx round-trip:
 *  - Unlinked image: <img src=DM alt=X>  ->  <a href="DM-URL">X</a>
 *  - Linked image (img is the sole meaningful content of an <a>):
 *      keep the link's navigation href, set title="DM-URL", replace the
 *      link content with the alt text.
 *  - Mixed-content anchors (image + other text/elements) are skipped.
 * Empty alt becomes the visible sentinel "Image without alt text"; the
 * scripts.js auto-block translates it back to alt="".
 *
 * Runs only in afterTransform so parsers still see <img> nodes.
 */

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function detectDynamicMediaUrl(urlStr) {
  if (!urlStr || !/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch (e) { return false; }
  if (u.pathname.startsWith('/is/image/')) return 'scene7';
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

function normalizeUrl(src) {
  return src.startsWith('//') ? `https:${src}` : src;
}

function getImageSrc(img) {
  const candidates = [
    img.getAttribute('src'),
    img.getAttribute('data-src'),
  ];
  // Fall back to the first srcset candidate (picture/source or img srcset).
  const srcset = img.getAttribute('srcset')
    || (img.closest('picture') && img.closest('picture').querySelector('source[srcset]')
      && img.closest('picture').querySelector('source[srcset]').getAttribute('srcset'));
  if (srcset) candidates.push(srcset.split(',')[0].trim().split(/\s+/)[0]);
  return candidates.find((c) => c && detectDynamicMediaUrl(c)) || null;
}

// The node that stands for the image inside its parent (picture wrapper if any).
function imageUnit(img) {
  const picture = img.closest('picture');
  return picture && picture.contains(img) ? picture : img;
}

// True when the anchor contains nothing meaningful besides this image.
function isSoleImageAnchor(anchor, unit) {
  if (anchor.querySelectorAll('img').length !== 1) return false;
  const clone = anchor.cloneNode(true);
  clone.querySelectorAll('picture, img').forEach((n) => n.remove());
  if (clone.textContent.trim()) return false;
  // Remaining elements must be empty wrappers (no media / interactive content).
  return !clone.querySelector('video, iframe, svg, input, button, select, textarea');
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  const doc = element.ownerDocument;
  const images = Array.from(element.querySelectorAll('img'));

  images.forEach((img) => {
    if (!img.isConnected) return;
    const src = getImageSrc(img);
    if (!src) return;

    const dmUrl = normalizeUrl(src);
    const altRaw = (img.getAttribute('alt') || '').trim();
    const text = altRaw || EMPTY_ALT_SENTINEL;
    const unit = imageUnit(img);
    const anchor = img.closest('a[href]');

    if (anchor) {
      if (!isSoleImageAnchor(anchor, unit)) {
        // eslint-disable-next-line no-console
        console.warn('[neom-dm-images] Skipping DM image inside mixed-content link:', dmUrl);
        return;
      }
      const href = anchor.getAttribute('href') || '';
      if (detectDynamicMediaUrl(href)) {
        // Link points at the DM asset itself: treat as unlinked.
        anchor.setAttribute('href', dmUrl);
        anchor.removeAttribute('title');
      } else {
        anchor.setAttribute('title', dmUrl);
      }
      anchor.textContent = text;
      return;
    }

    const a = doc.createElement('a');
    a.setAttribute('href', dmUrl);
    a.textContent = text;
    unit.replaceWith(a);
  });
}
