import type { Category, GamesResult } from '../services/api';
import { SEED_GAMES, type SeedGame } from './games';

const categories: string[] = [
  ...new Set(SEED_GAMES.map((game: SeedGame): string => game.category)),
];

export function offlineCategories(): Category[] {
  return [
    { slug: 'all', label: 'All Games', isDefault: true },
    ...categories.map((slug: string): Category => ({
      slug,
      label: slug.charAt(0).toUpperCase() + slug.slice(1),
      isDefault: false,
    })),
  ];
}

export function offlineFeaturedGames(): GamesResult['data'] {
  return SEED_GAMES.filter((game: SeedGame): boolean => game.featured);
}

export function offlineGames(
  category: string,
  sort: string,
  page: number,
  limit: number,
): GamesResult {
  const games: SeedGame[] = SEED_GAMES.filter(
    (game: SeedGame): boolean =>
      category === 'all' || game.category === category,
  );
  games.sort((first: SeedGame, second: SeedGame): number => {
    const byName: number = first.name.localeCompare(second.name, 'en');
    switch (sort) {
      case 'name-asc': {
        return byName;
      }
      case 'name-desc': {
        return -byName;
      }
      case 'rating-asc': {
        return first.rating - second.rating || byName;
      }
      default: {
        return second.rating - first.rating || byName;
      }
    }
  });
  const start: number = (page - 1) * limit;
  return {
    data: games.slice(start, start + limit),
    meta: {
      page,
      totalPages: Math.ceil(games.length / limit),
      totalItems: games.length,
    },
  };
}
