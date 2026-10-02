import { createFooter } from '../components/footer/footer';
import { createHeader } from '../components/header/header';
import { AuthMode } from '../components/dialogs/auth-dialog';
import { createGameDetailsDialog } from '../components/dialogs/game-details-dialog';
import { getRoutePath } from './urls';
import { renderRoute, router } from './router';

function updateQuery(key: string, value: string | null): void {
  const url: URL = new URL(location.href);
  if (value) url.searchParams.set(key, value);
  else url.searchParams.delete(key);
  history.pushState(null, '', url);
}

/**
 * Starts the custom History API router and restores shareable dialog state.
 */
export function startApp(): void {
  const root: HTMLElement = document.createElement('div');
  root.id = 'app';
  const header: ReturnType<typeof createHeader> = createHeader();
  const gameDetails: ReturnType<typeof createGameDetailsDialog> =
    createGameDetailsDialog();
  let page: HTMLElement = router.start();
  let currentPath: string = getRoutePath();
  root.append(header.element, page, createFooter(), gameDetails.element);
  document.body.append(root);

  const syncDialogs: () => void = (): void => {
    const parameters: URLSearchParams = new URLSearchParams(location.search);
    const slug: string | null = parameters.get('game');
    const auth: string | null = parameters.get('auth');
    if (slug) gameDetails.open(slug);
    else gameDetails.close();
    header.setAuthMode(
      auth === AuthMode.Login || auth === AuthMode.Register ? auth : null,
    );
  };
  const syncRoute: () => void = (): void => {
    const nextPath: string = getRoutePath();
    if (nextPath === currentPath) {
      page.dispatchEvent(new Event('route-change'));
    } else {
      page.dispatchEvent(new Event('page-disconnect'));
      const nextPage: HTMLElement = renderRoute(nextPath);
      page.replaceWith(nextPage);
      page = nextPage;
      currentPath = nextPath;
      header.setCurrentPage(nextPath);
      scrollTo({ top: 0, behavior: 'instant' });
    }
    syncDialogs();
  };

  root.addEventListener('open-game-details', (event: Event): void => {
    const target: EventTarget | null = event.target;
    if (!(target instanceof HTMLElement) || !target.dataset.gameSlug) return;
    updateQuery('game', target.dataset.gameSlug);
    syncDialogs();
  });
  gameDetails.element.addEventListener('close', (): void => {
    if (!new URLSearchParams(location.search).has('game')) return;
    const url: URL = new URL(location.href);
    url.searchParams.delete('game');
    history.replaceState(null, '', url);
  });
  root.addEventListener('request-auth', (event: Event): void => {
    if (!(event instanceof CustomEvent)) return;
    const detail: unknown = event.detail;
    if (typeof detail !== 'object' || detail === null || !('mode' in detail))
      return;
    const mode: unknown = detail.mode;
    if (mode !== AuthMode.Login && mode !== AuthMode.Register) return;
    updateQuery('auth', mode);
    syncDialogs();
  });
  root.addEventListener('auth-mode-change', (event: Event): void => {
    if (!(event instanceof CustomEvent)) return;
    const detail: unknown = event.detail;
    if (typeof detail !== 'object' || detail === null || !('mode' in detail))
      return;
    const mode: unknown = detail.mode;
    if (mode === AuthMode.Login || mode === AuthMode.Register)
      updateQuery('auth', mode);
  });
  root.addEventListener('auth-closed', (): void => {
    if (!new URLSearchParams(location.search).has('auth')) return;
    const url: URL = new URL(location.href);
    url.searchParams.delete('auth');
    history.replaceState(null, '', url);
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
    if (!destination.pathname.startsWith(basePath)) return;
    event.preventDefault();
    if (destination.href === location.href) return;
    history.pushState(null, '', destination);
    syncRoute();
  });

  addEventListener('popstate', syncRoute);
  syncDialogs();
  addEventListener(
    'pagehide',
    (): void => {
      page.dispatchEvent(new Event('page-disconnect'));
      header.destroy();
      removeEventListener('popstate', syncRoute);
    },
    { once: true },
  );
}
