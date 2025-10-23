import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import WidgetWrapper from './WidgetWrapper';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableWidgetProps {
  title?: string;
  data: any[];
  columns: Column[];
  pageSize?: number;
  loading?: boolean;
  error?: string;
  config?: any;
}

const TableWidget: React.FC<TableWidgetProps> = ({
  title,
  data,
  columns,
  pageSize = 10,
  loading,
  error,
  config,
}) => {
  const { theme } = useTheme();
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <WidgetWrapper title={title} loading={loading} error={error}>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead
              className={`sticky top-0 z-10 ${
                theme === 'dark' ? 'bg-[#0f1729]' : 'bg-gray-50'
              }`}
            >
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortKey === column.key && (
                        <>
                          {sortOrder === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b ${
                    theme === 'dark'
                      ? 'border-gray-700/50 hover:bg-white/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                      }`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            className={`flex items-center justify-between px-4 py-3 border-t ${
              theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200'
            }`}
          >
            <div
              className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm ${
                  theme === 'dark'
                    ? 'bg-[#0f1729] text-white hover:bg-[#1a2744] disabled:opacity-50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm ${
                  theme === 'dark'
                    ? 'bg-[#0f1729] text-white hover:bg-[#1a2744] disabled:opacity-50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </WidgetWrapper>
  );
};

export default TableWidget;
