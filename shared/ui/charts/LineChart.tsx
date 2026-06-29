export type LineChartData = {
  label: string;
  value: number;
};

type Props = {
  data: LineChartData[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
};

export default function LineChart({
  data,
  width = 300,
  height = 120,
  color = 'var(--color-primary)',
  showDots = true,
}: Props) {
  if (data.length === 0) {
    return null;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((item, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - (item.value / maxValue) * chartHeight;
    return { x, y, label: item.label, value: item.value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const firstPoint = points[0]!;
  const lastPoint = points[points.length - 1]!;
  const areaD = `${pathD} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;

  return (
    <div className="w-full" role="img" aria-label="نمودار خطی">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)" />
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {showDots
          ? points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="var(--surface-1)"
              stroke={color}
              strokeWidth="2"
            />
          ))
          : null}
      </svg>
      <div className="mt-1 flex justify-between px-1">
        {points.map((p, i) => (
          <span key={i} className="text-[10px] text-[var(--text-muted)]">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
