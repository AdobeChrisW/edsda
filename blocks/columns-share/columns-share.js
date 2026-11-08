// Inline icons, copied from the source site's share icons (filled rounded squares, currentColor).
const ICONS = {
  x: {
    box: 30,
    evenodd: true,
    d: 'M6.25 0H23.75C27.25 0 30 2.75 30 6.25V23.75C30 27.25 27.25 30 23.75 30H6.25C2.75 30 0 27.25 0 23.75V6.25C0 2.75 2.75 0 6.25 0ZM23.1796 6.25L16.6649 13.6563H16.6645L23.75 23.741H18.539L13.7676 16.9499L7.79388 23.741H6.25L13.0822 15.9744L6.25 6.25H11.461L15.9791 12.6807L21.6359 6.25H23.1796ZM13.8581 15.0918L14.5503 16.0601V16.0605L19.2653 22.6561H21.6366L15.8587 14.5733L15.1664 13.6049L10.7215 7.38664H8.35016L13.8581 15.0918Z',
  },
  linkedin: { d: 'M19 0H5C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM8 19H5V8h3v11zM6.5 6.7c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8S8.2 4 8.2 5c0 1-.7 1.7-1.7 1.7zM20 19h-3v-5.6c0-3.4-4-3.1-4 0V19h-3V8h3v1.8c1.4-2.6 7-2.8 7 2.5V19z' },
  facebook: { d: 'M19 0H5C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zm-3 7h-1.9c-.6 0-1.1.3-1.1.9V9h3l-.2 3H13v8h-3v-8H8V9h2V7.1c0-2 1.1-3.1 3.5-3.1H16v3z' },
  whatsapp: { d: 'M12.036 5.339C8.401 5.339 5.445 8.295 5.443 11.928C5.442 13.411 5.877 14.522 6.607 15.684L5.941 18.116L8.435 17.462C9.552 18.125 10.619 18.523 12.03 18.523C15.662 18.523 18.621 15.567 18.622 11.933C18.625 8.292 15.68 5.34 12.036 5.339ZM15.912 14.762C15.747 15.225 14.955 15.647 14.575 15.704C14.234 15.755 13.802 15.776 13.327 15.626C13.039 15.535 12.67 15.413 12.198 15.209C10.211 14.351 8.913 12.35 8.814 12.218C8.715 12.086 8.005 11.144 8.005 10.169C8.005 9.194 8.517 8.715 8.698 8.516C8.88 8.316 9.094 8.266 9.226 8.266L9.606 8.273C9.728 8.279 9.891 8.227 10.052 8.613C10.217 9.01 10.613 9.985 10.663 10.084C10.712 10.183 10.746 10.299 10.679 10.431C10.613 10.563 10.58 10.646 10.481 10.761L10.184 11.108C10.085 11.207 9.982 11.314 10.097 11.512C10.213 11.71 10.61 12.359 11.199 12.884C11.956 13.559 12.594 13.768 12.792 13.867C12.99 13.966 13.106 13.95 13.221 13.817C13.337 13.685 13.716 13.239 13.848 13.04C13.98 12.841 14.112 12.875 14.294 12.941C14.476 13.007 15.45 13.486 15.648 13.586C15.846 13.685 15.978 13.735 16.028 13.817C16.077 13.902 16.077 14.299 15.912 14.762ZM19 0H5C2.239 0 0 2.239 0 5V19C0 21.761 2.239 24 5 24H19C21.762 24 24 21.761 24 19V5C24 2.239 21.762 0 19 0ZM12.033 19.862C10.706 19.862 9.399 19.529 8.241 18.897L4.038 20L5.163 15.892C4.469 14.69 4.104 13.326 4.105 11.928C4.107 7.556 7.663 4 12.033 4C14.154 4.001 16.145 4.827 17.642 6.325C19.139 7.823 19.963 9.816 19.962 11.934C19.96 16.306 16.403 19.862 12.033 19.862Z' },
  email: { evenodd: true, d: 'M5 0h14c2.8 0 5 2.2 5 5v14c0 2.8-2.2 5-5 5H5c-2.8 0-5-2.2-5-5V5c0-2.8 2.2-5 5-5zm10.2 12.5l6.5 6.6-5-8 5-6-10 7.4-10-7.4 5.1 6-5.1 8 6.6-6.7 3.4 3.5 3.5-3.4z' },
  copy: { d: 'M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zm-7.69 18.86a4.363 4.363 0 01-6.17-6.17l2.92-2.91A4.28 4.28 0 019 9a4.34 4.34 0 015.72 1.4L13.24 12a2.3 2.3 0 00-2.6-1.32 2.27 2.27 0 00-1.11.61l-2.91 2.88a2.27 2.27 0 003.21 3.21l.9-.9a5.64 5.64 0 002.56.39l-1.98 1.99zm7.55-7.55l-2.92 2.91A4.28 4.28 0 0115 15a4.38 4.38 0 01-3.13.42 4.49 4.49 0 01-2.06-1.16 4.14 4.14 0 01-.53-.66l1.48-1.6c.122.262.288.502.49.71a2.27 2.27 0 003.21 0l2.92-2.92a2.27 2.27 0 00-3.21-3.21l-.9.9a5.64 5.64 0 00-2.56-.39l2-2a4.363 4.363 0 016.17 6.17l-.02.05z' },
  check: { d: 'M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zm-8.959 17l-4.5-4.319 1.395-1.435 3.08 2.937L17.037 7l1.422 1.409L10.041 17z' },
  share: { d: 'M14.6 15.9l-3.4-2.4c.3-.4.4-.9.4-1.4 0-.5-.1-.9-.4-1.4l3.4-2.4c.5.3 1.1.5 1.6.5.9 0 1.6-.3 2.3-.9.6-.6 1-1.4 1-2.3s-.4-1.8-1-2.4a3.32 3.32 0 00-4.7 0c-.6.6-1 1.4-1 2.3 0 .5.1 1 .4 1.4L9.8 9.4c-1.3-.8-2.9-.5-4 .5-.6.6-1 1.4-1 2.3 0 .9.4 1.6 1 2.3.6.6 1.5.9 2.3.9.6 0 1.1-.1 1.6-.5l3.4 2.4c-.3.4-.4.9-.4 1.4 0 .9.4 1.6 1 2.3.6.6 1.5.9 2.3.9.8 0 1.6-.3 2.3-.9.6-.6 1-1.4 1-2.3 0-.9-.4-1.6-1-2.3-.8-1-2.4-1.1-3.7-.5zm.6-11.2c.3-.3.6-.4 1-.4s.8.1 1 .4c.3.3.4.6.4.9 0 .4-.1.6-.4.9-.5.5-1.5.5-2 0-.3-.3-.4-.6-.4-.9.1-.4.2-.6.4-.9zm-8 8.3c-.3-.3-.4-.6-.4-.9 0-.4.1-.6.4-.9.3-.3.6-.4 1-.4s.8.1 1 .4c.3.3.4.5.4.9s-.2.7-.4.9c-.6.5-1.5.5-2 0zm10.1 6.6c-.5.5-1.5.5-2 0-.3-.3-.4-.6-.4-.9 0-.4.1-.6.4-.9.3-.3.6-.4 1-.4s.8.1 1 .4c.3.3.4.6.4.9-.1.4-.2.6-.4.9z' },
  back: { evenodd: true, d: 'M1.5 11.6a.5.5 0 000 .8l5.8 5a.5.5 0 00.7-.7l-2.6-4h16.5a.8.8 0 000-1.4H5.4l2.6-4a.5.5 0 00-.7-.7l-5.8 5z' },
  close: { evenodd: true, d: 'M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4z' },
};

const COPY_FEEDBACK_MS = 2000;
let dialogCount = 0;

function icon(name) {
  const { box = 24, evenodd = false, d } = ICONS[name];
  const rule = evenodd ? ' fill-rule="evenodd" clip-rule="evenodd"' : '';
  const span = document.createElement('span');
  span.className = 'columns-share-icon';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg viewBox="0 0 ${box} ${box}" width="24" height="24" focusable="false"><path fill="currentColor"${rule} d="${d}"/></svg>`;
  return span;
}

/** Identify the network an authored link stands for, by its href first, then its text. */
function detectNetwork(a) {
  const href = (a.getAttribute('href') || '').toLowerCase();
  const text = a.textContent.trim().toLowerCase();
  if (href.startsWith('mailto:') || /^e-?mail$/.test(text)) return 'email';
  if (href.endsWith('#copy') || /copy/.test(text)) return 'copy';
  if (/(^|\.)(twitter|x)\.com/.test(href.replace(/^\w+:\/\//, '')) || /^(x|twitter)/.test(text)) return 'x';
  if (/linkedin/.test(href) || /linkedin/.test(text)) return 'linkedin';
  if (/facebook/.test(href) || /facebook/.test(text)) return 'facebook';
  if (/wa\.me|whatsapp/.test(href) || /whatsapp/.test(text)) return 'whatsapp';
  return null;
}

function pageInfo() {
  const url = new URL(window.location.href);
  url.hash = '';
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const title = (ogTitle && ogTitle.content) || document.title || '';
  return { url: url.href, title };
}

function shareUrl(network, { url, title }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (network) {
    case 'x': return `https://twitter.com/intent/tweet?url=${u}&text=${t}`;
    case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case 'whatsapp': return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`.trim())}`;
    case 'email': return `mailto:?subject=${t}&body=${u}`;
    default: return null;
  }
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // fall through to the legacy path
    }
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.className = 'columns-share-offscreen';
  document.body.append(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (e) {
    ok = false;
  }
  field.remove();
  return ok;
}

function buildCopyButton(name, status, info) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'columns-share-link';
  button.dataset.network = 'copy';
  button.setAttribute('aria-label', name);
  const text = document.createElement('span');
  text.className = 'columns-share-link-text';
  text.textContent = name;
  // visual confirmation (source: green "Copied" panel); the status region announces it
  const copied = document.createElement('span');
  copied.className = 'columns-share-copied-msg';
  copied.setAttribute('aria-hidden', 'true');
  const copiedText = document.createElement('span');
  copiedText.textContent = 'Copied';
  copied.append(icon('check'), copiedText);
  button.append(icon('copy'), text, copied);
  let timer;
  button.addEventListener('click', async () => {
    const ok = await copyText(info.url);
    status.textContent = '';
    // re-set on the next frame so repeated copies are announced again
    requestAnimationFrame(() => {
      status.textContent = ok ? 'Link copied to clipboard' : 'Could not copy the link';
    });
    button.classList.toggle('columns-share-copied', ok);
    clearTimeout(timer);
    timer = setTimeout(() => {
      button.classList.remove('columns-share-copied');
      status.textContent = '';
    }, COPY_FEEDBACK_MS);
  });
  return button;
}

function buildLink(a, network, info) {
  const name = a.textContent.trim();
  const link = document.createElement('a');
  link.className = 'columns-share-link';
  link.dataset.network = network;
  link.href = shareUrl(network, info);
  const text = document.createElement('span');
  text.className = 'columns-share-link-text';
  text.textContent = name;
  link.append(icon(network), text);
  if (network === 'email') {
    link.setAttribute('aria-label', `Share by ${name}`);
  } else {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Share on ${name} (opens in a new window)`);
  }
  return link;
}

/** Label = first cell that holds text but no links; links = every authored link, in order. */
function readContent(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const labelCell = cells.find((c) => !c.querySelector('a') && c.textContent.trim());
  const label = labelCell ? labelCell.textContent.trim() : 'Share';
  const anchors = [...block.querySelectorAll('a')];
  return { label, anchors };
}

function buildList(anchors, status, info) {
  const list = document.createElement('ul');
  list.className = 'columns-share-list';
  anchors.forEach((a) => {
    const network = detectNetwork(a);
    const li = document.createElement('li');
    if (network === 'copy') {
      li.append(buildCopyButton(a.textContent.trim() || 'Copy link', status, info));
    } else if (network) {
      li.append(buildLink(a, network, info));
    } else {
      // unknown network: keep the authored link untouched
      a.className = 'columns-share-link';
      li.append(a);
    }
    list.append(li);
  });
  return list;
}

/**
 * The source shows the Share pill in one row with the article's Back link. That link is
 * authored as default content right before the block, so adopt it when it is a lone link
 * paragraph at the end of the preceding default content.
 */
function adoptBackLink(block) {
  const wrapper = block.parentElement;
  const prev = wrapper && wrapper.previousElementSibling;
  if (!prev || !prev.classList.contains('default-content-wrapper')) return null;
  const para = prev.lastElementChild;
  if (!para || para.tagName !== 'P') return null;
  const links = para.querySelectorAll('a');
  if (links.length !== 1 || para.textContent.trim() !== links[0].textContent.trim()) return null;
  const a = links[0];
  const text = document.createElement('span');
  text.textContent = a.textContent.trim();
  a.className = 'columns-share-back';
  a.removeAttribute('title');
  a.replaceChildren(icon('back'), text);
  para.remove();
  if (!prev.children.length) prev.remove();
  return a;
}

function decorateModal(block, label, list, status) {
  dialogCount += 1;
  const headingId = `columns-share-title-${dialogCount}`;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'columns-share-toggle';
  toggle.setAttribute('aria-haspopup', 'dialog');
  toggle.setAttribute('aria-expanded', 'false');
  const toggleText = document.createElement('span');
  toggleText.textContent = label;
  toggle.append(toggleText, icon('share'));

  const actions = document.createElement('div');
  actions.className = 'columns-share-actions';
  const back = adoptBackLink(block);
  if (back) actions.append(back);
  actions.append(toggle);

  const dialog = document.createElement('dialog');
  dialog.className = 'columns-share-dialog';
  dialog.setAttribute('aria-labelledby', headingId);

  // padding lives on the body so a click on the dialog element itself is always the backdrop
  const body = document.createElement('div');
  body.className = 'columns-share-dialog-body';
  const heading = document.createElement('h2');
  heading.id = headingId;
  heading.className = 'columns-share-dialog-title';
  heading.textContent = label;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'columns-share-close';
  close.setAttribute('aria-label', 'Close');
  close.append(icon('close'));
  body.append(heading, list, status);
  dialog.append(close, body);

  toggle.addEventListener('click', () => {
    dialog.showModal();
    toggle.setAttribute('aria-expanded', 'true');
  });
  close.addEventListener('click', () => dialog.close());
  // a click on the backdrop lands on the dialog element itself
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });

  block.replaceChildren(actions, dialog);
}

export default function decorate(block) {
  const { label, anchors } = readContent(block);
  const info = pageInfo();

  const status = document.createElement('p');
  status.className = 'columns-share-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const list = buildList(anchors, status, info);

  if (block.classList.contains('modal') && typeof HTMLDialogElement === 'function') {
    decorateModal(block, label, list, status);
    return;
  }

  const bar = document.createElement('div');
  bar.className = 'columns-share-bar';
  const labelEl = document.createElement('p');
  labelEl.className = 'columns-share-label';
  labelEl.textContent = label;
  bar.append(labelEl, list);
  block.replaceChildren(bar, status);
}
