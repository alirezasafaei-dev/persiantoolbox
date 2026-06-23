export type BarChartData = {
  label: string;
  value: number;
};

type Props = {
  data: BarChartData[];
  height?: number;
  maxValue?: number;
  color?: string;
};

export default function BarChart({
  data,
  height = 160,
  maxValue: maxValueProp,
  color = 'var(--color-primary)',
}: Props) {
  if (data.length === 0) {
    return null;
  }

  const maxValue = maxValueProp ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full" role="img" aria-label="نمودار میله‌ای">
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((item) => {
          const percent = Math.max((item.value / maxValue) * 100, 2);
          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] text-[var(--text-muted)]">{item.value}</span>
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: `${percent}%`,
                  backgroundColor: color,
                  minHeight: 4,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {data.map((item) => (
          <div key={item.label} className="flex-1 text-center text-[10px] text-[var(--text-muted)]">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
