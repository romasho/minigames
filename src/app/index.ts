import { createFooter } from '../components/footer/footer';
import { createHeader } from '../components/header/header';
import { router } from './router';

/**
 * Starts the single-page application.
 */
export function bootstrap(): void {
  const root: HTMLElement = document.createElement('div');
  root.id = 'app';
  root.append(createHeader(), router.start(), createFooter());
  document.body.append(root);
}
