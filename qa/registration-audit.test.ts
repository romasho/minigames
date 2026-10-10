import { it, expect, vi, beforeEach } from 'vitest';
const sdk = vi.hoisted(() => ({
  initializeApp: vi.fn(() => ({})),
  getAuth: vi.fn(() => ({})),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  deleteUser: vi.fn(),
}));
vi.mock('firebase/app', () => ({ initializeApp: sdk.initializeApp }));
vi.mock('firebase/auth', () => ({
  ...sdk,
  GoogleAuthProvider: class {},
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
}));
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test');
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com');
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test');
  vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app');
});
it('QA: a profile update failure must allow the registration to be retried', async () => {
  let allocated = false;
  const user = { email: 'qa@example.com', displayName: null, photoURL: null };
  sdk.createUserWithEmailAndPassword.mockImplementation(async () => {
    if (allocated)
      throw Object.assign(new Error('Already registered'), {
        code: 'auth/email-already-in-use',
      });
    allocated = true;
    return { user };
  });
  sdk.updateProfile
    .mockRejectedValueOnce(new Error('Network failure'))
    .mockResolvedValue(undefined);
  sdk.deleteUser.mockImplementation(async () => {
    allocated = false;
  });
  const { register } = await import('../src/services/firebase');
  await expect(register(user.email, 'Audit7!', 'AuditTester')).rejects.toThrow(
    'Network failure',
  );
  await expect(
    register(user.email, 'Audit7!', 'AuditTester'),
  ).resolves.toMatchObject({ displayName: 'AuditTester' });
});
