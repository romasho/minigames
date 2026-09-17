import logoUrl from '../../assets/images/minigames-logo.png';
import {
  type AuthDialogController,
  AuthMode,
  createAuthDialog,
} from '../dialogs/auth-dialog';
import './header.scss';

interface NavigationItem {
  readonly label: string;
  readonly isCurrent?: boolean;
}

const navigationItems: readonly NavigationItem[] = [
  { label: 'Home', isCurrent: true },
  { label: 'Games' },
  { label: 'Leaderboard' },
  { label: 'About' },
];

function createBrand(): HTMLAnchorElement {
  const brand: HTMLAnchorElement = document.createElement('a');
  brand.className = 'app-header__brand';
  brand.href = '/';
  brand.setAttribute('aria-label', 'MiniGames home');

  const logo: HTMLImageElement = document.createElement('img');
  logo.className = 'app-header__logo';
  logo.src = logoUrl;
  logo.alt = '';
  logo.width = 32;
  logo.height = 32;

  const name: HTMLSpanElement = document.createElement('span');
  name.textContent = 'MiniGames';
  brand.append(logo, name);
  return brand;
}

function createNavigation(className: string): HTMLElement {
  const navigation: HTMLElement = document.createElement('nav');
  navigation.className = className;
  navigation.setAttribute('aria-label', 'Primary navigation');

  for (const item of navigationItems) {
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = '/';
    link.textContent = item.label;
    if (item.isCurrent === true) {
      link.classList.add('is-current');
      link.setAttribute('aria-current', 'page');
    }
    navigation.append(link);
  }

  return navigation;
}

function createButton(label: string, className: string): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  return button;
}

function createMenuToggle(): HTMLButtonElement {
  const button: HTMLButtonElement = document.createElement('button');
  button.type = 'button';
  button.className = 'app-header__menu-toggle';
  button.setAttribute('aria-label', 'Open navigation menu');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'mobile-navigation');

  const lines: readonly HTMLSpanElement[] = Array.from(
    { length: 3 },
    (): HTMLSpanElement => document.createElement('span'),
  );
  for (const line of lines) {
    line.setAttribute('aria-hidden', 'true');
    button.append(line);
  }
  return button;
}

/**
 * Creates the shared unauthenticated application header.
 */
export function createHeader(): HTMLElement {
  const header: HTMLElement = document.createElement('header');
  header.className = 'app-header';

  const inner: HTMLDivElement = document.createElement('div');
  inner.className = 'app-header__inner';
  inner.append(createBrand());

  const desktopActions: HTMLDivElement = document.createElement('div');
  desktopActions.className = 'app-header__desktop-actions';
  desktopActions.append(createNavigation('app-header__navigation'));

  const loginButton: HTMLButtonElement = createButton(
    'Log In',
    'app-header__button app-header__button--secondary',
  );
  const signUpButton: HTMLButtonElement = createButton(
    'Sign Up',
    'app-header__button app-header__button--primary',
  );
  const authActions: HTMLDivElement = document.createElement('div');
  authActions.className = 'app-header__auth-actions';
  authActions.append(loginButton, signUpButton);
  desktopActions.append(authActions);

  const tabletActions: HTMLDivElement = document.createElement('div');
  tabletActions.className = 'app-header__tablet-actions';
  const tabletSignUpButton: HTMLButtonElement = createButton(
    'Sign Up',
    'app-header__button app-header__button--primary app-header__tablet-sign-up',
  );
  const menuToggle: HTMLButtonElement = createMenuToggle();
  tabletActions.append(tabletSignUpButton, menuToggle);
  inner.append(desktopActions, tabletActions);

  const mobileMenu: HTMLElement = document.createElement('aside');
  mobileMenu.id = 'mobile-navigation';
  mobileMenu.className = 'mobile-navigation';
  mobileMenu.setAttribute('aria-hidden', 'true');
  const mobileMenuHeader: HTMLDivElement = document.createElement('div');
  mobileMenuHeader.className = 'mobile-navigation__header';
  mobileMenuHeader.append(createBrand());
  const mobileNavigation: HTMLElement = createNavigation(
    'mobile-navigation__links',
  );
  const mobileActions: HTMLDivElement = document.createElement('div');
  mobileActions.className = 'mobile-navigation__actions';
  const mobileLoginButton: HTMLButtonElement = createButton(
    'Log In',
    'app-header__button app-header__button--mobile-secondary',
  );
  const mobileSignUpButton: HTMLButtonElement = createButton(
    'Sign Up',
    'app-header__button app-header__button--primary',
  );
  mobileActions.append(mobileLoginButton, mobileSignUpButton);
  mobileMenu.append(mobileMenuHeader, mobileNavigation, mobileActions);

  const authDialog: AuthDialogController = createAuthDialog();
  header.append(inner, mobileMenu, authDialog.element);

  const setMenuOpen: (isOpen: boolean) => void = (isOpen: boolean): void => {
    header.classList.toggle('is-menu-open', isOpen);
    document.body.classList.toggle('is-overlay-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Close navigation menu' : 'Open navigation menu',
    );
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  };

  const openAuth: (mode: AuthMode) => void = (mode: AuthMode): void => {
    setMenuOpen(false);
    authDialog.open(mode);
  };

  menuToggle.addEventListener('click', (): void => {
    setMenuOpen(!header.classList.contains('is-menu-open'));
  });
  mobileNavigation.addEventListener('click', (): void => {
    setMenuOpen(false);
  });
  loginButton.addEventListener('click', (): void => {
    openAuth(AuthMode.Login);
  });
  tabletSignUpButton.addEventListener('click', (): void => {
    openAuth(AuthMode.Register);
  });
  signUpButton.addEventListener('click', (): void => {
    openAuth(AuthMode.Register);
  });
  mobileLoginButton.addEventListener('click', (): void => {
    openAuth(AuthMode.Login);
  });
  mobileSignUpButton.addEventListener('click', (): void => {
    openAuth(AuthMode.Register);
  });
  document.addEventListener('keydown', (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !header.classList.contains('is-menu-open'))
      return;
    setMenuOpen(false);
    menuToggle.focus();
  });

  const desktopMedia: MediaQueryList = matchMedia('(width > 48rem)');
  desktopMedia.addEventListener(
    'change',
    (event: MediaQueryListEvent): void => {
      if (event.matches) setMenuOpen(false);
    },
  );

  return header;
}
