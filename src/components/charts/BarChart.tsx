import React from 'react';
import { formatCurrency } from '../../utils/currency';

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  color = '#0ea5e9'
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400">
        無資料
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const chartHeight = height;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1" style={{ height: chartHeight }}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Value Label */}
              <div className="text-xs text-gray-600 font-medium min-h-4">
                {item.value > 0 ? formatCurrency(item.value) : ''}
              </div>

              {/* Bar */}
              <div className="w-full flex flex-col justify-end" style={{ height: chartHeight - 30 }}>
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer relative group"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: color,
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              </div>

              {/* Label */}
              <div className="text-xs text-gray-500 text-center truncate w-full">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
