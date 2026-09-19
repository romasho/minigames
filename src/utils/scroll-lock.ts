const scrollLockOwners: Set<string> = new Set<string>();

function updateScrollLock(): void {
  document.body.classList.toggle('is-overlay-open', scrollLockOwners.size > 0);
}

/**
 * Keeps page scrolling locked while one or more overlays are open.
 */
export function lockScroll(owner: string): void {
  scrollLockOwners.add(owner);
  updateScrollLock();
}

/**
 * Releases the named overlay's scroll lock without affecting other overlays.
 */
export function unlockScroll(owner: string): void {
  scrollLockOwners.delete(owner);
  updateScrollLock();
}
