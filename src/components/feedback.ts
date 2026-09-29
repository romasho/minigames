import './feedback.scss';

export function skeleton(label: string): HTMLElement {
  const placeholder: HTMLElement = document.createElement('div');
  placeholder.className = 'api-skeleton';
  placeholder.setAttribute('role', 'status');
  placeholder.setAttribute('aria-label', label);
  placeholder.textContent = label;
  return placeholder;
}

export function emptyState(message: string): HTMLElement {
  const placeholder: HTMLElement = document.createElement('p');
  placeholder.className = 'api-empty';
  placeholder.textContent = message;
  return placeholder;
}

export function errorBanner(message: string, retry: () => void): HTMLElement {
  const banner: HTMLElement = document.createElement('div');
  banner.className = 'api-error';
  banner.setAttribute('role', 'alert');
  const text: HTMLSpanElement = document.createElement('span');
  text.textContent = message;
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Retry';
  button.addEventListener('click', retry);
  banner.append(text, button);
  return banner;
}

const noticeState: { timer?: ReturnType<typeof setTimeout> } = {};
export function notify(
  message: string,
  variant: 'success' | 'error' = 'error',
): void {
  const old: HTMLElement | null = document.querySelector('.api-snackbar');
  old?.remove();
  if (noticeState.timer !== undefined) clearTimeout(noticeState.timer);
  const notice: HTMLElement = document.createElement('div');
  notice.className = `api-snackbar api-snackbar--${variant}`;
  notice.setAttribute('role', 'status');
  notice.textContent = message;
  const close: HTMLButtonElement = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.textContent = '×';
  close.addEventListener('click', (): void => {
    notice.remove();
  });
  notice.append(close);
  document.body.append(notice);
  noticeState.timer = setTimeout((): void => {
    notice.remove();
  }, 4500);
}
