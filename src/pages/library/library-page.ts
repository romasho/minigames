import {
  emptyState,
  errorBanner,
  notify,
  skeleton,
} from '../../components/feedback';
import { formatLikes } from '../../data/games';
import {
  gameImage,
  getCategories,
  getGames,
  type Category,
  type GameSummary,
  type GamesResult,
} from '../../services/api';
import './library-page.scss';

const SORT_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'rating-desc', label: 'Rating ↓' },
  { value: 'rating-asc', label: 'Rating ↑' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
];
const SORT_VALUES: ReadonlySet<string> = new Set(
  SORT_OPTIONS.map(
    (option: { value: string; label: string }): string => option.value,
  ),
);

interface LibraryState {
  category: string;
  sort: string;
  page: number;
}
function readState(): LibraryState {
  const parameters: URLSearchParams = new URLSearchParams(location.search);
  const pageValue: number | undefined = Number(parameters.get('page'));
  const sortValue: string | null = parameters.get('sort');
  return {
    category: parameters.get('category') ?? 'all',
    sort: sortValue && SORT_VALUES.has(sortValue) ? sortValue : 'rating-desc',
    page: Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1,
  };
}
function writeState(state: LibraryState): void {
  const url: URL = new URL(location.href);
  url.searchParams.set('category', state.category);
  url.searchParams.set('sort', state.sort);
  url.searchParams.set('page', String(state.page));
  history.pushState(null, '', url);
}
function createGameCard(game: GameSummary): HTMLElement {
  const card: HTMLElement = document.createElement('article');
  card.className = 'library-card';
  const image: HTMLImageElement = document.createElement('img');
  image.className = 'library-card__image';
  image.src = gameImage(game.cardImage);
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
  badge.textContent = game.category;
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
  rating.textContent = `★ ${game.rating.toFixed(1)}`;
  const likes: HTMLSpanElement = document.createElement('span');
  likes.setAttribute('aria-label', `${String(game.likesCount)} likes`);
  likes.textContent = `♥ ${formatLikes(game.likesCount)}`;
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = 'library-button library-button--primary';
  button.textContent = 'Details';
  button.dataset.gameSlug = game.slug;
  button.addEventListener('click', (): void => {
    button.dispatchEvent(
      new CustomEvent('open-game-details', {
        bubbles: true,
        detail: { slug: game.slug },
      }),
    );
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
  const title: HTMLHeadingElement = document.createElement('h1');
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
  sortButton.append(sortPrefix, sortValue);
  const options: HTMLUListElement = document.createElement('ul');
  options.className = 'library-sort__options';
  options.setAttribute('role', 'listbox');
  options.setAttribute('aria-label', 'Sort games');
  sort.append(sortButton, options);
  controls.append(chipViewport, sort);

  const grid: HTMLElement = document.createElement('section');
  grid.className = 'library-grid';
  grid.setAttribute('aria-label', 'Games');
  const pagination: HTMLElement = document.createElement('nav');
  pagination.className = 'library-pagination';
  pagination.setAttribute('aria-label', 'Library pages');
  const pageControls: HTMLDivElement = document.createElement('div');
  pageControls.className = 'library-pagination__controls';
  pagination.append(pageControls);
  page.append(intro, controls, grid, pagination);

  let state: LibraryState = readState();
  let categories: Category[] = [];
  let gameController: AbortController | undefined;
  const categoryController: AbortController = new AbortController();
  const media: MediaQueryList = matchMedia('(max-width: 600px)');
  let currentMeta: GamesResult['meta'] = {
    page: 1,
    totalPages: 1,
    totalItems: 0,
  };

  const renderControls: () => void = (): void => {
    chips.replaceChildren(
      ...categories.map((category: Category): HTMLButtonElement => {
        const chip: HTMLButtonElement = document.createElement('button');
        chip.type = 'button';
        chip.className = 'library-chip';
        chip.dataset.category = category.slug;
        chip.textContent = category.label;
        const isActive: boolean = state.category === category.slug;
        chip.classList.toggle('is-active', isActive);
        chip.setAttribute('aria-pressed', String(isActive));
        chip.addEventListener('click', (): void => {
          navigate({ ...state, category: category.slug, page: 1 });
        });
        return chip;
      }),
    );
    sortValue.textContent =
      SORT_OPTIONS.find(
        (option: { value: string; label: string }): boolean =>
          option.value === state.sort,
      )?.label ?? 'Rating ↓';
    options.replaceChildren(
      ...SORT_OPTIONS.map(
        (option: { value: string; label: string }): HTMLLIElement => {
          const item: HTMLLIElement = document.createElement('li');
          item.setAttribute('role', 'option');
          item.setAttribute(
            'aria-selected',
            String(option.value === state.sort),
          );
          item.classList.toggle('is-selected', option.value === state.sort);
          item.tabIndex = 0;
          item.textContent = option.label;
          const select: () => void = (): void => {
            sort.classList.remove('is-open');
            sortButton.setAttribute('aria-expanded', 'false');
            sortButton.focus();
            navigate({ ...state, sort: option.value, page: 1 });
          };
          item.addEventListener('click', select);
          item.addEventListener('keydown', (event: KeyboardEvent): void => {
            if (!(event.key === 'Enter' || event.key === ' ')) {
              return;
            }

            event.preventDefault();
            select();
          });
          return item;
        },
      ),
    );
  };
  const renderPagination: () => void = (): void => {
    const total: number = Math.max(1, currentMeta.totalPages);
    const current: number = Math.max(1, currentMeta.page);
    const visible: number = Math.min(media.matches ? 3 : 4, total);
    const start: number = Math.max(
      1,
      Math.min(current - Math.floor((visible - 1) / 2), total - visible + 1),
    );
    const previous: HTMLButtonElement = document.createElement('button');
    previous.type = 'button';
    previous.className = 'library-pagination__arrow';
    previous.setAttribute('aria-label', 'Previous page');
    previous.textContent = '‹';
    previous.disabled = current <= 1;
    previous.addEventListener('click', (): void => {
      navigate({ ...state, page: current - 1 });
    });
    const next: HTMLButtonElement = document.createElement('button');
    next.type = 'button';
    next.className = 'library-pagination__arrow';
    next.setAttribute('aria-label', 'Next page');
    next.textContent = '›';
    next.disabled = current >= total;
    next.addEventListener('click', (): void => {
      navigate({ ...state, page: current + 1 });
    });
    const buttons: HTMLDivElement = document.createElement('div');
    buttons.className = 'library-pagination__pages';
    for (let value: number = start; value < start + visible; value += 1) {
      const button: HTMLButtonElement = document.createElement('button');
      button.type = 'button';
      button.className = 'library-pagination__page';
      button.textContent = String(value);
      button.setAttribute('aria-label', `Page ${String(value)}`);
      button.classList.toggle('is-active', value === current);
      if (value === current) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', (): void => {
        navigate({ ...state, page: value });
      });
      buttons.append(button);
    }
    pageControls.replaceChildren(previous, buttons, next);
  };
  const loadGames: () => Promise<void> = async (): Promise<void> => {
    gameController?.abort();
    const controller: AbortController = new AbortController();
    gameController = controller;
    grid.replaceChildren(skeleton('Loading games'));
    try {
      const result: GamesResult = await getGames(
        state.category,
        state.sort,
        state.page,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      currentMeta = result.meta;
      grid.replaceChildren(
        ...(result.data.length > 0
          ? result.data.map((game: GameSummary): HTMLElement =>
              createGameCard(game),
            )
          : [emptyState('Data Not Found')]),
      );
      renderPagination();
    } catch {
      if (controller.signal.aborted) return;
      grid.replaceChildren(
        errorBanner('Could not load games.', (): void => {
          void loadGames();
        }),
      );
      notify('Could not load games.');
    }
  };
  const navigate: (next: LibraryState) => void = (next: LibraryState): void => {
    if (
      next.category === state.category &&
      next.sort === state.sort &&
      next.page === state.page
    )
      return;
    state = next;
    writeState(state);
    renderControls();
    void loadGames();
  };
  const syncFromUrl: () => void = (): void => {
    state = readState();
    renderControls();
    void loadGames();
  };
  const loadCategories: () => Promise<void> = async (): Promise<void> => {
    chips.replaceChildren(skeleton('Loading categories'));
    try {
      categories = await getCategories(categoryController.signal);
      if (categoryController.signal.aborted) return;
      if (!new URLSearchParams(location.search).has('category'))
        state.category =
          categories.find((item: Category): boolean => item.isDefault)?.slug ??
          'all';
      renderControls();
    } catch {
      if (categoryController.signal.aborted) return;
      chips.replaceChildren(
        errorBanner('Could not load categories.', (): void => {
          void loadCategories();
        }),
      );
      notify('Could not load categories.');
    }
  };
  sortButton.addEventListener('click', (): void => {
    const isOpen: boolean | undefined = !sort.classList.contains('is-open');
    sort.classList.toggle('is-open', isOpen);
    sortButton.setAttribute('aria-expanded', String(isOpen));
  });
  page.addEventListener('click', (event: MouseEvent): void => {
    if (!(event.target instanceof Node) || sort.contains(event.target)) {
      return;
    }

    sort.classList.remove('is-open');
    sortButton.setAttribute('aria-expanded', 'false');
  });
  page.addEventListener('route-change', syncFromUrl);
  media.addEventListener('change', renderPagination);
  page.addEventListener(
    'page-disconnect',
    (): void => {
      gameController?.abort();
      categoryController.abort();
      media.removeEventListener('change', renderPagination);
    },
    { once: true },
  );
  renderControls();
  renderPagination();
  void loadCategories();
  void loadGames();
  return page;
}
