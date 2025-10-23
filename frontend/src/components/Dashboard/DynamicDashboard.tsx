import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/api';
import DynamicWidget from '../Widgets/DynamicWidget';
import { Settings, Plus, Trash2, Save } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DynamicDashboardProps {
  dashboardId?: number;
  selectedDevice?: any;
  selectedHierarchy?: any;
  chartData?: any;
  hierarchyChartData?: any;
  timeRange?: string;
  editable?: boolean;
  metricsChartData?: any;
  metricsHierarchyChartData?: any;
  flowRateChartData?: any;
  flowRateHierarchyChartData?: any;
  lastRefresh?: Date;
}

const DynamicDashboard: React.FC<DynamicDashboardProps> = ({
  dashboardId,
  selectedDevice,
  selectedHierarchy,
  chartData,
  hierarchyChartData,
  timeRange = '1day',
  editable = false,
  metricsChartData,
  metricsHierarchyChartData,
  flowRateChartData,
  flowRateHierarchyChartData,
  lastRefresh,
}) => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [layouts, setLayouts] = useState<any>([]);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(editable);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (dashboardId && token) {
      loadDashboard();
    }
  }, [dashboardId, token]);

  const loadDashboard = async () => {
    if (!token || !dashboardId) return;

    setLoading(true);
    try {
      const response = await apiService.getDashboard(dashboardId, token);
      if (response.success && response.data) {
        const dashboardData = response.data;

        const layoutsData = dashboardData.layouts || [];

        const parsedLayouts = layoutsData.map((layout: any) => ({
          i: layout.id.toString(),
          x: layout.layout_config.x || 0,
          y: layout.layout_config.y || 0,
          w: layout.layout_config.w || 4,
          h: layout.layout_config.h || 2,
          minW: layout.layout_config.minW || 2,
          minH: layout.layout_config.minH || 1,
          static: !editMode,
        }));

        const widgetsData = layoutsData.map((layout: any) => ({
          id: layout.id,
          widgetDefinitionId: layout.widget_definition_id,
          name: layout.widget_name,
          componentName: layout.component_name,
          dataSourceConfig: layout.data_source_config,
          instanceConfig: layout.instance_config,
          displayOrder: layout.display_order,
        }));

        setLayouts(parsedLayouts);
        setWidgets(widgetsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      if (!editMode) return;

      setLayouts(newLayout);
      setHasChanges(true);
    },
    [editMode]
  );

  const saveDashboard = async () => {
    if (!token || !dashboardId) return;

    try {
      const updatedLayouts = layouts.map((layout: any) => {
        const widget = widgets.find((w) => w.id.toString() === layout.i);
        return {
          id: parseInt(layout.i),
          layout_config: {
            x: layout.x,
            y: layout.y,
            w: layout.w,
            h: layout.h,
            minW: layout.minW,
            minH: layout.minH,
          },
          display_order: widget?.displayOrder || 0,
        };
      });

      await apiService.bulkUpdateDashboardLayouts(dashboardId, updatedLayouts, token);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    }
  };

  const toggleEditMode = () => {
    if (editMode && hasChanges) {
      saveDashboard();
    }
    setEditMode(!editMode);

    setLayouts((prevLayouts: any[]) =>
      prevLayouts.map((layout) => ({
        ...layout,
        static: editMode,
      }))
    );
  };

  const removeWidget = async (widgetId: string) => {
    if (!token) return;

    try {
      await apiService.removeWidgetFromDashboard(parseInt(widgetId), token);
      setLayouts((prevLayouts: any[]) => prevLayouts.filter((l) => l.i !== widgetId));
      setWidgets((prevWidgets) => prevWidgets.filter((w) => w.id.toString() !== widgetId));
    } catch (error) {
      console.error('Failed to remove widget:', error);
    }
  };

  const getWidgetProps = (widget: any) => {
    const baseProps = {
      config: { ...widget.dataSourceConfig, ...widget.instanceConfig },
      loading: loading,
      selectedDevice,
      selectedHierarchy,
      timeRange,
    };

    switch (widget.componentName) {
      case 'MetricsCards':
        return {
          ...baseProps,
          chartData: metricsChartData,
          hierarchyChartData: metricsHierarchyChartData,
          lastRefresh,
          isDeviceOffline: metricsChartData?.device?.status === 'Offline',
        };
      case 'FlowRateCharts':
        return {
          ...baseProps,
          chartData: flowRateChartData,
          hierarchyChartData: flowRateHierarchyChartData,
          isDeviceOffline: flowRateChartData?.device?.status === 'Offline',
        };
      case 'FractionsChart':
        return {
          ...baseProps,
          chartData: metricsChartData,
          hierarchyChartData: metricsHierarchyChartData,
          isDeviceOffline: metricsChartData?.device?.status === 'Offline',
        };
      case 'GVFWLRCharts':
        return {
          ...baseProps,
          chartData: metricsChartData,
          hierarchyChartData: metricsHierarchyChartData,
          isDeviceOffline: metricsChartData?.device?.status === 'Offline',
        };
      case 'ProductionMap':
        return {
          ...baseProps,
        };
      case 'AlarmsTableWidget':
        return {
          ...baseProps,
        };
      default:
        return {
          ...baseProps,
          chartData,
          hierarchyChartData,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {editable && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              editMode
                ? theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                : theme === 'dark'
                ? 'bg-[#162345] hover:bg-[#1a2744] text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {editMode ? <Save className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            {editMode ? 'Save Changes' : 'Edit Layout'}
          </button>
        </div>
      )}

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layouts }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        isDraggable={editMode}
        isResizable={editMode}
        margin={[16, 16]}
        containerPadding={[0, 0]}
      >
        {widgets.map((widget) => (
          <div
            key={widget.id.toString()}
            className={`relative ${
              theme === 'dark' ? 'bg-[#162345]' : 'bg-white border border-gray-200'
            } rounded-lg overflow-hidden shadow-sm`}
          >
            {editMode && (
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <button
                  onClick={() => removeWidget(widget.id.toString())}
                  className="p-1.5 rounded bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="h-full">
              <DynamicWidget
                componentName={widget.componentName}
                widgetProps={getWidgetProps(widget)}
              />
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>

      {widgets.length === 0 && (
        <div
          className={`flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
          }`}
        >
          <Plus className={`w-12 h-12 mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No widgets added to this dashboard yet
          </p>
          {editable && (
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Click "Edit Layout" to add widgets
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicDashboard;
