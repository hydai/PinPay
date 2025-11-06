import React from 'react';
import { formatCurrency } from '../../utils/currency';

interface PieChartData {
  label: string;
  value: number;
  percentage: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
}

const DEFAULT_COLORS = [
  '#0ea5e9', // blue
  '#f59e0b', // amber
  '#10b981', // green
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
];

export const PieChart: React.FC<PieChartProps> = ({ data, size = 200 }) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        無資料
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = size / 2 - 10;

  // 計算每個扇形
  let currentAngle = -90; // 從頂部開始

  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // 計算路徑
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    return {
      ...item,
      path,
      color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    };
  });

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="flex justify-center mb-4">
        <svg width={size} height={size} className="transform -rotate-0">
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.path}
                fill={segment.color}
                className="transition-opacity hover:opacity-80 cursor-pointer"
              >
                <title>{`${segment.label}: ${formatCurrency(segment.value)} (${segment.percentage.toFixed(1)}%)`}</title>
              </path>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: segment.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-700 truncate">{segment.label}</div>
              <div className="text-xs text-gray-500">
                {segment.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
