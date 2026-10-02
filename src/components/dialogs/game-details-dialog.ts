import {
  emptyState,
  errorBanner,
  notify,
  skeleton,
  withSkeleton,
} from '../feedback';
import { formatLikes } from '../../data/games';
import {
  ApiError,
  gameImage,
  getComments,
  getGameDetails,
  type CommentsResult,
  type GameComment,
  type GameDetails,
} from '../../services/api';
import './game-details-dialog.scss';

export interface GameDetailsDialogController {
  readonly element: HTMLDialogElement;
  open(slug: string): void;
  close(): void;
}

const icons: Record<'heart' | 'star' | 'trophy' | 'close', string> = {
  heart:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8l-6.3 3.3 1.2-6.9-5-4.9 7-1L12 2Z"/></svg>',
  trophy:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h10v3h4v3c0 3.1-2 5.3-5.1 5.6A6 6 0 0 1 13 16v3h4v3H7v-3h4v-3a6 6 0 0 1-2.9-2.4C5 13.3 3 11.1 3 8V5h4V2Zm0 5H5v1c0 1.5.7 2.7 2.1 3.2A6 6 0 0 1 7 10V7Zm10 0v3c0 .4 0 .8-.1 1.2C18.3 10.7 19 9.5 19 8V7h-2Z"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19"/></svg>',
};

function text(tag: 'h2' | 'h3' | 'p' | 'span', value: string): HTMLElement {
  const element: HTMLElement = document.createElement(tag);
  element.textContent = value;
  return element;
}

export function relativeTime(date: string, now: number = Date.now()): string {
  const elapsed: number = Math.max(0, now - new Date(date).getTime());
  if (!Number.isFinite(elapsed)) return 'just now';
  const minutes: number = Math.floor(elapsed / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${String(minutes)} min ago`;
  const hours: number = Math.floor(minutes / 60);
  if (hours < 24)
    return `${String(hours)} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days: number = Math.floor(hours / 24);
  if (days < 7) return `${String(days)} ${days === 1 ? 'day' : 'days'} ago`;
  const weeks: number = Math.floor(days / 7);
  if (days < 28)
    return `${String(weeks)} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  const months: number = Math.min(11, Math.max(1, Math.floor(days / 30)));
  if (days < 365)
    return `${String(months)} ${months === 1 ? 'month' : 'months'} ago`;
  const years: number = Math.floor(days / 365);
  return `${String(years)} ${years === 1 ? 'year' : 'years'} ago`;
}

function renderDetails(game: GameDetails, comments: HTMLElement): HTMLElement {
  const wrapper: HTMLElement = document.createElement('div');
  const image: HTMLImageElement = document.createElement('img');
  image.className = 'game-details__image';
  image.src = gameImage(game.heroImage);
  image.alt = `${game.name} game artwork`;
  const content: HTMLDivElement = document.createElement('div');
  content.className = 'game-details__content';
  const heading: HTMLDivElement = document.createElement('div');
  heading.className = 'game-details__heading';
  const title: HTMLElement = text('h2', game.name);
  title.id = 'game-details-title';
  const rating: HTMLElement = text('span', game.rating.toFixed(1));
  rating.className = 'game-details__rating';
  rating.insertAdjacentHTML('afterbegin', icons.star);
  rating.setAttribute('aria-label', `${game.rating.toFixed(1)} out of 5 stars`);
  const likes: HTMLElement = text('span', formatLikes(game.likesCount));
  likes.className = 'game-details__likes';
  likes.insertAdjacentHTML('afterbegin', icons.heart);
  likes.setAttribute('aria-label', `${String(game.likesCount)} likes`);
  heading.append(title, rating, likes);
  const description: HTMLElement = text('p', game.fullDescription);
  description.className = 'game-details__description';
  const specs: HTMLDListElement = document.createElement('dl');
  specs.className = 'game-details__specs';
  for (const [label, value] of Object.entries(game.specs)) {
    const pair: HTMLDivElement = document.createElement('div');
    const term: HTMLElement = document.createElement('dt');
    term.textContent = (label[0]?.toUpperCase() ?? '') + label.slice(1);
    const definition: HTMLElement = document.createElement('dd');
    definition.textContent = value;
    pair.append(term, definition);
    specs.append(pair);
  }
  const actions: HTMLDivElement = document.createElement('div');
  actions.className = 'game-details__actions';
  const play: HTMLButtonElement = document.createElement('button');
  play.type = 'button';
  play.className = 'game-details__button game-details__button--primary';
  play.textContent = 'Play Now';
  play.disabled = true;
  play.title = 'Game launching is not available yet';
  const favorite: HTMLButtonElement = document.createElement('button');
  favorite.type = 'button';
  favorite.className = 'game-details__button game-details__favorite';
  favorite.innerHTML = `${icons.heart}<span>Add to Favorites</span>`;
  favorite.disabled = true;
  favorite.title = 'Sign in to save favorites';
  actions.append(play, favorite);
  const records: HTMLElement = document.createElement('section');
  records.className = 'game-details__records';
  const recordsTitle: HTMLElement = text('h3', 'Top Records');
  recordsTitle.insertAdjacentHTML('afterbegin', icons.trophy);
  records.append(recordsTitle);
  const list: HTMLOListElement = document.createElement('ol');
  for (const [index, record] of game.topRecords.entries()) {
    const item: HTMLLIElement = document.createElement('li');
    const medal: HTMLElement = text('span', ['🥇', '🥈', '🥉'][index] ?? '');
    medal.className = 'game-details__medal';
    medal.setAttribute('aria-label', `Rank ${String(index + 1)}`);
    const player: HTMLElement = text('span', record.playerName);
    player.className = 'game-details__player';
    const score: HTMLElement = text(
      'span',
      `${record.score.toLocaleString('en-US')} pts`,
    );
    score.className = 'game-details__score';
    const date: HTMLTimeElement = document.createElement('time');
    date.dateTime = record.achievedAt;
    date.textContent = relativeTime(record.achievedAt);
    item.append(medal, player, score, date);
    list.append(item);
  }
  records.append(
    game.topRecords.length > 0 ? list : emptyState('No records yet.'),
  );
  content.append(heading, description, specs, actions, records, comments);
  wrapper.append(image, content);
  return wrapper;
}

function renderComment(comment: GameComment): HTMLElement {
  const article: HTMLElement = document.createElement('article');
  article.className = 'game-details__comment';
  const heading: HTMLDivElement = document.createElement('div');
  heading.className = 'game-details__comment-heading';
  const avatar: HTMLElement = text('span', comment.authorName.charAt(0));
  avatar.className = 'game-details__avatar';
  avatar.setAttribute('aria-hidden', 'true');
  const author: HTMLElement = text('h3', comment.authorName);
  const date: HTMLTimeElement = document.createElement('time');
  date.dateTime = comment.createdAt;
  date.textContent = relativeTime(comment.createdAt);
  heading.append(avatar, author, date);
  const body: HTMLElement = text('p', comment.text);
  const likes: HTMLElement = text('span', String(comment.likesCount));
  likes.className = 'game-details__comment-like';
  likes.insertAdjacentHTML('afterbegin', icons.heart);
  article.append(heading, body, likes);
  return article;
}

export function createGameDetailsDialog(): GameDetailsDialogController {
  const dialog: HTMLDialogElement = document.createElement('dialog');
  dialog.className = 'game-details';
  dialog.setAttribute('aria-labelledby', 'game-details-title');
  const closeButton: HTMLButtonElement = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'game-details__close';
  closeButton.setAttribute('aria-label', 'Close game details');
  closeButton.innerHTML = icons.close;
  closeButton.addEventListener('click', (): void => {
    dialog.close();
  });
  const detailsSlot: HTMLDivElement = document.createElement('div');
  detailsSlot.className = 'game-details__details-slot';
  const comments: HTMLElement = document.createElement('section');
  comments.className = 'game-details__comments';
  dialog.append(closeButton, detailsSlot);
  let controller: AbortController | undefined;
  let activeSlug: string | undefined;
  const loadDetails: (
    slug: string,
    signal: AbortSignal,
  ) => Promise<void> = async (
    slug: string,
    signal: AbortSignal,
  ): Promise<void> => {
    const startedAt: number = performance.now();
    detailsSlot.replaceChildren(skeleton('Loading game details', 'details'));
    try {
      const game: GameDetails = await withSkeleton(
        getGameDetails(slug, signal),
        startedAt,
      );
      if (signal.aborted) return;
      detailsSlot.replaceChildren(renderDetails(game, comments));
      void loadComments(slug, signal);
    } catch (error: unknown) {
      if (signal.aborted) return;
      if (error instanceof ApiError && error.status === 404) {
        detailsSlot.replaceChildren(emptyState('Game Not Found'));
        comments.replaceChildren();
        controller?.abort();
        return;
      }
      detailsSlot.replaceChildren(
        errorBanner('Could not load game details.', (): void => {
          void loadDetails(slug, signal);
        }),
      );
      notify('Could not load game details.', 'error', dialog);
    }
  };
  const loadComments: (
    slug: string,
    signal: AbortSignal,
  ) => Promise<void> = async (
    slug: string,
    signal: AbortSignal,
  ): Promise<void> => {
    const startedAt: number = performance.now();
    comments.replaceChildren(skeleton('Loading comments', 'comments'));
    try {
      const result: CommentsResult = await withSkeleton(
        getComments(slug, signal),
        startedAt,
      );
      if (signal.aborted) return;
      const heading: HTMLElement = text(
        'h3',
        `Comments (${String(result.meta.totalComments)})`,
      );
      comments.replaceChildren(
        heading,
        ...(result.data.length > 0
          ? result.data.map((comment: GameComment): HTMLElement =>
              renderComment(comment),
            )
          : [emptyState('No comments yet.')]),
      );
    } catch {
      if (signal.aborted) return;
      comments.replaceChildren(
        errorBanner('Could not load comments.', (): void => {
          void loadComments(slug, signal);
        }),
      );
      notify('Could not load comments.', 'error', dialog);
    }
  };
  dialog.addEventListener('click', (event: MouseEvent): void => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', (): void => {
    controller?.abort();
    activeSlug = undefined;
  });
  return {
    element: dialog,
    open(slug: string): void {
      if (activeSlug === slug && dialog.open) return;
      controller?.abort();
      controller = new AbortController();
      activeSlug = slug;
      if (!dialog.open) dialog.showModal();
      void loadDetails(slug, controller.signal);
    },
    close(): void {
      if (dialog.open) dialog.close();
    },
  };
}
