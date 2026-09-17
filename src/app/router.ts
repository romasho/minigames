import { createHomePage } from '../pages/home/home-page';

export enum RoutePath {
  Home = '/',
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

const routes: readonly [
  RouteDefinition<RoutePath.Home>,
  RouteDefinition<RoutePath.NotFound>,
] = [
  { path: RoutePath.Home, render: createHomePage },
  { path: RoutePath.NotFound, render: createNotFoundPage },
];

export const router: Router = {
  start(): HTMLElement {
    const currentPath: RoutePath = location.pathname as RoutePath;
    const route: RouteDefinition<RoutePath> =
      routes.find(
        (candidate: RouteDefinition<RoutePath>): boolean =>
          candidate.path === currentPath,
      ) ?? routes[1];

    return route.render();
  },
};
