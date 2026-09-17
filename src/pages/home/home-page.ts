import './home-page.scss';

/**
 * Creates the home page container.
 */
export function createHomePage(): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.className = 'home-page';
  page.textContent = 'Minigames';
  return page;
}
