import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DateDifferencePage from '@/components/features/date-tools/DateDifference';

function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('date difference regression coverage', () => {
  it.each([
    ['jalali', 'سال تاریخ شروع', '1405.5'],
    ['jalali', 'ماه تاریخ شروع', '1.5'],
    ['jalali', 'روز تاریخ شروع', '1.5'],
    ['gregorian', 'سال تاریخ شروع', '2026.5'],
    ['gregorian', 'ماه تاریخ شروع', '1.5'],
    ['gregorian', 'روز تاریخ شروع', '1.5'],
  ])('rejects a fractional date part in %s (%s)', (calendar, field, value) => {
    render(<DateDifferencePage />);
    if (calendar === 'gregorian') {
      fireEvent.click(screen.getByRole('button', { name: 'تاریخ میلادی' }));
    }
    const year = calendar === 'jalali' ? '1405' : '2026';
    change('سال تاریخ شروع', year);
    change('ماه تاریخ شروع', '1');
    change('روز تاریخ شروع', '1');
    change('سال تاریخ پایان', year);
    change('ماه تاریخ پایان', '1');
    change('روز تاریخ پایان', '2');
    expect(screen.getByText('نتیجه اختلاف دو تاریخ')).toBeInTheDocument();

    change(field, value);

    expect(screen.getByRole('alert')).toHaveTextContent('تاریخ واردشده معتبر نیست');
    expect(screen.queryByText('نتیجه اختلاف دو تاریخ')).not.toBeInTheDocument();
  });

  it('keeps focus on a date field while the user types multiple digits', () => {
    render(<DateDifferencePage />);

    const yearInput = screen.getByLabelText('سال تاریخ شروع');
    yearInput.focus();
    expect(yearInput).toHaveFocus();

    fireEvent.change(yearInput, { target: { value: '1' } });

    expect(screen.getByLabelText('سال تاریخ شروع')).toHaveFocus();
  });

  it('calculates an exact one-day difference for consecutive Jalali dates', () => {
    render(<DateDifferencePage />);

    change('سال تاریخ شروع', '1405');
    change('ماه تاریخ شروع', '1');
    change('روز تاریخ شروع', '1');
    change('سال تاریخ پایان', '1405');
    change('ماه تاریخ پایان', '1');
    change('روز تاریخ پایان', '2');

    expect(screen.getByText('نتیجه اختلاف دو تاریخ')).toBeInTheDocument();
    expect(screen.getByText('روز دقیق').previousElementSibling).toHaveTextContent('۱');
  });

  it('supports Gregorian leap-day boundaries', () => {
    render(<DateDifferencePage />);

    fireEvent.click(screen.getByRole('button', { name: 'تاریخ میلادی' }));
    change('سال تاریخ شروع', '2024');
    change('ماه تاریخ شروع', '2');
    change('روز تاریخ شروع', '28');
    change('سال تاریخ پایان', '2024');
    change('ماه تاریخ پایان', '3');
    change('روز تاریخ پایان', '1');

    expect(screen.getByText('روز دقیق').previousElementSibling).toHaveTextContent('۲');
  });

  it('rejects invalid calendar dates instead of producing a result', () => {
    render(<DateDifferencePage />);

    change('سال تاریخ شروع', '1405');
    change('ماه تاریخ شروع', '12');
    change('روز تاریخ شروع', '30');
    change('سال تاریخ پایان', '1405');
    change('ماه تاریخ پایان', '12');
    change('روز تاریخ پایان', '31');

    expect(screen.getByRole('alert')).toHaveTextContent('تاریخ واردشده معتبر نیست');
    expect(screen.queryByText('نتیجه اختلاف دو تاریخ')).not.toBeInTheDocument();
  });
});
