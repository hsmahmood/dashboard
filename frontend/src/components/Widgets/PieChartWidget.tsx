import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import WidgetWrapper from './WidgetWrapper';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartWidgetProps {
  title?: string;
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  loading?: boolean;
  error?: string;
  config?: any;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const PieChartWidget: React.FC<PieChartWidgetProps> = ({
  title,
  data,
  loading,
  error,
  config,
}) => {
  const { theme } = useTheme();

  return (
    <WidgetWrapper title={title} loading={loading} error={error}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
              borderRadius: '8px',
              color: theme === 'dark' ? '#F9FAFB' : '#111827',
            }}
          />
          <Legend
            wrapperStyle={{
              color: theme === 'dark' ? '#F9FAFB' : '#111827',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </WidgetWrapper>
  );
};

export default PieChartWidget;
