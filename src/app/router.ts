import { createHomePage } from '../pages/home/home-page';
import { appUrl, getRoutePath } from './urls';

export enum RoutePath {
  Home = '/',
  Privacy = '/privacy',
  Terms = '/terms',
  NotFound = '*',
}

export interface RouteDefinition<TPath extends string = string> {
  path: TPath;
  render: () => HTMLElement;
}

export interface Router {
  start(): HTMLElement;
}

function createNotFoundPage(): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.textContent = 'Page not found';
  return page;
}

function createLegalPage(title: string, content: string): HTMLElement {
  const page: HTMLElement = document.createElement('main');
  page.className = 'legal-page';

  const heading: HTMLHeadingElement = document.createElement('h1');
  heading.textContent = title;
  const paragraph: HTMLParagraphElement = document.createElement('p');
  paragraph.textContent = content;
  const homeLink: HTMLAnchorElement = document.createElement('a');
  homeLink.href = appUrl();
  homeLink.textContent = 'Return to MiniGames home';
  page.append(heading, paragraph, homeLink);
  return page;
}

const routes: readonly RouteDefinition[] = [
  { path: RoutePath.Home, render: createHomePage },
  {
    path: RoutePath.Privacy,
    render: (): HTMLElement =>
      createLegalPage(
        'Privacy Policy',
        'MiniGames does not collect personal data in this demonstration application. Contact us before sharing account information.',
      ),
  },
  {
    path: RoutePath.Terms,
    render: (): HTMLElement =>
      createLegalPage(
        'Terms of Service',
        'MiniGames is a demonstration service. Use the site respectfully and do not submit production credentials.',
      ),
  },
  { path: RoutePath.NotFound, render: createNotFoundPage },
];

export const router: Router = {
  start(): HTMLElement {
    const currentPath: string = getRoutePath();
    const route: RouteDefinition = routes.find(
      (candidate: RouteDefinition): boolean => candidate.path === currentPath,
    ) ?? { path: RoutePath.NotFound, render: createNotFoundPage };

    return route.render();
  },
};
