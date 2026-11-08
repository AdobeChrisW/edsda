/* eslint-disable */
/* global WebImporter */

/**
 * Parser: tabs-map-stats
 * Source: .cmp-c95-transition-slider (section.b-transitionSlider)
 * Block model:
 *   optional single-cell intro row (h2 "THIS IS NEOM")
 *   one row per tab: cell 1 = tab label, cell 2 = map image, <ul> of hotspot
 *   links, stat paragraphs (<strong>value</strong><br>caption), paragraph,
 *   arrow link.
 */

const ORIGIN = 'https://www.neom.com';

function absUrl(url) {
  if (!url) return '';
  const u = url.trim();
  if (/^(https?:|data:|mailto:|tel:)/i.test(u)) return u;
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function cleanText(el) {
  if (!el) return '';
  let text = el.textContent || '';
  if (el.cloneNode && el.querySelectorAll) {
    const c = el.cloneNode(true);
    c.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
    text = c.textContent;
  }
  return text.replace(/\s+/g, ' ').trim();
}

function buildImage(document, img) {
  if (!img) return null;
  let src = img.getAttribute('src') || img.getAttribute('data-src') || '';
  if (!src || src.startsWith('data:')) {
    const pic = img.closest('picture');
    const s = pic && pic.querySelector('source[srcset]');
    if (s) src = s.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0];
  }
  if (!src || src.startsWith('data:')) return null;
  const out = document.createElement('img');
  out.src = absUrl(src);
  out.alt = (img.getAttribute('alt') || '').trim();
  return out;
}

function paragraphsFrom(document, container) {
  const out = [];
  if (!container) return out;
  const blocks = container.querySelectorAll(':scope > p, :scope > ul, :scope > ol, :scope > h3, :scope > h4');
  if (blocks.length) {
    blocks.forEach((b) => { if (cleanText(b)) out.push(b.cloneNode(true)); });
  } else if (cleanText(container)) {
    const p = document.createElement('p');
    p.innerHTML = container.innerHTML.trim();
    out.push(p);
  }
  return out;
}

export default function parse(element, { document }) {
  const cells = [];

  // Section heading ("THIS IS NEOM") is default content before the block
  // (authoring-analysis rc2-s1), not a block row.
  const defaultContent = [];
  const introHeading = element.querySelector('.b-transitionSlider__heading .a-heading, .b-transitionSlider__heading h1, .b-transitionSlider__heading h2, .b-transitionSlider__heading h3');
  if (introHeading && cleanText(introHeading)) {
    const h2 = document.createElement('h2');
    h2.textContent = cleanText(introHeading);
    defaultContent.push(h2);
  }

  // the item's first <span> can be an empty icon, so fall back to the whole item's text
  const labels = [...element.querySelectorAll('.b-transitionSlider__titlePaginationItem')]
    .map((li) => cleanText(li.querySelector('span')) || cleanText(li));
  const slides = element.querySelectorAll('.b-transitionSlider__item');

  slides.forEach((slide, i) => {
    const label = labels[i] || `Tab ${i + 1}`;
    const panel = [];

    // map image (base map, not the per-region outline overlays)
    const mapImg = buildImage(document, slide.querySelector('.o-regionSliderNavigation__map > .a-image img'));
    if (mapImg) {
      const p = document.createElement('p');
      p.append(mapImg);
      panel.push(p);
    }

    // hotspot list
    const items = slide.querySelectorAll('.o-regionSliderNavigation__paginationItem');
    if (items.length) {
      const ul = document.createElement('ul');
      items.forEach((item) => {
        const step = item.querySelector('.a-stepIndicator');
        if (!step) return;
        const text = cleanText(step.querySelector('.a-stepIndicator__label') || step);
        if (!text) return;
        const li = document.createElement('li');
        const href = step.getAttribute('href') || (item.querySelector('a[href]') && item.querySelector('a[href]').getAttribute('href'));
        if (href) {
          const a = document.createElement('a');
          a.href = absUrl(href);
          a.textContent = text;
          li.append(a);
        } else {
          li.textContent = text;
        }
        ul.append(li);
      });
      if (ul.children.length) panel.push(ul);
    }

    // stats
    slide.querySelectorAll('.m-statisticCard__figureItem').forEach((fig) => {
      const valueEl = fig.querySelector('.m-statisticCard__figureValue');
      // value number + measure (e.g. "100" + "+", "26,500" + "km²", "10" + "degrees")
      let value = '';
      if (valueEl) {
        const measureEl = valueEl.querySelector('.m-statisticCard__figureMeasure');
        const measure = cleanText(measureEl);
        const clone = valueEl.cloneNode(true);
        const m = clone.querySelector('.m-statisticCard__figureMeasure');
        if (m) m.remove();
        const num = cleanText(clone);
        value = measure ? `${num}${/^[A-Za-z]/.test(measure) ? ' ' : ''}${measure}` : num;
      }
      const caption = cleanText(fig.querySelector('.m-statisticCard__figureLabel'));
      if (!value && !caption) return;
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = value;
      p.append(strong);
      if (caption) {
        p.append(document.createElement('br'));
        p.append(document.createTextNode(caption));
      }
      panel.push(p);
    });

    // paragraph
    panel.push(...paragraphsFrom(document, slide.querySelector('.o-transitionSlide__content .m-paragraph__content')));

    // arrow link(s)
    slide.querySelectorAll('.o-transitionSlide__buttons > a.m-button[href]').forEach((btn) => {
      const text = cleanText(btn.querySelector('.a-label') || btn);
      if (!text) return;
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = absUrl(btn.getAttribute('href'));
      a.textContent = text;
      p.append(a);
      panel.push(p);
    });

    cells.push([label, panel]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-map-stats', cells });
  if (defaultContent.length) element.before(...defaultContent);
  element.replaceWith(block);
}
