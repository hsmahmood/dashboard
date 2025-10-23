# Dynamic Dashboard Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- PostgreSQL database running
- Backend and frontend dependencies installed

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Seed Widget Types

```bash
cd backend
node scripts/seedWidgets.js
```

This creates 11 default widget types:
- gauge, line_chart, bar_chart, kpi, table, pie_chart
- map, area_chart, donut_chart, stacked_bar, alarms_table

### Step 3: Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 4: Access Dynamic Dashboard

1. Navigate to `http://localhost:5173` (or your frontend URL)
2. Log in with your credentials
3. You'll see the dashboard page
4. Click "Use Dynamic Layout" button

## 📊 Creating Your First Dashboard

### Option A: Via Postman/API

**1. Get Available Widget Types**
```http
GET http://localhost:5000/api/widget-types
Authorization: Bearer YOUR_TOKEN
```

**2. Create Widget Definitions**
```http
POST http://localhost:5000/api/widget-definitions
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Production KPI",
  "description": "Total daily production",
  "widget_type_id": 4,
  "data_source_config": {
    "metric": "totalProduction",
    "unit": "bbl/day"
  },
  "layout_config": {
    "w": 3,
    "h": 2
  }
}
```

**3. Create Dashboard**
```http
POST http://localhost:5000/api/dashboards
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "My Production Dashboard",
  "description": "Overview of production metrics",
  "widgets": [
    {
      "widget_definition_id": 1,
      "layout_config": {
        "x": 0,
        "y": 0,
        "w": 12,
        "h": 2
      }
    }
  ]
}
```

### Option B: Using Existing Components

The system automatically includes your existing dashboard components as widgets:

```http
POST http://localhost:5000/api/widget-definitions
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Metrics Cards",
  "description": "Top 4 KPI cards",
  "widget_type_id": 4,
  "data_source_config": {},
  "layout_config": {
    "w": 12,
    "h": 2
  }
}
```

Available component names:
- `MetricsCards` - 4 KPI cards (OFR, GFR, WFR, GVF)
- `FlowRateCharts` - Oil/Gas/Water flow rate charts
- `FractionsChart` - Oil/Gas/Water distribution pie chart
- `GVFWLRCharts` - GVF and WLR line charts
- `ProductionMap` - Geographic device map
- `AlarmsTableWidget` - Live alarms table

## 🎨 Using the Dashboard

### View Mode (Default)
- View all widgets
- Interact with charts (hover, zoom)
- Select time ranges
- Switch between devices/hierarchies
- Widgets auto-refresh every 5 seconds

### Edit Mode
1. Click "Edit Layout" button
2. **Drag** widgets to reposition
3. **Resize** widgets by dragging corners
4. **Remove** widgets by clicking trash icon
5. Click "Save Changes" when done

### Grid Layout

The dashboard uses a 12-column grid:
- `w: 3` = 1/4 width (25%)
- `w: 4` = 1/3 width (33%)
- `w: 6` = 1/2 width (50%)
- `w: 12` = full width (100%)

Height is in rows (1 row = 100px):
- `h: 1` = 100px
- `h: 2` = 200px
- `h: 3` = 300px

Example layout:
```json
{
  "x": 0,   // Left edge
  "y": 0,   // Top row
  "w": 6,   // Half width
  "h": 2    // 200px height
}
```

## 🔧 Configuration

### Widget Data Source Config

Controls what data the widget displays:

```json
{
  "dataKey": "ofr",          // Which metric to display
  "timeRange": "24h",        // Time period
  "aggregation": "avg",      // How to aggregate
  "filters": {               // Additional filters
    "deviceType": "gas"
  }
}
```

### Widget Layout Config (Defaults)

Default layout when widget is added:

```json
{
  "w": 4,      // Width in grid units
  "h": 2,      // Height in grid units
  "minW": 2,   // Minimum width
  "minH": 1    // Minimum height
}
```

### Dashboard Layout Config (Instance)

Specific to each dashboard:

```json
{
  "x": 0,      // Column position
  "y": 0,      // Row position
  "w": 6,      // Actual width
  "h": 3       // Actual height
}
```

### Instance Config (Overrides)

Override widget settings per dashboard:

```json
{
  "customTitle": "My Custom Title",
  "color": "#3b82f6",
  "showLegend": false
}
```

## 🎯 Common Layouts

### Full Dashboard (12 columns)

```
┌─────────────────────────────────────┐
│  Metrics Cards (w:12, h:1)          │
├─────────────────┬───────────────────┤
│  OFR Chart      │  GFR Chart        │
│  (w:6, h:3)     │  (w:6, h:3)       │
│                 │                   │
├─────────────────┴───────────────────┤
│  Production Map (w:12, h:4)         │
│                                     │
└─────────────────────────────────────┘
```

### Side-by-Side

```
┌─────────────────┬───────────────────┐
│  KPI 1          │  KPI 2            │
│  (w:3, h:2)     │  (w:3, h:2)       │
├─────────────────┼───────────────────┤
│  KPI 3          │  KPI 4            │
│  (w:3, h:2)     │  (w:3, h:2)       │
└─────────────────┴───────────────────┘
```

### Chart Focus

```
┌─────────────────────────────────────┐
│  Main Chart (w:12, h:4)             │
│                                     │
│                                     │
├──────────┬──────────┬──────────────┤
│  KPI 1   │  KPI 2   │  KPI 3       │
│ (w:4,h:2)│ (w:4,h:2)│ (w:4, h:2)   │
└──────────┴──────────┴──────────────┘
```

## 📝 Example Widget Definitions

### KPI Widget
```json
{
  "name": "Daily Oil Production",
  "widget_type_id": 4,
  "data_source_config": {
    "metric": "ofr",
    "format": "number",
    "unit": "bbl/day",
    "showTrend": true
  }
}
```

### Line Chart Widget
```json
{
  "name": "Flow Rates Over Time",
  "widget_type_id": 2,
  "data_source_config": {
    "lines": [
      { "dataKey": "ofr", "name": "Oil", "color": "#3b82f6" },
      { "dataKey": "gfr", "name": "Gas", "color": "#8b5cf6" },
      { "dataKey": "wfr", "name": "Water", "color": "#ec4899" }
    ],
    "timeRange": "24h"
  }
}
```

### Pie Chart Widget
```json
{
  "name": "Production Mix",
  "widget_type_id": 6,
  "data_source_config": {
    "data": [
      { "name": "Oil", "value": 65, "color": "#3b82f6" },
      { "name": "Gas", "value": 25, "color": "#8b5cf6" },
      { "name": "Water", "value": 10, "color": "#ec4899" }
    ]
  }
}
```

### Table Widget
```json
{
  "name": "Device List",
  "widget_type_id": 5,
  "data_source_config": {
    "columns": [
      { "key": "serial", "label": "Serial #", "sortable": true },
      { "key": "status", "label": "Status", "sortable": true },
      { "key": "ofr", "label": "OFR", "sortable": true }
    ],
    "pageSize": 10
  }
}
```

## 🐛 Troubleshooting

### Dashboard Not Loading
```bash
# Check if widget types exist
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/widget-types

# If empty, seed them
cd backend && node scripts/seedWidgets.js
```

### Widgets Not Displaying
1. Open browser console (F12)
2. Check for errors
3. Verify API responses in Network tab
4. Check component name matches registry

### Layout Not Saving
1. Ensure you're in edit mode
2. Check you have permission to edit dashboard
3. Verify API endpoint: PUT /api/dashboard-layouts/dashboard/:id/bulk
4. Check browser console for errors

### Data Not Updating
1. Check auto-refresh is enabled (every 5s)
2. Verify device/hierarchy is selected
3. Check API responses for data
4. Review time range selection

## 📚 Next Steps

1. **Read Full Documentation**: See `DASHBOARD_IMPLEMENTATION_SUMMARY.md`
2. **Explore Widget Types**: Review available widgets in `DYNAMIC_DASHBOARD_GUIDE.md`
3. **Create Custom Widgets**: Follow widget creation guide
4. **Configure Permissions**: Set up dashboard sharing
5. **Optimize Performance**: Review performance best practices

## 🆘 Need Help?

1. Check documentation files:
   - `DYNAMIC_DASHBOARD_GUIDE.md` - Complete reference
   - `DASHBOARD_IMPLEMENTATION_SUMMARY.md` - Technical details
   - `QUICK_START.md` - This file

2. Review backend API:
   - Postman collections in `backend/postman/`
   - API routes in `backend/routes/`

3. Check existing examples:
   - Widget components in `frontend/src/components/Widgets/`
   - Dashboard components in `frontend/src/components/Dashboard/`

## ✅ Checklist

After setup, verify:
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Database connected
- [ ] Widget types seeded (11 types)
- [ ] Can access dashboard page
- [ ] "Use Dynamic Layout" button visible
- [ ] Can toggle to dynamic dashboard
- [ ] Widgets load and display data
- [ ] Edit mode works
- [ ] Layout saves successfully

You're all set! 🎉
