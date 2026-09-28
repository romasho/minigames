import { createFooter } from '../components/footer/footer';
import { createHeader } from '../components/header/header';
import { createGameDetailsDialog } from '../components/dialogs/game-details-dialog';
import { renderRoute, router } from './router';

/**
 * Starts the single-page application.
 */
export function startApp(): void {
  const root: HTMLElement = document.createElement('div');
  root.id = 'app';
  const header: ReturnType<typeof createHeader> = createHeader();
  const gameDetails: ReturnType<typeof createGameDetailsDialog> =
    createGameDetailsDialog();
  root.append(
    header.element,
    router.start(),
    createFooter(),
    gameDetails.element,
  );
  root.addEventListener('open-game-details', (): void => {
    gameDetails.open();
  });
  root.addEventListener('click', (event: MouseEvent): void => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const origin: EventTarget | null = event.target;
    if (!(origin instanceof Element)) return;
    const link: HTMLAnchorElement | null = origin.closest('a');
    if (!link || link.target || link.hasAttribute('download')) return;
    const destination: URL = new URL(link.href, location.href);
    if (destination.origin !== location.origin) return;
    const basePath: string = import.meta.env.BASE_URL.replace(/\/$/, '');
    const routePath: string = destination.pathname.startsWith(basePath)
      ? destination.pathname.slice(basePath.length) || '/'
      : destination.pathname;
    if (routePath !== '/' && routePath !== '/library') return;
    event.preventDefault();
    const page: HTMLElement | null =
      root.querySelector<HTMLElement>(':scope > main');
    page?.dispatchEvent(new Event('page-disconnect'));
    page?.replaceWith(renderRoute(routePath));
    header.setCurrentPage(routePath);
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  document.body.append(root);

  window.addEventListener(
    'pagehide',
    (): void => {
      root
        .querySelector<HTMLElement>(':scope > main')
        ?.dispatchEvent(new Event('page-disconnect'));
      header.destroy();
    },
    { once: true },
  );
}
