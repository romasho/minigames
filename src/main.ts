import { startApp } from './app';
import './styles/globals.scss';

const deepLink: string | null = sessionStorage.getItem('minigames-deep-link');
if (deepLink?.startsWith(import.meta.env.BASE_URL)) {
  sessionStorage.removeItem('minigames-deep-link');
  history.replaceState(null, '', deepLink);
}
startApp();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  void navigator.serviceWorker
    .register(`${import.meta.env.BASE_URL}sw.js`)
    .catch((error: unknown): void => {
      console.warn('Could not enable offline access.', error);
    });
}
