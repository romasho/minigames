import './pwa-controls.scss';

interface InstallPromptEvent extends Event {
  prompt(): Promise<unknown>;
}

function isInstallPrompt(event: Event): event is InstallPromptEvent {
  return 'prompt' in event && typeof event.prompt === 'function';
}

export function createPwaControls(signal: AbortSignal): HTMLElement {
  const controls: HTMLDivElement = document.createElement('div');
  controls.className = 'pwa-controls';
  const status: HTMLParagraphElement = document.createElement('p');
  status.className = 'pwa-controls__status';
  status.setAttribute('role', 'status');
  const install: HTMLButtonElement = document.createElement('button');
  install.className = 'pwa-controls__install';
  install.type = 'button';
  install.textContent = 'Install MiniGames';
  const guidance: HTMLParagraphElement = document.createElement('p');
  guidance.className = 'pwa-controls__guidance';
  controls.append(status, install, guidance);

  const display: MediaQueryList = matchMedia('(display-mode: standalone)');
  const isIphone: boolean = /iPhone/i.test(navigator.userAgent);
  let prompt: InstallPromptEvent | undefined;
  const update: () => void = (): void => {
    const isStandalone: boolean =
      display.matches ||
      ('standalone' in navigator && navigator.standalone === true);
    status.textContent = navigator.onLine
      ? ''
      : 'Offline · You can browse the saved catalog.';
    const canInstall: boolean = !isStandalone && navigator.onLine;
    install.hidden = !prompt || !canInstall;
    guidance.textContent =
      !prompt && isIphone && canInstall
        ? 'To install on iPhone, open MiniGames in Safari, tap Share, then Add to Home Screen.'
        : '';
  };
  if (import.meta.env.PROD) {
    addEventListener(
      'beforeinstallprompt',
      (event: Event): void => {
        if (!isInstallPrompt(event)) return;
        event.preventDefault();
        prompt = event;
        update();
      },
      { signal },
    );
    addEventListener(
      'appinstalled',
      (): void => {
        prompt = undefined;
        update();
      },
      { signal },
    );
    install.addEventListener(
      'click',
      (): void => {
        if (!prompt) return;
        void prompt.prompt().catch((error: unknown): void => {
          console.warn('Could not open the install prompt.', error);
        });
        prompt = undefined;
        update();
      },
      { signal },
    );
  }
  display.addEventListener('change', update, { signal });
  addEventListener('online', update, { signal });
  addEventListener('offline', update, { signal });
  update();
  return controls;
}
