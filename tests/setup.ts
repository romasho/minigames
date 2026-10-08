import { beforeEach, afterEach, vi } from 'vitest';

const media = new Map<string, MediaQueryList>();
export function setMedia(query: string, matches: boolean): void {
  const item = media.get(query);
  if (!item) return;
  Object.defineProperty(item, 'matches', {
    value: matches,
    configurable: true,
  });
  item.dispatchEvent(Object.assign(new Event('change'), { matches }));
}

beforeEach(() => {
  vi.useFakeTimers();
  media.clear();
  vi.stubGlobal('matchMedia', (query: string) => {
    const item = Object.assign(new EventTarget(), {
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
    });
    media.set(query, item as MediaQueryList);
    return item;
  });
  vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('PointerEvent', MouseEvent);
  Element.prototype.getAnimations = () => [];
  HTMLDialogElement.prototype.showModal = function (): void {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function (): void {
    if (!this.open) return;
    this.removeAttribute('open');
    const element = this;
    queueMicrotask(() => element.dispatchEvent(new Event('close')));
  };
  history.replaceState(null, '', '/');
  localStorage.clear();
});

afterEach(() => {
  window.dispatchEvent(new Event('pagehide'));
  document
    .querySelectorAll('main, .games-carousel, .leaderboard')
    .forEach((element) => element.dispatchEvent(new Event('page-disconnect')));
  document.body.replaceChildren();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

export async function settle(milliseconds = 500): Promise<void> {
  await vi.advanceTimersByTimeAsync(milliseconds);
}

export function required<T extends Element = HTMLElement>(
  root: ParentNode,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
}

export function fill(root: ParentNode, name: string, value: string): void {
  const input = required<HTMLInputElement>(root, `[name="${name}"]`);
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
