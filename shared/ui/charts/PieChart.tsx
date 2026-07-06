export type PieChartData = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: PieChartData[];
  size?: number;
};

const DEFAULT_COLORS = [
  'var(--color-primary)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-danger)',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
];

export default function PieChart({ data, size = 160 }: Props) {
  if (data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return null;
  }

  const radius = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  let cumulativePercent = 0;
  const slices = data.map((item, i) => {
    const percent = item.value / total;
    const startAngle = cumulativePercent * 360;
    cumulativePercent += percent;
    const endAngle = cumulativePercent * 360;
    const color = item.color ?? (DEFAULT_COLORS[i % DEFAULT_COLORS.length] as string);

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = percent > 0.5 ? 1 : 0;

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { d, color, label: item.label, value: item.value, percent };
  });

  return (
    <div className="flex items-center gap-4" role="img" aria-label="نمودار دایره‌ای">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={slice.color} stroke="var(--surface-1)" strokeWidth="1" />
        ))}
      </svg>
      <div className="space-y-1.5">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-[var(--text-secondary)]">{slice.label}</span>
            <span className="text-[var(--text-muted)]">{Math.round(slice.percent * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
