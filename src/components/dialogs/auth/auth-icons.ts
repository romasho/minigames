import type { FieldIcon } from './auth-types';

const iconPaths: Readonly<Record<FieldIcon | 'eye', string>> = {
  email:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
};

export function createIcon(name: FieldIcon | 'eye'): SVGSVGElement {
  const icon: SVGSVGElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '1.8');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  icon.innerHTML = iconPaths[name];
  return icon;
}

export function createGoogleIcon(): SVGSVGElement {
  const icon: SVGSVGElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );
  icon.setAttribute('viewBox', '0 0 18 18');
  icon.setAttribute('aria-hidden', 'true');
  icon.classList.add('auth-dialog__google-icon');
  icon.innerHTML =
    '<path fill="#4285f4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.716v2.26h2.909c1.702-1.567 2.684-3.874 2.684-6.616Z"/><path fill="#34a853" d="M9 18c2.43 0 4.468-.806 5.956-2.179l-2.91-2.26c-.806.54-1.835.86-3.046.86-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z"/><path fill="#fbbc05" d="M3.963 10.707A5.41 5.41 0 0 1 3.681 9c0-.592.102-1.168.282-1.707V4.961H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.039l3.007-2.332Z"/><path fill="#ea4335" d="M9 3.579c1.321 0 2.507.454 3.44 1.345l2.581-2.581C13.464.891 11.426 0 9 0A9 9 0 0 0 .956 4.961l3.007 2.332C4.672 5.164 6.656 3.579 9 3.579Z"/>';
  return icon;
}
