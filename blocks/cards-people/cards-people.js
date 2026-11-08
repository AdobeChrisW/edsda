import { createOptimizedPicture } from '../../scripts/aem.js';

function isPictureOnly(el) {
  return !!el.querySelector('picture') && el.textContent.trim() === '';
}

let instance = 0;

function buildSearch(placeholder, id) {
  const form = document.createElement('form');
  form.className = 'cards-people-search';
  form.setAttribute('role', 'search');
  form.addEventListener('submit', (e) => e.preventDefault());
  const label = document.createElement('label');
  label.className = 'cards-people-search-label';
  label.htmlFor = `cards-people-search-${id}`;
  label.textContent = placeholder;
  const input = document.createElement('input');
  input.type = 'search';
  input.id = `cards-people-search-${id}`;
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  form.append(label, input);
  return { form, input };
}

function decorateBody(body) {
  const paragraphs = [...body.children];
  const linkPara = paragraphs.reverse().find((p) => {
    const a = p.querySelector('a');
    return p.tagName === 'P' && a && p.textContent.trim() === a.textContent.trim();
  });
  const textParas = [...body.children].filter((el) => el !== linkPara);
  if (textParas[0]) textParas[0].classList.add('cards-people-name');
  if (textParas[1]) textParas[1].classList.add('cards-people-role');
  if (linkPara) {
    linkPara.classList.add('cards-people-link');
    const a = linkPara.querySelector('a');
    const name = textParas[0] ? textParas[0].textContent.trim() : '';
    // the arrow link usually has no meaningful text (empty or an arrow glyph):
    // name it after the person and let CSS draw the arrow
    if (a.textContent.trim().length < 3) {
      a.textContent = '';
      a.classList.add('cards-people-arrow');
      if (name) a.setAttribute('aria-label', name);
    }
  }
}

function makeButton(className, label, text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  if (text) {
    const span = document.createElement('span');
    span.textContent = text;
    button.append(span);
  }
  return button;
}

/**
 * Bio side panel (source .o-modal / .o-modalBioContent): a native modal
 * <dialog> on the right with portrait, name, role and bio. Escape is handled
 * by the dialog itself; the backdrop and the close button close it, and
 * prev/next page through every person in the block.
 */
function buildDialog(people, id) {
  const dialog = document.createElement('dialog');
  dialog.className = 'cards-people-dialog';
  dialog.setAttribute('aria-labelledby', `cards-people-dialog-name-${id}`);

  const panel = document.createElement('div');
  panel.className = 'cards-people-dialog-panel';

  const content = document.createElement('div');
  content.className = 'cards-people-dialog-content';
  const image = document.createElement('div');
  image.className = 'cards-people-dialog-image';
  const info = document.createElement('div');
  info.className = 'cards-people-dialog-info';
  info.setAttribute('aria-live', 'polite');
  const name = document.createElement('h2');
  name.className = 'cards-people-dialog-name';
  name.id = `cards-people-dialog-name-${id}`;
  const role = document.createElement('p');
  role.className = 'cards-people-dialog-role';
  info.append(name, role);
  const bio = document.createElement('div');
  bio.className = 'cards-people-dialog-bio';
  content.append(image, info, bio);

  const nav = document.createElement('div');
  nav.className = 'cards-people-dialog-nav';
  const prev = makeButton('cards-people-dialog-prev', 'Previous', 'Previous');
  const counter = document.createElement('p');
  counter.className = 'cards-people-dialog-counter';
  const next = makeButton('cards-people-dialog-next', 'Next', 'Next');
  nav.append(prev, counter, next);
  if (people.length < 2) nav.hidden = true;

  panel.append(content, nav);
  const close = makeButton('cards-people-dialog-close', 'Close');
  dialog.append(panel, close);

  let current = 0;
  const show = (index) => {
    current = (index + people.length) % people.length;
    const person = people[current];
    image.replaceChildren(...(person.picture ? [person.picture.cloneNode(true)] : []));
    image.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    name.textContent = person.name;
    role.textContent = person.role;
    role.hidden = !person.role;
    bio.replaceChildren(...[...person.bio.childNodes].map((n) => n.cloneNode(true)));
    // a plain-text bio cell becomes one paragraph
    if (!bio.querySelector('p, ul, ol')) {
      const p = document.createElement('p');
      p.textContent = person.bio.textContent.trim();
      bio.replaceChildren(p);
    }
    counter.textContent = `${current + 1} / ${people.length}`;
    const before = people[(current - 1 + people.length) % people.length];
    const after = people[(current + 1) % people.length];
    prev.setAttribute('aria-label', `Previous: ${before.name}`);
    next.setAttribute('aria-label', `Next: ${after.name}`);
    content.scrollTop = 0;
  };

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  close.addEventListener('click', () => dialog.close());
  // the panel fills the dialog box, so a click on the dialog itself is the backdrop
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (people.length < 2) return;
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  // return focus to the card of the person shown last
  dialog.addEventListener('close', () => {
    const { trigger } = people[current];
    if (trigger && !trigger.closest('[hidden]')) trigger.focus();
  });

  return {
    dialog,
    open(index) {
      show(index);
      if (!dialog.open) dialog.showModal();
      close.focus();
    },
  };
}

export default function decorate(block) {
  instance += 1;
  const id = instance;
  const rows = [...block.children];
  let search;
  const first = rows[0];
  if (first && first.children.length === 1 && !first.querySelector('picture')
    && first.textContent.trim()) {
    // optional first row: search placeholder text enables the filter
    search = buildSearch(first.textContent.trim(), id);
    rows.shift();
  }

  const list = document.createElement('ul');
  list.className = 'cards-people-list';
  const cards = [];
  rows.forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-people-card';
    const [imageOrBody, bodyOrImage, bioCell] = [...row.children];
    [imageOrBody, bodyOrImage].filter(Boolean).forEach((cell) => {
      cell.className = isPictureOnly(cell) ? 'cards-people-card-image' : 'cards-people-card-body';
      li.append(cell);
    });
    const body = li.querySelector('.cards-people-card-body');
    if (body) decorateBody(body);
    // cell 3 (optional): the bio, hidden in the card and shown in the side panel
    let bio = null;
    if (bioCell && bioCell.textContent.trim()) {
      bioCell.className = 'cards-people-card-bio';
      bioCell.hidden = true;
      li.append(bioCell);
      bio = bioCell;
    }
    list.append(li);
    cards.push({ li, body, bio });
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]));
  });

  // cards with a bio become one button-like control that opens the panel
  const people = cards.filter((card) => card.bio).map(({ li, body, bio }) => {
    const name = body?.querySelector('.cards-people-name')?.textContent.trim() || '';
    const role = body?.querySelector('.cards-people-role')?.textContent.trim() || '';
    const trigger = makeButton('cards-people-open', name || 'Open biography');
    trigger.setAttribute('aria-haspopup', 'dialog');
    li.classList.add('cards-people-card-has-bio');
    li.append(trigger);
    return {
      li, trigger, name, role, bio, picture: li.querySelector('.cards-people-card-image picture'),
    };
  });

  const children = [search && search.form, list];
  if (people.length) {
    const panel = buildDialog(people, id);
    people.forEach((person, index) => {
      person.trigger.addEventListener('click', () => panel.open(index));
    });
    children.push(panel.dialog);
  }
  block.replaceChildren(...children.filter(Boolean));

  if (search) {
    const status = document.createElement('p');
    status.className = 'cards-people-status';
    status.setAttribute('aria-live', 'polite');
    search.form.append(status);
    search.input.addEventListener('input', () => {
      const query = search.input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach(({ li, body }) => {
        // match on the card's visible text (name, role), not the hidden bio
        const text = (body || li).textContent.toLowerCase();
        const match = !query || text.includes(query);
        li.hidden = !match;
        if (match) shown += 1;
      });
      block.classList.toggle('cards-people-no-results', shown === 0);
      status.textContent = query ? `${shown} / ${cards.length}` : '';
    });
  }
}
