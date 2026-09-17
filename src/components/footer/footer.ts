import logoUrl from '../../assets/images/minigames-logo.png';
import codeIconUrl from '../../assets/icons/code-xml.svg';
import messageIconUrl from '../../assets/icons/message-square-text.svg';
import rssIconUrl from '../../assets/icons/rss.svg';
import shareIconUrl from '../../assets/icons/share-2.svg';
import './footer.scss';

interface FooterLinkGroup {
  readonly title: string;
  readonly links: readonly string[];
}

const FOOTER_LINK_GROUPS: readonly FooterLinkGroup[] = [
  { title: 'Explore', links: ['Home', 'Library', 'Categories', 'Tournaments'] },
  {
    title: 'Company',
    links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'],
  },
];

function createHomeLink(label: string): HTMLAnchorElement {
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = '/';
  link.textContent = label;
  return link;
}

function createBrand(): HTMLAnchorElement {
  const brand: HTMLAnchorElement = document.createElement('a');
  brand.className = 'app-footer__brand';
  brand.href = '/';
  brand.setAttribute('aria-label', 'MiniGames home');

  const logo: HTMLImageElement = document.createElement('img');
  logo.className = 'app-footer__logo';
  logo.src = logoUrl;
  logo.alt = '';
  logo.width = 32;
  logo.height = 32;

  const name: HTMLSpanElement = document.createElement('span');
  name.textContent = 'MiniGames';
  brand.append(logo, name);
  return brand;
}

function createLinkGroup(group: FooterLinkGroup): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className = 'app-footer__link-group';

  const title: HTMLHeadingElement = document.createElement('h2');
  title.textContent = group.title;

  const navigation: HTMLElement = document.createElement('nav');
  navigation.setAttribute('aria-label', `${group.title} links`);
  navigation.append(
    ...group.links.map((label: string) => createHomeLink(label)),
  );
  section.append(title, navigation);
  return section;
}

function createSocialLink(label: string, iconUrl: string): HTMLAnchorElement {
  const link: HTMLAnchorElement = createHomeLink('');
  link.className = 'app-footer__social-link';
  link.setAttribute('aria-label', label);

  const icon: HTMLImageElement = document.createElement('img');
  icon.src = iconUrl;
  icon.alt = '';
  icon.width = 16;
  icon.height = 16;
  link.append(icon);
  return link;
}

function createCommunityGroup(): HTMLElement {
  const section: HTMLElement = document.createElement('section');
  section.className =
    'app-footer__link-group app-footer__link-group--community';

  const title: HTMLHeadingElement = document.createElement('h2');
  title.textContent = 'Community';

  const links: HTMLDivElement = document.createElement('div');
  links.className = 'app-footer__social-links';
  links.append(
    createSocialLink('Share MiniGames', shareIconUrl),
    createSocialLink('MiniGames community', messageIconUrl),
    createSocialLink('MiniGames RSS feed', rssIconUrl),
  );
  section.append(title, links);
  return section;
}

function createCourseLink(): HTMLAnchorElement {
  const link: HTMLAnchorElement = document.createElement('a');
  link.className = 'app-footer__course-link';
  link.href = 'https://rs.school/courses/short-track';
  link.textContent = 'RS School';

  const mark: HTMLSpanElement = document.createElement('span');
  mark.className = 'app-footer__rs-mark';
  mark.setAttribute('aria-hidden', 'true');
  mark.textContent = 'RS';
  link.prepend(mark);
  return link;
}

function createDeveloperLink(): HTMLAnchorElement {
  const link: HTMLAnchorElement = document.createElement('a');
  link.className = 'app-footer__developer-link';
  link.href = 'https://github.com/romasho';
  link.setAttribute('aria-label', 'Developer romasho on GitHub');

  const icon: HTMLSpanElement = document.createElement('span');
  icon.className = 'app-footer__developer-icon';
  icon.setAttribute('aria-hidden', 'true');
  const image: HTMLImageElement = document.createElement('img');
  image.src = codeIconUrl;
  image.alt = '';
  image.width = 12;
  image.height = 12;
  icon.append(image);

  const label: HTMLSpanElement = document.createElement('span');
  label.textContent = '@romasho';
  link.append(icon, label);
  return link;
}

/**
 * Creates the shared application footer.
 */
export function createFooter(): HTMLElement {
  const footer: HTMLElement = document.createElement('footer');
  footer.className = 'app-footer';

  const inner: HTMLDivElement = document.createElement('div');
  inner.className = 'app-footer__inner';
  const content: HTMLDivElement = document.createElement('div');
  content.className = 'app-footer__content';

  const introduction: HTMLDivElement = document.createElement('div');
  introduction.className = 'app-footer__introduction';
  const description: HTMLParagraphElement = document.createElement('p');
  description.textContent =
    'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.';
  introduction.append(createBrand(), description);

  content.append(
    introduction,
    ...FOOTER_LINK_GROUPS.map((group: FooterLinkGroup) =>
      createLinkGroup(group),
    ),
    createCommunityGroup(),
  );

  const legal: HTMLDivElement = document.createElement('div');
  legal.className = 'app-footer__legal';
  const copyright: HTMLSpanElement = document.createElement('span');
  copyright.className = 'app-footer__copyright';
  copyright.textContent = '© 2026 MiniGames. All rights reserved.';
  const credit: HTMLSpanElement = document.createElement('span');
  credit.className = 'app-footer__credit';
  credit.textContent = 'Designed with love';
  legal.append(copyright, createCourseLink(), createDeveloperLink(), credit);

  inner.append(content, legal);
  footer.append(inner);
  return footer;
}
