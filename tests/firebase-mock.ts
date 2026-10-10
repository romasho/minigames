import { vi } from 'vitest';
import type { Profile } from '../src/features/auth/profile';

let identity: Profile | null | undefined = null;
const listeners = new Set<() => void>();

export function setFirebaseIdentity(profile: Profile | null | undefined): void {
  identity = profile;
  for (const listener of listeners) listener();
}

export function resetFirebaseMock(): void {
  identity = null;
  listeners.clear();
  firebaseMock.hasValidFirebaseIdentity.mockReset();
  firebaseMock.hasValidFirebaseIdentity.mockImplementation(
    async (email: string) => identity?.email === email,
  );
}

export const firebaseMock = {
  getFirebaseIdentity: (): Profile | null | undefined => identity,
  subscribeFirebaseIdentity: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  hasValidFirebaseIdentity: vi.fn(
    async (email: string) => identity?.email === email,
  ),
  logoutFirebase: vi.fn().mockResolvedValue(undefined),
  login: vi.fn(),
  register: vi.fn(),
  loginGoogle: vi.fn(),
  authError: () => 'Sign-in failed',
};
