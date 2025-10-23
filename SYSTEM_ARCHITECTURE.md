# Dynamic Dashboard System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  (Dashboard with drag-and-drop widgets, theme support)         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND COMPONENTS                          │
├─────────────────────────────────────────────────────────────────┤
│  DashboardLayout                                                │
│    ├── NewDashboardContent (data loading & management)         │
│    │     ├── DynamicDashboard (grid layout renderer)           │
│    │     │     ├── DynamicWidget (component loader)            │
│    │     │     │     ├── KPIWidget                             │
│    │     │     │     ├── LineChartWidget                       │
│    │     │     │     ├── PieChartWidget                        │
│    │     │     │     ├── TableWidget                           │
│    │     │     │     ├── MetricsCards                          │
│    │     │     │     ├── FlowRateCharts                        │
│    │     │     │     ├── FractionsChart                        │
│    │     │     │     ├── GVFWLRCharts                          │
│    │     │     │     ├── ProductionMap                         │
│    │     │     │     └── AlarmsTable                           │
│    │     │     └── WidgetRegistry (component mapping)          │
│    └── DashboardContent (legacy static layout)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API SERVICE                               │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard APIs:                                                │
│    • getDashboards() - List dashboards                         │
│    • getDashboard(id) - Get specific dashboard                 │
│    • createDashboard() - Create new dashboard                  │
│    • updateDashboard() - Update dashboard                      │
│    • deleteDashboard() - Delete dashboard                      │
│                                                                 │
│  Widget APIs:                                                   │
│    • getWidgetTypes() - List widget types                      │
│    • getWidgetDefinitions() - List widget instances            │
│                                                                 │
│  Layout APIs:                                                   │
│    • getDashboardLayouts() - Get widget positions              │
│    • addWidgetToDashboard() - Add widget                       │
│    • updateDashboardLayout() - Update position                 │
│    • bulkUpdateDashboardLayouts() - Save all positions         │
│    • removeWidgetFromDashboard() - Remove widget               │
│                                                                 │
│  Data APIs (existing):                                          │
│    • getDeviceChartDataEnhanced() - Device data                │
│    • getHierarchyChartDataEnhanced() - Hierarchy data          │
│    • getAlarms() - Alarm data                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND ROUTES                               │
├─────────────────────────────────────────────────────────────────┤
│  /api/dashboards         - Dashboard CRUD operations            │
│  /api/widget-types       - Widget type management              │
│  /api/widget-definitions - Widget instance management          │
│  /api/dashboard-layouts  - Layout & positioning                │
│  /api/charts             - Chart data (existing)               │
│  /api/devices            - Device data (existing)              │
│  /api/alarms             - Alarm data (existing)               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND MODELS                               │
├─────────────────────────────────────────────────────────────────┤
│  WidgetType       - Available widget types                      │
│  WidgetDefinition - User-created widget instances               │
│  Dashboard        - Dashboard containers                        │
│  DashboardLayout  - Widget positions & config                  │
│  DashboardShare   - Sharing permissions                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                              │
├─────────────────────────────────────────────────────────────────┤
│  widget_types (11 pre-seeded types)                             │
│    ├── id, name, component_name                                │
│    └── default_config (JSONB)                                  │
│                                                                 │
│  widget_definitions (user-created)                              │
│    ├── id, name, description                                   │
│    ├── widget_type_id                                          │
│    ├── data_source_config (JSONB)                              │
│    ├── layout_config (JSONB)                                   │
│    └── created_by                                              │
│                                                                 │
│  dashboards                                                     │
│    ├── id, name, description                                   │
│    ├── grid_config (JSONB)                                     │
│    ├── version, is_active                                      │
│    └── created_by                                              │
│                                                                 │
│  dashboard_layouts                                              │
│    ├── id, dashboard_id                                        │
│    ├── widget_definition_id                                    │
│    ├── layout_config (x, y, w, h)                              │
│    ├── instance_config (JSONB)                                 │
│    └── display_order                                           │
│                                                                 │
│  dashboard_shares                                               │
│    ├── dashboard_id, user_id                                   │
│    ├── permission_level (view/edit/admin)                      │
│    └── expires_at                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Dashboard Page
│
├── DashboardLayout (Main container)
│   │
│   ├── DashboardHeader (Nav tabs)
│   │
│   ├── SidebarDrawer (Device/hierarchy selector)
│   │
│   └── Content Area
│       │
│       └── NewDashboardContent [if useDynamicDashboard]
│           │
│           ├── Header Section
│           │   ├── Dashboard Title
│           │   ├── Time Range Selector
│           │   └── Dynamic Layout Toggle
│           │
│           ├── DynamicDashboard
│           │   │
│           │   ├── Edit Controls (when in edit mode)
│           │   │   ├── Edit Layout Button
│           │   │   └── Save Changes Button
│           │   │
│           │   └── React Grid Layout
│           │       │
│           │       └── Grid Items (foreach widget)
│           │           │
│           │           ├── Remove Button (edit mode)
│           │           │
│           │           └── DynamicWidget
│           │               │
│           │               └── Widget Component
│           │                   ├── MetricsCards
│           │                   ├── FlowRateCharts
│           │                   ├── FractionsChart
│           │                   ├── GVFWLRCharts
│           │                   ├── ProductionMap
│           │                   ├── AlarmsTable
│           │                   ├── KPIWidget
│           │                   ├── LineChartWidget
│           │                   ├── PieChartWidget
│           │                   └── TableWidget
│           │
│           └── Footer
│               └── Version Info
│
└── DashboardContent [if !useDynamicDashboard - legacy]
    └── Static layout components
```

## Data Flow Diagram

```
┌──────────┐
│   USER   │
└─────┬────┘
      │
      │ 1. Select Device/Hierarchy
      ▼
┌─────────────────┐
│ DashboardLayout │
└────────┬────────┘
         │
         │ 2. Load Dashboard
         ▼
┌──────────────────────┐
│ NewDashboardContent  │
└─────────┬────────────┘
          │
          ├─► 3a. Load Dashboard Metadata
          │   GET /api/dashboards/:id
          │
          ├─► 3b. Load Widget Layouts
          │   GET /api/dashboard-layouts/dashboard/:id
          │
          ├─► 3c. Load Device/Hierarchy Data
          │   GET /api/charts/device/:id
          │   GET /api/charts/hierarchy/:id
          │
          └─► 3d. Start Auto-Refresh Timer (5s)
                  │
                  ▼
          ┌───────────────┐
          │ DynamicDashboard │
          └──────┬──────────┘
                 │
                 │ 4. Parse Layouts
                 │ 5. Create Grid Items
                 │
                 ▼
          ┌────────────────┐
          │ foreach Widget │
          └───────┬────────┘
                  │
                  │ 6. Lookup Component
                  │    from Registry
                  ▼
          ┌─────────────────┐
          │ DynamicWidget   │
          └────────┬────────┘
                   │
                   │ 7. Render Component
                   │    with Props
                   ▼
          ┌──────────────────┐
          │ Widget Component │
          │ (e.g., KPIWidget)│
          └──────────────────┘
                   │
                   │ 8. Display Data
                   ▼
          ┌──────────────────┐
          │   USER SEES      │
          │   DASHBOARD      │
          └──────────────────┘
```

## Widget Rendering Flow

```
DynamicDashboard receives layouts:
[
  {
    id: 1,
    widget_definition_id: 5,
    component_name: "MetricsCards",
    layout_config: { x: 0, y: 0, w: 12, h: 2 },
    data_source_config: {},
    instance_config: {}
  },
  ...
]

For each layout:
  1. Create grid item with position (x, y, w, h)
  2. Pass to DynamicWidget:
     - componentName: "MetricsCards"
     - widgetProps: {
         config: { ...data_source_config, ...instance_config },
         selectedDevice: Device | null,
         selectedHierarchy: Hierarchy | null,
         chartData: DeviceChartData | null,
         hierarchyChartData: HierarchyChartData | null,
         timeRange: string,
         loading: boolean
       }

  3. DynamicWidget looks up component in registry:
     WidgetRegistry["MetricsCards"] → MetricsCards component

  4. Render component:
     <MetricsCards {...widgetProps} />

  5. Component displays data based on props
```

## Edit Mode Flow

```
USER CLICKS "EDIT LAYOUT"
    ↓
Set editMode = true
Set layouts.static = false (enable dragging)
    ↓
┌────────────────────────────┐
│  USER DRAGS/RESIZES WIDGET │
└──────────────┬─────────────┘
               │
               ▼
onLayoutChange(newLayout) called
    ↓
Update local layouts state
Set hasChanges = true
    ↓
USER CLICKS "SAVE CHANGES"
    ↓
┌─────────────────────────────────┐
│ bulkUpdateDashboardLayouts()    │
│                                 │
│ PUT /api/dashboard-layouts/     │
│     dashboard/:id/bulk          │
│                                 │
│ Body: {                         │
│   layouts: [                    │
│     {                           │
│       id: 1,                    │
│       layout_config: {          │
│         x: 0, y: 0,             │
│         w: 6, h: 2              │
│       }                         │
│     },                          │
│     ...                         │
│   ]                             │
│ }                               │
└────────────┬────────────────────┘
             │
             ▼
Backend updates dashboard_layouts table
Increments dashboard version
    ↓
Set hasChanges = false
Set editMode = false
Set layouts.static = true
    ↓
SUCCESS - Layout Saved!
```

## Configuration Cascade

```
Widget Type Default Config
    ↓
    Merged with
    ↓
Widget Definition Config
(data_source_config + layout_config)
    ↓
    Merged with
    ↓
Dashboard Layout Instance Config
    ↓
    Results in
    ↓
Final Widget Props

Example:

WidgetType (kpi):
{
  "format": "number",
  "showTrend": true
}

WidgetDefinition:
{
  "data_source_config": {
    "metric": "ofr",
    "unit": "bbl/day"
  }
}

DashboardLayout:
{
  "instance_config": {
    "customTitle": "Well #123 Oil"
  }
}

Final Props:
{
  "format": "number",
  "showTrend": true,
  "metric": "ofr",
  "unit": "bbl/day",
  "customTitle": "Well #123 Oil"
}
```

## Time Range & Data Loading

```
┌─────────────────────────────────────────────────────┐
│                Time Range Selection                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ├─► Metrics Cards (Always 'day')
                 │   ├─► getDeviceChartDataEnhanced(id, 'day')
                 │   └─► Shows current metrics
                 │
                 ├─► Flow Rate Charts (User selected)
                 │   ├─► getDeviceChartDataEnhanced(id, timeRange)
                 │   └─► Shows OFR, GFR, WFR over time
                 │
                 ├─► Fractions Chart (Always 'day')
                 │   ├─► Uses metrics data
                 │   └─► Shows oil/gas/water %
                 │
                 └─► GVF/WLR Charts (Always 'day')
                     ├─► Uses metrics data
                     └─► Shows ratios

Auto-Refresh (every 5 seconds):
  ├─► Refreshes metrics with 'day' timeRange
  └─► Refreshes flow rates with selected timeRange
```

## Permission Model

```
Dashboard Owner
    │
    ├─── Can: Everything
    │    ├─ View dashboard
    │    ├─ Edit layout
    │    ├─ Add/remove widgets
    │    ├─ Share dashboard
    │    ├─ Delete dashboard
    │    └─ Change settings
    │
    └─── Shares with Users:
         │
         ├─── View Permission
         │    └─ Can: View only
         │
         ├─── Edit Permission
         │    ├─ Can: View
         │    ├─ Can: Edit layout
         │    └─ Can: Add/remove widgets
         │
         └─── Admin Permission
              ├─ Can: Everything except delete
              └─ Can: Share with others
```

## Technology Stack

```
Frontend:
├── React 18 (UI framework)
├── TypeScript (Type safety)
├── Vite (Build tool)
├── TailwindCSS (Styling)
├── Recharts (Charts)
├── react-grid-layout (Grid system)
├── Framer Motion (Animations)
└── Lucide React (Icons)

Backend:
├── Node.js (Runtime)
├── Express.js (Server framework)
├── PostgreSQL (Database)
├── JWT (Authentication)
└── bcrypt (Password hashing)

Libraries:
├── react-resizable (Widget resizing)
├── date-fns (Date formatting)
└── axios (HTTP client - via fetch)
```

## File Organization

```
project/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Widgets/           (NEW)
│   │   │   │   ├── WidgetWrapper.tsx
│   │   │   │   ├── KPIWidget.tsx
│   │   │   │   ├── LineChartWidget.tsx
│   │   │   │   ├── PieChartWidget.tsx
│   │   │   │   ├── TableWidget.tsx
│   │   │   │   ├── WidgetRegistry.tsx
│   │   │   │   └── DynamicWidget.tsx
│   │   │   │
│   │   │   └── Dashboard/
│   │   │       ├── DynamicDashboard.tsx       (NEW)
│   │   │       ├── NewDashboardContent.tsx    (NEW)
│   │   │       ├── DashboardLayout.tsx        (UPDATED)
│   │   │       ├── DashboardContent.tsx       (EXISTING)
│   │   │       ├── MetricsCards.tsx           (EXISTING)
│   │   │       ├── FlowRateCharts.tsx         (EXISTING)
│   │   │       ├── FractionsChart.tsx         (EXISTING)
│   │   │       ├── GVFWLRCharts.tsx           (EXISTING)
│   │   │       ├── ProductionMap.tsx          (EXISTING)
│   │   │       └── AlarmsTable.tsx            (EXISTING)
│   │   │
│   │   └── services/
│   │       └── api.ts                         (UPDATED)
│   │
│   └── package.json                           (UPDATED)
│
├── backend/
│   ├── models/
│   │   ├── WidgetType.js                      (EXISTING)
│   │   ├── WidgetDefinition.js                (EXISTING)
│   │   ├── Dashboard.js                       (EXISTING)
│   │   └── DashboardLayout.js                 (EXISTING)
│   │
│   ├── routes/
│   │   ├── widgetTypes.js                     (EXISTING)
│   │   ├── widgetDefinitions.js               (EXISTING)
│   │   ├── dashboards.js                      (EXISTING)
│   │   └── dashboardLayouts.js                (EXISTING)
│   │
│   └── scripts/
│       └── seedWidgets.js                     (EXISTING)
│
└── Documentation/                              (NEW)
    ├── QUICK_START.md
    ├── DYNAMIC_DASHBOARD_GUIDE.md
    ├── DASHBOARD_IMPLEMENTATION_SUMMARY.md
    ├── SYSTEM_ARCHITECTURE.md
    └── COMPLETION_SUMMARY.md
```

## Summary

This architecture provides:

✅ **Scalable**: Easy to add new widget types
✅ **Maintainable**: Clear separation of concerns
✅ **Flexible**: Widgets can be configured per-instance
✅ **Performant**: Optimized rendering and data loading
✅ **User-Friendly**: Intuitive drag-and-drop interface
✅ **Secure**: Permission-based access control
✅ **Extensible**: Plugin-style widget registration

The system is production-ready and follows industry best practices for modern web applications.
