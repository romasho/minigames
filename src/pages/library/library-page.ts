import {
  SEED_GAMES,
  formatLikes,
  getCardImage,
  type SeedGame,
} from '../../data/games';
import './library-page.scss';

const games: readonly SeedGame[] = SEED_GAMES.slice(0, 6);

const categories: readonly string[] = [
  'All Games',
  'Puzzle',
  'Card',
  'Match',
  'Farm',
  'Strategy',
  'Arcade',
];
const sortOptions: readonly string[] = [
  'Rating ↓',
  'Rating ↑',
  'Name A–Z',
  'Name Z–A',
];

const starIcon: string = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">',
  '<path d="m12 2 3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8l-6.3 3.3 1.2-6.9-5-4.9 7-1L12 2Z"/>',
  '</svg>',
].join('');
const heartIcon: string = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
  '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  '</svg>',
].join('');

function createGameCard(game: SeedGame): HTMLElement {
  const card: HTMLElement = document.createElement('article');
  card.className = 'library-card';
  const image: HTMLImageElement = document.createElement('img');
  image.className = 'library-card__image';
  image.src = getCardImage(game);
  image.alt = `${game.name} game screenshot`;
  image.loading = 'lazy';
  const body: HTMLDivElement = document.createElement('div');
  body.className = 'library-card__body';
  const headingRow: HTMLDivElement = document.createElement('div');
  headingRow.className = 'library-card__heading-row';
  const heading: HTMLHeadingElement = document.createElement('h2');
  heading.className = 'library-card__title';
  heading.textContent = game.name;
  const badge: HTMLSpanElement = document.createElement('span');
  badge.className = 'library-card__badge';
  badge.textContent =
    (game.category[0]?.toUpperCase() ?? '') + game.category.slice(1);
  const price: HTMLSpanElement = document.createElement('span');
  price.className = 'library-card__price';
  price.textContent = game.price;
  headingRow.append(heading, badge, price);
  const description: HTMLParagraphElement = document.createElement('p');
  description.className = 'library-card__description';
  description.textContent = game.shortDescription;
  const footer: HTMLDivElement = document.createElement('div');
  footer.className = 'library-card__footer';
  const stats: HTMLDivElement = document.createElement('div');
  stats.className = 'library-card__stats';
  const rating: HTMLSpanElement = document.createElement('span');
  rating.setAttribute('aria-label', `${game.rating.toFixed(1)} out of 5 stars`);
  rating.innerHTML = `${starIcon}<span>${game.rating.toFixed(1)}</span>`;
  const likes: HTMLSpanElement = document.createElement('span');
  likes.setAttribute('aria-label', `${String(game.likesCount)} likes`);
  likes.innerHTML = `${heartIcon}<span>${formatLikes(game.likesCount)}</span>`;
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = 'library-button library-button--primary';
  button.textContent = 'Details';
  button.addEventListener('click', (): void => {
    button.dispatchEvent(new Event('open-game-details', { bubbles: true }));
  });
  stats.append(rating, likes);
  footer.append(stats, button);
  body.append(headingRow, description, footer);
  card.append(image, body);
  return card;
}

export function createLibraryPage(): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.className = 'library-page';
  const intro: HTMLElement = document.createElement('section');
  intro.className = 'library-intro';
  intro.setAttribute('aria-labelledby', 'library-title');
  const title: HTMLElement = document.createElement('h1');
  title.id = 'library-title';
  title.textContent = 'Game Library';
  const subtitle: HTMLParagraphElement = document.createElement('p');
  subtitle.textContent = 'Browse our collection of casual mini-games';
  intro.append(title, subtitle);

  const controls: HTMLElement = document.createElement('section');
  controls.className = 'library-controls';
  controls.setAttribute('aria-label', 'Filter and sort games');
  const chipViewport: HTMLDivElement = document.createElement('div');
  chipViewport.className = 'library-controls__chips-viewport';
  const chips: HTMLDivElement = document.createElement('div');
  chips.className = 'library-controls__chips';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', 'Filter by category');
  for (const [index, category] of categories.entries()) {
    const chip: HTMLButtonElement = document.createElement('button');
    chip.type = 'button';
    chip.className = 'library-chip';
    chip.dataset.category = category;
    chip.textContent = category;
    chip.setAttribute('aria-pressed', String(index === 0));
    if (index === 0) chip.classList.add('is-active');
    chip.addEventListener('click', () => {
      chips
        .querySelectorAll<HTMLButtonElement>('.library-chip')
        .forEach((item: HTMLButtonElement) => {
          const isActive: boolean = item === chip;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-pressed', String(isActive));
        });
    });
    chips.append(chip);
  }
  chipViewport.append(chips);

  const sort: HTMLDivElement = document.createElement('div');
  sort.className = 'library-sort';
  const sortButton: HTMLButtonElement = document.createElement('button');
  sortButton.type = 'button';
  sortButton.className = 'library-sort__trigger';
  sortButton.setAttribute('aria-haspopup', 'listbox');
  sortButton.setAttribute('aria-expanded', 'false');
  const sortPrefix: HTMLSpanElement = document.createElement('span');
  sortPrefix.textContent = 'Sort by: ';
  const sortValue: HTMLSpanElement = document.createElement('span');
  sortValue.textContent = sortOptions[0] ?? 'Rating ↓';
  sortButton.append(sortPrefix, sortValue);
  const options: HTMLUListElement = document.createElement('ul');
  options.className = 'library-sort__options';
  options.setAttribute('role', 'listbox');
  options.setAttribute('aria-label', 'Sort games');
  for (const [index, option] of sortOptions.entries()) {
    const item: HTMLLIElement = document.createElement('li');
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', String(index === 0));
    item.tabIndex = 0;
    item.textContent = option;
    if (index === 0) item.classList.add('is-selected');
    item.addEventListener('click', () => {
      options.querySelectorAll('[role="option"]').forEach((entry: Element) => {
        const isSelected: boolean = entry === item;
        entry.setAttribute('aria-selected', String(isSelected));
        entry.classList.toggle('is-selected', isSelected);
      });
      sortValue.textContent = option;
      sort.classList.remove('is-open');
      sort.dataset.open = 'false';
      sortButton.setAttribute('aria-expanded', 'false');
      sortButton.focus();
    });
    item.addEventListener('keydown', (event: KeyboardEvent) => {
      if (!(event.key === 'Enter' || event.key === ' ')) {
        return;
      }

      event.preventDefault();
      item.click();
    });
    options.append(item);
  }
  sortButton.addEventListener('click', () => {
    const isOpen: boolean = sort.dataset.open !== 'true';
    sort.classList.toggle('is-open', isOpen);
    sort.dataset.open = String(isOpen);
    sortButton.setAttribute('aria-expanded', String(isOpen));
  });
  page.addEventListener('click', (event: Event) => {
    if (sort.contains(event.target as Node)) {
      return;
    }

    sort.classList.remove('is-open');
    sort.dataset.open = 'false';
    sortButton.setAttribute('aria-expanded', 'false');
  });
  sort.append(sortButton, options);
  controls.append(chipViewport, sort);

  const grid: HTMLElement = document.createElement('section');
  grid.className = 'library-grid';
  grid.setAttribute('aria-label', 'Games');
  const cards: HTMLElement[] = games.map((game: SeedGame): HTMLElement =>
    createGameCard(game),
  );
  const compactLayout: MediaQueryList = matchMedia('(max-width: 800px)');
  const arrangeCards: () => void = (): void => {
    const order: readonly number[] = compactLayout.matches
      ? [0, 2, 1, 3, 5, 4]
      : [0, 1, 2, 3, 4, 5];
    grid.replaceChildren(
      ...order.map((index: number): HTMLElement => {
        const card: HTMLElement | undefined = cards[index];
        if (!card)
          throw new Error(`Missing Library card at index ${String(index)}`);
        return card;
      }),
    );
  };
  compactLayout.addEventListener('change', arrangeCards);
  arrangeCards();
  const pagination: ReturnType<typeof createPagination> = createPagination();
  page.addEventListener(
    'page-disconnect',
    (): void => {
      pagination.destroy();
      compactLayout.removeEventListener('change', arrangeCards);
    },
    { once: true },
  );
  page.append(intro, controls, grid, pagination.element);
  return page;
}

function createPagination(): { element: HTMLElement; destroy: () => void } {
  const nav: HTMLElement = document.createElement('nav');
  nav.className = 'library-pagination';
  nav.setAttribute('aria-label', 'Library pages');
  const controls: HTMLDivElement = document.createElement('div');
  controls.className = 'library-pagination__controls';
  const pageCount: number = Math.ceil(SEED_GAMES.length / games.length);
  let current: number = Math.min(1, pageCount);
  const previous: HTMLButtonElement = document.createElement('button');
  previous.type = 'button';
  previous.className = 'library-pagination__arrow';
  previous.setAttribute('aria-label', 'Previous page');
  previous.textContent = '‹';
  const next: HTMLButtonElement = document.createElement('button');
  next.type = 'button';
  next.className = 'library-pagination__arrow';
  next.setAttribute('aria-label', 'Next page');
  next.textContent = '›';
  const buttons: HTMLDivElement = document.createElement('div');
  buttons.className = 'library-pagination__pages';
  const media: MediaQueryList = matchMedia('(max-width: 600px)');
  const render: () => void = (): void => {
    previous.disabled = current === 1;
    next.disabled = current === pageCount;
    const limit: number = media.matches ? 3 : 4;
    let start: number = Math.max(
      1,
      Math.min(current - Math.floor((limit - 1) / 2), pageCount - limit + 1),
    );
    if (current === 1) start = 1;
    buttons.replaceChildren();
    for (let value: number = start; value < start + limit; value += 1) {
      const button: HTMLButtonElement = document.createElement('button');
      button.type = 'button';
      button.className = 'library-pagination__page';
      button.textContent = String(value);
      button.setAttribute('aria-label', `Page ${String(value)}`);
      button.setAttribute('aria-current', String(value === current));
      button.classList.toggle('is-active', value === current);
      button.addEventListener('click', () => {
        current = value;
        render();
      });
      buttons.append(button);
    }
  };
  previous.addEventListener('click', () => {
    if (!(current > 1)) {
      return;
    }

    current -= 1;
    render();
  });
  next.addEventListener('click', () => {
    if (!(current < pageCount)) {
      return;
    }

    current += 1;
    render();
  });
  media.addEventListener('change', render);
  controls.append(previous, buttons, next);
  nav.append(controls);
  render();
  return {
    element: nav,
    destroy: (): void => {
      media.removeEventListener('change', render);
    },
  };
}
