import { startApp } from './app';
import './styles/globals.scss';

const deepLink: string | null = sessionStorage.getItem('minigames-deep-link');
if (deepLink?.startsWith(import.meta.env.BASE_URL)) {
  sessionStorage.removeItem('minigames-deep-link');
  history.replaceState(null, '', deepLink);
}
startApp();
