import heroImageUrl from '../../assets/games/tukoni-forest-keepers-hero.jpg';
import commentsSeed from '../../data/comments-tukoni-forest-keepers.json';
import detailSeed from '../../data/game-tukoni-forest-keepers.json';
import { formatLikes } from '../../data/games';
import './game-details-dialog.scss';

export interface GameDetailsDialogController {
  readonly element: HTMLDialogElement;
  open(): void;
}

const game: (typeof detailSeed)['data'] = detailSeed.data;

const icons: Record<'heart' | 'star' | 'trophy' | 'send' | 'close', string> = {
  heart:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8l-6.3 3.3 1.2-6.9-5-4.9 7-1L12 2Z"/></svg>',
  trophy:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h10v3h4v3c0 3.1-2 5.3-5.1 5.6A6 6 0 0 1 13 16v3h4v3H7v-3h4v-3a6 6 0 0 1-2.9-2.4C5 13.3 3 11.1 3 8V5h4V2Zm0 5H5v1c0 1.5.7 2.7 2.1 3.2A6 6 0 0 1 7 10V7Zm10 0v3c0 .4 0 .8-.1 1.2C18.3 10.7 19 9.5 19 8V7h-2Z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 4 16 8-16 8 3-8-3-8Zm3 8h13"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19"/></svg>',
};

function createText(
  tag: 'h2' | 'h3' | 'p' | 'span',
  value: string,
): HTMLElement {
  const element: HTMLElement = document.createElement(tag);
  element.textContent = value;
  return element;
}

function createComment(
  comment: (typeof commentsSeed.data)[number],
  index: number,
  likeButtons: HTMLButtonElement[],
): HTMLElement {
  const article: HTMLElement = document.createElement('article');
  article.className = 'game-details__comment';

  const heading: HTMLDivElement = document.createElement('div');
  heading.className = 'game-details__comment-heading';
  const avatar: HTMLElement = createText('span', comment.authorName.charAt(0));
  avatar.className = `game-details__avatar game-details__avatar--${String(index + 1)}`;
  avatar.setAttribute('aria-hidden', 'true');
  const author: HTMLElement = createText('h3', comment.authorName);
  const date: HTMLTimeElement = document.createElement('time');
  date.dateTime = comment.createdAt;
  date.textContent = ['3 hours ago', '1 day ago', '3 days ago'][index] ?? '';
  heading.append(avatar, author, date);

  const body: HTMLElement = createText('p', comment.text);
  const like: HTMLButtonElement = document.createElement('button');
  like.type = 'button';
  like.className = 'game-details__comment-like';
  like.setAttribute('aria-label', `Like comment by ${comment.authorName}`);
  like.setAttribute('aria-pressed', 'false');
  like.innerHTML = `${icons.heart}<span>${String(comment.likesCount)}</span>`;
  like.addEventListener('click', (): void => {
    const isActive: boolean = like.getAttribute('aria-pressed') !== 'true';
    like.setAttribute('aria-pressed', String(isActive));
    const count: HTMLElement | null = like.querySelector('span');
    if (count)
      count.textContent = String(comment.likesCount + Number(isActive));
  });
  likeButtons.push(like);
  article.append(heading, body, like);
  return article;
}

export function createGameDetailsDialog(): GameDetailsDialogController {
  const dialog: HTMLDialogElement = document.createElement('dialog');
  dialog.className = 'game-details';
  dialog.setAttribute('aria-labelledby', 'game-details-title');

  const close: HTMLButtonElement = document.createElement('button');
  close.type = 'button';
  close.className = 'game-details__close';
  close.setAttribute('aria-label', 'Close game details');
  close.innerHTML = icons.close;
  close.addEventListener('click', (): void => {
    dialog.close();
  });

  const image: HTMLImageElement = document.createElement('img');
  image.className = 'game-details__image';
  image.src = heroImageUrl;
  image.alt = `${game.name} game artwork`;

  const content: HTMLDivElement = document.createElement('div');
  content.className = 'game-details__content';
  const heading: HTMLDivElement = document.createElement('div');
  heading.className = 'game-details__heading';
  const title: HTMLElement = createText('h2', game.name);
  title.id = 'game-details-title';
  const rating: HTMLElement = createText('span', game.rating.toFixed(1));
  rating.className = 'game-details__rating';
  rating.insertAdjacentHTML('afterbegin', icons.star);
  rating.setAttribute('aria-label', `${game.rating.toFixed(1)} out of 5 stars`);
  const likes: HTMLElement = createText('span', formatLikes(game.likesCount));
  likes.className = 'game-details__likes';
  likes.insertAdjacentHTML('afterbegin', icons.heart);
  likes.setAttribute('aria-label', `${String(game.likesCount)} likes`);
  heading.append(title, rating, likes);

  const description: HTMLElement = createText('p', game.fullDescription);
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
  const favorite: HTMLButtonElement = document.createElement('button');
  favorite.type = 'button';
  favorite.className = 'game-details__button game-details__favorite';
  favorite.innerHTML = `${icons.heart}<span>Add to Favorites</span>`;
  favorite.setAttribute('aria-label', 'Add to Favorites');
  favorite.setAttribute('aria-pressed', 'false');
  favorite.addEventListener('click', (): void => {
    const isActive: boolean = favorite.getAttribute('aria-pressed') !== 'true';
    favorite.setAttribute('aria-pressed', String(isActive));
    favorite.setAttribute(
      'aria-label',
      isActive ? 'Remove from Favorites' : 'Add to Favorites',
    );
    const label: HTMLElement | null = favorite.querySelector('span');
    if (label)
      label.textContent = isActive ? 'Added to Favorites' : 'Add to Favorites';
  });
  actions.append(play, favorite);

  const records: HTMLElement = document.createElement('section');
  records.className = 'game-details__records';
  const recordsTitle: HTMLElement = createText('h3', 'Top Records');
  recordsTitle.insertAdjacentHTML('afterbegin', icons.trophy);
  records.append(recordsTitle);
  const recordList: HTMLOListElement = document.createElement('ol');
  for (const [index, record] of game.topRecords.entries()) {
    const item: HTMLLIElement = document.createElement('li');
    const medal: HTMLElement = createText(
      'span',
      ['🥇', '🥈', '🥉'][index] ?? '',
    );
    medal.className = 'game-details__medal';
    medal.setAttribute('aria-label', `Rank ${String(index + 1)}`);
    const player: HTMLElement = createText('span', record.playerName);
    player.className = 'game-details__player';
    const score: HTMLElement = createText(
      'span',
      `${record.score.toLocaleString('en-US')} pts`,
    );
    score.className = 'game-details__score';
    const date: HTMLTimeElement = document.createElement('time');
    date.dateTime = record.achievedAt;
    date.textContent = ['2 days ago', '5 days ago', '1 week ago'][index] ?? '';
    item.append(medal, player, score, date);
    recordList.append(item);
  }
  records.append(recordList);

  const comments: HTMLElement = document.createElement('section');
  comments.className = 'game-details__comments';
  comments.append(
    createText('h3', `Comments (${String(commentsSeed.meta.totalComments)})`),
  );
  const composer: HTMLDivElement = document.createElement('div');
  composer.className = 'game-details__composer';
  const ownAvatar: HTMLElement = createText('span', 'U');
  ownAvatar.className = 'game-details__avatar game-details__avatar--self';
  ownAvatar.setAttribute('aria-hidden', 'true');
  const textarea: HTMLTextAreaElement = document.createElement('textarea');
  textarea.rows = 1;
  textarea.placeholder = 'Write a comment...';
  textarea.setAttribute('aria-label', 'Write a comment');
  textarea.addEventListener('input', (): void => {
    textarea.style.height = 'auto';
    textarea.style.height = `${String(textarea.scrollHeight)}px`;
  });
  const send: HTMLButtonElement = document.createElement('button');
  send.type = 'button';
  send.className = 'game-details__send';
  send.setAttribute('aria-label', 'Send comment');
  send.innerHTML = icons.send;
  composer.append(ownAvatar, textarea, send);
  comments.append(composer);
  const likeButtons: HTMLButtonElement[] = [];
  comments.append(
    ...commentsSeed.data.map(
      (
        comment: (typeof commentsSeed.data)[number],
        index: number,
      ): HTMLElement => createComment(comment, index, likeButtons),
    ),
  );

  content.append(heading, description, specs, actions, records, comments);
  dialog.append(close, image, content);
  dialog.addEventListener('click', (event: MouseEvent): void => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', (): void => {
    favorite.setAttribute('aria-pressed', 'false');
    favorite.setAttribute('aria-label', 'Add to Favorites');
    const label: HTMLElement | null = favorite.querySelector('span');
    if (label) label.textContent = 'Add to Favorites';
    for (const [index, button] of likeButtons.entries()) {
      const count: number = commentsSeed.data[index]?.likesCount ?? 0;
      button.setAttribute('aria-pressed', 'false');
      const countLabel: HTMLElement | null = button.querySelector('span');
      if (countLabel) countLabel.textContent = String(count);
    }
    textarea.value = '';
    textarea.style.height = '';
    dialog.scrollTop = 0;
  });

  return {
    element: dialog,
    open(): void {
      if (!dialog.open) dialog.showModal();
    },
  };
}
