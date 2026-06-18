import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatePresence, motion } from '@/shared/ui/CssMotion';

describe('CSS motion compatibility', () => {
  it('preserves DOM props without emitting blocked animation styles', () => {
    const { getByRole } = render(
      <motion.button
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        type="button"
      >
        محاسبه
      </motion.button>,
    );

    const button = getByRole('button', { name: 'محاسبه' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('animate');
    expect(button).not.toHaveAttribute('initial');
    expect(button).not.toHaveAttribute('style');
  });

  it('renders presence children without a wrapper element', () => {
    const { container } = render(
      <AnimatePresence>
        <motion.div exit={{ opacity: 0 }}>نتیجه</motion.div>
      </AnimatePresence>,
    );

    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild).not.toHaveAttribute('exit');
  });
});
