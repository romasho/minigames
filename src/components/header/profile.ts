import {
  profileName,
  profileInitials,
  type Profile,
} from '../../features/auth/profile';
import { endSession } from '../../features/auth/session';

export function createProfile(profile: Profile): HTMLElement {
  const element: HTMLDivElement = document.createElement('div');
  element.className = 'app-header__profile';
  const name: string = profileName(profile);
  const avatar: HTMLSpanElement = document.createElement('span');
  avatar.className = 'app-header__avatar';
  avatar.textContent = profileInitials(name);
  avatar.setAttribute('aria-hidden', 'true');
  if (profile.avatarUrl) {
    const image: HTMLImageElement = document.createElement('img');
    image.alt = '';
    image.src = profile.avatarUrl;
    image.addEventListener(
      'error',
      (): void => {
        image.remove();
      },
      { once: true },
    );
    avatar.append(image);
  }
  const label: HTMLSpanElement = document.createElement('span');
  label.textContent = name;
  const logout: HTMLButtonElement = document.createElement('button');
  logout.type = 'button';
  logout.className = 'app-header__button app-header__button--secondary';
  logout.textContent = 'Logout';
  logout.addEventListener('click', (): void => {
    endSession();
  });
  element.append(avatar, label, logout);
  return element;
}
