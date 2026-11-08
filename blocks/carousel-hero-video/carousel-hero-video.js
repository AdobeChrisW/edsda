import { createOptimizedPicture } from '../../scripts/aem.js';

const SLIDE_DURATION = 8000;
const VIDEO_RE = /\.(mp4|webm|m3u8)(\?|$)|\/is\/content\//i;

function optimizeImages(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '2000' }]));
  });
}

/**
 * Turns a video link in the media cell into a muted background <video>.
 * The authored picture (if any) is kept as the poster/fallback.
 */
function buildVideo(media, eager) {
  const link = [...media.querySelectorAll('a[href]')].find((a) => VIDEO_RE.test(a.href));
  if (!link) return null;
  const video = document.createElement('video');
  video.className = 'carousel-hero-video-video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.preload = eager ? 'auto' : 'none';
  const img = media.querySelector('img');
  if (img) video.poster = img.currentSrc || img.src;
  video.dataset.src = link.href;
  const wrapper = link.closest('p') || link;
  wrapper.remove();
  media.append(video);
  return video;
}

function loadVideo(video) {
  if (!video || video.src) return;
  video.src = video.dataset.src;
}

function setupSlide(row, idx, id) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hero-video-slide';
  slide.dataset.slideIndex = idx;
  slide.id = `carousel-hero-video-${id}-slide-${idx}`;
  const cols = [...row.children];
  const media = cols[0];
  const content = cols[1] || cols[0];
  if (media && media !== content) {
    media.className = 'carousel-hero-video-slide-media';
    slide.append(media);
  }
  content.className = 'carousel-hero-video-slide-content';
  // CTAs that point at a video file open the full video in a modal (source "-play" button)
  content.querySelectorAll('a.button').forEach((a) => {
    if (VIDEO_RE.test(a.href)) a.classList.add('play');
  });
  slide.append(content);
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading && heading.id) slide.setAttribute('aria-labelledby', heading.id);
  return slide;
}

/**
 * Builds the full-video modal used by "play" CTAs.
 * @param {Function} onOpen called when the modal opens
 * @param {Function} onClose called after the modal closes
 */
function buildVideoModal(onOpen, onClose) {
  const dialog = document.createElement('dialog');
  dialog.className = 'carousel-hero-video-modal';
  dialog.setAttribute('aria-label', 'Video player');
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'carousel-hero-video-modal-close';
  close.setAttribute('aria-label', 'Close video');
  const player = document.createElement('video');
  player.className = 'carousel-hero-video-modal-video';
  player.controls = true;
  player.playsInline = true;
  dialog.append(close, player);

  close.addEventListener('click', () => dialog.close());
  // clicking the backdrop (the dialog element itself) closes it
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    onClose();
  });

  return {
    dialog,
    open(src, label) {
      if (label) dialog.setAttribute('aria-label', label);
      player.src = src;
      onOpen();
      dialog.showModal();
      player.play().catch(() => {});
    },
  };
}

let instance = 0;

export default function decorate(block) {
  instance += 1;
  const id = instance;
  const rows = [...block.children];
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-hero-video-slides';
  const slides = rows.map((row, idx) => {
    const slide = setupSlide(row, idx, id);
    slidesWrapper.append(slide);
    return slide;
  });

  optimizeImages(slidesWrapper);
  const videos = slides.map((slide, idx) => {
    const media = slide.querySelector('.carousel-hero-video-slide-media');
    return media ? buildVideo(media, idx === 0) : null;
  });

  const nav = document.createElement('nav');
  nav.className = 'carousel-hero-video-pagination';
  nav.setAttribute('aria-label', 'Carousel slide controls');
  const indicators = document.createElement('ol');
  indicators.className = 'carousel-hero-video-indicators';
  slides.forEach((slide, idx) => {
    const li = document.createElement('li');
    li.className = 'carousel-hero-video-indicator';
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-controls', slide.id);
    button.setAttribute('aria-label', `Show slide ${idx + 1} of ${slides.length}`);
    const bar = document.createElement('span');
    bar.className = 'carousel-hero-video-progress';
    button.append(bar);
    li.append(button);
    indicators.append(li);
  });
  nav.append(indicators);

  block.replaceChildren(slidesWrapper);
  // the classic (source V1) hero always shows its page-indicator dots, even for one slide
  if (slides.length > 1 || block.classList.contains('classic')) block.append(nav);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = -1;
  let timer;

  function show(index) {
    const next = (index + slides.length) % slides.length;
    active = next;
    block.dataset.activeSlide = next;
    block.style.setProperty('--carousel-hero-video-duration', `${SLIDE_DURATION}ms`);
    slides.forEach((slide, i) => {
      const isActive = i === next;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', !isActive);
      slide.querySelectorAll('a, button').forEach((el) => {
        if (isActive) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
      const video = videos[i];
      if (video) {
        if (isActive) {
          loadVideo(video);
          if (!reduceMotion) video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
    indicators.querySelectorAll('button').forEach((btn, i) => {
      btn.closest('li').classList.toggle('active', i === next);
      btn.closest('li').classList.toggle('done', i < next);
      if (i === next) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
    clearTimeout(timer);
    if (slides.length > 1 && !reduceMotion && !block.classList.contains('paused')) {
      timer = setTimeout(() => show(active + 1), SLIDE_DURATION);
    }
  }

  indicators.querySelectorAll('button').forEach((btn, i) => {
    btn.addEventListener('click', () => show(i));
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

  if (block.querySelector('a.button.play')) {
    const modal = buildVideoModal(() => {
      pause();
      if (videos[active]) videos[active].pause();
    }, () => {
      if (videos[active] && !reduceMotion) videos[active].play().catch(() => {});
    });
    block.append(modal.dialog);
    block.addEventListener('click', (e) => {
      const link = e.target.closest('a.button.play');
      if (!link) return;
      e.preventDefault();
      modal.open(link.href, link.textContent.trim());
    });
  }

  show(0);
}
