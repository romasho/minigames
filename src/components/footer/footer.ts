import './footer.scss';

/**
 * Creates the shared application footer.
 */
export function createFooter(): HTMLElement {
  const footer: HTMLElement = document.createElement('footer');
  footer.className = 'app-footer';
  return footer;
}
