import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Block options (authored as "Columns Media (square, pull)"):
 *   square        1:1 images (source figure -square); without it the block falls back to the
 *                 images' natural ratio, see detectSquare()
 *   pull          every row's image bleeds to the viewport edge (source -assetPull on all rows)
 *   inset         no row's image bleeds (source rows without -assetPull)
 *   large-heading h2 on the larger tier (source a-heading -h5, 37px instead of 28px)
 * Without pull/inset, multi-row blocks follow the common source pattern: image-last rows bleed,
 * image-first rows are inset. A single row with the image last is the c24 split (two halves);
 * a single row with the image first is a c09 row with a bleeding image.
 */

const SQUARE_TOLERANCE = 0.05;

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

function isSquarish(img) {
  const { naturalWidth: w, naturalHeight: h } = img;
  return w > 0 && h > 0 && Math.abs(w / h - 1) <= SQUARE_TOLERANCE;
}

function settled(img) {
  if (img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  });
}

// Scene7 renditions (/is/image/) are resized server-side per breakpoint and do not report the
// asset's real ratio (e.g. 750x2000 for a 1:1 asset at wid=750), so they are not measured.
function hasOwnRatio(img) {
  return !new URL(img.currentSrc || img.src, window.location.href).pathname.startsWith('/is/image/');
}

/*
 * The importer does not carry the source figure ratio, so when neither square nor widescreen
 * is authored, a multi-row block is rendered square when at least a third of its measurable
 * images are ~1:1 (e.g. /regions). Once the first image loads (it is near the viewport), the
 * rest load eagerly so the class is set before those rows scroll into view.
 */
function detectSquare(block) {
  if (block.classList.contains('square') || block.classList.contains('widescreen')) return;
  if (block.children.length < 2) return;
  const imgs = [...block.querySelectorAll('.columns-media-image img')];
  if (!imgs.length) return;
  Promise.race(imgs.map(settled))
    .then(() => {
      imgs.forEach((img) => { img.loading = 'eager'; });
      return Promise.all(imgs.map(settled));
    })
    .then(() => {
      const measured = imgs.filter(hasOwnRatio);
      if (measured.length && measured.filter(isSquarish).length * 3 >= measured.length) {
        block.classList.add('square');
      }
    });
}

export default function decorate(block) {
  const rows = [...block.children];
  const pullAll = block.classList.contains('pull');
  const insetAll = block.classList.contains('inset');

  rows.forEach((row) => {
    row.classList.add('columns-media-row');
    const cells = [...row.children];
    let imageFirst = null;
    cells.forEach((cell, i) => {
      if (isPictureOnly(cell)) {
        cell.classList.add('columns-media-image');
        imageFirst = i === 0;
        row.classList.add(imageFirst ? 'columns-media-image-first' : 'columns-media-image-last');
        return;
      }
      cell.classList.add('columns-media-content');
      // a short paragraph directly before the heading is the eyebrow
      const heading = cell.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4');
      const prev = heading && heading.previousElementSibling;
      if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture')) {
        prev.classList.add('columns-media-eyebrow');
      }
    });
    if (cells.length === 1) row.classList.add('columns-media-single');
    if (imageFirst === null) return;

    if (rows.length === 1 && !imageFirst && !pullAll && !insetAll) {
      row.classList.add('columns-media-split');
    } else if (pullAll || (!insetAll && (rows.length === 1 || !imageFirst))) {
      row.classList.add('columns-media-pull');
    }
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '1200' }]));
  });

  detectSquare(block);
}
