import './auth-dialog.scss';
import { createField } from './auth/auth-field';
import { fieldsByMode } from './auth/auth-fields';
import { createGoogleIcon } from './auth/auth-icons';
import {
  AuthMode,
  type AuthDialogController,
  type FieldDefinition,
} from './auth/auth-types';
import { lockScroll, unlockScroll } from '../../utils/scroll-lock';

export { AuthMode, type AuthDialogController } from './auth/auth-types';

function shouldReduceMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  const status: HTMLParagraphElement = document.createElement('p');
  status.className = 'auth-dialog__status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
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
    status,
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
  let submitTimer: number | undefined;
  let previouslyFocused: HTMLElement | null = null;
  const eventController: AbortController = new AbortController();
  const { signal }: AbortController = eventController;

  const setStatus: (message?: string, isError?: boolean) => void = (
    message?: string,
    isError?: boolean,
  ): void => {
    status.textContent = message ?? '';
    status.classList.toggle('is-error', isError ?? false);
  };

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
    setStatus();
    setTabState(mode);
    title.textContent = isLogin ? 'Welcome Back!' : 'Create Account';
    description.textContent = isLogin
      ? 'Sign in to continue your games and progress.'
      : 'Join MiniGames to track your score & streak.';
    fields.replaceChildren(
      ...fieldsByMode[mode].map((field: FieldDefinition): HTMLLabelElement =>
        createField(field, signal),
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
    alternateButton.addEventListener(
      'click',
      (): void => {
        switchMode(isLogin ? AuthMode.Register : AuthMode.Login);
      },
      { signal },
    );
    alternateAction.replaceChildren(alternateText, alternateButton);
  };

  const switchMode: (mode: AuthMode) => void = (mode: AuthMode): void => {
    if (mode === activeMode) return;
    const version: number = ++switchVersion;
    for (const animation of panel.getAnimations()) animation.cancel();
    if (shouldReduceMotion()) {
      render(mode);
      return;
    }
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

  loginTab.addEventListener(
    'click',
    (): void => {
      switchMode(AuthMode.Login);
    },
    { signal },
  );
  registerTab.addEventListener(
    'click',
    (): void => {
      switchMode(AuthMode.Register);
    },
    { signal },
  );
  tabs.addEventListener(
    'keydown',
    (event: KeyboardEvent): void => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const nextMode: AuthMode =
        activeMode === AuthMode.Login ? AuthMode.Register : AuthMode.Login;
      switchMode(nextMode);
      (nextMode === AuthMode.Login ? loginTab : registerTab).focus();
    },
    { signal },
  );
  dialog.addEventListener(
    'click',
    (event: MouseEvent): void => {
      if (event.target === dialog) requestClose();
    },
    { signal },
  );
  dialog.addEventListener(
    'cancel',
    (event: Event): void => {
      event.preventDefault();
      requestClose();
    },
    { signal },
  );
  dialog.addEventListener(
    'close',
    (): void => {
      clearTimeout(closeTimer);
      closeTimer = undefined;
      dialog.classList.remove('is-closing', 'is-visible');
      unlockScroll('authentication');
      previouslyFocused?.focus();
      previouslyFocused = null;
    },
    { signal },
  );
  form.addEventListener(
    'submit',
    (event: SubmitEvent): void => {
      event.preventDefault();
      const passwordField: Element | RadioNodeList | null =
        form.elements.namedItem('password');
      const confirmationField: Element | RadioNodeList | null =
        form.elements.namedItem('confirm-password');
      const arePasswordsDifferent: boolean =
        activeMode === AuthMode.Register &&
        passwordField instanceof HTMLInputElement &&
        confirmationField instanceof HTMLInputElement &&
        passwordField.value !== confirmationField.value;
      if (arePasswordsDifferent) {
        if (confirmationField instanceof HTMLInputElement) {
          confirmationField.setCustomValidity('Passwords do not match.');
          confirmationField.reportValidity();
        }
        setStatus('Passwords do not match. Please check both fields.', true);
        return;
      }

      setStatus(
        activeMode === AuthMode.Login
          ? 'You are signed in to this demo.'
          : 'Your demo account has been created.',
      );
      submitButton.disabled = true;
      submitTimer = setTimeout((): void => {
        submitButton.disabled = false;
        requestClose();
      }, 700);
    },
    { signal },
  );
  form.addEventListener(
    'input',
    (event: Event): void => {
      if (!(event.target instanceof HTMLInputElement)) return;
      event.target.setCustomValidity('');
      setStatus();
    },
    { signal },
  );
  forgotPassword.addEventListener(
    'click',
    (): void => {
      setStatus('Password recovery is available at developers@minigames.com.');
    },
    { signal },
  );
  googleButton.disabled = true;
  googleButton.title =
    'Google sign-in requires a server-side OAuth integration.';

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

      lockScroll('authentication');
      requestAnimationFrame((): void => {
        dialog.classList.add('is-visible');
      });
    },
    close(): void {
      requestClose();
    },
    setMode(mode: AuthMode): void {
      switchMode(mode);
    },
    destroy(): void {
      clearTimeout(closeTimer);
      clearTimeout(submitTimer);
      eventController.abort();
      for (const animation of panel.getAnimations()) animation.cancel();
      unlockScroll('authentication');
      if (dialog.open) dialog.close();
      previouslyFocused?.focus();
      previouslyFocused = null;
    },
  };
}
