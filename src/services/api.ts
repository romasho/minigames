const API_BASE: URL = new URL(
  'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com',
);

export interface GameSummary {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
}
export interface Category {
  slug: string;
  label: string;
  isDefault: boolean;
}
export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameName: string;
}
export interface GameDetails {
  slug: string;
  name: string;
  heroImage: string;
  rating: number;
  likesCount: number;
  fullDescription: string;
  specs: Record<string, string>;
  topRecords: {
    position: number;
    playerName: string;
    score: number;
    achievedAt: string;
  }[];
}
export interface GameComment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  createdAt: string;
}
export interface GamesResult {
  data: GameSummary[];
  meta: { page: number; totalPages: number; totalItems: number };
}
export interface CommentsResult {
  data: GameComment[];
  meta: { totalComments: number };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function hasFields(
  value: unknown,
  strings: string[],
  numbers: string[],
): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    strings.every((key: string): boolean => typeof value[key] === 'string') &&
    numbers.every((key: string): boolean => typeof value[key] === 'number')
  );
}
function parseList<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
): T[] {
  if (
    !isRecord(value) ||
    !Array.isArray(value.data) ||
    !value.data.every(isItem)
  )
    throw new Error('Invalid API response');
  return value.data;
}
function isGame(value: unknown): value is GameSummary {
  return hasFields(
    value,
    ['slug', 'name', 'category', 'price', 'shortDescription', 'cardImage'],
    ['rating', 'likesCount'],
  );
}
function isCategory(value: unknown): value is Category {
  return (
    hasFields(value, ['slug', 'label'], []) &&
    typeof value.isDefault === 'boolean'
  );
}
function isLeader(value: unknown): value is LeaderboardEntry {
  return hasFields(
    value,
    ['playerName', 'favoriteGameName'],
    ['rank', 'gamesPlayed', 'totalScore', 'streakDays'],
  );
}
function isComment(value: unknown): value is GameComment {
  return hasFields(
    value,
    ['commentId', 'authorName', 'text', 'createdAt'],
    ['likesCount'],
  );
}
async function get(path: string, signal?: AbortSignal): Promise<unknown> {
  const response: Response = await fetch(`${API_BASE}${path}`, { signal });
  if (!response.ok)
    throw new Error(`Request failed (${String(response.status)})`);
  return response.json() as Promise<unknown>;
}
export function gameImage(path: string): string {
  return new URL(path, API_BASE).href;
}
export async function getFeaturedGames(
  signal?: AbortSignal,
): Promise<GameSummary[]> {
  return parseList(await get('/api/games?featured=true', signal), isGame);
}
export async function getLeaderboard(
  signal?: AbortSignal,
): Promise<LeaderboardEntry[]> {
  return parseList(await get('/api/leaderboard', signal), isLeader);
}
export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  return parseList(await get('/api/categories', signal), isCategory);
}
export async function getGames(
  category: string,
  sort: string,
  page: number,
  signal?: AbortSignal,
): Promise<GamesResult> {
  const parameters: URLSearchParams = new URLSearchParams({
    category,
    sort,
    page: String(page),
    limit: '6',
  });
  const value: unknown = await get(
    `/api/games?${parameters.toString()}`,
    signal,
  );
  const data: GameSummary[] = parseList(value, isGame);
  if (
    !isRecord(value) ||
    !hasFields(value.meta, [], ['page', 'totalPages', 'totalItems'])
  )
    throw new Error('Invalid games metadata');
  const meta: Record<string, unknown> = value.meta;
  return {
    data,
    meta: {
      page: Number(meta.page),
      totalPages: Number(meta.totalPages),
      totalItems: Number(meta.totalItems),
    },
  };
}
export async function getGameDetails(
  slug: string,
  signal?: AbortSignal,
): Promise<GameDetails> {
  const value: unknown = await get(
    `/api/games/${encodeURIComponent(slug)}`,
    signal,
  );
  if (
    !isRecord(value) ||
    !hasFields(
      value.data,
      ['slug', 'name', 'heroImage', 'fullDescription'],
      ['rating', 'likesCount'],
    ) ||
    !isRecord(value.data.specs) ||
    !Array.isArray(value.data.topRecords)
  )
    throw new Error('Invalid game details');
  const details: Record<string, unknown> = value.data;
  const rawSpecs: Record<string, unknown> = value.data.specs;
  const rawRecords: unknown[] = value.data.topRecords;
  const specs: Record<string, string> = {};
  for (const [key, item] of Object.entries(rawSpecs))
    if (typeof item === 'string') specs[key] = item;
  const records: GameDetails['topRecords'] = rawRecords.filter(
    (item: unknown): item is GameDetails['topRecords'][number] =>
      hasFields(item, ['playerName', 'achievedAt'], ['position', 'score']),
  );
  return {
    slug: String(details.slug),
    name: String(details.name),
    heroImage: String(details.heroImage),
    fullDescription: String(details.fullDescription),
    rating: Number(details.rating),
    likesCount: Number(details.likesCount),
    specs,
    topRecords: records,
  };
}
export async function getComments(
  slug: string,
  signal?: AbortSignal,
): Promise<CommentsResult> {
  const value: unknown = await get(
    `/api/games/${encodeURIComponent(slug)}/comments?limit=3&sort=newest`,
    signal,
  );
  const data: GameComment[] = parseList(value, isComment);
  if (!isRecord(value) || !hasFields(value.meta, [], ['totalComments']))
    throw new Error('Invalid comments metadata');
  return { data, meta: { totalComments: Number(value.meta.totalComments) } };
}
