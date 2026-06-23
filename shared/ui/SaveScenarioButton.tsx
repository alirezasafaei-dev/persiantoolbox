'use client';

import { useCallback } from 'react';
import { saveFinanceCalculation, type FinanceToolId } from '@/shared/analytics/financeSaved';
import Button from '@/shared/ui/Button';

type Props = {
  tool: FinanceToolId;
  title: string;
  summary: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  disabled?: boolean;
};

export default function SaveScenarioButton({
  tool,
  title,
  summary,
  input,
  output,
  disabled,
}: Props) {
  const handleSave = useCallback(() => {
    const calc: {
      tool: FinanceToolId;
      title: string;
      summary: string;
      input?: Record<string, unknown>;
      output?: Record<string, unknown>;
    } = { tool, title, summary };
    if (input !== undefined) {
      calc.input = input;
    }
    if (output !== undefined) {
      calc.output = output;
    }
    saveFinanceCalculation(calc);
  }, [tool, title, summary, input, output]);

  return (
    <Button variant="secondary" onClick={handleSave} disabled={disabled}>
      ذخیره سناریو
    </Button>
  );
}
