import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  type Auth,
  type User,
  type UserCredential,
} from 'firebase/auth';
import type { Profile } from '../features/auth/profile';

const sdk: { auth?: Auth } = {};
function firebaseAuth(): Auth {
  if (sdk.auth) return sdk.auth;
  const options: FirebaseOptions = {
    apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY ?? ''),
    authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? ''),
    projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID ?? ''),
    appId: String(import.meta.env.VITE_FIREBASE_APP_ID ?? ''),
  };
  if (
    !options.apiKey ||
    !options.authDomain ||
    !options.projectId ||
    !options.appId
  )
    throw new Error(
      'Firebase is not configured. Follow the Firebase setup in README.',
    );
  sdk.auth = getAuth(initializeApp(options));
  return sdk.auth;
}

function toProfile(user: User): Profile {
  if (!user.email) throw new Error('This account has no email address.');
  return {
    displayName: user.displayName ?? '',
    email: user.email,
    ...(user.photoURL && { avatarUrl: user.photoURL }),
  };
}

export async function login(email: string, password: string): Promise<Profile> {
  const result: UserCredential = await signInWithEmailAndPassword(
    firebaseAuth(),
    email,
    password,
  );
  return toProfile(result.user);
}
export async function register(
  email: string,
  password: string,
  username: string,
): Promise<Profile> {
  const result: UserCredential = await createUserWithEmailAndPassword(
    firebaseAuth(),
    email,
    password,
  );
  const user: User = result.user;
  try {
    await updateProfile(user, { displayName: username });
    return { ...toProfile(user), displayName: username };
  } catch (error: unknown) {
    await signOut(firebaseAuth());
    throw error;
  }
}
export async function loginGoogle(): Promise<Profile> {
  const result: UserCredential = await signInWithPopup(
    firebaseAuth(),
    new GoogleAuthProvider(),
  );
  return toProfile(result.user);
}
export async function logoutFirebase(): Promise<void> {
  // No SDK identity exists when the project has not been configured yet.
  if (!sdk.auth && !import.meta.env.VITE_FIREBASE_API_KEY) return;
  await signOut(firebaseAuth());
}

export function authError(error: unknown): string {
  const code: unknown =
    typeof error === 'object' && error !== null && 'code' in error
      ? error.code
      : undefined;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password': {
      return 'Email or password is incorrect.';
    }
    case 'auth/email-already-in-use': {
      return 'This email is already registered. Try logging in.';
    }
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request': {
      return 'Google sign-in was canceled. Try again.';
    }
    case 'auth/popup-blocked': {
      return 'Allow popups to continue with Google.';
    }
    case 'auth/too-many-requests': {
      return 'Too many attempts. Please try again later.';
    }
    case 'auth/network-request-failed': {
      return 'Check your connection and try again.';
    }
    default: {
      return error instanceof Error &&
        error.message.startsWith('Firebase is not configured')
        ? error.message
        : 'Could not sign in. Please try again.';
    }
  }
}
