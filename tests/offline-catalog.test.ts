import { afterEach, expect, it, vi } from 'vitest';
import { SEED_GAMES, getCardImage } from '../src/data/games';
import { getCategories, getFeaturedGames, getGames } from '../src/services/api';
import { publicResponse } from './fixtures';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('filters and sorts the offline catalog before taking six games per page', async () => {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);

  expect(await getCategories()).toContainEqual({
    slug: 'puzzle',
    label: 'Puzzle',
    isDefault: false,
  });
  const expected = SEED_GAMES.filter((game) => game.category === 'puzzle').sort(
    (first, second) => second.name.localeCompare(first.name, 'en'),
  );
  const first = await getGames('puzzle', 'name-desc', 1);
  const second = await getGames('puzzle', 'name-desc', 2);
  expect(first.data).toEqual(expected.slice(0, 6));
  expect(second.data).toEqual(expected.slice(6));
  expect(second.meta).toEqual({ page: 2, totalPages: 2, totalItems: 9 });
  expect((await getGames('puzzle', 'name-desc', 3)).data).toEqual([]);
  expect((await getGames('all', 'rating-desc', 1)).meta.totalItems).toBe(24);
  const ascending = await getGames('all', 'rating-asc', 1);
  expect(ascending.data.map((game) => game.rating)).toEqual(
    SEED_GAMES.map((game) => game.rating)
      .sort((first, second) => first - second)
      .slice(0, 6),
  );
  expect(fetch).not.toHaveBeenCalled();
});

it('uses local featured games offline and returns to the API when online', async () => {
  const connection = vi
    .spyOn(navigator, 'onLine', 'get')
    .mockReturnValue(false);
  const fetch = vi.fn(async (url: string) => publicResponse(url));
  vi.stubGlobal('fetch', fetch);

  expect(await getFeaturedGames()).toEqual(
    SEED_GAMES.filter((game) => game.featured),
  );
  for (const game of SEED_GAMES) expect(getCardImage(game)).toContain('-card');
  expect(fetch).not.toHaveBeenCalled();

  connection.mockReturnValue(true);
  expect((await getGames('all', 'rating-desc', 1)).meta.totalItems).toBe(48);
  expect(fetch).toHaveBeenCalledOnce();
});
