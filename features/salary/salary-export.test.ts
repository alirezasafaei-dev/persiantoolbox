import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadSalaryCsv, printSalaryReport, downloadPayslip } from './salary-export';
import type { SalaryOutput, MinimumWageOutput } from './salary.types';

beforeEach(() => {
  vi.restoreAllMocks();
});

function makeSalaryOutput(overrides?: Partial<SalaryOutput>): SalaryOutput {
  return {
    grossSalary: 20_000_000,
    netSalary: 15_000_000,
    summary: { insurance: 2_000_000, tax: 3_000_000, totalDeductions: 5_000_000 },
    ...overrides,
  };
}

function makeMinWageOutput(overrides?: Partial<MinimumWageOutput>): MinimumWageOutput {
  return {
    baseSalary: 10_000_000,
    housingAllowance: 1_000_000,
    foodAllowance: 500_000,
    childAllowance: 300_000,
    marriageAllowance: 200_000,
    seniorityAllowance: 150_000,
    totalGross: 12_150_000,
    insuranceAmount: 1_215_000,
    taxAmount: 500_000,
    netSalary: 10_435_000,
    ...overrides,
  };
}

describe('downloadSalaryCsv', () => {
  it('generates CSV for gross-to-net mode', () => {
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    let appendedLink: HTMLAnchorElement | null = null;
    const appendChild = vi.fn((el: Node) => {
      appendedLink = el as HTMLAnchorElement;
      return el;
    }) as unknown as typeof document.body.appendChild;
    const removeChild = vi.fn() as unknown as typeof document.body.removeChild;
    document.body.appendChild = appendChild;
    document.body.removeChild = removeChild;

    downloadSalaryCsv({
      mode: 'gross-to-net',
      inputs: { 'حقوق پایه': '۲۰,۰۰۰,۰۰۰' },
      result: makeSalaryOutput(),
      generatedAt: '۱۴۰۵/۰۱/۱۵',
    });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(appendChild).toHaveBeenCalledTimes(1);
    expect(removeChild).toHaveBeenCalledTimes(1);
    expect(appendedLink).not.toBeNull();
    const link = appendedLink as unknown as HTMLAnchorElement;
    expect(link.download).toMatch(/^salary-report-/);
    expect(link.href).toBe('blob:test');
  });

  it('generates CSV for minimum-wage mode', () => {
    const createObjectURL = vi.fn(() => 'blob:minwage');
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = vi.fn();

    document.body.appendChild = vi.fn() as unknown as typeof document.body.appendChild;
    document.body.removeChild = vi.fn() as unknown as typeof document.body.removeChild;

    downloadSalaryCsv({
      mode: 'minimum-wage',
      inputs: { سابقه: '۵ سال' },
      result: makeMinWageOutput(),
      generatedAt: '۱۴۰۵/۰۱/۱۵',
    });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('skips false/zero values in inputs', () => {
    URL.createObjectURL = vi.fn(() => 'blob:skip');
    URL.revokeObjectURL = vi.fn();
    document.body.appendChild = vi.fn() as unknown as typeof document.body.appendChild;
    document.body.removeChild = vi.fn() as unknown as typeof document.body.removeChild;

    expect(() =>
      downloadSalaryCsv({
        mode: 'net-to-gross',
        inputs: { valid: 'yes', empty: '', zero: '0', falseVal: 'false' },
        result: makeSalaryOutput(),
        generatedAt: '۱۴۰۵/۰۱/۱۵',
      }),
    ).not.toThrow();
  });
});

describe('printSalaryReport', () => {
  it('opens print window for gross-to-net mode', () => {
    const mockPrint = vi.fn();
    const mockWrite = vi.fn();
    const mockClose = vi.fn();
    const mockWindow = {
      document: { write: mockWrite, close: mockClose },
      print: mockPrint,
    } as unknown as Window;
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockWindow);

    printSalaryReport({
      mode: 'gross-to-net',
      inputs: { 'حقوق پایه': '۲۰,۰۰۰,۰۰۰' },
      result: makeSalaryOutput(),
      generatedAt: '۱۴۰۵/۰۱/۱۵',
    });

    expect(openSpy).toHaveBeenCalledWith('', '_blank');
    expect(mockWrite).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(mockPrint).toHaveBeenCalledTimes(1);

    const html = mockWrite.mock.calls[0]?.[0] as string | undefined;
    expect(html).toBeDefined();
    expect(html as string).toContain('گزارش محاسبه حقوق');
    expect(html as string).toContain('ناخالص به خالص');
    expect(html as string).toContain('تومان');
    expect(html as string).toMatch(/۲۰٬۰۰۰٬۰۰۰/);
    expect(html as string).toMatch(/۱۵٬۰۰۰٬۰۰۰/);
  });

  it('opens print window for minimum-wage mode', () => {
    const mockPrint = vi.fn();
    const mockWrite = vi.fn();
    const mockClose = vi.fn();
    const mockWindow = {
      document: { write: mockWrite, close: mockClose },
      print: mockPrint,
    } as unknown as Window;
    vi.spyOn(window, 'open').mockReturnValue(mockWindow);

    printSalaryReport({
      mode: 'minimum-wage',
      inputs: { سابقه: '۵ سال' },
      result: makeMinWageOutput(),
      generatedAt: '۱۴۰۵/۰۱/۱۵',
    });

    expect(mockPrint).toHaveBeenCalledTimes(1);
    const html = mockWrite.mock.calls[0]?.[0] as string | undefined;
    expect(html).toBeDefined();
    expect(html as string).toContain('حداقل حقوق');
    expect(html as string).toMatch(/۱۰٬۰۰۰٬۰۰۰/);
    expect(html as string).toMatch(/۱۰٬۴۳۵٬۰۰۰/);
  });

  it('handles window.open returning null', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);

    expect(() =>
      printSalaryReport({
        mode: 'gross-to-net',
        inputs: {},
        result: makeSalaryOutput(),
        generatedAt: '',
      }),
    ).not.toThrow();
  });
});

describe('downloadPayslip', () => {
  it('generates payslip for gross-to-net mode', () => {
    const mockPrint = vi.fn();
    const mockWrite = vi.fn();
    const mockClose = vi.fn();
    const mockWindow = {
      document: { write: mockWrite, close: mockClose },
      print: mockPrint,
    } as unknown as Window;
    vi.spyOn(window, 'open').mockReturnValue(mockWindow);

    downloadPayslip({
      mode: 'gross-to-net',
      inputs: { 'حقوق پایه': '۲۰,۰۰۰,۰۰۰' },
      result: makeSalaryOutput(),
      generatedAt: '۱۴۰۵/۰۱/۱۵',
    });

    expect(mockPrint).toHaveBeenCalledTimes(1);
    const html0 = mockWrite.mock.calls[0]?.[0] as string | undefined;
    expect(html0).toBeDefined();
    expect(html0 as string).toContain('فیش حقوقی');
    expect(html0 as string).toContain('تومان');
    expect(html0 as string).toContain('خالص');
  });

  it('generates payslip for minimum-wage mode', () => {
    const mockPrint = vi.fn();
    const mockWrite = vi.fn();
    const mockClose = vi.fn();
    const mockWindow = {
      document: { write: mockWrite, close: mockClose },
      print: mockPrint,
    } as unknown as Window;
    vi.spyOn(window, 'open').mockReturnValue(mockWindow);

    downloadPayslip({
      mode: 'minimum-wage',
      inputs: { سابقه: '۵ سال' },
      result: makeMinWageOutput(),
      generatedAt: '۱۴۰۵/۰۱/۱۵',
    });

    expect(mockPrint).toHaveBeenCalledTimes(1);
    const html1 = mockWrite.mock.calls[0]?.[0] as string | undefined;
    expect(html1).toBeDefined();
    expect(html1 as string).toContain('حداقل دستمزد');
    expect(html1 as string).toMatch(/۱۰٬۰۰۰٬۰۰۰/);
  });

  it('handles window.open returning null', () => {
    vi.spyOn(window, 'open').mockReturnValue(null);

    expect(() =>
      downloadPayslip({
        mode: 'gross-to-net',
        inputs: {},
        result: makeSalaryOutput(),
        generatedAt: '',
      }),
    ).not.toThrow();
  });
});
