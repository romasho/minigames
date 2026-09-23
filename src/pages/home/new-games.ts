import { FEATURED_GAMES, type GameCard } from './home-data';
import './new-games.scss';

function createGameCard(game: GameCard): HTMLElement {
  const card = document.createElement('article');
  card.className = 'game-card';
  if (game.featured) card.classList.add('game-card--featured');
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
  }
  const viewport = document.createElement('div');
  viewport.className = 'games-carousel__viewport';
  const track = document.createElement('div');
  track.className = 'games-carousel__track';
  track.append(...FEATURED_GAMES.map((game: GameCard) => createGameCard(game)));
  viewport.append(track);
  headingRow.append(title, arrows);
  section.append(headingRow, viewport);
  return section;
}
