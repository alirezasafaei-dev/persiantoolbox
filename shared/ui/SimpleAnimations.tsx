import type { ReactNode } from 'react';
import { useReducedMotion } from './useReducedMotion';

// CSS-based animation components following docs/project-standards.md
// These use CSS transitions instead of external animation libraries

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  return (
    <div
      className={`
        card
        animate-fade-in-up
        ${className}
      `.trim()}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function FadeIn({ children, className = '', delay = 0, direction = 'up' }: FadeInProps) {
  const animationClass = {
    up: 'animate-fade-in-up',
    down: 'animate-fade-in-down',
    left: 'animate-fade-in-left',
    right: 'animate-fade-in-right',
  }[direction];

  return (
    <div
      className={`
        ${animationClass}
        ${className}
      `.trim()}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
}

export function FloatingElement({ children, className = '', duration = 3 }: FloatingElementProps) {
  return (
    <div
      className={`
        animate-float
        ${className}
      `.trim()}
      style={{ animationDuration: `${duration}s` }}
    >
      {children}
    </div>
  );
}

interface PulseElementProps {
  children: ReactNode;
  className?: string;
}

export function PulseElement({ children, className = '' }: PulseElementProps) {
  return <div className={`animate-pulse-subtle ${className}`}>{children}</div>;
}

// Component that respects reduced motion
interface RespectfulAnimationProps {
  children: ReactNode;
  className?: string;
  animationClass: string;
  delay?: number;
}

export function RespectfulAnimation({
  children,
  className = '',
  animationClass,
  delay = 0,
}: RespectfulAnimationProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`
        ${animationClass}
        ${className}
      `.trim()}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
