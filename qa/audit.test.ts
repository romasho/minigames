import { it, expect, vi, beforeEach } from 'vitest';
import { startApp } from '../src/app';
import {
  SESSION_KEY,
  startSession,
  getSession,
  endSession,
} from '../src/features/auth/session';
import { validateAuth } from '../src/features/auth/validation';
import { toggleFavorite } from '../src/services/api';
import { profile, publicResponse } from '../tests/fixtures';
import { settle, required } from '../tests/setup';
import { resetFirebaseMock, setFirebaseIdentity } from '../tests/firebase-mock';

vi.mock('../src/services/firebase', async () => {
  const { firebaseMock } = await import('../tests/firebase-mock');
  return firebaseMock;
});
beforeEach(() => {
  resetFirebaseMock();
  endSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options) =>
      options?.method === 'POST'
        ? {
            ok: true,
            json: async () => ({ data: { isFavorited: true, likesCount: 1 } }),
          }
        : publicResponse(String(url)),
    ),
  );
});

it('QA: a locally fabricated profile must not establish authenticated identity', () => {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...profile, authenticatedAt: Date.now() }),
  );
  const stop = startSession();
  const session = getSession();
  stop();
  expect(session).toBeNull();
});

it('QA: a protected mutation must not accept only fabricated local profile data', async () => {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...profile, authenticatedAt: Date.now() }),
  );
  await expect(toggleFavorite('tiny-glade')).rejects.toThrow();
  expect(
    vi
      .mocked(fetch)
      .mock.calls.some(([, options]) => options?.method === 'POST'),
  ).toBe(false);
});

it('QA: signing in in another tab must close an already open Auth dialog and remove auth URL', async () => {
  history.replaceState(
    null,
    '',
    '/?auth=login&game=tiny-glade&category=cozy#details',
  );
  startApp();
  await settle();
  expect(required<HTMLDialogElement>(document, '.auth-dialog').open).toBe(true);
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...profile, authenticatedAt: Date.now() }),
  );
  window.dispatchEvent(new Event('storage'));
  // The app storage event can arrive before Firebase's identity notification.
  expect(document.querySelector('.app-header__profile')).toBeNull();
  setFirebaseIdentity(profile);
  await settle();
  expect(document.querySelector('.app-header__profile')).not.toBeNull();
  expect(required<HTMLDialogElement>(document, '.auth-dialog').open).toBe(
    false,
  );
  expect(location.search).not.toContain('auth=');
  expect(location.search).toContain('game=tiny-glade');
  expect(location.search).toContain('category=cozy');
  expect(location.hash).toBe('#details');
  expect(required<HTMLDialogElement>(document, '.game-details').open).toBe(
    true,
  );
});

it('QA: real-time email validation must reject consecutive domain dots', () => {
  expect(
    validateAuth({ email: 'qa@example..com', password: 'Audit7!' }, false),
  ).toHaveProperty('email');
});
