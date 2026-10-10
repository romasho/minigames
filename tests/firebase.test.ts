import { it, expect, vi, beforeEach } from 'vitest';
import { profile } from './fixtures';

const sdk = vi.hoisted(() => ({
  initializeApp: vi.fn(() => ({})),
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('firebase/app', () => ({ initializeApp: sdk.initializeApp }));
vi.mock('firebase/auth', () => ({ ...sdk, GoogleAuthProvider: class {} }));
const user = {
  displayName: profile.displayName,
  email: profile.email,
  photoURL: 'https://example.com/photo.jpg',
  getIdToken: vi.fn().mockResolvedValue('firebase-token'),
};
const firebaseAuth = {
  currentUser: user as typeof user | null,
  authStateReady: vi.fn().mockResolvedValue(undefined),
};
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  sdk.signOut.mockResolvedValue(undefined);
  sdk.deleteUser.mockResolvedValue(undefined);
  firebaseAuth.currentUser = user;
  firebaseAuth.authStateReady.mockResolvedValue(undefined);
  user.getIdToken.mockResolvedValue('firebase-token');
  sdk.getAuth.mockReturnValue(firebaseAuth);
});

function configure(): void {
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test');
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com');
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test');
  vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app');
}

it('reports missing configuration and supports unconfigured guest startup', async () => {
  vi.stubEnv('VITE_FIREBASE_API_KEY', '');
  const auth = await import('../src/services/firebase');
  await auth.logoutFirebase();
  expect(sdk.signOut).not.toHaveBeenCalled();
  await expect(auth.login('a@b.com', 'abcdef')).rejects.toThrow(
    'not configured',
  );
  expect(
    auth.authError(new Error('Firebase is not configured. Setup')),
  ).toContain('not configured');
  const listener = vi.fn();
  const stop = auth.subscribeFirebaseIdentity(listener);
  await vi.advanceTimersByTimeAsync(0);
  expect(auth.getFirebaseIdentity()).toBeNull();
  expect(listener).toHaveBeenCalledOnce();
  stop();
});
it('waits for restored Firebase identity, subscribes to account changes and cleans up', async () => {
  configure();
  let identityChanged: () => void = () => {};
  const unsubscribe = vi.fn();
  sdk.onAuthStateChanged.mockImplementation((_auth, callback) => {
    identityChanged = callback;
    return unsubscribe;
  });
  const auth = await import('../src/services/firebase');
  expect(auth.getFirebaseIdentity()).toBeUndefined();
  const listener = vi.fn();
  const stop = auth.subscribeFirebaseIdentity(listener);
  expect(auth.getFirebaseIdentity()).toBeUndefined();
  identityChanged();
  expect(auth.getFirebaseIdentity()).toEqual({
    ...profile,
    avatarUrl: user.photoURL,
  });
  firebaseAuth.currentUser = null;
  identityChanged();
  expect(auth.getFirebaseIdentity()).toBeNull();
  expect(listener).toHaveBeenCalledTimes(2);
  stop();
  expect(unsubscribe).toHaveBeenCalledOnce();
});
it('verifies the restored SDK account and token before allowing a mutation', async () => {
  configure();
  const auth = await import('../src/services/firebase');
  expect(await auth.hasValidFirebaseIdentity(profile.email)).toBe(true);
  expect(firebaseAuth.authStateReady).toHaveBeenCalledOnce();
  expect(user.getIdToken).toHaveBeenCalledOnce();
  expect(await auth.hasValidFirebaseIdentity('other@example.com')).toBe(false);
  firebaseAuth.currentUser = null;
  expect(await auth.hasValidFirebaseIdentity(profile.email)).toBe(false);
  expect(user.getIdToken).toHaveBeenCalledOnce();
});
it('does not accept an account switched while its token is loading', async () => {
  configure();
  user.getIdToken.mockImplementationOnce(async () => {
    firebaseAuth.currentUser = { ...user, email: 'other@example.com' };
    return 'old-token';
  });
  const auth = await import('../src/services/firebase');
  expect(await auth.hasValidFirebaseIdentity(profile.email)).toBe(false);
});
it('preserves token verification errors for a failed protected action', async () => {
  configure();
  user.getIdToken.mockRejectedValueOnce(new Error('revoked token'));
  const auth = await import('../src/services/firebase');
  await expect(auth.hasValidFirebaseIdentity(profile.email)).rejects.toThrow(
    'revoked token',
  );
});

it('reports recoverable account creation when rollback and sign-out fail, preserving the original cause', async () => {
  configure();
  const profileError = new Error('profile network failure');
  sdk.createUserWithEmailAndPassword.mockResolvedValue({ user });
  sdk.updateProfile.mockRejectedValueOnce(profileError);
  sdk.deleteUser.mockRejectedValueOnce(new Error('delete offline'));
  sdk.signOut.mockRejectedValueOnce(new Error('sign-out offline'));
  const auth = await import('../src/services/firebase');
  let failure: unknown;
  try {
    await auth.register(profile.email, 'secret', 'Alex');
  } catch (error) {
    failure = error;
  }
  expect(failure).toMatchObject({ cause: profileError });
  expect(auth.authError(failure)).toContain(
    'Try logging in with the same email and password',
  );
  expect(sdk.deleteUser).toHaveBeenCalledWith(user);
});
it('initializes once, signs in and converts only public profile data', async () => {
  configure();
  sdk.signInWithEmailAndPassword.mockResolvedValue({ user });
  const auth = await import('../src/services/firebase');
  expect(await auth.login(profile.email, 'secret')).toEqual({
    ...profile,
    avatarUrl: user.photoURL,
  });
  await auth.login(profile.email, 'secret');
  expect(sdk.initializeApp).toHaveBeenCalledTimes(1);
  expect(sdk.signInWithEmailAndPassword).toHaveBeenCalledWith(
    expect.any(Object),
    profile.email,
    'secret',
  );
  await auth.logoutFirebase();
  expect(sdk.signOut).toHaveBeenCalled();
});
it('registers the Firebase display name and rolls back only the fresh account after profile failure', async () => {
  configure();
  sdk.createUserWithEmailAndPassword.mockResolvedValue({ user });
  sdk.updateProfile
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error('profile failed'));
  const auth = await import('../src/services/firebase');
  expect(
    (await auth.register(profile.email, 'secret', 'Alex')).displayName,
  ).toBe('Alex');
  expect(sdk.updateProfile).toHaveBeenCalledWith(user, { displayName: 'Alex' });
  await expect(auth.register(profile.email, 'secret', 'Alex')).rejects.toThrow(
    'profile failed',
  );
  expect(sdk.deleteUser).toHaveBeenCalledWith(user);
});
it('uses Google popup and handles absent display name/avatar or email', async () => {
  configure();
  sdk.signInWithPopup
    .mockResolvedValueOnce({
      user: { email: profile.email, displayName: null, photoURL: null },
    })
    .mockResolvedValueOnce({ user: { email: null } });
  const auth = await import('../src/services/firebase');
  expect(await auth.loginGoogle()).toEqual({
    email: profile.email,
    displayName: '',
  });
  await expect(auth.loginGoogle()).rejects.toThrow('no email');
});
it.each([
  'auth/invalid-credential',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/email-already-in-use',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/popup-blocked',
  'auth/too-many-requests',
  'auth/network-request-failed',
  'unknown',
])('maps provider error %s to actionable feedback', async (code) => {
  const { authError } = await import('../src/services/firebase');
  expect(authError({ code })).not.toContain(code);
  expect(authError(null)).toContain('try again');
});
