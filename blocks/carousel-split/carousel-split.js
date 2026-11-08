import { createOptimizedPicture } from '../../scripts/aem.js';

const SLIDE_DURATION = 8000;

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

function decorateContent(content) {
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  // a paragraph before the heading is the eyebrow
  if (heading) {
    const before = heading.previousElementSibling;
    if (before && before.tagName === 'P' && !before.querySelector('a')) {
      before.classList.add('carousel-split-eyebrow');
    }
  }
  const last = content.lastElementChild;
  const link = last && last.tagName === 'P' ? last.querySelector('a') : null;
  let cta = null;
  if (link && last.textContent.trim() === link.textContent.trim()) {
    last.classList.add('carousel-split-cta');
    // the CTA gets its own grid cell: below the image on mobile, bottom-left on desktop
    cta = document.createElement('div');
    cta.className = 'carousel-split-slide-cta';
    cta.append(last);
  }
  return { heading, cta };
}

function setupSlide(row, idx, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-split-slide';
  slide.id = `carousel-split-${id}-slide-${idx}`;
  slide.dataset.slideIndex = idx;
  slide.setAttribute('role', 'tabpanel');
  const cells = [...row.children];
  const media = cells.find((c) => isPictureOnly(c));
  const content = cells.find((c) => c !== media) || document.createElement('div');
  content.className = 'carousel-split-slide-content';
  slide.append(content);
  if (media) {
    media.className = 'carousel-split-slide-media';
    slide.append(media);
  }
  const { heading, cta } = decorateContent(content);
  if (cta) slide.append(cta);
  return { slide, label: heading ? heading.textContent.trim() : `${idx + 1}` };
}

let instance = 0;

export default function decorate(block) {
  instance += 1;
  const id = instance;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-split-slides';
  const built = [...block.children].map((row, idx) => setupSlide(row, idx, id));
  const slides = built.map(({ slide }) => {
    slidesWrapper.append(slide);
    return slide;
  });

  slidesWrapper.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]));
  });

  // labelled tabs with a progress bar each; the label is the slide heading
  const tabs = document.createElement('div');
  tabs.className = 'carousel-split-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Carousel slide controls');
  const buttons = built.map(({ slide, label }, idx) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'carousel-split-tab';
    button.id = `${slide.id}-tab`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', slide.id);
    slide.setAttribute('aria-labelledby', button.id);
    const bar = document.createElement('span');
    bar.className = 'carousel-split-progress';
    bar.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'carousel-split-tab-label';
    text.textContent = label;
    button.append(bar, text);
    tabs.append(button);
    button.addEventListener('click', () => {
      // eslint-disable-next-line no-use-before-define
      show(idx);
    });
    return button;
  });

  block.replaceChildren(slidesWrapper);
  if (slides.length > 1) block.append(tabs);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = 0;
  let timer;

  function show(index) {
    active = (index + slides.length) % slides.length;
    block.style.setProperty('--carousel-split-duration', `${SLIDE_DURATION}ms`);
    slides.forEach((slide, i) => {
      const isActive = i === active;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', !isActive);
      slide.querySelectorAll('a, button').forEach((el) => {
        if (isActive) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
    });
    buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === active);
      btn.classList.toggle('done', i < active);
      btn.setAttribute('aria-selected', i === active);
      btn.tabIndex = i === active ? 0 : -1;
    });
    clearTimeout(timer);
    if (slides.length > 1 && !reduceMotion && !block.classList.contains('paused')) {
      timer = setTimeout(() => show(active + 1), SLIDE_DURATION);
    }
  }

  tabs.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (active + (e.key === 'ArrowRight' ? 1 : -1) + slides.length) % slides.length;
    show(next);
    buttons[next].focus();
  });

  // pause auto-advance while the user interacts with the carousel
  const pause = () => {
    block.classList.add('paused');
    clearTimeout(timer);
  };
  const resume = () => {
    if (!block.classList.contains('paused')) return;
    block.classList.remove('paused');
    show(active);
  };
  block.addEventListener('focusin', pause);
  block.addEventListener('focusout', (e) => {
    if (!block.contains(e.relatedTarget)) resume();
  });

  show(0);
}
