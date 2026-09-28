import { createDeveloperSection } from './developer';
import { createHeroSection } from './hero';
import { createLeaderboardSection } from './leaderboard';
import { createNewGamesSection } from './new-games';
import './home-page.scss';

/**
 * Creates the Home page from its route-level sections.
 */
export function createHomePage(): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.className = 'home-page';
  page.id = 'top';
  const newGames = createNewGamesSection();
  page.append(
    createHeroSection(),
    newGames,
    createLeaderboardSection(),
    createDeveloperSection(),
  );
  page.addEventListener(
    'page-disconnect',
    (): void => {
      newGames.dispatchEvent(new Event('page-disconnect'));
    },
    { once: true },
  );
  return page;
}
