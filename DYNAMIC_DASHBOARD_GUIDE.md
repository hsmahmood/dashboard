# Dynamic Dashboard System Guide

## Overview

The dynamic dashboard system allows you to create fully customizable, widget-based dashboards that can be saved, shared, and dynamically loaded from the database. The system includes:

- **Widget System**: Reusable widget components that can display different types of data
- **Grid Layout**: Drag-and-drop grid system using react-grid-layout
- **Dashboard Management**: Create, edit, and share dashboards
- **Real-time Data**: Widgets automatically update with live data from your devices

## Architecture

### Backend Components

1. **Widget Types** (`widget_types` table)
   - Defines available widget types (e.g., KPI, LineChart, Map, etc.)
   - Stores component name and default configuration
   - Seeded with: gauge, line_chart, bar_chart, kpi, table, pie_chart, map, area_chart, donut_chart, stacked_bar, alarms_table

2. **Widget Definitions** (`widget_definitions` table)
   - User-created widget instances
   - Links to a widget type
   - Contains data source configuration and layout preferences
   - Can be reused across multiple dashboards

3. **Dashboards** (`dashboards` table)
   - Container for organizing widgets
   - Stores grid configuration
   - Supports versioning and sharing

4. **Dashboard Layouts** (`dashboard_layouts` table)
   - Junction table connecting dashboards and widget definitions
   - Stores widget position (x, y, w, h) and display order
   - Enables same widget to appear on multiple dashboards with different layouts

### Frontend Components

1. **Widget Components** (`/frontend/src/components/Widgets/`)
   - `WidgetWrapper.tsx` - Base wrapper with loading/error states
   - `KPIWidget.tsx` - Single metric display with trends
   - `LineChartWidget.tsx` - Time-series line charts
   - `PieChartWidget.tsx` - Pie/donut charts
   - `TableWidget.tsx` - Sortable, paginated data tables
   - `WidgetRegistry.tsx` - Central registry mapping component names to React components
   - `DynamicWidget.tsx` - Runtime widget renderer

2. **Dashboard Components** (`/frontend/src/components/Dashboard/`)
   - `DynamicDashboard.tsx` - Main dashboard renderer with grid layout
   - `NewDashboardContent.tsx` - Dashboard container with data loading
   - Existing components integrated: MetricsCards, FlowRateCharts, FractionsChart, GVFWLRCharts, ProductionMap, AlarmsTable

## Setup Instructions

### 1. Database Setup

The widget system tables are created automatically when you run the backend migrations. Ensure your database is set up correctly:

```bash
cd backend
npm install
# Set DATABASE_URL in .env file
node scripts/seed.js
node scripts/seedWidgets.js
```

### 2. Frontend Setup

Install dependencies including react-grid-layout:

```bash
cd frontend
npm install
```

### 3. Seed Widget Types

Run the widget types seeding script to populate default widget types:

```bash
cd backend
node scripts/seedWidgets.js
```

## Creating Your First Dashboard

### Via API (Postman/cURL)

1. **Create Widget Definitions**:

```json
POST /api/widget-definitions
{
  "name": "OFR Line Chart",
  "description": "Oil Flow Rate over time",
  "widget_type_id": 2,
  "data_source_config": {
    "dataKey": "ofr",
    "timeRange": "24h"
  },
  "layout_config": {
    "w": 6,
    "h": 3
  }
}
```

2. **Create Dashboard**:

```json
POST /api/dashboards
{
  "name": "Production Overview",
  "description": "Main production dashboard",
  "widgets": [
    {
      "widget_definition_id": 1,
      "layout_config": {
        "x": 0,
        "y": 0,
        "w": 4,
        "h": 2
      }
    },
    {
      "widget_definition_id": 2,
      "layout_config": {
        "x": 4,
        "y": 0,
        "w": 8,
        "h": 3
      }
    }
  ]
}
```

### Via UI

1. Navigate to the Dashboard page
2. Click "Use Dynamic Layout"
3. Click "Edit Layout" to enable edit mode
4. Drag widgets to reposition
5. Resize widgets by dragging corners
6. Click "Save Changes" to persist layout

## Available Widget Types

### 1. KPI Widget
**Component**: `KPIWidget`
**Use Case**: Display single metric with optional trend
**Props**:
- `value`: number | string
- `unit`: string (optional)
- `format`: 'number' | 'percentage' | 'currency'
- `trend`: { value: number, direction: 'up'|'down'|'neutral' }

### 2. Line Chart Widget
**Component**: `LineChartWidget`
**Use Case**: Time-series data visualization
**Props**:
- `data`: array of data points
- `lines`: array of line configurations (dataKey, name, color)
- `xAxisKey`: string (default: 'timestamp')

### 3. Pie Chart Widget
**Component**: `PieChartWidget`
**Use Case**: Show proportions and distributions
**Props**:
- `data`: array of { name, value, color }

### 4. Table Widget
**Component**: `TableWidget`
**Use Case**: Display tabular data with sorting/pagination
**Props**:
- `data`: array of objects
- `columns`: array of column definitions
- `pageSize`: number (default: 10)

### 5. Integrated Widgets
The following existing dashboard components are also available as widgets:
- `MetricsCards` - Top 4 KPI cards
- `FlowRateCharts` - OFR, GFR, WFR charts
- `FractionsChart` - Pie chart showing oil/gas/water fractions
- `GVFWLRCharts` - GVF and WLR line charts
- `ProductionMap` - Geographic device map
- `AlarmsTableWidget` - Live alarms table

## Widget Configuration

### Data Source Configuration
Stored in `widget_definitions.data_source_config`:

```json
{
  "dataKey": "ofr",
  "timeRange": "24h",
  "aggregation": "avg",
  "filters": {
    "deviceType": "gas",
    "status": "online"
  }
}
```

### Layout Configuration
Stored in both `widget_definitions.layout_config` (defaults) and `dashboard_layouts.layout_config` (instance-specific):

```json
{
  "x": 0,
  "y": 0,
  "w": 4,
  "h": 2,
  "minW": 2,
  "minH": 1,
  "static": false
}
```

- `x`, `y`: Grid position (0-indexed)
- `w`, `h`: Width and height in grid units
- `minW`, `minH`: Minimum dimensions
- `static`: Whether widget can be moved/resized

### Instance Configuration
Stored in `dashboard_layouts.instance_config`, overrides widget definition config:

```json
{
  "customTitle": "Device #123 Oil Flow",
  "color": "#3b82f6",
  "showLegend": false
}
```

## API Endpoints

### Dashboards
- `GET /api/dashboards` - List user's dashboards
- `GET /api/dashboards/:id` - Get dashboard with layouts
- `POST /api/dashboards` - Create dashboard
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard
- `POST /api/dashboards/:id/duplicate` - Duplicate dashboard
- `GET /api/dashboards/:id/shares` - List shares
- `POST /api/dashboards/:id/share` - Share dashboard
- `DELETE /api/dashboards/:id/share/:userId` - Revoke access

### Widget Types
- `GET /api/widget-types` - List all widget types
- `GET /api/widget-types/:id` - Get widget type details
- `POST /api/widget-types` - Create widget type (admin)
- `PUT /api/widget-types/:id` - Update widget type (admin)
- `DELETE /api/widget-types/:id` - Delete widget type (admin)

### Widget Definitions
- `GET /api/widget-definitions` - List widget definitions
- `GET /api/widget-definitions/:id` - Get widget definition
- `POST /api/widget-definitions` - Create widget definition
- `PUT /api/widget-definitions/:id` - Update widget definition
- `DELETE /api/widget-definitions/:id` - Delete widget definition

### Dashboard Layouts
- `GET /api/dashboard-layouts/dashboard/:dashboardId` - Get layouts for dashboard
- `GET /api/dashboard-layouts/:id` - Get single layout
- `POST /api/dashboard-layouts` - Add widget to dashboard
- `PUT /api/dashboard-layouts/:id` - Update layout
- `PUT /api/dashboard-layouts/dashboard/:dashboardId/bulk` - Bulk update layouts
- `DELETE /api/dashboard-layouts/:id` - Remove widget from dashboard

## Creating Custom Widgets

### 1. Create Widget Component

```typescript
// frontend/src/components/Widgets/MyCustomWidget.tsx
import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import WidgetWrapper from './WidgetWrapper';

interface MyCustomWidgetProps {
  title?: string;
  data?: any;
  config?: any;
  loading?: boolean;
  error?: string;
}

const MyCustomWidget: React.FC<MyCustomWidgetProps> = ({
  title,
  data,
  config,
  loading,
  error,
}) => {
  const { theme } = useTheme();

  return (
    <WidgetWrapper title={title} loading={loading} error={error}>
      <div>
        {/* Your widget content here */}
      </div>
    </WidgetWrapper>
  );
};

export default MyCustomWidget;
```

### 2. Register Widget

```typescript
// frontend/src/components/Widgets/WidgetRegistry.tsx
import MyCustomWidget from './MyCustomWidget';

const widgetRegistry: Record<string, React.FC<WidgetComponentProps>> = {
  // ... existing widgets
  MyCustomWidget: MyCustomWidget,
};
```

### 3. Add Widget Type to Database

```sql
INSERT INTO widget_types (name, component_name, default_config)
VALUES (
  'my_custom',
  'MyCustomWidget',
  '{"defaultOption": "value"}'::jsonb
);
```

## Best Practices

### Performance
- Use `React.memo` for widget components that receive complex props
- Implement shouldSkipUpdate logic for data that updates frequently
- Limit number of widgets per dashboard (recommended: 8-12)
- Use pagination for table widgets with large datasets

### Layout Design
- Use grid widths of 12 for desktop layouts
- Set reasonable minW and minH to prevent unusable widgets
- Group related widgets together
- Leave empty space for visual breathing room

### Data Loading
- Load shared data at dashboard level, pass to widgets via props
- Use widget-specific data loading only for unique data sources
- Implement proper loading and error states
- Cache data when appropriate to reduce API calls

### Security
- Always validate user permissions before showing/editing dashboards
- Sanitize widget configurations before saving
- Use parameterized queries to prevent SQL injection
- Implement rate limiting on dashboard/widget creation

## Troubleshooting

### Widget Not Displaying
1. Check widget type exists in database
2. Verify component name matches registry
3. Check browser console for React errors
4. Ensure data structure matches widget expectations

### Layout Issues
1. Clear browser cache
2. Check grid configuration in dashboard table
3. Verify layout_config JSON is valid
4. Ensure breakpoints are configured correctly

### Data Not Loading
1. Check API endpoints are accessible
2. Verify authentication token is valid
3. Check data_source_config is properly formatted
4. Review network tab for failed requests

## Future Enhancements

- [ ] Widget library/marketplace
- [ ] Dashboard templates
- [ ] Export/import dashboards
- [ ] Real-time collaboration
- [ ] Mobile-optimized widget layouts
- [ ] Advanced filtering and drill-down
- [ ] Scheduled reports/snapshots
- [ ] Custom themes per dashboard

## Support

For issues or questions:
1. Check this guide and API documentation
2. Review existing widget implementations for examples
3. Check backend logs for API errors
4. Review browser console for frontend errors
