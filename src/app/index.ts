import { createFooter } from '../components/footer/footer';
import { createHeader } from '../components/header/header';
import { router } from './router';

/**
 * Starts the single-page application.
 */
export function startApp(): void {
  const root: HTMLElement = document.createElement('div');
  root.id = 'app';
  const header: ReturnType<typeof createHeader> = createHeader();
  root.append(header.element, router.start(), createFooter());
  document.body.append(root);

  window.addEventListener(
    'pagehide',
    (): void => {
      header.destroy();
    },
    { once: true },
  );
}
