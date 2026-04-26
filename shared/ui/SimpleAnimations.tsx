import type { ReactNode } from 'react';
import { useReducedMotion } from './useReducedMotion';

// CSS-based animation components following docs/project-standards.md
// These use CSS transitions instead of external animation libraries

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const delayClassMap: Record<string, string> = {
  '0': 'anim-delay-0',
  '0.1': 'anim-delay-100',
  '0.15': 'anim-delay-150',
  '0.2': 'anim-delay-200',
  '0.3': 'anim-delay-300',
};

const durationClassMap: Record<string, string> = {
  '2': 'anim-duration-2',
  '3': 'anim-duration-3',
  '4': 'anim-duration-4',
  '5': 'anim-duration-5',
};

function resolveDelayClass(delay: number): string {
  return delayClassMap[String(delay)] ?? 'anim-delay-0';
}

function resolveDurationClass(duration: number): string {
  return durationClassMap[String(duration)] ?? 'anim-duration-3';
}

export function AnimatedCard({ children, className = '', delay = 0 }: AnimatedCardProps) {
  return (
    <div
      className={`
        card
        animate-fade-in-up
        ${resolveDelayClass(delay)}
        ${className}
      `.trim()}
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
        ${resolveDelayClass(delay)}
        ${className}
      `.trim()}
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
        ${resolveDurationClass(duration)}
        ${className}
      `.trim()}
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
        ${resolveDelayClass(delay)}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}
