/**
 * Creates a URL relative to the Vite base path.
 */
export function appUrl(path: string | undefined = ''): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}

export function libraryUrl(): string {
  return appUrl('library');
}

/**
 * Returns the application's route without the GitHub Pages repository prefix.
 */
export function getRoutePath(): string {
  const basePath: string = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path: string = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length)
    : location.pathname;

  return path || '/';
}
