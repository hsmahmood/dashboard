import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import WidgetWrapper from './WidgetWrapper';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LineChartWidgetProps {
  title?: string;
  data: any[];
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  xAxisKey?: string;
  loading?: boolean;
  error?: string;
  config?: any;
}

const LineChartWidget: React.FC<LineChartWidgetProps> = ({
  title,
  data,
  lines,
  xAxisKey = 'timestamp',
  loading,
  error,
  config,
}) => {
  const { theme } = useTheme();

  const formatXAxis = (value: string) => {
    try {
      const date = new Date(value);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return value;
    }
  };

  return (
    <WidgetWrapper title={title} loading={loading} error={error}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
          />
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatXAxis}
            stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
          />
          <YAxis
            stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: theme === 'dark' ? '#F9FAFB' : '#111827',
            }}
            labelFormatter={(label) => {
              try {
                const date = new Date(label);
                return date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              } catch {
                return label;
              }
            }}
          />
          <Legend
            wrapperStyle={{
              color: theme === 'dark' ? '#F9FAFB' : '#111827',
            }}
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </WidgetWrapper>
  );
};

export default LineChartWidget;
