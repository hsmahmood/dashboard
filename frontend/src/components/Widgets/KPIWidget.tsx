import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import WidgetWrapper from './WidgetWrapper';

interface KPIWidgetProps {
  title?: string;
  value: number | string;
  unit?: string;
  format?: 'number' | 'percentage' | 'currency';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  loading?: boolean;
  error?: string;
  config?: any;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  unit = '',
  format = 'number',
  trend,
  icon,
  loading,
  error,
  config,
}) => {
  const { theme } = useTheme();

  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';

    switch (trend.direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <WidgetWrapper title={title} loading={loading} error={error}>
      <div className="h-full flex flex-col items-center justify-center">
        {icon && <div className="mb-3">{icon}</div>}
        <div className="text-center">
          <div
            className={`text-4xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {formatValue(value)}
            {unit && (
              <span
                className={`text-xl ml-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {unit}
              </span>
            )}
          </div>
          {trend && (
            <div className={`flex items-center justify-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </WidgetWrapper>
  );
};

export default KPIWidget;
