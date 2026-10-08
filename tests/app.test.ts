import { it, expect, vi, beforeEach } from 'vitest';
import { startApp } from '../src/app';
import {
  createSession,
  endSession,
  getSession,
  SESSION_KEY,
  SESSION_LIFETIME,
} from '../src/features/auth/session';
import { login, logoutFirebase } from '../src/services/firebase';
import { publicResponse, profile } from './fixtures';
import { required, fill, settle, setMedia } from './setup';

vi.mock('../src/services/firebase', () => ({
  logoutFirebase: vi.fn().mockResolvedValue(undefined),
  login: vi.fn(),
  register: vi.fn(),
  loginGoogle: vi.fn(),
  authError: () => 'Sign-in failed',
}));
beforeEach(() => {
  endSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => publicResponse(url)),
  );
});

it('navigates pages and restores shareable game/auth URLs without stacking dialogs', async () => {
  startApp();
  await settle();
  expect(document.querySelector('.home-page')).not.toBeNull();
  expect(document.querySelector('footer')).not.toBeNull();
  required<HTMLAnchorElement>(
    document,
    '.app-header__navigation a[href$="/library"]',
  ).click();
  await settle();
  expect(location.pathname).toBe('/library');
  expect(document.querySelector('.library-page')).not.toBeNull();
  required<HTMLButtonElement>(document, '.library-card button').click();
  await settle(1000);
  expect(location.search).toContain('game=tiny-glade');
  expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
  required<HTMLButtonElement>(document, '.game-details__favorite').click();
  await settle(0);
  expect(location.search).toContain('auth=login');
  expect(location.search).toContain('game=tiny-glade');
  expect(document.querySelectorAll('dialog[open]')).toHaveLength(1);
  expect(required<HTMLDialogElement>(document, '.auth-dialog').open).toBe(true);
  required(document, '.auth-dialog').dispatchEvent(
    new Event('cancel', { cancelable: true }),
  );
  await settle(350);
  expect(location.search).not.toContain('auth=');
  expect(required<HTMLDialogElement>(document, '.game-details').open).toBe(
    true,
  );
  required<HTMLButtonElement>(document, '.game-details__close').click();
  await settle(0);
  expect(location.search).not.toContain('game=');
  history.replaceState(null, '', '/?auth=register#top');
  window.dispatchEvent(new Event('popstate'));
  await settle(0);
  expect(required<HTMLDialogElement>(document, '.auth-dialog').open).toBe(true);
  required<HTMLButtonElement>(document, '#auth-dialog-login-tab').click();
  expect(location.search).toContain('auth=login');
  history.replaceState(null, '', '/');
  window.dispatchEvent(new Event('popstate'));
  await settle(0);
  expect(document.querySelectorAll('dialog[open]')).toHaveLength(0);
});
it('guards direct Auth URLs, preserves other URL state and renders profile everywhere', async () => {
  createSession({
    ...profile,
    displayName: 'Émile 王',
    avatarUrl: 'https://example.com/me.jpg',
  });
  history.replaceState(
    null,
    '',
    '/library?category=cozy&auth=register&game=tiny-glade#details',
  );
  const replace = vi.spyOn(history, 'replaceState');
  const push = vi.spyOn(history, 'pushState');
  startApp();
  await settle(1000);
  expect(location.search).not.toContain('auth=');
  expect(location.search).toContain('category=cozy');
  expect(location.hash).toBe('#details');
  expect(push).not.toHaveBeenCalled();
  expect(replace).toHaveBeenCalled();
  expect(document.querySelectorAll('.app-header__profile')).toHaveLength(3);
  expect(document.body.textContent).toContain('Émile 王');
  expect(document.querySelectorAll('.app-header__avatar')).toHaveLength(3);
  required<HTMLButtonElement>(document, '.app-header__profile button').click();
  await settle(1000);
  expect(getSession()).toBeNull();
  expect(logoutFirebase).toHaveBeenCalled();
  expect(document.querySelector('.app-header__profile')).toBeNull();
  expect(required<HTMLDialogElement>(document, '.game-details').open).toBe(
    true,
  );
  expect(
    required<HTMLTextAreaElement>(document, '.game-details textarea').disabled,
  ).toBe(true);
});
it('returns to authenticated Game Details after login without replaying the blocked action', async () => {
  vi.mocked(login).mockResolvedValue(profile);
  history.replaceState(null, '', '/?game=tiny-glade');
  startApp();
  await settle(1000);
  required<HTMLButtonElement>(document, '.game-details__favorite').click();
  await settle(0);
  const dialog = required(document, '.auth-dialog');
  fill(dialog, 'email', profile.email);
  fill(dialog, 'password', 'abcdef');
  required<HTMLButtonElement>(dialog, '[type=submit]').click();
  await settle(1000);
  expect(getSession()?.email).toBe(profile.email);
  expect(location.search).not.toContain('auth=');
  expect(location.search).toContain('game=tiny-glade');
  expect(required<HTMLDialogElement>(document, '.game-details').open).toBe(
    true,
  );
  expect(
    vi
      .mocked(fetch)
      .mock.calls.filter(([, options]) => options?.method === 'POST'),
  ).toHaveLength(0);
});
it('checks edited expiration before protected actions and public navigation', async () => {
  createSession(profile);
  history.replaceState(null, '', '/?game=tiny-glade');
  startApp();
  await settle(1000);
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      ...profile,
      authenticatedAt: Date.now() - SESSION_LIFETIME,
    }),
  );
  required<HTMLButtonElement>(document, '.game-details__favorite').click();
  await settle(1000);
  expect(getSession()).toBeNull();
  expect(location.search).toContain('auth=login');
  expect(location.search).toContain('game=tiny-glade');
  expect(
    vi
      .mocked(fetch)
      .mock.calls.filter(([, options]) => options?.method === 'POST'),
  ).toHaveLength(0);
  required(document, '.auth-dialog').dispatchEvent(
    new Event('cancel', { cancelable: true }),
  );
  await settle(350);
  required<HTMLAnchorElement>(
    document,
    '.app-header__navigation a[href$="/library"]',
  ).click();
  await settle();
  expect(document.querySelector('.library-page')).not.toBeNull();
});
it('supports mobile navigation, escape and desktop media cleanup', async () => {
  startApp();
  await settle();
  const menu = required<HTMLButtonElement>(
    document,
    '.app-header__menu-toggle',
  );
  menu.click();
  expect(menu.getAttribute('aria-expanded')).toBe('true');
  expect(document.body.classList.contains('is-overlay-open')).toBe(true);
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(menu.getAttribute('aria-expanded')).toBe('false');
  menu.click();
  setMedia('(width > 48rem)', true);
  expect(menu.getAttribute('aria-expanded')).toBe('false');
  required<HTMLButtonElement>(
    document,
    '.mobile-navigation__actions button',
  ).click();
  expect(location.search).toContain('auth=login');
  required(document, '.auth-dialog').dispatchEvent(
    new Event('cancel', { cancelable: true }),
  );
  await settle(350);
  required<HTMLButtonElement>(document, '.app-header__tablet-sign-up').click();
  expect(location.search).toContain('auth=register');
});

it('does not create an extra history entry when an authenticated UI action requests Auth', async () => {
  createSession(profile);
  startApp();
  await settle();
  const push = vi.spyOn(history, 'pushState');
  required(document, '#app').dispatchEvent(
    new CustomEvent('request-auth', {
      bubbles: true,
      detail: { mode: 'login' },
    }),
  );
  expect(push).not.toHaveBeenCalled();
  expect(document.querySelector('dialog[open]')).toBeNull();
  expect(document.body.textContent).toContain('already signed in');
});

it('recovers GitHub Pages deep links during bootstrap', async () => {
  sessionStorage.setItem('minigames-deep-link', '/library?category=cozy');
  await import('../src/main');
  await settle();
  expect(location.pathname).toBe('/library');
  expect(location.search).toBe('?category=cozy');
  expect(sessionStorage.getItem('minigames-deep-link')).toBeNull();
  expect(document.querySelector('.library-page')).not.toBeNull();
});
