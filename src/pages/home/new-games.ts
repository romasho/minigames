import { FEATURED_GAMES, type GameCard } from './home-data';
import './new-games.scss';

function createGameCard(game: GameCard): HTMLElement {
  const card = document.createElement('article');
  card.className = 'game-card';
  const artwork = document.createElement('div');
  artwork.className = 'game-card__artwork';
  const image = document.createElement('img');
  image.className = 'game-card__image';
  image.src = game.imageUrl;
  image.alt = `${game.title} game preview`;
  const information = document.createElement('div');
  information.className = 'game-card__information';
  const title = document.createElement('h3');
  title.className = 'game-card__title';
  title.textContent = game.title;
  const statistics = document.createElement('div');
  statistics.className = 'game-card__statistics';
  const likes = document.createElement('span');
  likes.className = 'game-card__likes';
  likes.setAttribute('aria-label', `${game.likes} likes`);
  likes.textContent = `♥ ${game.likes}`;
  const rating = document.createElement('span');
  rating.className = 'game-card__rating';
  rating.setAttribute('aria-label', `${game.rating} out of 5 stars`);
  rating.textContent = `★ ${game.rating}`;
  artwork.append(image);
  statistics.append(rating, likes);
  information.append(title, statistics);
  card.append(artwork, information);
  const details: HTMLButtonElement = document.createElement('button');
  details.type = 'button';
  details.className = 'game-card__details-trigger';
  details.setAttribute('aria-label', `Details for ${game.title}`);
  details.addEventListener('click', (): void => {
    details.dispatchEvent(new Event('open-game-details', { bubbles: true }));
  });
  card.append(details);
  return card;
}

export function createNewGamesSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'games-carousel';
  section.setAttribute('aria-labelledby', 'new-games-title');
  const headingRow = document.createElement('div');
  headingRow.className = 'games-carousel__heading-row';
  const title = document.createElement('h2');
  title.id = 'new-games-title';
  title.textContent = 'New Games';
  const arrows = document.createElement('div');
  arrows.className = 'games-carousel__arrows';
  arrows.setAttribute('aria-label', 'Carousel navigation');
  const navigation: HTMLButtonElement[] = [];
  for (const [direction, symbol] of [
    ['Previous', '←'],
    ['Next', '→'],
  ] as const) {
    const arrow = document.createElement('button');
    arrow.type = 'button';
    arrow.className = 'games-carousel__arrow';
    arrow.setAttribute('aria-label', `${direction} slide`);
    arrow.textContent = symbol;
    arrows.append(arrow);
    navigation.push(arrow);
  }
  const viewport = document.createElement('div');
  viewport.className = 'games-carousel__viewport';
  viewport.setAttribute('aria-label', 'Featured games carousel');
  const track = document.createElement('div');
  track.className = 'games-carousel__track';
  const cards: HTMLElement[] = FEATURED_GAMES.map((game: GameCard) =>
    createGameCard(game),
  );
  track.append(...cards);
  viewport.append(track);
  headingRow.append(title, arrows);
  section.append(headingRow, viewport);

  const desktop = matchMedia('(width > 768px)');
  const interval = 4000;
  let center = 0;
  let remaining = interval;
  let deadline = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pointerId: number | undefined;
  let startX = 0;
  let startY = 0;
  let isSwiped = false;
  let isSuppressClick = false;

  const render = (): void => {
    const visibleDistance = desktop.matches ? 2 : 1;
    for (const [index, card] of cards.entries()) {
      const half = Math.floor(cards.length / 2);
      const offset =
        ((index - center + cards.length + half) % cards.length) - half;
      const previous = Number(card.dataset.slot);
      // A card crossing the loop seam is outside the viewport on both sides.
      card.classList.toggle('game-card--wrap', Math.abs(previous - offset) > 1);
      card.dataset.slot = String(offset);
      if (card.classList.contains('game-card--wrap'))
        card.getBoundingClientRect();
      const isVisible = Math.abs(offset) <= visibleDistance;
      card.setAttribute('aria-hidden', String(!isVisible));
      const trigger = card.querySelector<HTMLButtonElement>(
        '.game-card__details-trigger',
      );
      if (trigger) trigger.tabIndex = isVisible ? 0 : -1;
    }
    requestAnimationFrame((): void => {
      for (const card of cards) card.classList.remove('game-card--wrap');
    });
  };

  const stopTimer = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };

  const schedule = (duration: number): void => {
    stopTimer();
    remaining = duration;
    deadline = performance.now() + duration;
    timer = setTimeout((): void => {
      timer = undefined;
      center = (center + 1) % cards.length;
      render();
      schedule(interval);
    }, duration);
  };

  const move = (direction: number): void => {
    center = (center + direction + cards.length) % cards.length;
    render();
    schedule(interval);
  };

  navigation[0]?.addEventListener('click', (): void => {
    move(-1);
  });
  navigation[1]?.addEventListener('click', (): void => {
    move(1);
  });

  const finishPointer = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    pointerId = undefined;
    removeEventListener('pointerup', finishPointer);
    removeEventListener('pointercancel', finishPointer);
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    isSwiped =
      event.type === 'pointerup' &&
      Math.abs(deltaX) >= 35 &&
      Math.abs(deltaX) > Math.abs(deltaY);
    if (isSwiped) {
      isSuppressClick = true;
      move(deltaX < 0 ? 1 : -1);
    } else {
      schedule(remaining);
    }
  };

  viewport.addEventListener('pointerdown', (event: PointerEvent): void => {
    if (
      pointerId !== undefined ||
      (event.pointerType === 'mouse' && event.button !== 0)
    )
      return;
    pointerId = event.pointerId;
    isSuppressClick = false;
    startX = event.clientX;
    startY = event.clientY;
    isSwiped = false;
    remaining = Math.max(0, deadline - performance.now());
    stopTimer();
    addEventListener('pointerup', finishPointer);
    addEventListener('pointercancel', finishPointer);
  });
  viewport.addEventListener(
    'click',
    (event: MouseEvent): void => {
      if (!isSuppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      isSuppressClick = false;
    },
    { capture: true },
  );

  desktop.addEventListener('change', render);
  render();
  schedule(interval);
  section.addEventListener(
    'page-disconnect',
    (): void => {
      stopTimer();
      desktop.removeEventListener('change', render);
      removeEventListener('pointerup', finishPointer);
      removeEventListener('pointercancel', finishPointer);
    },
    { once: true },
  );
  return section;
}
