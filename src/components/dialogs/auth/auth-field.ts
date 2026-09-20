import { createIcon } from './auth-icons';
import type { FieldDefinition } from './auth-types';

export function createField(
  field: FieldDefinition,
  signal: AbortSignal,
): HTMLLabelElement {
  const label: HTMLLabelElement = document.createElement('label');
  label.className = 'auth-dialog__field';
  const labelText: HTMLSpanElement = document.createElement('span');
  labelText.textContent = field.label;
  const control: HTMLSpanElement = document.createElement('span');
  control.className = 'auth-dialog__control';
  const fieldIcon: SVGSVGElement = createIcon(field.icon);
  fieldIcon.classList.add('auth-dialog__field-icon');
  const input: HTMLInputElement = document.createElement('input');
  input.name = field.name;
  input.type = field.type;
  input.placeholder = field.placeholder;
  input.autocomplete = field.autocomplete;
  input.required = true;
  control.append(fieldIcon, input);

  if (field.type === 'password') {
    const toggle: HTMLButtonElement = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'auth-dialog__password-toggle';
    toggle.setAttribute('aria-label', `Show ${field.label.toLowerCase()}`);
    toggle.setAttribute('aria-pressed', 'false');
    toggle.append(createIcon('eye'));
    toggle.addEventListener(
      'click',
      (): void => {
        const isShowingPassword: boolean = input.type === 'password';
        input.type = isShowingPassword ? 'text' : 'password';
        toggle.classList.toggle('is-visible', isShowingPassword);
        toggle.setAttribute('aria-pressed', String(isShowingPassword));
        toggle.setAttribute(
          'aria-label',
          `${isShowingPassword ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`,
        );
      },
      { signal },
    );
    control.append(toggle);
  }

  label.append(labelText, control);
  return label;
}
