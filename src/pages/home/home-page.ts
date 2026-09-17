import heroBackgroundUrl from '../../assets/images/hero-background.png';
import camperVanCardUrl from '../../assets/games/camper-van-make-it-home-card.jpg';
import catChessCardUrl from '../../assets/games/cat-chess-card.jpg';
import cozySolitaireCardUrl from '../../assets/games/cozy-solitaire-card.jpg';
import tinyGladeCardUrl from '../../assets/games/tiny-glade-card.jpg';
import './home-page.scss';

interface GameCard {
  imageUrl: string;
  title: string;
  likes: string;
  rating: string;
}

interface LeaderboardPlayer {
  rank: number;
  playerName: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameName: string;
}

const FEATURED_GAMES: readonly GameCard[] = [
  {
    imageUrl: camperVanCardUrl,
    title: 'Camper Van: Make It Home',
    likes: '12.8K',
    rating: '4.9',
  },
  {
    imageUrl: catChessCardUrl,
    title: 'Cat Chess',
    likes: '9.6K',
    rating: '4.8',
  },
  {
    imageUrl: cozySolitaireCardUrl,
    title: 'Cozy Solitaire',
    likes: '8.4K',
    rating: '4.7',
  },
  {
    imageUrl: tinyGladeCardUrl,
    title: 'Tiny Glade',
    likes: '7.9K',
    rating: '4.8',
  },
];

const LEADERBOARD_PLAYERS: readonly LeaderboardPlayer[] = [
  {
    rank: 1,
    playerName: 'Alex_Pro99',
    gamesPlayed: 142,
    totalScore: 94_250,
    streakDays: 12,
    favoriteGameName: 'Heartopia',
  },
  {
    rank: 2,
    playerName: 'CozyGamer_x',
    gamesPlayed: 118,
    totalScore: 81_400,
    streakDays: 8,
    favoriteGameName: 'Cat Mail Co.',
  },
  {
    rank: 3,
    playerName: 'MatchMaster',
    gamesPlayed: 98,
    totalScore: 72_110,
    streakDays: 5,
    favoriteGameName: 'Tiny Glade',
  },
  {
    rank: 4,
    playerName: 'BubblePop',
    gamesPlayed: 87,
    totalScore: 65_900,
    streakDays: 3,
    favoriteGameName: 'Whisper of the House',
  },
  {
    rank: 5,
    playerName: 'SudokuGod',
    gamesPlayed: 74,
    totalScore: 59_320,
    streakDays: 2,
    favoriteGameName: 'Cat Chess',
  },
];

function createHeroSection(): HTMLElement {
  const hero: HTMLElement = document.createElement('section');
  hero.className = 'hero';
  hero.setAttribute('aria-labelledby', 'hero-title');

  const background: HTMLImageElement = document.createElement('img');
  background.className = 'hero__background';
  background.src = heroBackgroundUrl;
  background.alt = '';
  background.setAttribute('aria-hidden', 'true');

  const overlay: HTMLDivElement = document.createElement('div');
  overlay.className = 'hero__overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'hero__content';

  const title: HTMLHeadingElement = document.createElement('h1');
  title.id = 'hero-title';
  title.textContent = 'Take a Short Break & Have Fun';

  const description: HTMLParagraphElement = document.createElement('p');
  description.textContent =
    'Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.';

  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = 'hero__button';
  button.textContent = 'Browse Library';

  content.append(title, description, button);
  hero.append(background, overlay, content);
  return hero;
}

function createGameCard(game: GameCard): HTMLElement {
  const card: HTMLElement = document.createElement('article');
  card.className = 'game-card';

  const artwork: HTMLDivElement = document.createElement('div');
  artwork.className = 'game-card__artwork';

  const image: HTMLImageElement = document.createElement('img');
  image.className = 'game-card__image';
  image.src = game.imageUrl;
  image.alt = `${game.title} game preview`;

  const information: HTMLDivElement = document.createElement('div');
  information.className = 'game-card__information';

  const title: HTMLHeadingElement = document.createElement('h3');
  title.className = 'game-card__title';
  title.textContent = game.title;

  const statistics: HTMLDivElement = document.createElement('div');
  statistics.className = 'game-card__statistics';

  const likes: HTMLSpanElement = document.createElement('span');
  likes.className = 'game-card__likes';
  likes.setAttribute('aria-label', `${game.likes} likes`);
  likes.textContent = `♥ ${game.likes}`;

  const rating: HTMLSpanElement = document.createElement('span');
  rating.className = 'game-card__rating';
  rating.setAttribute('aria-label', `${game.rating} out of 5 stars`);
  rating.textContent = `★ ${game.rating}`;

  artwork.append(image);
  statistics.append(likes, rating);
  information.append(title, statistics);
  card.append(artwork, information);
  return card;
}

function createCarouselSection(): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'games-carousel';
  section.setAttribute('aria-labelledby', 'popular-games-title');

  const headingRow: HTMLDivElement = document.createElement('div');
  headingRow.className = 'games-carousel__heading-row';

  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'popular-games-title';
  title.textContent = 'Popular Games';

  const arrows: HTMLDivElement = document.createElement('div');
  arrows.className = 'games-carousel__arrows';
  arrows.setAttribute('aria-label', 'Carousel navigation');

  for (const [direction, symbol] of [
    ['Previous', '←'],
    ['Next', '→'],
  ] as const) {
    const arrow: HTMLButtonElement = document.createElement('button');
    arrow.type = 'button';
    arrow.className = 'games-carousel__arrow';
    arrow.setAttribute('aria-label', `${direction} slide (coming soon)`);
    arrow.setAttribute('aria-disabled', 'true');
    arrow.textContent = symbol;
    arrows.append(arrow);
  }

  const viewport: HTMLDivElement = document.createElement('div');
  viewport.className = 'games-carousel__viewport';

  const track: HTMLDivElement = document.createElement('div');
  track.className = 'games-carousel__track';
  track.append(...FEATURED_GAMES.map((game: GameCard) => createGameCard(game)));
  viewport.append(track);

  const indicators: HTMLDivElement = document.createElement('div');
  indicators.className = 'games-carousel__indicators';
  indicators.setAttribute('aria-label', 'Slide 1 of 3');
  for (const isActive of [true, false, false]) {
    const indicator: HTMLSpanElement = document.createElement('span');
    indicator.className = 'games-carousel__indicator';
    if (isActive) indicator.classList.add('games-carousel__indicator--active');
    indicators.append(indicator);
  }

  headingRow.append(title, arrows);
  section.append(headingRow, viewport, indicators);
  return section;
}

function createLeaderboardCell(
  content: string,
  label: string,
  className?: string,
): HTMLTableCellElement {
  const cell: HTMLTableCellElement = document.createElement('td');
  cell.dataset.label = label;
  if (className) cell.className = className;
  cell.textContent = content;
  return cell;
}

function createLeaderboardSection(): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'leaderboard';
  section.setAttribute('aria-labelledby', 'leaderboard-title');

  const heading: HTMLDivElement = document.createElement('div');
  heading.className = 'leaderboard__heading';

  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'leaderboard-title';
  title.textContent = 'Leaderboard';

  const description: HTMLParagraphElement = document.createElement('p');
  description.textContent = 'Top Players This Week';
  heading.append(title, description);

  const table: HTMLTableElement = document.createElement('table');
  table.className = 'leaderboard__table';

  const caption: HTMLTableCaptionElement = document.createElement('caption');
  caption.textContent = 'Top players this week';

  const header: HTMLTableSectionElement = table.createTHead();
  const headerRow: HTMLTableRowElement = header.insertRow();
  for (const label of [
    'Rank',
    'Player',
    'Games Played',
    'Total Score',
    'Streak',
    'Favourite Game',
  ]) {
    const cell: HTMLTableCellElement = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = label;
    headerRow.append(cell);
  }

  const body: HTMLTableSectionElement = table.createTBody();
  const scoreFormatter: Intl.NumberFormat = new Intl.NumberFormat('en-US');
  for (const player of LEADERBOARD_PLAYERS) {
    const row: HTMLTableRowElement = body.insertRow();
    row.className = `leaderboard__row leaderboard__row--rank-${String(player.rank)}`;
    row.append(
      createLeaderboardCell(String(player.rank), 'Rank', 'leaderboard__rank'),
      createLeaderboardCell(player.playerName, 'Player', 'leaderboard__player'),
      createLeaderboardCell(String(player.gamesPlayed), 'Games Played'),
      createLeaderboardCell(
        scoreFormatter.format(player.totalScore),
        'Total Score',
        'leaderboard__score',
      ),
      createLeaderboardCell(
        `${String(player.streakDays)} days`,
        'Streak',
        'leaderboard__streak',
      ),
      createLeaderboardCell(player.favoriteGameName, 'Favourite Game'),
    );
  }

  table.append(caption, header, body);
  section.append(heading, table);
  return section;
}

/**
 * Creates the Home page and its semantic content sections.
 */
export function createHomePage(): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.className = 'home-page';
  page.append(
    createHeroSection(),
    createCarouselSection(),
    createLeaderboardSection(),
  );
  return page;
}
