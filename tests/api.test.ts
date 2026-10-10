import {
  firebaseMock,
  resetFirebaseMock,
  setFirebaseIdentity,
} from './firebase-mock';
import { it, expect, vi, beforeEach } from 'vitest';
import * as api from '../src/services/api';
import {
  createSession,
  endSession,
  SESSION_KEY,
  SESSION_LIFETIME,
} from '../src/features/auth/session';
import {
  summary,
  details,
  comment,
  profile,
  response,
  publicResponse,
} from './fixtures';

vi.mock('../src/services/firebase', async () => {
  const { firebaseMock } = await import('./firebase-mock');
  return firebaseMock;
});
beforeEach(() => {
  resetFirebaseMock();
  endSession();
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => Promise.resolve(publicResponse(url))),
  );
});

it('constructs server filtering, sort, pagination and personalized queries', async () => {
  expect((await api.getFeaturedGames()).length).toBe(5);
  expect((await api.getCategories())[0]?.slug).toBe('all');
  expect((await api.getLeaderboard())[0]?.rank).toBe(1);
  const games = await api.getGames('a & b', 'name-asc', 3);
  expect(games.data).toEqual([summary]);
  expect(games.meta.totalItems).toBe(48);
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('category=a+%26+b&sort=name-asc&page=3&limit=6'),
    expect.any(Object),
  );
  expect(
    (await api.getGameDetails('tiny/glade', undefined, profile.email)).specs,
  ).toEqual(details.specs);
  expect(fetch).toHaveBeenLastCalledWith(
    expect.stringContaining('tiny%2Fglade?userEmail=cozy%2B1%40example.com'),
    expect.any(Object),
  );
  expect(
    (await api.getComments('tiny-glade', undefined, profile.email)).meta
      .totalComments,
  ).toBe(12);
  expect(fetch).toHaveBeenLastCalledWith(
    expect.stringContaining(
      'limit=3&sort=newest&userEmail=cozy%2B1%40example.com',
    ),
    expect.any(Object),
  );
});

it('reports HTTP errors and malformed response structures', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(response({}, 404));
  await expect(api.getGameDetails('missing')).rejects.toMatchObject({
    status: 404,
  });
  for (const load of [
    api.getFeaturedGames,
    api.getLeaderboard,
    api.getCategories,
  ]) {
    vi.mocked(fetch).mockResolvedValueOnce(response({ data: [{}] }));
    await expect(load()).rejects.toThrow('Invalid API response');
  }
  vi.mocked(fetch).mockResolvedValueOnce(response({ data: [summary] }));
  await expect(api.getGames('all', 'name-asc', 1)).rejects.toThrow('metadata');
  vi.mocked(fetch).mockResolvedValueOnce(response({ data: [comment] }));
  await expect(api.getComments('slug')).rejects.toThrow('metadata');
  vi.mocked(fetch).mockResolvedValueOnce(
    response({ data: { ...details, specs: null } }),
  );
  await expect(api.getGameDetails('slug')).rejects.toThrow(
    'Invalid game details',
  );
});

it('validates nested details and resolves bundled or remote images', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(
    response({
      data: {
        ...details,
        specs: { valid: 'text', invalid: 42 },
        topRecords: [...details.topRecords, { score: 2 }],
      },
    }),
  );
  const game = await api.getGameDetails('slug');
  expect(game.specs).toEqual({ valid: 'text' });
  expect(game.topRecords).toHaveLength(1);
  expect(api.gameImage('/images/tiny-glade-card.jpg')).toContain(
    'tiny-glade-card.jpg',
  );
  expect(api.gameImage('/missing.png')).toBe(
    'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/missing.png',
  );
});

it('never sends protected requests in Guest Mode or after expiration', async () => {
  await expect(api.toggleFavorite('slug')).rejects.toBeInstanceOf(
    api.SessionRequiredError,
  );
  await expect(api.toggleCommentLike('id')).rejects.toBeInstanceOf(
    api.SessionRequiredError,
  );
  await expect(api.submitComment('slug', 'hi')).rejects.toBeInstanceOf(
    api.SessionRequiredError,
  );
  setFirebaseIdentity(profile);
  createSession(profile);
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      ...profile,
      authenticatedAt: Date.now() - SESSION_LIFETIME,
    }),
  );
  await expect(api.toggleFavorite('slug')).rejects.toBeInstanceOf(
    api.SessionRequiredError,
  );
  expect(fetch).not.toHaveBeenCalled();
});

it('rechecks the provider identity before every protected operation', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  firebaseMock.hasValidFirebaseIdentity.mockResolvedValue(false);
  for (const operation of [
    () => api.toggleFavorite('slug'),
    () => api.toggleCommentLike('comment'),
    () => api.submitComment('slug', 'Hello'),
  ]) {
    await expect(operation()).rejects.toBeInstanceOf(api.SessionRequiredError);
  }
  expect(fetch).not.toHaveBeenCalled();
  expect(firebaseMock.hasValidFirebaseIdentity).toHaveBeenCalledTimes(3);
});

it.each(['logout', 'account-change', 'expiration', 'timestamp-change'])(
  'does not POST after %s during an identity check',
  async (change) => {
    setFirebaseIdentity(profile);
    createSession(profile);
    let confirmIdentity: (valid: boolean) => void = () => {};
    firebaseMock.hasValidFirebaseIdentity.mockImplementationOnce(
      () =>
        new Promise<boolean>((resolve) => {
          confirmIdentity = resolve;
        }),
    );
    const mutation = api.toggleFavorite('slug');
    if (change === 'logout') endSession();
    if (change === 'account-change')
      setFirebaseIdentity({ ...profile, email: 'other@example.com' });
    if (change === 'expiration')
      vi.setSystemTime(Date.now() + SESSION_LIFETIME);
    if (change === 'timestamp-change')
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ...profile, authenticatedAt: Date.now() - 1 }),
      );
    confirmIdentity(true);
    await expect(mutation).rejects.toBeInstanceOf(api.SessionRequiredError);
    expect(fetch).not.toHaveBeenCalled();
  },
);

it('blocks a mutation when Firebase cannot validate its token', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  firebaseMock.hasValidFirebaseIdentity.mockRejectedValueOnce(
    new Error('Token expired'),
  );
  await expect(api.toggleFavorite('slug')).rejects.toThrow('Token expired');
  expect(fetch).not.toHaveBeenCalled();
});

it('checks guest mode at fetch time even if logout is queued after identity validation', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  const check = Promise.resolve(true);
  firebaseMock.hasValidFirebaseIdentity.mockReturnValueOnce(check);
  const mutation = api.toggleFavorite('slug');
  // This callback runs after the token continuation, before the POST continuation.
  void check.then(() => endSession());
  await expect(mutation).rejects.toBeInstanceOf(api.SessionRequiredError);
  expect(fetch).not.toHaveBeenCalled();
});

it('uses session identity and returns server-confirmed toggle values', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  vi.mocked(fetch).mockResolvedValueOnce(
    response({ data: { isFavorited: true, likesCount: 41 } }),
  );
  expect(await api.toggleFavorite('tiny/glade')).toEqual({
    isFavorited: true,
    likesCount: 41,
  });
  expect(fetch).toHaveBeenLastCalledWith(
    expect.stringContaining('/tiny%2Fglade/favorite'),
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ userEmail: profile.email }),
    }),
  );
  vi.mocked(fetch).mockResolvedValueOnce(
    response({ data: { isLikedByCurrentUser: false, likesCount: 3 } }),
  );
  expect(await api.toggleCommentLike('a/b')).toEqual({
    isLikedByCurrentUser: false,
    likesCount: 3,
  });
  expect(fetch).toHaveBeenLastCalledWith(
    expect.stringContaining('/comments/a%2Fb/like'),
    expect.objectContaining({ method: 'POST' }),
  );
});

it('validates and trims comments and uses bounded profile display names', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  await expect(api.submitComment('slug', '  ')).rejects.toThrow('1–500');
  await expect(api.submitComment('slug', 'x'.repeat(501))).rejects.toThrow(
    '1–500',
  );
  expect(fetch).not.toHaveBeenCalled();
  vi.mocked(fetch).mockResolvedValueOnce(response({ data: comment }, 201));
  expect(await api.submitComment('slug', '  Nice game!  ')).toEqual(comment);
  expect(fetch).toHaveBeenLastCalledWith(
    expect.stringContaining('/games/slug/comments'),
    expect.objectContaining({
      body: JSON.stringify({
        userEmail: profile.email,
        authorName: profile.displayName,
        text: 'Nice game!',
      }),
    }),
  );
});

it('does not retry ambiguous requests and rejects malformed mutation replies', async () => {
  setFirebaseIdentity(profile);
  createSession(profile);
  vi.mocked(fetch).mockRejectedValueOnce(new TypeError('offline'));
  await expect(api.toggleFavorite('slug')).rejects.toThrow('offline');
  expect(fetch).toHaveBeenCalledTimes(1);
  for (const mutation of [
    () => api.toggleFavorite('slug'),
    () => api.toggleCommentLike('id'),
    () => api.submitComment('slug', 'hi'),
  ]) {
    vi.mocked(fetch).mockResolvedValueOnce(
      response({ data: { likesCount: 'invalid' } }),
    );
    await expect(mutation()).rejects.toThrow('Invalid');
  }
  vi.mocked(fetch).mockResolvedValueOnce(response({}, 400));
  await expect(api.submitComment('slug', 'hi')).rejects.toMatchObject({
    status: 400,
  });
  vi.mocked(fetch).mockResolvedValueOnce(response({}));
  await expect(api.toggleFavorite('slug')).rejects.toThrow('Invalid mutation');
});
