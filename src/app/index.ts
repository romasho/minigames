import { createFooter } from '../components/footer/footer';
import { createHeader } from '../components/header/header';
import { requireElement } from '../utils/dom';
import { router } from './router';

/**
 * Starts the single-page application.
 */
export function bootstrap(): void {
  const root: HTMLElement = requireElement('#app');
  root.append(createHeader(), router.start(), createFooter());
}
