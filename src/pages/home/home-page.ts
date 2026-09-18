import heroBackgroundUrl from '../../assets/images/hero-background.png';
import developerIllustrationUrl from '../../assets/images/illustration-side.png';
import islandersCardUrl from '../../assets/games/islanders-new-shores-card.jpg';
import organizedInsideCardUrl from '../../assets/games/organized-inside-card.jpg';
import shelveThePotionsCardUrl from '../../assets/games/shelve-the-potions-card.jpg';
import vacationCafeCardUrl from '../../assets/games/vacation-cafe-simulator-card.jpg';
import winterBurrowCardUrl from '../../assets/games/winter-burrow-card.jpg';
import './home-page.scss';

interface GameCard {
  imageUrl: string;
  title: string;
  likes: string;
  rating: string;
  featured?: boolean;
}

interface LeaderboardPlayer {
  rank: number;
  initials: string;
  playerName: string;
  mobilePlayerName?: string;
  gamesPlayed: number;
  totalScore: number;
  streakDays: number;
  favoriteGameName: string;
}

const FEATURED_GAMES: readonly GameCard[] = [
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

const LEADERBOARD_PLAYERS: readonly LeaderboardPlayer[] = [
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
  if (game.featured) card.classList.add('game-card--featured');

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
  statistics.append(rating, likes);
  information.append(title, statistics);
  card.append(artwork, information);
  return card;
}

function createCarouselSection(): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'games-carousel';
  section.setAttribute('aria-labelledby', 'new-games-title');

  const headingRow: HTMLDivElement = document.createElement('div');
  headingRow.className = 'games-carousel__heading-row';

  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'new-games-title';
  title.textContent = 'New Games';

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
    arrow.setAttribute('aria-label', `${direction} slide`);
    arrow.textContent = symbol;
    arrows.append(arrow);
  }

  const viewport: HTMLDivElement = document.createElement('div');
  viewport.className = 'games-carousel__viewport';

  const track: HTMLDivElement = document.createElement('div');
  track.className = 'games-carousel__track';
  track.append(...FEATURED_GAMES.map((game: GameCard) => createGameCard(game)));
  viewport.append(track);

  headingRow.append(title, arrows);
  section.append(headingRow, viewport);
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

function createPlayerCell(player: LeaderboardPlayer): HTMLTableCellElement {
  const cell: HTMLTableCellElement = createLeaderboardCell(
    '',
    'Player',
    'leaderboard__player',
  );
  const avatar: HTMLSpanElement = document.createElement('span');
  avatar.className = `leaderboard__avatar leaderboard__avatar--${String(player.rank)}`;
  avatar.textContent = player.initials;

  const name: HTMLSpanElement = document.createElement('span');
  name.className = 'leaderboard__player-name';
  name.textContent = player.playerName;
  if (player.mobilePlayerName)
    name.dataset.mobileName = player.mobilePlayerName;

  cell.append(avatar, name);
  return cell;
}

function createStreakCell(player: LeaderboardPlayer): HTMLTableCellElement {
  const cell: HTMLTableCellElement = createLeaderboardCell(
    '',
    'Streak',
    'leaderboard__streak',
  );
  const icon: HTMLSpanElement = document.createElement('span');
  icon.className = 'leaderboard__streak-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '🔥';
  const desktopValue: HTMLSpanElement = document.createElement('span');
  desktopValue.className = 'leaderboard__streak-desktop';
  desktopValue.textContent = `${String(player.streakDays)} days`;
  const compactValue: HTMLSpanElement = document.createElement('span');
  compactValue.className = 'leaderboard__streak-compact';
  compactValue.textContent = `${String(player.streakDays)}d`;
  cell.append(icon, desktopValue, compactValue);
  return cell;
}

function createScoreCell(
  player: LeaderboardPlayer,
  scoreFormatter: Intl.NumberFormat,
): HTMLTableCellElement {
  const cell: HTMLTableCellElement = createLeaderboardCell(
    '',
    'Score',
    'leaderboard__score',
  );
  const fullValue: HTMLSpanElement = document.createElement('span');
  fullValue.className = 'leaderboard__score-full';
  fullValue.textContent = scoreFormatter.format(player.totalScore);
  const compactValue: HTMLSpanElement = document.createElement('span');
  compactValue.className = 'leaderboard__score-compact';
  compactValue.textContent = `${(Math.floor(player.totalScore / 100) / 10).toFixed(1)}K`;
  cell.append(fullValue, compactValue);
  return cell;
}

function createFavoriteCell(player: LeaderboardPlayer): HTMLTableCellElement {
  const cell: HTMLTableCellElement = createLeaderboardCell(
    '',
    'Favorite Game',
    'leaderboard__favorite',
  );
  const tag: HTMLSpanElement = document.createElement('span');
  tag.className = 'leaderboard__favorite-tag';
  tag.textContent = player.favoriteGameName;
  cell.append(tag);
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
  const desktopTitle: HTMLSpanElement = document.createElement('span');
  desktopTitle.className = 'leaderboard__title-desktop';
  desktopTitle.textContent = 'Top Players This Week';
  const mobileTitle: HTMLSpanElement = document.createElement('span');
  mobileTitle.className = 'leaderboard__title-mobile';
  mobileTitle.textContent = 'Top Players';
  title.append(desktopTitle, mobileTitle);
  heading.append(title);

  const table: HTMLTableElement = document.createElement('table');
  table.className = 'leaderboard__table';

  const columns: HTMLTableColElement[] = Array.from(
    { length: 6 },
    (_value: unknown, index: number): HTMLTableColElement => {
      const column: HTMLTableColElement = document.createElement('col');
      column.className = `leaderboard__column leaderboard__column--${String(index + 1)}`;
      return column;
    },
  );
  const columnGroup: HTMLTableColElement = document.createElement('colgroup');
  columnGroup.append(...columns);

  const caption: HTMLTableCaptionElement = document.createElement('caption');
  caption.textContent = 'Top players this week';

  const header: HTMLTableSectionElement = table.createTHead();
  const headerRow: HTMLTableRowElement = header.insertRow();
  for (const [longLabel, compactLabel] of [
    ['Rank', 'Rank'],
    ['Player', 'Player'],
    ['Games Played', 'Games'],
    ['Total Score', 'Score'],
    ['Streak', 'Streak'],
    ['Favorite Game', 'Favorite Game'],
  ] as const) {
    const cell: HTMLTableCellElement = document.createElement('th');
    cell.scope = 'col';
    const long: HTMLSpanElement = document.createElement('span');
    long.className = 'leaderboard__label-long';
    long.textContent = longLabel;
    const compact: HTMLSpanElement = document.createElement('span');
    compact.className = 'leaderboard__label-compact';
    compact.textContent = compactLabel;
    cell.append(long, compact);
    headerRow.append(cell);
  }

  const body: HTMLTableSectionElement = table.createTBody();
  const scoreFormatter: Intl.NumberFormat = new Intl.NumberFormat('en-US');
  for (const player of LEADERBOARD_PLAYERS) {
    const row: HTMLTableRowElement = body.insertRow();
    row.className = `leaderboard__row leaderboard__row--rank-${String(player.rank)}`;
    row.append(
      createLeaderboardCell(
        `#${String(player.rank)}`,
        'Rank',
        'leaderboard__rank',
      ),
      createPlayerCell(player),
      createLeaderboardCell(String(player.gamesPlayed), 'Games Played'),
      createScoreCell(player, scoreFormatter),
      createStreakCell(player),
      createFavoriteCell(player),
    );
  }

  table.append(caption, columnGroup, header, body);
  section.append(heading, table);
  return section;
}

function createDeveloperSection(): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'game-developer';
  section.setAttribute('aria-labelledby', 'game-developer-title');

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'game-developer__content';

  const title: HTMLHeadingElement = document.createElement('h2');
  title.id = 'game-developer-title';
  title.textContent = 'Are You a Game Developer?';

  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'game-developer__description';
  description.textContent =
    "Want to see your game on MiniGames? We're always looking for fun, engaging mini games to add to our platform. Submit your game and reach thousands of players!";

  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = 'game-developer__button';
  const buttonIcon: HTMLSpanElement = document.createElement('span');
  buttonIcon.className = 'game-developer__button-icon';
  buttonIcon.setAttribute('aria-hidden', 'true');
  const buttonLabel: HTMLSpanElement = document.createElement('span');
  buttonLabel.textContent = 'Submit Form';
  button.append(buttonIcon, buttonLabel);

  const contact: HTMLParagraphElement = document.createElement('p');
  contact.className = 'game-developer__contact';
  contact.textContent = 'or contact us at developers@minigames.com';

  const illustration: HTMLDivElement = document.createElement('div');
  illustration.className = 'game-developer__illustration';
  illustration.setAttribute('aria-hidden', 'true');

  const image: HTMLImageElement = document.createElement('img');
  image.src = developerIllustrationUrl;
  image.alt = '';
  image.className = 'game-developer__image';

  illustration.append(image);
  content.append(title, description, button, contact);
  section.append(content, illustration);
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
    createDeveloperSection(),
  );
  return page;
}
