import React from 'react';
import { formatCurrency } from '../../utils/currency';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 150,
  color = '#0ea5e9',
  showDots = true,
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        無資料
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  const chartWidth = 100; // percentage
  const chartHeight = height;
  const padding = 20;

  // 計算點的位置
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * chartWidth;
    const y = ((maxValue - item.value) / range) * (chartHeight - padding * 2) + padding;
    return { x, y, value: item.value, label: item.label };
  });

  // 生成路徑
  const pathD = points
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    })
    .join(' ');

  // 生成填充區域路徑
  const areaD = [
    pathD,
    `L ${chartWidth} ${chartHeight - padding}`,
    `L 0 ${chartHeight - padding}`,
    'Z',
  ].join(' ');

  return (
    <div className="w-full">
      <div className="relative" style={{ height: chartHeight }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * (chartHeight - padding * 2);
            return (
              <line
                key={index}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="0.2"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill={color} fillOpacity="0.1" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots */}
          {showDots &&
            points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="1.5"
                  fill="white"
                  stroke={color}
                  strokeWidth="1"
                  className="cursor-pointer hover:r-2"
                >
                  <title>{`${point.label}: ${formatCurrency(point.value)}`}</title>
                </circle>
              </g>
            ))}
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
          <span>{data[0]?.label}</span>
          {data.length > 2 && (
            <span className="hidden sm:inline">
              {data[Math.floor(data.length / 2)]?.label}
            </span>
          )}
          <span>{data[data.length - 1]?.label}</span>
        </div>
      </div>
    </div>
  );
};
