import './feedback.scss';

export type SkeletonKind =
  | 'carousel'
  | 'leaderboard'
  | 'library'
  | 'categories'
  | 'details'
  | 'comments';

const SKELETON_ITEMS: Record<SkeletonKind, number> = {
  carousel: 3,
  leaderboard: 5,
  library: 6,
  categories: 6,
  details: 1,
  comments: 3,
};
enum SkeletonDuration {
  Minimum = 450,
}

export function skeleton(label: string, kind: SkeletonKind): HTMLElement {
  const placeholder: HTMLElement = document.createElement('div');
  placeholder.className = `api-skeleton api-skeleton--${kind}`;
  placeholder.setAttribute('role', 'status');
  placeholder.setAttribute('aria-label', label);
  placeholder.append(
    ...Array.from({ length: SKELETON_ITEMS[kind] }, (): HTMLElement => {
      const item: HTMLElement = document.createElement('div');
      item.className = 'api-skeleton__item';
      item.setAttribute('aria-hidden', 'true');
      const media: HTMLElement = document.createElement('span');
      media.className = 'api-skeleton__media';
      const lines: HTMLElement = document.createElement('span');
      lines.className = 'api-skeleton__lines';
      item.append(media, lines);
      return item;
    }),
  );
  return placeholder;
}

async function waitForSkeleton(startedAt: number): Promise<void> {
  const remaining: number =
    SkeletonDuration.Minimum - (performance.now() - startedAt);
  if (remaining <= 0) return;
  await new Promise<void>((resolve: () => void): void => {
    setTimeout(resolve, remaining);
  });
}

export async function withSkeleton<T>(
  request: Promise<T>,
  startedAt: number,
): Promise<T> {
  try {
    return await request;
  } finally {
    await waitForSkeleton(startedAt);
  }
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
  container: HTMLElement = document.body,
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
  container.append(notice);
  noticeState.timer = setTimeout((): void => {
    notice.remove();
  }, 4500);
}
