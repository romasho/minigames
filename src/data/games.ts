import seed from './all-games-seed.json';

export interface SeedGame {
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly price: string;
  readonly shortDescription: string;
  readonly rating: number;
  readonly likesCount: number;
  readonly cardImage: string;
  readonly featured: boolean;
}

const cardImages: Record<string, string> = import.meta.glob(
  '../assets/games/*-card.jpg',
  { eager: true, query: '?url', import: 'default' },
);

export const SEED_GAMES: readonly SeedGame[] = seed.data;

export function getGame(slug: string): SeedGame {
  const game: SeedGame | undefined = SEED_GAMES.find(
    (candidate: SeedGame): boolean => candidate.slug === slug,
  );
  if (!game) throw new Error(`Unknown game: ${slug}`);
  return game;
}

export function getCardImage(game: SeedGame): string {
  const filename: string | undefined = game.cardImage.split('/').at(-1);
  if (!filename) throw new Error(`Missing card filename for ${game.slug}`);
  const image: string | undefined = cardImages[`../assets/games/${filename}`];
  if (!image) throw new Error(`Missing card artwork for ${game.slug}`);
  return image;
}

export function formatLikes(count: number): string {
  return count < 1000
    ? String(count)
    : `${(Math.floor(count / 100) / 10).toFixed(1)}K`;
}
