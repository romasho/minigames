import {
  formatLikes,
  getCardImage,
  getGame,
  type SeedGame,
} from '../../data/games';

export interface GameCard {
  readonly imageUrl: string;
  readonly title: string;
  readonly likes: string;
  readonly rating: string;
  readonly featured?: boolean;
}

export interface LeaderboardPlayer {
  readonly rank: number;
  readonly initials: string;
  readonly playerName: string;
  readonly mobilePlayerName?: string;
  readonly gamesPlayed: number;
  readonly totalScore: number;
  readonly streakDays: number;
  readonly favoriteGameName: string;
}

const featuredSlugs: readonly string[] = [
  'organized-inside',
  'islanders-new-shores',
  'vacation-cafe-simulator',
  'winter-burrow',
  'shelve-the-potions',
];

export const FEATURED_GAMES: readonly GameCard[] = featuredSlugs.map(
  (slug: string, index: number): GameCard => {
    const game: SeedGame = getGame(slug);
    return {
      imageUrl: getCardImage(game),
      title: game.name,
      likes: formatLikes(game.likesCount),
      rating: game.rating.toFixed(1),
      featured: index === 2,
    };
  },
);

export const LEADERBOARD_PLAYERS: readonly LeaderboardPlayer[] = [
  {
    rank: 1,
    initials: 'AP',
    playerName: 'Alex_Pro99',
    gamesPlayed: 142,
    totalScore: 94_250,
    streakDays: 12,
    favoriteGameName: 'Heartopia',
  },
  {
    rank: 2,
    initials: 'CG',
    playerName: 'CozyGamer_x',
    mobilePlayerName: 'CozyGamer',
    gamesPlayed: 118,
    totalScore: 81_400,
    streakDays: 8,
    favoriteGameName: 'Cat Mail Co.',
  },
  {
    rank: 3,
    initials: 'MM',
    playerName: 'MatchMaster',
    gamesPlayed: 98,
    totalScore: 72_110,
    streakDays: 5,
    favoriteGameName: 'Tiny Glade',
  },
  {
    rank: 4,
    initials: 'BP',
    playerName: 'BubblePop',
    gamesPlayed: 87,
    totalScore: 65_900,
    streakDays: 3,
    favoriteGameName: 'Whisper of the House',
  },
  {
    rank: 5,
    initials: 'SG',
    playerName: 'SudokuGod',
    gamesPlayed: 74,
    totalScore: 59_320,
    streakDays: 2,
    favoriteGameName: 'Cat Chess',
  },
];
