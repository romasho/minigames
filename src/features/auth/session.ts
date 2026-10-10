import {
  getFirebaseIdentity,
  logoutFirebase,
  subscribeFirebaseIdentity,
} from '../../services/firebase';
import { notify } from '../../components/feedback';
import type { Profile } from './profile';
import { isValidEmail } from './validation';

export const SESSION_KEY: string = [
  'minigames',
  'sholomickiyr',
  'app-session',
].join(':');
export const SESSION_LIFETIME: number = 5 * 60_000;
export interface AppSession extends Profile {
  authenticatedAt: number;
}
type Listener = (session: AppSession | null) => void;
const state: {
  active: AppSession | null;
  timer?: ReturnType<typeof setTimeout>;
} = { active: null };
const listeners: Set<Listener> = new Set<Listener>();

export function parseSession(raw: string, now: number): AppSession | null {
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value !== 'object' ||
      value === null ||
      !('displayName' in value) ||
      typeof value.displayName !== 'string' ||
      !('email' in value) ||
      typeof value.email !== 'string' ||
      !isValidEmail(value.email) ||
      !('authenticatedAt' in value) ||
      typeof value.authenticatedAt !== 'number' ||
      !Number.isFinite(value.authenticatedAt) ||
      value.authenticatedAt > now ||
      now - value.authenticatedAt >= SESSION_LIFETIME ||
      ('avatarUrl' in value && typeof value.avatarUrl !== 'string')
      ? null
      : {
          displayName: value.displayName,
          email: value.email,
          authenticatedAt: value.authenticatedAt,
          ...('avatarUrl' in value && { avatarUrl: String(value.avatarUrl) }),
        };
  } catch {
    return null;
  }
}

function publish(): void {
  clearTimeout(state.timer);
  if (state.active)
    state.timer = setTimeout(
      (): void => {
        getSession();
      },
      Math.max(0, state.active.authenticatedAt + SESSION_LIFETIME - Date.now()),
    );
  for (const listener of listeners) listener(state.active);
}

export function endSession(hasExpired?: boolean): void {
  state.active = null;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /*
    Storage may be blocked.
    */
  }
  publish();
  void logoutFirebase().catch((): void => {
    notify('Firebase sign-out failed. You are still in Guest Mode.');
  });
  if (hasExpired) notify('Your session has expired. Please sign in again.');
}

export function getSession(): AppSession | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(SESSION_KEY);
  } catch {
    raw = null;
  }
  const restored: AppSession | null = raw
    ? parseSession(raw, Date.now())
    : null;
  if (!restored) {
    if (raw !== null || state.active)
      endSession(
        state.active !== null || Boolean(raw?.includes('authenticatedAt')),
      );
    return null;
  }
  const identity: Profile | null | undefined = getFirebaseIdentity();
  if (identity?.email !== restored.email) {
    // Storage may arrive before Firebase's cross-tab identity notification.
    // Keep the candidate while restoring, but never expose it as signed in.
    if (state.active) {
      state.active = null;
      publish();
    }
    return null;
  }
  const verified: AppSession = {
    ...identity,
    authenticatedAt: restored.authenticatedAt,
  };
  if (JSON.stringify(verified) !== JSON.stringify(state.active)) {
    state.active = verified;
    publish();
  }
  return state.active;
}

export function createSession(profile: Profile): void {
  const identity: Profile | null | undefined = getFirebaseIdentity();
  if (identity?.email !== profile.email)
    throw new Error('Please sign in to continue.');
  const session: AppSession = {
    ...identity,
    authenticatedAt: Date.now(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    endSession();
    throw new Error('Browser storage is unavailable. Enable it to sign in.');
  }
  state.active = session;
  publish();
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener);
  return (): void => {
    listeners.delete(listener);
  };
}

function checkSession(): void {
  getSession();
}

export function startSession(): () => void {
  const unsubscribeIdentity: () => void =
    subscribeFirebaseIdentity(checkSession);
  checkSession();
  window.addEventListener('focus', checkSession);
  document.addEventListener('visibilitychange', checkSession);
  addEventListener('storage', checkSession);
  return (): void => {
    unsubscribeIdentity();
    clearTimeout(state.timer);
    window.removeEventListener('focus', checkSession);
    document.removeEventListener('visibilitychange', checkSession);
    removeEventListener('storage', checkSession);
  };
}
