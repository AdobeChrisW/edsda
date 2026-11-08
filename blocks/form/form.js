import { toClassName } from '../../scripts/aem.js';

const DEFAULTS = {
  label: 'Email address',
  placeholder: 'Enter your email',
  button: 'Sign up',
  success: 'Thank you for subscribing.',
  error: 'Something went wrong. Please try again.',
};

/**
 * Reads authoring config. Supported rows:
 *  - two cells: key | value (action, label, placeholder, button, success, error)
 *  - one cell containing a link: the submit URL (action)
 */
function readConfig(block) {
  const config = { ...DEFAULTS, action: '' };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = toClassName(cells[0].textContent);
      const link = cells[1].querySelector('a');
      const value = key === 'action' && link ? link.href : cells[1].textContent.trim();
      if (key && value) config[key] = value;
    } else if (cells.length === 1) {
      const link = cells[0].querySelector('a');
      if (link) config.action = link.href;
    }
  });
  return config;
}

let formId = 0;

export default function decorate(block) {
  formId += 1;
  const config = readConfig(block);
  const inputId = `form-${formId}-email`;

  const form = document.createElement('form');
  form.className = 'form-newsletter';
  form.noValidate = true;
  if (config.action) {
    form.action = config.action;
    form.method = 'post';
  }

  const field = document.createElement('div');
  field.className = 'form-field';
  const label = document.createElement('label');
  label.htmlFor = inputId;
  label.className = 'form-label';
  label.textContent = config.label;
  const input = document.createElement('input');
  input.type = 'email';
  input.id = inputId;
  input.name = 'email';
  input.required = true;
  input.autocomplete = 'email';
  input.placeholder = config.placeholder;
  field.append(label, input);

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'form-submit';
  button.textContent = config.button;

  const message = document.createElement('p');
  message.className = 'form-message';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');

  form.append(field, button, message);

  // source dims the button until a valid email is entered; keep it focusable
  const updatePending = () => {
    form.classList.toggle('form-pending', !input.value || !input.checkValidity());
  };
  updatePending();
  input.addEventListener('input', () => {
    input.removeAttribute('aria-invalid');
    updatePending();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    message.textContent = '';
    form.classList.remove('form-success', 'form-error');
    if (!input.checkValidity()) {
      input.setAttribute('aria-invalid', 'true');
      message.textContent = input.validationMessage;
      form.classList.add('form-error');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    if (!config.action) {
      // no submit endpoint configured yet
      message.textContent = config.success;
      form.classList.add('form-success');
      form.reset();
      updatePending();
      return;
    }
    button.disabled = true;
    try {
      const resp = await fetch(config.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { email: input.value } }),
      });
      if (!resp.ok) throw new Error(resp.status);
      message.textContent = config.success;
      form.classList.add('form-success');
      form.reset();
      updatePending();
    } catch (err) {
      message.textContent = config.error;
      form.classList.add('form-error');
    } finally {
      button.disabled = false;
    }
  });

  block.replaceChildren(form);
}
