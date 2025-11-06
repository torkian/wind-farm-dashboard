import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Action } from '../../types';
import { TABLE_PAGE_SIZES } from '../../config/thresholds';

interface ActionQueueProps {
  actions: Action[];
  onActionClick?: (actionId: string) => void;
}

export function ActionQueue({ actions, onActionClick }: ActionQueueProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'isOverdue', desc: true },
    { id: 'deadline', desc: false },
  ]);

  const columns = useMemo<ColumnDef<Action>[]>(
    () => [
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: (info) => {
          const priority = info.getValue() as string;
          const color = priority.includes('Critical') || priority === 'P1' ? 'text-red-600 font-semibold' :
                       priority.includes('High') || priority === 'P2' ? 'text-orange-600 font-semibold' :
                       'text-gray-600';
          return <span className={color}>{priority}</span>;
        },
        size: 100,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const status = info.getValue() as string;
          const bgColor = status === 'Open' ? 'bg-blue-100 text-blue-700' :
                         status === 'In Progress' ? 'bg-violet-100 text-violet-700' :
                         status === 'Closed' ? 'bg-green-100 text-green-700' :
                         'bg-red-100 text-red-700';
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
              {status}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'siteName',
        header: 'Site',
        cell: (info) => <span className="text-sm">{info.getValue() as string || '-'}</span>,
        size: 150,
      },
      {
        accessorKey: 'turbineName',
        header: 'Turbine',
        cell: (info) => <span className="text-sm">{info.getValue() as string || '-'}</span>,
        size: 150,
      },
      {
        accessorKey: 'activity',
        header: 'Activity',
        cell: (info) => <span className="text-sm font-medium text-black">{info.getValue() as string}</span>,
        size: 250,
      },
      {
        accessorKey: 'deadline',
        header: 'Deadline',
        cell: (info) => {
          const deadline = info.getValue() as Date | null;
          if (!deadline) return <span className="text-gray-400 text-sm">-</span>;
          return <span className="text-sm">{format(deadline, 'MMM d, yyyy')}</span>;
        },
        size: 120,
      },
      {
        accessorKey: 'isOverdue',
        header: 'Overdue',
        cell: (info) => {
          const isOverdue = info.getValue() as boolean;
          return isOverdue ? (
            <span className="text-red-600 font-semibold text-sm">Yes</span>
          ) : null;
        },
        size: 80,
      },
      {
        accessorKey: 'metSLA',
        header: 'Met SLA',
        cell: (info) => {
          const metSLA = info.getValue();
          if (metSLA === null) return <span className="text-gray-400 text-sm">-</span>;
          return metSLA ? (
            <span className="text-green-600 text-sm">✓</span>
          ) : (
            <span className="text-red-600 text-sm">✗</span>
          );
        },
        size: 80,
      },
      {
        accessorKey: 'details',
        header: 'Details',
        cell: (info) => {
          const details = info.getValue() as string;
          return (
            <span className="text-sm text-gray-800" title={details}>
              {details.length > 80 ? details.substring(0, 80) + '...' : details}
            </span>
          );
        },
        size: 300,
      },
    ],
    []
  );

  const table = useReactTable({
    data: actions,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const getRowClassName = (action: Action) => {
    if (action.isOverdue) {
      return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500';
    }
    if (action.severity === 'Critical') {
      return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-500';
    }
    return 'hover:bg-gray-50';
  };

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-black mb-4">Action Queue</h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span>
                          {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`${getRowClassName(row.original)} cursor-pointer transition-colors`}
                onClick={() => onActionClick?.(row.original.actionId)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-black">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <span className="text-sm text-gray-700">
            ({actions.length} total actions)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 text-sm font-medium bg-[#24a4ab] text-white rounded hover:bg-[#1d8289] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-4 py-2 text-sm font-medium bg-[#24a4ab] text-white rounded hover:bg-[#1d8289] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="ml-4 px-2 py-1 text-sm border border-gray-300 rounded"
          >
            {TABLE_PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
