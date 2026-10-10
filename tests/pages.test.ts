import { it, expect, vi, beforeEach } from 'vitest';
import { createLibraryPage } from '../src/pages/library/library-page';
import { createNewGamesSection } from '../src/pages/home/new-games';
import { createLeaderboardSection } from '../src/pages/home/leaderboard';
import { renderRoute, router } from '../src/app/router';
import { formatDuration } from '../src/utils/format';
import { requireElement } from '../src/utils/dom';
import { lockScroll, unlockScroll } from '../src/utils/scroll-lock';
import { getGame, getCardImage, formatLikes } from '../src/data/games';
import { storage } from '../src/services/storage';
import { profile, publicResponse, response } from './fixtures';
import { required, settle, setMedia } from './setup';
import { endSession } from '../src/features/auth/session';
import {
  emptyState,
  errorBanner,
  notify,
  skeleton,
  withSkeleton,
} from '../src/components/feedback';

vi.mock('../src/services/firebase', () => ({
  logoutFirebase: vi.fn().mockResolvedValue(undefined),
}));
beforeEach(() => {
  endSession();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => publicResponse(url)),
  );
});

it('loads the library, sends category/sort/page changes to the server and synchronizes URLs', async () => {
  const page = createLibraryPage();
  document.body.append(page);
  await settle();
  expect(page.textContent).toContain('Tiny Glade');
  expect(
    required<HTMLButtonElement>(page, '[aria-label="Previous page"]').disabled,
  ).toBe(true);
  const details = vi.fn();
  page.addEventListener('open-game-details', details);
  required<HTMLButtonElement>(page, '.library-card button').click();
  expect(details).toHaveBeenCalledTimes(1);
  required<HTMLButtonElement>(page, '[data-category=cozy]').click();
  await settle();
  expect(location.search).toContain('category=cozy');
  expect(fetch).toHaveBeenLastCalledWith(
    expect.stringContaining('category=cozy&sort=rating-desc&page=1'),
    expect.any(Object),
  );
  required<HTMLButtonElement>(page, '.library-sort__trigger').click();
  expect(
    required(page, '.library-sort__trigger').getAttribute('aria-expanded'),
  ).toBe('true');
  required(page, '.library-sort__options li:nth-child(3)').dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
  );
  await settle();
  expect(location.search).toContain('sort=name-asc');
  required<HTMLButtonElement>(page, '[aria-label="Next page"]').click();
  await settle();
  expect(location.search).toContain('page=2');
  required<HTMLButtonElement>(page, '[aria-label="Previous page"]').click();
  await settle();
  required<HTMLButtonElement>(page, '[aria-label="Page 3"]').click();
  await settle();
  expect(location.search).toContain('page=3');
  setMedia('(max-width: 600px)', true);
  expect(page.querySelectorAll('.library-pagination__page')).toHaveLength(3);
  history.replaceState(null, '', '/library?category=all&sort=wrong&page=-1');
  page.dispatchEvent(new Event('route-change'));
  await settle();
  expect(fetch).toHaveBeenLastCalledWith(
    expect.stringContaining('category=all&sort=rating-desc&page=1'),
    expect.any(Object),
  );
  required<HTMLButtonElement>(page, '.library-sort__trigger').click();
  page.click();
  expect(
    required(page, '.library-sort__trigger').getAttribute('aria-expanded'),
  ).toBe('false');
  page.dispatchEvent(new Event('page-disconnect'));
});
it('recovers library errors and handles empty/out-of-range server pages', async () => {
  vi.mocked(fetch).mockImplementation(async (url) =>
    String(url).includes('/categories')
      ? response({}, 500)
      : publicResponse(String(url)),
  );
  const page = createLibraryPage();
  document.body.append(page);
  await settle();
  expect(page.textContent).toContain('Could not load categories');
  vi.mocked(fetch).mockImplementation(async (url) =>
    publicResponse(String(url)),
  );
  required<HTMLButtonElement>(
    page,
    '.library-controls .api-error button',
  ).click();
  await settle();
  expect(page.textContent).toContain('All Games');
  vi.mocked(fetch).mockResolvedValueOnce(response({}, 500));
  required<HTMLButtonElement>(page, '[aria-label="Next page"]').click();
  await settle();
  expect(page.textContent).toContain('Could not load games');
  required<HTMLButtonElement>(page, '.library-grid .api-error button').click();
  await settle();
  expect(page.textContent).toContain('Tiny Glade');
  vi.mocked(fetch).mockResolvedValueOnce(
    response({ data: [], meta: { page: 3, totalPages: 1, totalItems: 0 } }),
  );
  required<HTMLButtonElement>(page, '[aria-label="Next page"]').click();
  await settle(1000);
  expect(location.search).toContain('page=1');
  vi.mocked(fetch).mockResolvedValueOnce(
    response({ data: [], meta: { page: 1, totalPages: 1, totalItems: 0 } }),
  );
  page.dispatchEvent(new Event('route-change'));
  await settle();
  expect(page.textContent).toContain('Data Not Found');
  page.dispatchEvent(new Event('page-disconnect'));
});
it('moves the carousel through controls, autoplay and swipes without opening a game on swipe', async () => {
  const section = createNewGamesSection();
  document.body.append(section);
  await settle();
  const first = required(section, '.game-card');
  const initial = first.getAttribute('data-slot');
  required<HTMLButtonElement>(section, '[aria-label="Next slide"]').click();
  expect(first.getAttribute('data-slot')).not.toBe(initial);
  required<HTMLButtonElement>(section, '[aria-label="Previous slide"]').click();
  expect(first.getAttribute('data-slot')).toBe(initial);
  await settle(4000);
  expect(first.getAttribute('data-slot')).not.toBe(initial);
  setMedia('(width > 768px)', true);
  expect(
    section.querySelectorAll('.game-card[aria-hidden=false]'),
  ).toHaveLength(5);
  const opened = vi.fn();
  section.addEventListener('open-game-details', opened);
  const viewport = required(section, '.games-carousel__viewport');
  const pointer = (type: string, x: number) =>
    Object.assign(
      new MouseEvent(type, { clientX: x, clientY: 10, bubbles: true }),
      { pointerId: 1, pointerType: 'touch' },
    );
  viewport.dispatchEvent(pointer('pointerdown', 150));
  window.dispatchEvent(pointer('pointerup', 20));
  required<HTMLButtonElement>(section, '.game-card__details-trigger').click();
  expect(opened).not.toHaveBeenCalled();
  required<HTMLButtonElement>(section, '.game-card__details-trigger').click();
  expect(opened).toHaveBeenCalledTimes(1);
  viewport.dispatchEvent(pointer('pointerdown', 20));
  window.dispatchEvent(pointer('pointercancel', 25));
  section.dispatchEvent(new Event('page-disconnect'));
});
it('shows carousel/leaderboard failure recovery and empty states', async () => {
  vi.mocked(fetch).mockResolvedValueOnce(response({}, 500));
  const carousel = createNewGamesSection();
  document.body.append(carousel);
  await settle();
  expect(carousel.textContent).toContain('Could not load featured games');
  vi.mocked(fetch).mockResolvedValueOnce(response({ data: [] }));
  required<HTMLButtonElement>(carousel, '.api-error button').click();
  await settle();
  expect(carousel.textContent).toContain('No featured games yet');
  carousel.dispatchEvent(new Event('page-disconnect'));
  vi.mocked(fetch).mockResolvedValueOnce(response({}, 500));
  const leaders = createLeaderboardSection();
  document.body.append(leaders);
  await settle();
  expect(leaders.textContent).toContain('Could not load leaderboard');
  required<HTMLButtonElement>(leaders, '.api-error button').click();
  await settle();
  expect(required(leaders, 'tbody').textContent).toContain('123,456');
  expect(required(leaders, 'tbody').textContent).toContain('Alex');
  leaders.dispatchEvent(new Event('page-disconnect'));
  vi.mocked(fetch).mockResolvedValueOnce(response({ data: [] }));
  const empty = createLeaderboardSection();
  document.body.append(empty);
  await settle();
  expect(empty.textContent).toContain('No players yet');
  empty.dispatchEvent(new Event('page-disconnect'));
});
it('renders legal, missing and home routes with useful navigation links', async () => {
  expect(renderRoute('/privacy').textContent).toContain('Privacy Policy');
  expect(renderRoute('/terms').textContent).toContain('Terms of Service');
  expect(renderRoute('/missing').textContent).toContain('Page Not Found');
  history.replaceState(null, '', '/missing');
  expect(router.start().textContent).toContain('Page Not Found');
  const home = renderRoute('/');
  document.body.append(home);
  await settle();
  expect(home.textContent).toContain('New Games');
  expect(home.querySelector('a[href^="mailto:"]')).not.toBeNull();
  home.dispatchEvent(new Event('page-disconnect'));
});
it('keeps shared scroll locks independent and uses namespaced storage access', () => {
  lockScroll('first');
  lockScroll('second');
  unlockScroll('first');
  expect(document.body.classList.contains('is-overlay-open')).toBe(true);
  unlockScroll('second');
  expect(document.body.classList.contains('is-overlay-open')).toBe(false);
  storage.set('minigames:test', profile.email);
  expect(storage.get('minigames:test')).toBe(profile.email);
  expect(formatDuration(125)).toBe('2:05');
  expect(formatLikes(1250)).toBe('1.2K');
  expect(formatLikes(99)).toBe('99');
  expect(getCardImage(getGame('tiny-glade'))).toContain('tiny-glade-card.jpg');
  expect(() => getGame('missing')).toThrow('Unknown game');
  expect(() =>
    getCardImage({ ...getGame('tiny-glade'), cardImage: '' }),
  ).toThrow('Missing card filename');
  expect(() =>
    getCardImage({ ...getGame('tiny-glade'), cardImage: '/missing.jpg' }),
  ).toThrow('Missing card artwork');
  expect(() => requireElement('#missing')).toThrow('Missing required element');
  const node = document.createElement('div');
  node.id = 'test';
  document.body.append(node);
  expect(requireElement('#test')).toBe(node);
});
it('announces errors safely, enforces minimum skeleton time and replaces notifications', async () => {
  expect(skeleton('Loading', 'comments').getAttribute('aria-label')).toBe(
    'Loading',
  );
  expect(emptyState('<b>none</b>').querySelector('b')).toBeNull();
  const retry = vi.fn();
  required<HTMLButtonElement>(errorBanner('Failed', retry), 'button').click();
  expect(retry).toHaveBeenCalledOnce();
  const promise = withSkeleton(Promise.resolve('data'), performance.now());
  let done = false;
  void promise.then(() => {
    done = true;
  });
  await settle(449);
  expect(done).toBe(false);
  await settle(1);
  expect(await promise).toBe('data');
  notify('first');
  notify('second', 'success');
  expect(document.querySelectorAll('.api-snackbar')).toHaveLength(1);
  required<HTMLButtonElement>(document, '.api-snackbar button').click();
  expect(document.querySelector('.api-snackbar')).toBeNull();
  notify('expires');
  await settle(4500);
  expect(document.querySelector('.api-snackbar')).toBeNull();
});
