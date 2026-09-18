import './auth-dialog.scss';

export enum AuthMode {
  Login = 'login',
  Register = 'register',
}

export interface AuthDialogController {
  readonly element: HTMLDialogElement;
  open(mode: AuthMode): void;
}

type FieldIcon = 'email' | 'lock' | 'user';

interface FieldDefinition {
  readonly autocomplete: AutoFill;
  readonly icon: FieldIcon;
  readonly label: string;
  readonly name: string;
  readonly placeholder: string;
  readonly type: 'email' | 'password' | 'text';
}

const fieldsByMode: Readonly<Record<AuthMode, readonly FieldDefinition[]>> = {
  [AuthMode.Login]: [
    {
      autocomplete: 'email',
      icon: 'email',
      label: 'Email Address',
      name: 'email',
      placeholder: 'e.g. alex@minigames.com',
      type: 'email',
    },
    {
      autocomplete: 'current-password',
      icon: 'lock',
      label: 'Password',
      name: 'password',
      placeholder: '••••••••',
      type: 'password',
    },
  ],
  [AuthMode.Register]: [
    {
      autocomplete: 'username',
      icon: 'user',
      label: 'Username',
      name: 'username',
      placeholder: 'e.g. CozyGamer_99',
      type: 'text',
    },
    {
      autocomplete: 'email',
      icon: 'email',
      label: 'Email Address',
      name: 'email',
      placeholder: 'your.email@domain.com',
      type: 'email',
    },
    {
      autocomplete: 'new-password',
      icon: 'lock',
      label: 'Password',
      name: 'password',
      placeholder: 'Min. 8 characters',
      type: 'password',
    },
    {
      autocomplete: 'new-password',
      icon: 'lock',
      label: 'Confirm Password',
      name: 'confirm-password',
      placeholder: 'Repeat your password',
      type: 'password',
    },
  ],
};

const iconPaths: Readonly<Record<FieldIcon | 'eye', string>> = {
  email:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
};

function createIcon(name: FieldIcon | 'eye'): SVGSVGElement {
  const icon: SVGSVGElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '1.8');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  icon.innerHTML = iconPaths[name];
  return icon;
}

function createGoogleIcon(): SVGSVGElement {
  const icon: SVGSVGElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );
  icon.setAttribute('viewBox', '0 0 18 18');
  icon.setAttribute('aria-hidden', 'true');
  icon.classList.add('auth-dialog__google-icon');
  icon.innerHTML = `
    <path fill="#4285f4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.716v2.26h2.909c1.702-1.567 2.684-3.874 2.684-6.616Z"/>
    <path fill="#34a853" d="M9 18c2.43 0 4.468-.806 5.956-2.179l-2.91-2.26c-.806.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z"/>
    <path fill="#fbbc05" d="M3.963 10.707A5.41 5.41 0 0 1 3.681 9c0-.592.102-1.168.282-1.707V4.961H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.039l3.007-2.332Z"/>
    <path fill="#ea4335" d="M9 3.579c1.321 0 2.507.454 3.44 1.345l2.581-2.581C13.464.891 11.426 0 9 0A9 9 0 0 0 .956 4.961l3.007 2.332C4.672 5.164 6.656 3.579 9 3.579Z"/>
  `;
  return icon;
}

function createTab(label: string, mode: AuthMode): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = 'auth-dialog__tab';
  button.dataset.mode = mode;
  button.id = `auth-dialog-${mode}-tab`;
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-controls', 'auth-dialog-panel');
  button.textContent = label;
  return button;
}

function createField(field: FieldDefinition): HTMLLabelElement {
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
    toggle.append(createIcon('eye'));
    toggle.addEventListener('click', (): void => {
      const isShowingPassword: boolean = input.type === 'password';
      input.type = isShowingPassword ? 'text' : 'password';
      toggle.classList.toggle('is-visible', isShowingPassword);
      toggle.setAttribute(
        'aria-label',
        `${isShowingPassword ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`,
      );
    });
    control.append(toggle);
  }

  label.append(labelText, control);
  return label;
}

/*
 * Creates the reusable authentication modal used by every header trigger.
 */
export function createAuthDialog(): AuthDialogController {
  const dialog: HTMLDialogElement = document.createElement('dialog');
  dialog.className = 'auth-dialog';
  dialog.setAttribute('aria-labelledby', 'auth-dialog-title');

  const surface: HTMLDivElement = document.createElement('div');
  surface.className = 'auth-dialog__surface';

  const tabs: HTMLDivElement = document.createElement('div');
  tabs.className = 'auth-dialog__tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Authentication method');
  const loginTab: HTMLButtonElement = createTab('Login', AuthMode.Login);
  const registerTab: HTMLButtonElement = createTab(
    'Register',
    AuthMode.Register,
  );
  tabs.append(loginTab, registerTab);

  const panel: HTMLElement = document.createElement('section');
  panel.id = 'auth-dialog-panel';
  panel.className = 'auth-dialog__panel';
  panel.setAttribute('role', 'tabpanel');

  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'auth-dialog-title';
  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'auth-dialog__description';
  const form: HTMLFormElement = document.createElement('form');
  form.className = 'auth-dialog__form';

  const fields: HTMLDivElement = document.createElement('div');
  fields.className = 'auth-dialog__fields';
  const forgotPassword: HTMLButtonElement = document.createElement('button');
  forgotPassword.type = 'button';
  forgotPassword.className = 'auth-dialog__forgot';
  forgotPassword.textContent = 'Forgot Password?';

  const submitButton: HTMLButtonElement = document.createElement('button');
  submitButton.className = 'auth-dialog__submit';
  submitButton.type = 'submit';

  const divider: HTMLDivElement = document.createElement('div');
  divider.className = 'auth-dialog__divider';
  divider.setAttribute('aria-hidden', 'true');
  const dividerLabel: HTMLSpanElement = document.createElement('span');
  dividerLabel.textContent = 'OR';
  divider.append(dividerLabel);

  const googleButton: HTMLButtonElement = document.createElement('button');
  googleButton.type = 'button';
  googleButton.className = 'auth-dialog__google';
  const googleLabel: HTMLSpanElement = document.createElement('span');
  googleButton.append(createGoogleIcon(), googleLabel);

  const alternateAction: HTMLParagraphElement = document.createElement('p');
  alternateAction.className = 'auth-dialog__alternate';

  form.append(fields, forgotPassword, submitButton);
  panel.append(
    title,
    description,
    form,
    divider,
    googleButton,
    alternateAction,
  );
  surface.append(tabs, panel);
  dialog.append(surface);

  let activeMode: AuthMode = AuthMode.Login;
  let switchVersion: number;
  switchVersion = 0;
  let closeTimer: number | undefined;
  let previouslyFocused: HTMLElement | null = null;

  const setTabState: (mode: AuthMode) => void = (mode: AuthMode): void => {
    const isLogin: boolean = mode === AuthMode.Login;
    loginTab.classList.toggle('is-active', isLogin);
    registerTab.classList.toggle('is-active', !isLogin);
    loginTab.setAttribute('aria-selected', String(isLogin));
    registerTab.setAttribute('aria-selected', String(!isLogin));
    loginTab.tabIndex = isLogin ? 0 : -1;
    registerTab.tabIndex = isLogin ? -1 : 0;
    panel.setAttribute(
      'aria-labelledby',
      isLogin ? loginTab.id : registerTab.id,
    );
  };

  const render: (mode: AuthMode) => void = (mode: AuthMode): void => {
    activeMode = mode;
    const isLogin: boolean = mode === AuthMode.Login;
    setTabState(mode);
    title.textContent = isLogin ? 'Welcome Back!' : 'Create Account';
    description.textContent = isLogin
      ? 'Sign in to continue your games and progress.'
      : 'Join MiniGames to track your score & streak.';
    fields.replaceChildren(
      ...fieldsByMode[mode].map((field: FieldDefinition): HTMLLabelElement =>
        createField(field),
      ),
    );
    forgotPassword.hidden = !isLogin;
    submitButton.textContent = isLogin ? 'Login' : 'Create Account';
    googleLabel.textContent = isLogin
      ? 'Continue with Google'
      : 'Sign up with Google';

    const alternateText: Text = document.createTextNode(
      isLogin ? "Don't have an account? " : 'Already have an account? ',
    );
    const alternateButton: HTMLButtonElement = document.createElement('button');
    alternateButton.type = 'button';
    alternateButton.textContent = isLogin ? 'Register' : 'Login';
    alternateButton.addEventListener('click', (): void => {
      switchMode(isLogin ? AuthMode.Register : AuthMode.Login);
    });
    alternateAction.replaceChildren(alternateText, alternateButton);
  };

  const switchMode: (mode: AuthMode) => void = (mode: AuthMode): void => {
    if (mode === activeMode) return;
    const version: number = ++switchVersion;
    for (const animation of panel.getAnimations()) animation.cancel();
    const outAnimation: Animation = panel.animate(
      [
        { opacity: 1, transform: 'translateX(0)' },
        {
          opacity: 0,
          transform:
            mode === AuthMode.Register
              ? 'translateX(-14px)'
              : 'translateX(14px)',
        },
      ],
      { duration: 110, easing: 'ease-in', fill: 'forwards' },
    );
    outAnimation.addEventListener(
      'finish',
      (): void => {
        if (version !== switchVersion) return;
        render(mode);
        panel.animate(
          [
            {
              opacity: 0,
              transform:
                mode === AuthMode.Register
                  ? 'translateX(14px)'
                  : 'translateX(-14px)',
            },
            { opacity: 1, transform: 'translateX(0)' },
          ],
          { duration: 180, easing: 'ease-out', fill: 'both' },
        );
      },
      { once: true },
    );
  };

  const finishClose: () => void = (): void => {
    if (!dialog.open) return;
    dialog.close();
  };

  const requestClose: () => void = (): void => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.add('is-closing');
    dialog.classList.remove('is-visible');
    closeTimer = setTimeout(finishClose, 300);
  };

  loginTab.addEventListener('click', (): void => {
    switchMode(AuthMode.Login);
  });
  registerTab.addEventListener('click', (): void => {
    switchMode(AuthMode.Register);
  });
  tabs.addEventListener('keydown', (event: KeyboardEvent): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const nextMode: AuthMode =
      activeMode === AuthMode.Login ? AuthMode.Register : AuthMode.Login;
    switchMode(nextMode);
    (nextMode === AuthMode.Login ? loginTab : registerTab).focus();
  });
  dialog.addEventListener('click', (event: MouseEvent): void => {
    if (event.target === dialog) requestClose();
  });
  dialog.addEventListener('cancel', (event: Event): void => {
    event.preventDefault();
    requestClose();
  });
  dialog.addEventListener('close', (): void => {
    clearTimeout(closeTimer);
    closeTimer = undefined;
    dialog.classList.remove('is-closing', 'is-visible');
    document.body.classList.remove('is-overlay-open');
    previouslyFocused?.focus();
    previouslyFocused = null;
  });
  form.addEventListener('submit', (event: SubmitEvent): void => {
    event.preventDefault();
  });

  render(AuthMode.Login);

  return {
    element: dialog,
    open(mode: AuthMode): void {
      ++switchVersion;
      for (const animation of panel.getAnimations()) animation.cancel();
      render(mode);

      if (closeTimer !== undefined) clearTimeout(closeTimer);
      closeTimer = undefined;
      dialog.classList.remove('is-closing');

      if (!dialog.open) {
        previouslyFocused =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        dialog.showModal();
      }

      document.body.classList.add('is-overlay-open');
      requestAnimationFrame((): void => {
        dialog.classList.add('is-visible');
      });
    },
  };
}
