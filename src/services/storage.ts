export interface StorageService {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

/**
 * Namespaced access to browser storage.
 */
export const storage: StorageService = {
  get(key: string): string | null {
    return localStorage.getItem(key);
  },
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  },
};
