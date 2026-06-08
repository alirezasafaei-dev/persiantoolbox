/**
 * Focus management utilities for accessibility
 * Helps with keyboard navigation and screen reader support
 */

export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = getFocusableElements(element);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') {
      return;
    }

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

export function getFocusableElements(element: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return Array.from(element.querySelectorAll(focusableSelectors.join(','))) as HTMLElement[];
}

export function restoreFocus(savedElement: HTMLElement | null): void {
  if (savedElement && document.contains(savedElement)) {
    savedElement.focus();
  }
}

export function saveFocus(): HTMLElement | null {
  return document.activeElement as HTMLElement;
}

export function moveToNextFocusable(current: HTMLElement, container?: HTMLElement): void {
  const focusableElements = container
    ? getFocusableElements(container)
    : getFocusableElements(document.body);

  const currentIndex = focusableElements.indexOf(current);
  const nextIndex = (currentIndex + 1) % focusableElements.length;
  focusableElements[nextIndex]?.focus();
}

export function moveToPreviousFocusable(current: HTMLElement, container?: HTMLElement): void {
  const focusableElements = container
    ? getFocusableElements(container)
    : getFocusableElements(document.body);

  const currentIndex = focusableElements.indexOf(current);
  const previousIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
  focusableElements[previousIndex]?.focus();
}

export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
