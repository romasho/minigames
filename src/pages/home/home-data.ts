import islandersCardUrl from '../../assets/games/islanders-new-shores-card.jpg';
import organizedInsideCardUrl from '../../assets/games/organized-inside-card.jpg';
import shelveThePotionsCardUrl from '../../assets/games/shelve-the-potions-card.jpg';
import vacationCafeCardUrl from '../../assets/games/vacation-cafe-simulator-card.jpg';
import winterBurrowCardUrl from '../../assets/games/winter-burrow-card.jpg';

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

export const FEATURED_GAMES: readonly GameCard[] = [
  {
    imageUrl: organizedInsideCardUrl,
    title: 'Organized Inside',
    likes: '41.6K',
    rating: '4.9',
  },
  {
    imageUrl: islandersCardUrl,
    title: 'ISLANDERS: New Shores',
    likes: '54.2K',
    rating: '4.9',
  },
  {
    imageUrl: vacationCafeCardUrl,
    title: 'Vacation Cafe Simulator',
    likes: '28.7K',
    rating: '4.8',
    featured: true,
  },
  {
    imageUrl: winterBurrowCardUrl,
    title: 'Winter Burrow',
    likes: '32.4K',
    rating: '4.9',
  },
  {
    imageUrl: shelveThePotionsCardUrl,
    title: 'Shelve the Potions',
    likes: '26.8K',
    rating: '4.8',
  },
];

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
