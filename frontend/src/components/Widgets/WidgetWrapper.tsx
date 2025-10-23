import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface WidgetWrapperProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  loading?: boolean;
  error?: string;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
  title,
  children,
  className = '',
  headerActions,
  loading = false,
  error,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-lg shadow-sm h-full flex flex-col ${
        theme === 'dark'
          ? 'bg-[#162345] border border-gray-700/50'
          : 'bg-white border border-gray-200'
      } ${className}`}
    >
      {title && (
        <div
          className={`px-4 py-3 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'
          }`}
        >
          <h3
            className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h3>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default WidgetWrapper;
