import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { shouldSkipUpdate } from '../../utils/chartUtils';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { apiService, DeviceChartData, HierarchyChartData, Device } from '../../services/api';
import { Calendar, ChevronDown, Check, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DynamicDashboard from './DynamicDashboard';

interface NewDashboardContentProps {
  children?: React.ReactNode;
  selectedDevice?: Device | null;
  selectedHierarchy?: any | null;
}

const AnimatedSelect: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  theme: 'dark' | 'light' | string;
}> = ({ value, onChange, options, theme }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const selectedIndex = options.findIndex((o) => o.value === value);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (!listRef.current) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(options.length - 1, selectedIndex + 1);
        onChange(options[next].value);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(0, selectedIndex - 1);
        onChange(options[prev].value);
      } else if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key === 'Enter') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, selectedIndex, options, onChange]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-opacity-30 text-sm font-medium ${
          theme === 'dark'
            ? 'bg-[#162345] text-white shadow-md hover:shadow-lg focus:ring-[#7c9cff]'
            : 'bg-white text-gray-900 border border-gray-200 shadow-sm hover:shadow-md focus:ring-[#6366F1]'
        }`}
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 opacity-80" />
          <span>{options.find((o) => o.value === value)?.label}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 600, damping: 30 }}
            ref={listRef}
            role="listbox"
            aria-activedescendant={options[selectedIndex]?.value}
            className={`absolute right-0 mt-2 w-56 rounded-lg z-50 overflow-hidden shadow-xl ring-1 ring-black ring-opacity-5 ${
              theme === 'dark'
                ? 'bg-[#0b1326] text-white'
                : 'bg-white text-gray-900'
            }`}
          >
            <div className="max-h-56 overflow-auto">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onChange(opt.value);
                        setOpen(false);
                      }
                    }}
                    tabIndex={0}
                    className={`flex items-center justify-between gap-2 px-4 py-2 cursor-pointer select-none hover:bg-opacity-10 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-white/6 focus:bg-white/6'
                        : 'hover:bg-gray-50 focus:bg-gray-50'
                    } ${isSelected ? 'font-semibold' : 'font-normal'}`}
                  >
                    <div className="truncate">{opt.label}</div>
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="w-4 h-4 opacity-90" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NewDashboardContent: React.FC<NewDashboardContentProps> = ({
  children,
  selectedDevice,
  selectedHierarchy,
}) => {
  const { token, user } = useAuth();
  const { theme } = useTheme();
  const [metricsChartData, setMetricsChartData] = useState<DeviceChartData | null>(null);
  const [metricsHierarchyChartData, setMetricsHierarchyChartData] = useState<HierarchyChartData | null>(null);
  const [flowRateChartData, setFlowRateChartData] = useState<DeviceChartData | null>(null);
  const [flowRateHierarchyChartData, setFlowRateHierarchyChartData] = useState<HierarchyChartData | null>(null);
  const [timeRange, setTimeRange] = useState<string>('1day');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null);
  const [useDynamicLayout, setUseDynamicLayout] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const timeRangeOptions = [
    { value: '1day', label: 'Today', apiValue: 'day' },
    { value: '7days', label: 'Last 7 Days', apiValue: 'week' },
    { value: '1month', label: 'Last 1 Month', apiValue: 'month' },
  ];

  useEffect(() => {
    if (token) {
      loadDashboards();
    }
  }, [token]);

  const loadDashboards = async () => {
    if (!token) return;

    try {
      const response = await apiService.getDashboards(token);
      if (response.success && response.data) {
        setDashboards(response.data);
        if (response.data.length > 0) {
          setSelectedDashboard(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error);
    }
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  const getCurrentTimeRangeApiValue = () => {
    const option = timeRangeOptions.find((opt) => opt.value === timeRange);
    return option?.apiValue || 'day';
  };

  useEffect(() => {
    if (selectedDevice && !selectedHierarchy) {
      loadDeviceMetricsData(selectedDevice.deviceId || selectedDevice.id);
      setMetricsHierarchyChartData(null);
    } else if (selectedHierarchy && !selectedDevice) {
      loadHierarchyMetricsData(selectedHierarchy.id);
      setMetricsChartData(null);
    }
  }, [selectedDevice, selectedHierarchy, token]);

  useEffect(() => {
    if (selectedDevice && !selectedHierarchy) {
      loadDeviceFlowRateData(selectedDevice.deviceId || selectedDevice.id);
      setFlowRateHierarchyChartData(null);
    } else if (selectedHierarchy && !selectedDevice) {
      loadHierarchyFlowRateData(selectedHierarchy.id);
      setFlowRateChartData(null);
    }
  }, [selectedDevice, selectedHierarchy, timeRange, token]);

  useEffect(() => {
    const startAutoRefresh = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      refreshIntervalRef.current = setInterval(() => {
        setLastRefresh(new Date());

        if (selectedDevice && !selectedHierarchy) {
          loadDeviceMetricsData(selectedDevice.deviceId || selectedDevice.id);
          loadDeviceFlowRateData(selectedDevice.deviceId || selectedDevice.id);
        } else if (selectedHierarchy && !selectedDevice) {
          loadHierarchyMetricsData(selectedHierarchy.id);
          loadHierarchyFlowRateData(selectedHierarchy.id);
        }
      }, 5000);
    };

    startAutoRefresh();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [selectedDevice, selectedHierarchy, token, timeRange]);

  const transformDeviceData = (
    response: any,
    deviceId: number | string
  ): DeviceChartData => {
    return {
      device: {
        id: response.data.device.deviceId?.toString() || deviceId.toString(),
        serial_number: response.data.device.deviceSerial,
        type: response.data.device.deviceName,
        logo: response.data.device.deviceLogo,
        metadata: response.data.device.metadata,
        created_at: response.data.device.createdAt || new Date().toISOString(),
        location: response.data.device.wellName,
        company: response.data.device.companyName || 'Unknown',
        status: response.data.device.status,
      },
      chartData: response.data.chartData.map((point: any) => ({
        timestamp: point.timestamp,
        gfr: point.gfr,
        gor: point.gor,
        gvf: point.gvf,
        ofr: point.ofr,
        wfr: point.wfr,
        wlr: point.wlr,
        pressure: point.pressure,
        temperature: point.temperature,
      })),
      latestData: response.data.latestData,
      timeRange: response.data.timeRange,
      totalDataPoints: response.data.totalDataPoints,
    };
  };

  const loadDeviceMetricsData = async (deviceId: number | string) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const deviceIdNumber =
        typeof deviceId === 'string' ? parseInt(deviceId) : deviceId;
      const response = await apiService.getDeviceChartDataEnhanced(
        deviceIdNumber,
        'day',
        token
      );
      if (response.success && response.data) {
        setMetricsChartData(transformDeviceData(response, deviceId));
      }
    } catch (error) {
      console.error('Failed to load device metrics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeviceFlowRateData = async (deviceId: number | string) => {
    if (!token) return;

    try {
      const deviceIdNumber =
        typeof deviceId === 'string' ? parseInt(deviceId) : deviceId;
      const response = await apiService.getDeviceChartDataEnhanced(
        deviceIdNumber,
        getCurrentTimeRangeApiValue(),
        token
      );
      if (response.success && response.data) {
        const newData = transformDeviceData(response, deviceId);
        if (!shouldSkipUpdate(flowRateChartData?.chartData, newData.chartData)) {
          setFlowRateChartData(newData);
        }
      }
    } catch (error) {
      console.error('Failed to load device flow rate data:', error);
    }
  };

  const loadHierarchyMetricsData = async (hierarchyId: number | string) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await apiService.getHierarchyChartDataEnhanced(
        Number(hierarchyId),
        'day',
        token
      );
      if (response.success && response.data) {
        setMetricsHierarchyChartData(response.data);
      }
    } catch (error) {
      console.error('Failed to load hierarchy metrics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHierarchyFlowRateData = async (hierarchyId: number | string) => {
    if (!token) return;

    try {
      const response = await apiService.getHierarchyChartDataEnhanced(
        Number(hierarchyId),
        getCurrentTimeRangeApiValue(),
        token
      );
      if (response.success && response.data) {
        const newData = response.data;
        if (!shouldSkipUpdate(flowRateHierarchyChartData?.chartData, newData.chartData)) {
          setFlowRateHierarchyChartData(newData);
        }
      }
    } catch (error) {
      console.error('Failed to load hierarchy flow rate data:', error);
    }
  };

  return (
    <div
      className={`h-full p-4 overflow-y-auto ${
        theme === 'dark' ? 'bg-[]' : 'bg-gray-50'
      }`}
    >
      {children || (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h1
                className={`text-3xl font-semibold md:tracking-wide ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {selectedHierarchy &&
                selectedHierarchy.id !== selectedHierarchy.name
                  ? `${selectedHierarchy.name} Dashboard`
                  : selectedDevice
                  ? `Device ${
                      selectedDevice.serial_number ||
                      selectedDevice.deviceSerial
                    } Dashboard`
                  : 'Production Dashboard'}
              </h1>
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span
                    className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Loading...
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {dashboards.length > 0 && (
                <button
                  onClick={() => setUseDynamicLayout(!useDynamicLayout)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    useDynamicLayout
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : theme === 'dark'
                      ? 'bg-[#162345] text-white hover:bg-[#1a2744]'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {useDynamicLayout ? 'Using Dynamic Layout' : 'Use Dynamic Layout'}
                </button>
              )}
              <AnimatedSelect
                value={timeRange}
                onChange={handleTimeRangeChange}
                options={timeRangeOptions.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                theme={theme}
              />
            </div>
          </div>

          {useDynamicLayout && selectedDashboard ? (
            <DynamicDashboard
              dashboardId={selectedDashboard.id}
              selectedDevice={selectedDevice}
              selectedHierarchy={selectedHierarchy}
              timeRange={timeRange}
              editable={true}
              metricsChartData={metricsChartData}
              metricsHierarchyChartData={metricsHierarchyChartData}
              flowRateChartData={flowRateChartData}
              flowRateHierarchyChartData={flowRateHierarchyChartData}
              lastRefresh={lastRefresh}
            />
          ) : (
            <div
              className={`flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
              }`}
            >
              <LayoutDashboard
                className={`w-12 h-12 mb-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
              />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {dashboards.length === 0
                  ? 'No dashboards found. Create one to get started.'
                  : 'Click "Use Dynamic Layout" to view your dashboard'}
              </p>
            </div>
          )}

          <div className={`text-center py-4 text-xs ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Version 2.0.0 - Dynamic Dashboard System
          </div>
        </>
      )}
    </div>
  );
};

export default NewDashboardContent;
