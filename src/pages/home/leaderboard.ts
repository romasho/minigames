import { getLeaderboard, type LeaderboardEntry } from '../../services/api';
import {
  emptyState,
  errorBanner,
  notify,
  skeleton,
  withSkeleton,
} from '../../components/feedback';
import './leaderboard.scss';

function createCell(
  content: string,
  label: string,
  className?: string,
): HTMLTableCellElement {
  const cell = document.createElement('td');
  cell.dataset.label = label;
  if (className) cell.className = className;
  cell.textContent = content;
  return cell;
}
function createPlayerCell(player: LeaderboardEntry): HTMLTableCellElement {
  const cell = createCell('', 'Player', 'leaderboard__player');
  const avatar = document.createElement('span');
  avatar.className = `leaderboard__avatar leaderboard__avatar--${String(player.rank)}`;
  avatar.textContent = player.playerName.slice(0, 2).toUpperCase();
  const name = document.createElement('span');
  name.className = 'leaderboard__player-name';
  name.textContent = player.playerName;
  cell.append(avatar, name);
  return cell;
}
function createStreakCell(player: LeaderboardEntry): HTMLTableCellElement {
  const cell = createCell('', 'Streak', 'leaderboard__streak');
  const icon = document.createElement('span');
  icon.className = 'leaderboard__streak-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '🔥';
  const desktop = document.createElement('span');
  desktop.className = 'leaderboard__streak-desktop';
  desktop.textContent = `${String(player.streakDays)} days`;
  const compact = document.createElement('span');
  compact.className = 'leaderboard__streak-compact';
  compact.textContent = `${String(player.streakDays)}d`;
  cell.append(icon, desktop, compact);
  return cell;
}
function createScoreCell(
  player: LeaderboardEntry,
  formatter: Intl.NumberFormat,
): HTMLTableCellElement {
  const cell = createCell('', 'Score', 'leaderboard__score');
  const full = document.createElement('span');
  full.className = 'leaderboard__score-full';
  full.textContent = formatter.format(player.totalScore);
  const compact = document.createElement('span');
  compact.className = 'leaderboard__score-compact';
  compact.textContent = `${(Math.floor(player.totalScore / 100) / 10).toFixed(1)}K`;
  cell.append(full, compact);
  return cell;
}
function createFavoriteCell(player: LeaderboardEntry): HTMLTableCellElement {
  const cell = createCell('', 'Favorite Game', 'leaderboard__favorite');
  const tag = document.createElement('span');
  tag.className = 'leaderboard__favorite-tag';
  tag.textContent = player.favoriteGameName;
  cell.append(tag);
  return cell;
}

export function createLeaderboardSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'leaderboard';
  section.id = 'leaderboard';
  section.setAttribute('aria-labelledby', 'leaderboard-title');
  const heading = document.createElement('div');
  heading.className = 'leaderboard__heading';
  const title = document.createElement('h2');
  title.id = 'leaderboard-title';
  const desktopTitle = document.createElement('span');
  desktopTitle.className = 'leaderboard__title-desktop';
  desktopTitle.textContent = 'Top Players This Week';
  const mobileTitle = document.createElement('span');
  mobileTitle.className = 'leaderboard__title-mobile';
  mobileTitle.textContent = 'Top Players';
  title.append(desktopTitle, mobileTitle);
  heading.append(title);
  const table = document.createElement('table');
  table.className = 'leaderboard__table';
  const columnGroup = document.createElement('colgroup');
  columnGroup.append(
    ...Array.from(
      { length: 6 },
      (_value: unknown, index: number): HTMLTableColElement => {
        const column = document.createElement('col');
        column.className = `leaderboard__column leaderboard__column--${String(index + 1)}`;
        return column;
      },
    ),
  );
  const caption = document.createElement('caption');
  caption.textContent = 'Top players this week';
  const header = table.createTHead();
  const headerRow = header.insertRow();
  for (const [longLabel, compactLabel] of [
    ['Rank', 'Rank'],
    ['Player', 'Player'],
    ['Games Played', 'Games'],
    ['Total Score', 'Score'],
    ['Streak', 'Streak'],
    ['Favorite Game', 'Favorite Game'],
  ] as const) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    const long = document.createElement('span');
    long.className = 'leaderboard__label-long';
    long.textContent = longLabel;
    const compact = document.createElement('span');
    compact.className = 'leaderboard__label-compact';
    compact.textContent = compactLabel;
    cell.append(long, compact);
    headerRow.append(cell);
  }
  const body = table.createTBody();
  const formatter = new Intl.NumberFormat('en-US');
  table.append(caption, columnGroup, header, body);
  section.append(heading, table);
  const controller: AbortController = new AbortController();
  const load = async (): Promise<void> => {
    table.hidden = true;
    section.querySelector('.api-skeleton, .api-error, .api-empty')?.remove();
    const startedAt: number = performance.now();
    section.append(skeleton('Loading leaderboard', 'leaderboard'));
    try {
      const players: LeaderboardEntry[] = await withSkeleton(
        getLeaderboard(controller.signal),
        startedAt,
      );
      if (controller.signal.aborted) return;
      section.querySelector('.api-skeleton')?.remove();
      body.replaceChildren();
      for (const player of players) {
        const row: HTMLTableRowElement = body.insertRow();
        row.className = `leaderboard__row leaderboard__row--rank-${String(player.rank)}`;
        row.append(
          createCell(`#${String(player.rank)}`, 'Rank', 'leaderboard__rank'),
          createPlayerCell(player),
          createCell(String(player.gamesPlayed), 'Games Played'),
          createScoreCell(player, formatter),
          createStreakCell(player),
          createFavoriteCell(player),
        );
      }
      table.hidden = players.length === 0;
      if (players.length === 0) section.append(emptyState('No players yet.'));
    } catch {
      if (controller.signal.aborted) return;
      section.querySelector('.api-skeleton')?.replaceWith(
        errorBanner('Could not load leaderboard.', (): void => {
          void load();
        }),
      );
      notify('Could not load leaderboard.');
    }
  };
  void load();
  section.addEventListener(
    'page-disconnect',
    (): void => {
      controller.abort();
    },
    {
      once: true,
    },
  );
  return section;
}
