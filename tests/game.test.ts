import { resetFirebaseMock, setFirebaseIdentity } from './firebase-mock';
import { it, expect, vi, beforeEach } from 'vitest';
import {
  createGameDetailsDialog,
  relativeTime,
} from '../src/components/dialogs/game-details-dialog';
import { createSession, endSession } from '../src/features/auth/session';
import { profile, comment, publicResponse, response } from './fixtures';
import { required, settle } from './setup';

vi.mock('../src/services/firebase', async () => {
  const { firebaseMock } = await import('./firebase-mock');
  return firebaseMock;
});
beforeEach(() => {
  resetFirebaseMock();
  endSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => publicResponse(url)),
  );
});
async function open() {
  const game = createGameDetailsDialog();
  document.body.append(game.element);
  game.open('tiny-glade');
  await settle(1000);
  return game;
}
it('renders safe text, full counts, stable commenter initials and guest composer', async () => {
  const game = await open();
  expect(game.element.textContent).toContain('Comments (12)');
  expect(game.element.textContent).toContain(comment.text);
  expect(game.element.querySelector('[onerror]')).toBeNull();
  const avatar = required(
    game.element,
    '.game-details__comment .game-details__avatar',
  );
  const color = avatar.className;
  expect(avatar.textContent).toBe('A');
  expect(required<HTMLTextAreaElement>(game.element, 'textarea').disabled).toBe(
    true,
  );
  game.refresh();
  await settle(1000);
  expect(
    required(game.element, '.game-details__comment .game-details__avatar')
      .className,
  ).toBe(color);
  game.close();
  await settle(0);
});
it('guests request Auth for favorites and comment likes without a POST', async () => {
  const game = await open();
  const request = vi.fn();
  game.element.addEventListener('request-auth', request);
  required<HTMLButtonElement>(game.element, '.game-details__favorite').click();
  required<HTMLButtonElement>(
    game.element,
    '.game-details__comment-like',
  ).click();
  expect(request).toHaveBeenCalledTimes(2);
  expect(
    vi
      .mocked(fetch)
      .mock.calls.every(([, options]) => options?.method !== 'POST'),
  ).toBe(true);
  expect(document.body.textContent).toContain('Please sign in');
  game.close();
});
it('locks duplicate favorites, initializes personalized state and applies only server counts', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  let resolvePost: (value: Response) => void = () => {};
  vi.mocked(fetch).mockImplementation(async (url, options) =>
    options?.method === 'POST'
      ? new Promise((resolve) => {
          resolvePost = resolve;
        })
      : publicResponse(String(url)),
  );
  const game = await open();
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('userEmail=cozy%2B1%40example.com'),
    expect.any(Object),
  );
  const favorite = required<HTMLButtonElement>(
    game.element,
    '.game-details__favorite',
  );
  expect(favorite.getAttribute('aria-pressed')).toBe('false');
  favorite.click();
  favorite.click();
  await settle(0);
  expect(favorite.disabled).toBe(true);
  expect(favorite.getAttribute('aria-busy')).toBe('true');
  expect(
    vi
      .mocked(fetch)
      .mock.calls.filter(([, options]) => options?.method === 'POST'),
  ).toHaveLength(1);
  resolvePost(response({ data: { isFavorited: true, likesCount: 65 } }));
  await settle(0);
  expect(favorite.disabled).toBe(false);
  expect(favorite.getAttribute('aria-pressed')).toBe('true');
  expect(
    required(game.element, '.game-details__likes').getAttribute('aria-label'),
  ).toBe('65 likes');
  game.close();
});
it('submits trimmed comments on Enter, clears on success and refreshes the full count', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  let posts = 0;
  vi.mocked(fetch).mockImplementation(async (url, options) => {
    if (options?.method === 'POST') {
      posts++;
      return response({ data: comment }, 201);
    }
    if (String(url).includes('/comments'))
      return response({
        data: [comment],
        meta: { totalComments: posts ? 13 : 12 },
      });
    return publicResponse(String(url));
  });
  const game = await open();
  const input = required<HTMLTextAreaElement>(game.element, 'textarea');
  input.value = '   Good game   ';
  input.dispatchEvent(new Event('input'));
  input.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: true,
      cancelable: true,
    }),
  );
  expect(posts).toBe(0);
  input.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }),
  );
  expect(input.disabled).toBe(true);
  await settle(1000);
  expect(posts).toBe(1);
  expect(required<HTMLTextAreaElement>(game.element, 'textarea').value).toBe(
    '',
  );
  expect(game.element.textContent).toContain('Comments (13)');
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('/comments'),
    expect.objectContaining({
      body: JSON.stringify({
        userEmail: profile.email,
        authorName: profile.displayName,
        text: 'Good game',
      }),
    }),
  );
  game.close();
});
it('keeps draft and unlocks on rejection, reports unknown outcomes without replay', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  const game = await open();
  const input = required<HTMLTextAreaElement>(game.element, 'textarea');
  input.value = 'Keep my draft';
  input.dispatchEvent(new Event('input'));
  vi.mocked(fetch).mockResolvedValueOnce(response({}, 400));
  required<HTMLButtonElement>(game.element, '.game-details__send').click();
  await settle(0);
  expect(input.value).toBe('Keep my draft');
  expect(input.disabled).toBe(false);
  expect(game.element.textContent).toContain('rejected');
  vi.mocked(fetch).mockRejectedValueOnce(new TypeError('connection lost'));
  required<HTMLButtonElement>(game.element, '.game-details__send').click();
  await settle(0);
  expect(game.element.textContent).toContain('result is unknown');
  expect(input.value).toBe('Keep my draft');
  expect(
    vi
      .mocked(fetch)
      .mock.calls.filter(([, options]) => options?.method === 'POST'),
  ).toHaveLength(2);
  game.close();
});
it('updates likes using server state and ignores a response after logout', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  const game = await open();
  const like = required<HTMLButtonElement>(
    game.element,
    '.game-details__comment-like',
  );
  vi.mocked(fetch).mockResolvedValueOnce(
    response({ data: { isLikedByCurrentUser: true, likesCount: 99 } }),
  );
  like.click();
  await settle(0);
  expect(like.getAttribute('aria-pressed')).toBe('true');
  expect(like.textContent).toBe('99');
  let resolvePost: (value: Response) => void = () => {};
  vi.mocked(fetch).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolvePost = resolve;
      }),
  );
  like.click();
  endSession();
  resolvePost(
    response({ data: { isLikedByCurrentUser: false, likesCount: 98 } }),
  );
  await settle(0);
  expect(like.textContent).toBe('99');
  game.close();
});
it('recovers failed game and comment reads through Retry and preserves suspended details', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(response({}, 500));
  const game = await open();
  expect(game.element.textContent).toContain('Could not load game details');
  required<HTMLButtonElement>(game.element, '.api-error button').click();
  await settle(1000);
  expect(game.element.textContent).toContain('Tiny Glade');
  game.suspend();
  await settle(0);
  expect(game.element.open).toBe(false);
  const calls = vi.mocked(fetch).mock.calls.length;
  game.open('tiny-glade');
  expect(game.element.open).toBe(true);
  expect(fetch).toHaveBeenCalledTimes(calls);
  game.close();
  await settle(0);
  vi.mocked(fetch).mockResolvedValueOnce(response({}, 404));
  game.open('missing');
  await settle(1000);
  expect(game.element.textContent).toContain('Game Not Found');
  game.close();
});
it.each([
  [0, 'just now'],
  [60_000, '1 min ago'],
  [3_600_000, '1 hour ago'],
  [7_200_000, '2 hours ago'],
  [86_400_000, '1 day ago'],
  [7 * 86_400_000, '1 week ago'],
  [30 * 86_400_000, '1 month ago'],
  [365 * 86_400_000, '1 year ago'],
])('formats elapsed %i', (elapsed, label) => {
  const now = Date.UTC(2026, 9, 8);
  expect(relativeTime(new Date(now - elapsed).toISOString(), now)).toBe(label);
  expect(relativeTime('invalid', now)).toBe('just now');
});
