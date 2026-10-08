export const summary = {
  slug: 'tiny-glade', name: 'Tiny Glade', category: 'cozy', price: 'Free',
  shortDescription: 'Build a castle', rating: 4.5, likesCount: 1200,
  cardImage: '/images/tiny-glade-card.jpg',
};
export const details = {
  ...summary, heroImage: '/images/tiny-glade-hero.jpg', fullDescription: 'Make a home',
  specs: { genre: 'Building', platform: 'Web' }, isLikedByCurrentUser: false,
  topRecords: [{ position: 1, playerName: 'Alex', score: 1234, achievedAt: '2026-10-01T10:00:00Z' }],
};
export const comment = {
  commentId: 'comment-1', authorName: ' Alice ', text: '<img src=x onerror=alert(1)>',
  likesCount: 2, createdAt: '2026-10-08T10:00:00Z', isLikedByCurrentUser: false,
};
export const profile = { displayName: 'CozyGamer', email: 'cozy+1@example.com' };
export function response(value: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => value } as Response;
}
export function publicResponse(url: string): Response {
  if (url.includes('/comments')) return response({ data: [comment], meta: { totalComments: 12 } });
  if (url.includes('/categories')) return response({ data: [
    { slug: 'all', label: 'All Games', isDefault: true }, { slug: 'cozy', label: 'Cozy', isDefault: false },
  ] });
  if (url.includes('/leaderboard')) return response({ data: [{ rank: 1, playerName: 'Alex', gamesPlayed: 12, totalScore: 123456, streakDays: 3, favoriteGameName: 'Tiny Glade' }] });
  if (url.includes('/games?featured')) return response({ data: Array.from({ length: 5 }, (_, index) => ({ ...summary, slug: `game-${index}`, name: `Game ${index}` })) });
  if (/\/games\?/.test(url)) return response({ data: [summary], meta: { page: Number(new URL(url).searchParams.get('page')) || 1, totalPages: 8, totalItems: 48 } });
  return response({ data: details });
}
