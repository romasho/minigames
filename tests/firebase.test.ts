import { it, expect, vi, beforeEach } from 'vitest';
import { profile } from './fixtures';

const sdk = vi.hoisted(() => ({
  initializeApp: vi.fn(() => ({})),
  getAuth: vi.fn(() => ({})),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('firebase/app', () => ({ initializeApp: sdk.initializeApp }));
vi.mock('firebase/auth', () => ({ ...sdk, GoogleAuthProvider: class {} }));
const user = {
  displayName: profile.displayName,
  email: profile.email,
  photoURL: 'https://example.com/photo.jpg',
};
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  sdk.signOut.mockResolvedValue(undefined);
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
it('registers the Firebase display name and signs out after a profile update failure', async () => {
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
  expect(sdk.signOut).toHaveBeenCalled();
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
