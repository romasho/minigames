/**
 * Returns a required DOM element or throws a descriptive error.
 */
export function requireElement(selector: string): HTMLElement {
  const element: HTMLElement | null = document.querySelector(selector);
  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element;
}
