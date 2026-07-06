export type SparklineData = {
  value: number;
  label?: string;
};

type Props = {
  data: SparklineData[];
  width?: number;
  height?: number;
  color?: string;
};

export default function Sparkline({
  data,
  width = 80,
  height = 24,
  color = 'var(--color-primary)',
}: Props) {
  if (data.length === 0) {
    return null;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((item, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - (item.value / maxValue) * chartHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      role="img"
      aria-label="نمودار کوچک روند"
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={padding + chartWidth}
        cy={
          padding +
          chartHeight -
          ((data[data.length - 1] as SparklineData).value / maxValue) * chartHeight
        }
        r="2"
        fill={color}
      />
    </svg>
  );
}
