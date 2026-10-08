import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateAuth } from '../src/features/auth/validation';
import {
  profileInitials,
  profileName,
  commentAuthor,
} from '../src/features/auth/profile';
import {
  parseSession,
  createSession,
  getSession,
  endSession,
  subscribeSession,
  startSession,
  SESSION_KEY,
  SESSION_LIFETIME,
} from '../src/features/auth/session';
import {
  createAuthDialog,
  AuthMode,
} from '../src/components/dialogs/auth-dialog';
import { createProfile } from '../src/components/header/profile';
import {
  login,
  register,
  loginGoogle,
  logoutFirebase,
} from '../src/services/firebase';
import { fill, required, settle } from './setup';
import { profile } from './fixtures';

vi.mock('../src/services/firebase', () => ({
  login: vi.fn(),
  register: vi.fn(),
  loginGoogle: vi.fn(),
  logoutFirebase: vi.fn().mockResolvedValue(undefined),
  authError: () => 'Sign-in failed',
}));

beforeEach(() => {
  endSession();
  vi.mocked(logoutFirebase).mockResolvedValue(undefined);
});

describe('validation and profiles', () => {
  it('validates login without registration strength rules', () => {
    expect(
      validateAuth({ email: 'x@y.com', password: 'abcdef' }, false),
    ).toEqual({});
    expect(validateAuth({}, false)).toHaveProperty('email');
    expect(
      validateAuth({ email: 'wrong', password: '123' }, false),
    ).toHaveProperty('password');
  });
  it.each(['alex', 'A', 'A_foo', 'A'.repeat(31), 'Яна'])(
    'rejects username %s',
    (username) => {
      expect(
        validateAuth(
          {
            username,
            email: 'x@y.com',
            password: 'Cozy1!',
            'confirm-password': 'Cozy1!',
          },
          true,
        ),
      ).toHaveProperty('username');
    },
  );
  it('enforces registration strength and dependent confirmation', () => {
    expect(
      validateAuth(
        {
          username: 'Alex99',
          email: ' x@y.com ',
          password: 'Cozy1!',
          'confirm-password': 'Cozy1!',
        },
        true,
      ),
    ).toEqual({});
    expect(
      validateAuth(
        {
          username: 'Alex',
          email: 'x@y.com',
          password: 'abcdef',
          'confirm-password': 'different',
        },
        true,
      ),
    ).toMatchObject({
      password: expect.any(String),
      'confirm-password': expect.any(String),
    });
  });
  it.each([
    [' Alice Bob Smith ', 'AB'],
    ['!Émile', 'É'],
    [' Иван Петров ', 'ИП'],
    ['123', '1'],
    ['---', '?'],
    ['', '?'],
  ])('calculates Unicode initials for %s', (name, initials) => {
    expect(profileInitials(name)).toBe(initials);
  });
  it('falls back to email and bounds API author names', () => {
    expect(profileName({ displayName: '', email: 'alex@example.com' })).toBe(
      'alex',
    );
    expect(profileName({ displayName: '', email: '' })).toBe('Player');
    expect(commentAuthor({ displayName: 'A', email: '' })).toBe('Player');
    expect(
      commentAuthor({ displayName: 'A'.repeat(40), email: '' }),
    ).toHaveLength(30);
  });
  it('renders untrusted profile names as text and handles broken photos', () => {
    const element = createProfile({
      displayName: '<b>Alex</b>',
      email: profile.email,
      avatarUrl: 'https://example.com/photo.jpg',
    });
    expect(element.querySelector('b')).toBeNull();
    required(element, 'img').dispatchEvent(new Event('error'));
    expect(element.querySelector('img')).toBeNull();
    createSession(profile);
    required<HTMLButtonElement>(element, 'button').click();
    expect(getSession()).toBeNull();
  });
});

describe('fixed app session', () => {
  it('restores exactly the original timestamp and expires once', async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);
    localStorage.setItem('unrelated', 'keep');
    createSession(profile);
    const original = getSession();
    expect(original?.authenticatedAt).toBe(Date.now());
    const stop = startSession();
    await settle(SESSION_LIFETIME - 1);
    expect(getSession()?.authenticatedAt).toBe(original?.authenticatedAt);
    await settle(1);
    expect(getSession()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep');
    expect(listener).toHaveBeenLastCalledWith(null);
    expect(document.body.textContent).toContain('expired');
    unsubscribe();
    stop();
  });
  it.each([
    'broken',
    '{}',
    'null',
    '[]',
    JSON.stringify({ ...profile, authenticatedAt: '123' }),
    JSON.stringify({ ...profile, authenticatedAt: Infinity }),
    JSON.stringify({ ...profile, authenticatedAt: 1, avatarUrl: 7 }),
  ])('rejects malformed storage %s', (raw) => {
    localStorage.setItem(SESSION_KEY, raw);
    const stop = startSession();
    expect(getSession()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(logoutFirebase).toHaveBeenCalled();
    stop();
  });
  it('rejects future and expired timestamps, and checks focus/storage events', () => {
    expect(
      parseSession(
        JSON.stringify({ ...profile, authenticatedAt: Date.now() + 1 }),
        Date.now(),
      ),
    ).toBeNull();
    createSession({ ...profile, avatarUrl: 'https://example.com/me.jpg' });
    const stop = startSession();
    expect(getSession()?.avatarUrl).toContain('me.jpg');
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        ...profile,
        authenticatedAt: Date.now() - SESSION_LIFETIME,
      }),
    );
    window.dispatchEvent(new Event('focus'));
    expect(getSession()).toBeNull();
    window.dispatchEvent(new Event('storage'));
    document.dispatchEvent(new Event('visibilitychange'));
    stop();
  });
  it('keeps Guest Mode if Firebase sign-out fails', async () => {
    createSession(profile);
    vi.mocked(logoutFirebase).mockRejectedValueOnce(new Error('offline'));
    endSession();
    await settle(0);
    expect(getSession()).toBeNull();
    expect(document.body.textContent).toContain('still in Guest Mode');
  });
});

describe('Auth dialog', () => {
  it('clears the old form immediately before animating a mode switch', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    Object.defineProperty(Element.prototype, 'animate', {
      configurable: true,
      value: vi.fn(),
    });
    const dialog = createAuthDialog();
    document.body.append(dialog.element);
    dialog.open(AuthMode.Login);
    fill(dialog.element, 'email', profile.email);
    fill(dialog.element, 'password', 'abcdef');
    expect(
      required<HTMLButtonElement>(dialog.element, '[type=submit]').disabled,
    ).toBe(false);
    dialog.setMode(AuthMode.Register);
    expect(
      required<HTMLInputElement>(dialog.element, '[name=email]').value,
    ).toBe('');
    expect(
      required<HTMLButtonElement>(dialog.element, '[type=submit]').disabled,
    ).toBe(true);
    expect(dialog.element.querySelector('[name=username]')).not.toBeNull();
    dialog.destroy();
  });
  it('validates as users type, resets modes and toggles password visibility', () => {
    const dialog = createAuthDialog();
    document.body.append(dialog.element);
    dialog.open(AuthMode.Register);
    const submit = required<HTMLButtonElement>(dialog.element, '[type=submit]');
    expect(submit.disabled).toBe(true);
    fill(dialog.element, 'username', 'Alex99');
    fill(dialog.element, 'email', 'alex@example.com');
    fill(dialog.element, 'password', 'Cozy1!');
    fill(dialog.element, 'confirm-password', 'Cozy1!');
    expect(submit.disabled).toBe(false);
    fill(dialog.element, 'password', 'Cozy2!');
    expect(
      required(dialog.element, '#auth-error-confirm-password').textContent,
    ).toContain('match');
    required<HTMLButtonElement>(
      dialog.element,
      '.auth-dialog__password-toggle',
    ).click();
    expect(
      required<HTMLInputElement>(dialog.element, '[name=password]').type,
    ).toBe('text');
    required<HTMLButtonElement>(
      dialog.element,
      '.auth-dialog__password-toggle',
    ).click();
    expect(
      required<HTMLInputElement>(dialog.element, '[name=password]').type,
    ).toBe('password');
    dialog.setMode(AuthMode.Login);
    expect(
      required<HTMLInputElement>(dialog.element, '[name=email]').value,
    ).toBe('');
    expect(dialog.element.querySelector('[name=username]')).toBeNull();
    dialog.destroy();
  });
  it('locks all actions and closing until Firebase completes', async () => {
    let resolveLogin: (value: typeof profile) => void = () => {};
    vi.mocked(login).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );
    const dialog = createAuthDialog();
    document.body.append(dialog.element);
    dialog.open(AuthMode.Login);
    fill(dialog.element, 'email', profile.email);
    fill(dialog.element, 'password', 'abcdef');
    required(dialog.element, 'form').dispatchEvent(
      new Event('submit', { cancelable: true }),
    );
    expect(
      [
        ...dialog.element.querySelectorAll<
          HTMLInputElement | HTMLButtonElement
        >('input,button'),
      ].every((item) => item.disabled),
    ).toBe(true);
    dialog.element.dispatchEvent(new Event('cancel', { cancelable: true }));
    dialog.element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    dialog.close();
    dialog.setMode(AuthMode.Register);
    expect(dialog.element.open).toBe(true);
    expect(login).toHaveBeenCalledWith(profile.email, 'abcdef');
    resolveLogin(profile);
    await settle(0);
    expect(dialog.element.open).toBe(false);
    expect(getSession()?.email).toBe(profile.email);
    dialog.destroy();
  });
  it('recovers from errors and registers the submitted display name', async () => {
    vi.mocked(register)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(profile);
    const dialog = createAuthDialog();
    document.body.append(dialog.element);
    dialog.open(AuthMode.Register);
    fill(dialog.element, 'username', 'CozyGamer');
    fill(dialog.element, 'email', profile.email);
    fill(dialog.element, 'password', 'Cozy1!');
    fill(dialog.element, 'confirm-password', 'Cozy1!');
    const form = required(dialog.element, 'form');
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle(0);
    expect(dialog.element.open).toBe(true);
    expect(dialog.element.textContent).toContain('Sign-in failed');
    expect(
      required<HTMLInputElement>(dialog.element, '[name=password]').disabled,
    ).toBe(false);
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await settle(0);
    expect(register).toHaveBeenCalledWith(profile.email, 'Cozy1!', 'CozyGamer');
    expect(getSession()?.displayName).toBe(profile.displayName);
    dialog.destroy();
  });
  it('recovers from Google cancellation, supports retry and guards authenticated opening', async () => {
    vi.mocked(loginGoogle)
      .mockRejectedValueOnce(new Error('cancel'))
      .mockResolvedValueOnce(profile);
    const dialog = createAuthDialog();
    document.body.append(dialog.element);
    dialog.open(AuthMode.Login);
    const google = required<HTMLButtonElement>(
      dialog.element,
      '.auth-dialog__google',
    );
    google.click();
    await settle(0);
    expect(dialog.element.open).toBe(true);
    google.click();
    await settle(0);
    expect(getSession()?.email).toBe(profile.email);
    dialog.open(AuthMode.Register);
    expect(dialog.element.open).toBe(false);
    expect(document.body.textContent).toContain('already signed in');
    dialog.destroy();
  });
  it('changes modes with keyboard and restores focus on backdrop dismissal', async () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    const dialog = createAuthDialog();
    document.body.append(dialog.element);
    dialog.open(AuthMode.Login);
    required(dialog.element, '[role=tablist]').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    expect(dialog.element.textContent).toContain('Create Account');
    required<HTMLButtonElement>(
      dialog.element,
      '.auth-dialog__alternate button',
    ).click();
    required<HTMLButtonElement>(dialog.element, '.auth-dialog__forgot').click();
    expect(dialog.element.textContent).toContain('Password recovery');
    dialog.element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle(350);
    expect(dialog.element.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    dialog.destroy();
  });
});
