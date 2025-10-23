import React from 'react';
import KPIWidget from './KPIWidget';
import LineChartWidget from './LineChartWidget';
import PieChartWidget from './PieChartWidget';
import TableWidget from './TableWidget';
import MetricsCards from '../Dashboard/MetricsCards';
import FlowRateCharts from '../Dashboard/FlowRateCharts';
import FractionsChart from '../Dashboard/FractionsChart';
import GVFWLRCharts from '../Dashboard/GVFWLRCharts';
import ProductionMap from '../Dashboard/ProductionMap';
import AlarmsTable from '../Dashboard/AlarmsTable';

export interface WidgetComponentProps {
  data?: any;
  config?: any;
  loading?: boolean;
  error?: string;
  selectedDevice?: any;
  selectedHierarchy?: any;
  chartData?: any;
  hierarchyChartData?: any;
  timeRange?: string;
  [key: string]: any;
}

const widgetRegistry: Record<string, React.FC<WidgetComponentProps>> = {
  KPIWidget: KPIWidget,
  LineChartWidget: LineChartWidget,
  PieChartWidget: PieChartWidget,
  TableWidget: TableWidget,
  MetricsCards: MetricsCards,
  FlowRateCharts: FlowRateCharts,
  FractionsChart: FractionsChart,
  GVFWLRCharts: GVFWLRCharts,
  ProductionMap: ProductionMap,
  AlarmsTableWidget: AlarmsTable,
};

export const getWidgetComponent = (componentName: string): React.FC<WidgetComponentProps> | null => {
  return widgetRegistry[componentName] || null;
};

export const registerWidget = (
  componentName: string,
  component: React.FC<WidgetComponentProps>
): void => {
  widgetRegistry[componentName] = component;
};

export default widgetRegistry;
