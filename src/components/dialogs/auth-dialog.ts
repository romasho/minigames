import './auth-dialog.scss';

export enum AuthMode {
  Login = 'login',
  Register = 'register',
}

export interface AuthDialogController {
  readonly element: HTMLDialogElement;
  open(mode: AuthMode): void;
}

interface FieldDefinition {
  readonly autocomplete: AutoFill;
  readonly label: string;
  readonly name: string;
  readonly placeholder: string;
  readonly type: 'email' | 'password' | 'text';
}

const fieldsByMode: Readonly<Record<AuthMode, readonly FieldDefinition[]>> = {
  [AuthMode.Login]: [
    {
      autocomplete: 'email',
      label: 'Email Address',
      name: 'email',
      placeholder: 'e.g. alex@minigames.com',
      type: 'email',
    },
    {
      autocomplete: 'current-password',
      label: 'Password',
      name: 'password',
      placeholder: '••••••••',
      type: 'password',
    },
  ],
  [AuthMode.Register]: [
    {
      autocomplete: 'username',
      label: 'Username',
      name: 'username',
      placeholder: 'e.g. alex',
      type: 'text',
    },
    {
      autocomplete: 'email',
      label: 'Email Address',
      name: 'email',
      placeholder: 'e.g. alex@minigames.com',
      type: 'email',
    },
    {
      autocomplete: 'new-password',
      label: 'Password',
      name: 'password',
      placeholder: '••••••••',
      type: 'password',
    },
    {
      autocomplete: 'new-password',
      label: 'Confirm Password',
      name: 'confirm-password',
      placeholder: '••••••••',
      type: 'password',
    },
  ],
};

function createTab(label: string, mode: AuthMode): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = 'auth-dialog__tab';
  button.dataset.mode = mode;
  button.textContent = label;
  return button;
}

function createField(field: FieldDefinition): HTMLLabelElement {
  const label: HTMLLabelElement = document.createElement('label');
  label.className = 'auth-dialog__field';
  const labelText: HTMLSpanElement = document.createElement('span');
  labelText.textContent = field.label;
  const input: HTMLInputElement = document.createElement('input');
  input.name = field.name;
  input.type = field.type;
  input.placeholder = field.placeholder;
  input.autocomplete = field.autocomplete;
  input.required = true;
  label.append(labelText, input);
  return label;
}

/**
 * Creates a reusable Figma-styled authentication dialog.
 */
export function createAuthDialog(): AuthDialogController {
  const dialog: HTMLDialogElement = document.createElement('dialog');
  dialog.className = 'auth-dialog';
  dialog.setAttribute('aria-labelledby', 'auth-dialog-title');

  const closeButton: HTMLButtonElement = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'auth-dialog__close';
  closeButton.setAttribute('aria-label', 'Close authentication dialog');
  closeButton.textContent = '×';

  const tabs: HTMLDivElement = document.createElement('div');
  tabs.className = 'auth-dialog__tabs';
  tabs.setAttribute('role', 'tablist');
  const loginTab: HTMLButtonElement = createTab('Login', AuthMode.Login);
  const registerTab: HTMLButtonElement = createTab(
    'Register',
    AuthMode.Register,
  );
  tabs.append(loginTab, registerTab);

  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'auth-dialog-title';
  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'auth-dialog__description';
  const form: HTMLFormElement = document.createElement('form');
  form.className = 'auth-dialog__form';
  form.method = 'dialog';
  const fields: HTMLDivElement = document.createElement('div');
  fields.className = 'auth-dialog__fields';
  const submitButton: HTMLButtonElement = document.createElement('button');
  submitButton.className = 'auth-dialog__submit';
  submitButton.type = 'submit';
  form.append(fields, submitButton);
  dialog.append(closeButton, tabs, title, description, form);

  const render: (mode: AuthMode) => void = (mode: AuthMode): void => {
    const isLogin: boolean = mode === AuthMode.Login;
    loginTab.classList.toggle('is-active', isLogin);
    registerTab.classList.toggle('is-active', !isLogin);
    loginTab.setAttribute('aria-selected', String(isLogin));
    registerTab.setAttribute('aria-selected', String(!isLogin));
    title.textContent = isLogin ? 'Welcome Back!' : 'Create Account';
    description.textContent = isLogin
      ? 'Sign in to resume your games and progress.'
      : 'Join MiniGames and start your adventure.';
    fields.replaceChildren(
      ...fieldsByMode[mode].map((field: FieldDefinition): HTMLLabelElement =>
        createField(field),
      ),
    );
    submitButton.textContent = isLogin ? 'Login' : 'Create Account';
  };

  loginTab.addEventListener('click', (): void => {
    render(AuthMode.Login);
  });
  registerTab.addEventListener('click', (): void => {
    render(AuthMode.Register);
  });
  closeButton.addEventListener('click', (): void => {
    dialog.close();
  });
  dialog.addEventListener('click', (event: MouseEvent): void => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', (): void => {
    document.body.classList.remove('is-overlay-open');
  });
  form.addEventListener('submit', (event: SubmitEvent): void => {
    event.preventDefault();
  });

  return {
    element: dialog,
    open(mode: AuthMode): void {
      render(mode);
      document.body.classList.add('is-overlay-open');
      if (!dialog.open) dialog.showModal();
    },
  };
}
