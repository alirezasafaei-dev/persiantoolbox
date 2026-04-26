type ProgressBarProps = {
  value: number;
  label?: string;
};

function clampProgress(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

export default function ProgressBar({ value, label = 'پیشرفت عملیات' }: ProgressBarProps) {
  const normalizedValue = clampProgress(value);

  return (
    <div className="space-y-2">
      <progress className="tool-progress" aria-label={label} max={100} value={normalizedValue} />
      <div className="text-xs text-[var(--text-muted)]" role="status" aria-live="polite">
        {normalizedValue}%
      </div>
    </div>
  );
}
