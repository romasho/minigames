import heroBackgroundUrl from '../../assets/images/hero-background.png';
import './hero.scss';

export function createHeroSection(): HTMLElement {
  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.setAttribute('aria-labelledby', 'hero-title');
  const background = document.createElement('img');
  background.className = 'hero__background';
  background.src = heroBackgroundUrl;
  background.alt = '';
  background.setAttribute('aria-hidden', 'true');
  const overlay = document.createElement('div');
  overlay.className = 'hero__overlay';
  overlay.setAttribute('aria-hidden', 'true');
  const content = document.createElement('div');
  content.className = 'hero__content';
  const title = document.createElement('h1');
  title.id = 'hero-title';
  title.textContent = 'Take a Short Break & Have Fun';
  const description = document.createElement('p');
  const desktopDescription = document.createElement('span');
  desktopDescription.className = 'hero__description--desktop';
  desktopDescription.textContent =
    'Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.';
  const mobileDescription = document.createElement('span');
  mobileDescription.className = 'hero__description--mobile';
  mobileDescription.textContent =
    'Discover hundreds of curated casual mini-games right in your browser.';
  description.append(desktopDescription, mobileDescription);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'hero__button';
  button.textContent = 'Browse Library';
  button.addEventListener('click', (): void =>
    document
      .querySelector('#new-games-title')
      ?.scrollIntoView({ behavior: 'smooth' }),
  );
  content.append(title, description, button);
  hero.append(background, overlay, content);
  return hero;
}
