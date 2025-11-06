import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { SiteKPI } from '../../types';
import { InfoButton } from '../common/InfoButton';
import { VISUALIZATION_INFO } from '../../config/visualizationInfo';

interface SiteScorecardProps {
  sites: SiteKPI[];
  onSiteClick?: (siteId: string) => void;
}

export function SiteScorecard({ sites, onSiteClick }: SiteScorecardProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'criticalCases', desc: true },
  ]);

  // Calculate health score (0-100, higher is better)
  const getHealthScore = (site: SiteKPI): number => {
    const criticalPenalty = site.criticalCases * 10;
    const openPenalty = site.openCases * 2;
    const overduePenalty = site.overdueActions * 5;

    const score = Math.max(0, 100 - criticalPenalty - openPenalty - overduePenalty);
    return Math.round(score);
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700';
    if (score >= 60) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const columns = useMemo<ColumnDef<SiteKPI>[]>(
    () => [
      {
        accessorKey: 'siteName',
        header: 'Site Name',
        cell: (info) => (
          <span className="font-medium text-black">{info.getValue() as string}</span>
        ),
        size: 200,
      },
      {
        accessorKey: 'turbineCount',
        header: 'Turbines',
        cell: (info) => <span className="text-sm">{info.getValue() as number}</span>,
        size: 100,
      },
      {
        accessorKey: 'openCases',
        header: 'Open Cases',
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className={`text-sm font-semibold ${value > 20 ? 'text-red-600' : 'text-gray-700'}`}>
              {value}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'criticalCases',
        header: 'Critical',
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className={`text-sm font-bold ${value > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {value}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: 'overdueActions',
        header: 'Overdue Actions',
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className={`text-sm font-semibold ${value > 5 ? 'text-orange-600' : 'text-gray-700'}`}>
              {value}
            </span>
          );
        },
        size: 140,
      },
      {
        accessorKey: 'casesPerTurbine',
        header: 'Cases/Turbine',
        cell: (info) => {
          const value = info.getValue() as number;
          return <span className="text-sm">{value.toFixed(2)}</span>;
        },
        size: 130,
      },
      {
        id: 'healthScore',
        header: 'Health Score',
        accessorFn: (row) => getHealthScore(row),
        cell: (info) => {
          const score = info.getValue() as number;
          const colorClass = getHealthColor(score);
          return (
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${colorClass}`}>
              {score}
            </span>
          );
        },
        size: 130,
      },
    ],
    []
  );

  const table = useReactTable({
    data: sites,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (sites.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Scorecard</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-black">Site Scorecard</h3>
          <InfoButton {...VISUALIZATION_INFO.siteScorecard} />
        </div>
        <p className="text-sm text-gray-700">
          Comprehensive site health metrics. Click column headers to sort. Health score: 100 = excellent, 0 = critical.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <span className="text-blue-600">
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
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSiteClick?.(row.original.siteId)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Total: {sites.length} sites | Click a row to filter by site</p>
      </div>
    </div>
  );
}
