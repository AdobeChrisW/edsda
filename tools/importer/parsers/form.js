/* eslint-disable */
/* global WebImporter */

/**
 * Parser: form
 * Source: .cmp-c96-newsletter-subscription form (newsletter email signup).
 * The surrounding heading + paragraph stay outside the matched <form> and are
 * imported as default content. Success/error panels are removed by the
 * neom-cleanup transformer before parsing.
 * Block model: optional key/value rows (label, placeholder, button, ...).
 * The AEM form action (/_jcr_content/.../form.form) is intentionally not
 * mapped: it is a source-site endpoint that will not accept EDS posts.
 */

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

export default function parse(element, { document }) {
  const cells = [];

  const input = element.querySelector('input[type="email"], .a-input__input, input:not([type="hidden"])');

  // label text without the "1000 characters" limit helper
  // (tried in order: a comma list would match the ancestor <label> first)
  const labelEl = element.querySelector('.m-textField__textLabel .a-label')
    || element.querySelector('.m-textField__label .a-label')
    || element.querySelector('label');
  let label = cleanText(labelEl);
  if (labelEl && labelEl.tagName === 'LABEL') {
    const limit = labelEl.querySelector('.m-textField__limit');
    if (limit) label = label.replace(cleanText(limit), '').trim();
  }
  if (label) cells.push(['label', label]);

  const placeholder = input ? (input.getAttribute('placeholder') || '').trim() : '';
  if (placeholder) cells.push(['placeholder', placeholder]);

  const button = element.querySelector('.o-form__buttons button, button[type="submit"], button');
  const buttonText = button ? (cleanText(button.querySelector('.a-label') || button) || (button.getAttribute('title') || '').trim()) : '';
  if (buttonText) cells.push(['button', buttonText]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'form', cells });
  element.replaceWith(block);
}
