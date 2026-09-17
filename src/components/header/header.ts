import './header.scss';

/**
 * Creates the shared application header.
 */
export function createHeader(): HTMLElement {
  const header: HTMLElement = document.createElement('header');
  header.className = 'app-header';
  return header;
}
