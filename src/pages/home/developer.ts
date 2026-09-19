import developerIllustrationUrl from '../../assets/images/illustration-side.png';
import './developer.scss';

export function createDeveloperSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'game-developer';
  section.id = 'developers';
  section.setAttribute('aria-labelledby', 'game-developer-title');
  const content = document.createElement('div');
  content.className = 'game-developer__content';
  const title = document.createElement('h2');
  title.id = 'game-developer-title';
  title.textContent = 'Are You a Game Developer?';
  const description = document.createElement('p');
  description.className = 'game-developer__description';
  description.textContent =
    "Want to see your game on MiniGames? We're always looking for fun, engaging mini games to add to our platform. Submit your game and reach thousands of players!";
  const button = document.createElement('a');
  button.className = 'game-developer__button';
  button.href = 'mailto:developers@minigames.com?subject=Game%20submission';
  const icon = document.createElement('span');
  icon.className = 'game-developer__button-icon';
  icon.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.textContent = 'Submit Form';
  button.append(icon, label);
  const contact = document.createElement('p');
  contact.className = 'game-developer__contact';
  contact.textContent = 'or contact us at developers@minigames.com';
  const illustration = document.createElement('div');
  illustration.className = 'game-developer__illustration';
  illustration.setAttribute('aria-hidden', 'true');
  const image = document.createElement('img');
  image.src = developerIllustrationUrl;
  image.alt = '';
  image.className = 'game-developer__image';
  illustration.append(image);
  content.append(title, description, button, contact);
  section.append(content, illustration);
  return section;
}
