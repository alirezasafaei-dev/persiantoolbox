import { render } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  AnimatedCard,
  FadeIn,
  FloatingElement,
  RespectfulAnimation,
} from '@/shared/ui/SimpleAnimations';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('SimpleAnimations', () => {
  it('maps delay props to CSS classes instead of inline styles', () => {
    const { container } = render(
      <FadeIn delay={0.15}>
        <div>content</div>
      </FadeIn>,
    );

    const element = container.firstElementChild as HTMLElement;
    expect(element.className).toContain('anim-delay-150');
    expect(element.getAttribute('style')).toBeNull();
  });

  it('maps floating duration to a CSS class', () => {
    const { container } = render(
      <FloatingElement duration={4}>
        <div>content</div>
      </FloatingElement>,
    );

    const element = container.firstElementChild as HTMLElement;
    expect(element.className).toContain('anim-duration-4');
    expect(element.getAttribute('style')).toBeNull();
  });

  it('keeps animated card and respectful animation class-based', () => {
    const animated = render(
      <AnimatedCard delay={0.3}>
        <div>card</div>
      </AnimatedCard>,
    );
    expect(animated.container.firstElementChild?.className).toContain('anim-delay-300');

    const respectful = render(
      <RespectfulAnimation animationClass="animate-fade-in-up" delay={0.2}>
        <div>motion</div>
      </RespectfulAnimation>,
    );
    expect(respectful.container.firstElementChild?.className).toContain('anim-delay-200');
    expect(respectful.container.firstElementChild?.getAttribute('style')).toBeNull();
  });
});
