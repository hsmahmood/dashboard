import React from 'react';
import { getWidgetComponent } from './WidgetRegistry';
import { useTheme } from '../../hooks/useTheme';

interface DynamicWidgetProps {
  componentName: string;
  widgetProps: any;
  className?: string;
}

const DynamicWidget: React.FC<DynamicWidgetProps> = ({
  componentName,
  widgetProps,
  className = '',
}) => {
  const { theme } = useTheme();
  const WidgetComponent = getWidgetComponent(componentName);

  if (!WidgetComponent) {
    return (
      <div
        className={`rounded-lg p-4 flex items-center justify-center ${
          theme === 'dark' ? 'bg-[#162345]' : 'bg-white border border-gray-200'
        } ${className}`}
      >
        <div className="text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Widget component "{componentName}" not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full ${className}`}>
      <WidgetComponent {...widgetProps} />
    </div>
  );
};

export default DynamicWidget;
