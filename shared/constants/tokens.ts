/**
 * Persian Tools Design System Tokens
 * Based on docs/project-standards.md requirements
 */

export const tokens = {
  // Typography
  font: {
    family: {
      sans: 'var(--font-family-sans)',
    },
    size: {
      xs: '12px', // توضیحات ریز/متا
      sm: '14px', // متن ثانویه
      md: '16px', // متن اصلی
      lg: '18px', // تیتر کوچک
      xl: '20px', // تیتر صفحه
    },
    lineHeight: {
      tight: '1.2', // تیترها
      normal: '1.4', // تیترها
      relaxed: '1.8', // متن‌های طولانی
    },
  },

  // Spacing (4px scale)
  space: {
    1: 'var(--space-1)',
    2: 'var(--space-2)',
    3: 'var(--space-3)',
    4: 'var(--space-4)',
    5: 'var(--space-5)',
    6: 'var(--space-6)',
    8: 'var(--space-8)',
    10: 'var(--space-10)',
    12: 'var(--space-12)',
  },

  // Colors - Semantic naming
  color: {
    background: {
      DEFAULT: 'var(--bg-primary)',
      subtle: 'var(--bg-subtle)',
    },
    surface: {
      1: 'var(--surface-1)',
      2: 'var(--surface-2)',
      3: 'var(--surface-3)',
    },
    text: {
      DEFAULT: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)',
      inverted: 'var(--text-inverted)',
    },
    border: {
      DEFAULT: 'var(--border-default)',
      strong: 'var(--border-strong)',
    },
    primary: {
      DEFAULT: 'var(--color-primary)',
      hover: 'var(--color-primary-hover)',
      pressed: 'var(--color-primary-pressed)',
    },
    primaryScale: {
      50: 'var(--color-primary-50)',
      100: 'var(--color-primary-100)',
      200: 'var(--color-primary-200)',
      300: 'var(--color-primary-300)',
      400: 'var(--color-primary-400)',
      500: 'var(--color-primary-500)',
      600: 'var(--color-primary-600)',
      700: 'var(--color-primary-700)',
      800: 'var(--color-primary-800)',
      900: 'var(--color-primary-900)',
    },
    primaryRgb: 'var(--color-primary-rgb)',
    status: {
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      danger: 'var(--color-danger)',
      error: 'var(--color-danger)',
      info: 'var(--color-info)',
    },
    statusRgb: {
      success: 'var(--color-success-rgb)',
      warning: 'var(--color-warning-rgb)',
      danger: 'var(--color-danger-rgb)',
      info: 'var(--color-info-rgb)',
    },
  },

  // Border Radius
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
  },

  // Shadow
  shadow: {
    subtle: 'var(--shadow-subtle)',
    medium: 'var(--shadow-medium)',
  },

  // Motion
  motion: {
    duration: {
      fast: '0.15', // seconds
      medium: '0.22', // seconds
      modal: '0.24', // seconds
    },
    easing: {
      ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    },
  },

  // Breakpoints
  breakpoint: {
    sm: '360px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Container padding
  container: {
    padding: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px',
    },
    maxWidth: '1200px',
  },
} as const;

export const toolCategories = {
  financial: {
    primary: 'var(--color-financial)',
    name: 'مالی',
    icon: '💰',
  },
  document: {
    primary: 'var(--color-document)',
    name: 'مستندات',
    icon: '📄',
  },
  image: {
    primary: 'var(--color-image)',
    name: 'تصویر',
    icon: '🖼️',
  },
  utility: {
    primary: 'var(--color-utility)',
    name: 'کاربردی',
    icon: '🛠️',
  },
} as const;

// Type definitions for tokens
export type TokenKeys = typeof tokens;
export type ColorToken = keyof typeof tokens.color;
export type SpaceToken = keyof typeof tokens.space;
export type RadiusToken = keyof typeof tokens.radius;

// Helper functions for runtime access
export const getToken = {
  color: (name: ColorToken) => tokens.color[name],
  space: (name: SpaceToken) => tokens.space[name],
  radius: (name: RadiusToken) => tokens.radius[name],
  motion: (duration: keyof typeof tokens.motion.duration) => tokens.motion.duration[duration],
};

export const withAlpha = (rgbVar: string, alpha: number) => `rgb(${rgbVar} / ${alpha})`;

// CSS Variable names (matching index.css)
export const cssVars = {
  fontFamily: '--font-family-sans',
  color: {
    background: '--bg-primary',
    text: '--text-primary',
    border: '--border-primary',
    primary: '--color-primary',
  },
  space: {
    1: '--space-1',
    2: '--space-2',
    3: '--space-3',
    4: '--space-4',
    6: '--space-6',
    8: '--space-8',
  },
  radius: {
    sm: '--radius-sm',
    md: '--radius-md',
    lg: '--radius-lg',
  },
  motion: {
    fast: '--motion-fast',
    medium: '--motion-medium',
    ease: '--motion-ease',
  },
} as const;
