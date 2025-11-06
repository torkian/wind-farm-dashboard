import { useMemo } from 'react';
import { ChartHeader } from '../common/ChartHeader';
import { VISUALIZATION_INFO } from '../../config/visualizationInfo';
import { HeatmapCell } from '../../types';

interface RiskHeatmapProps {
  data: HeatmapCell[];
  onCellClick?: (siteId: string, componentName: string) => void;
}

/**
 * Risk Heatmap using CSS Grid
 * Shows critical case count by site x component
 */
export function RiskHeatmap({ data, onCellClick }: RiskHeatmapProps) {
  // Get unique sites and components
  const { sites, components, grid } = useMemo(() => {
    const siteSet = new Map<string, string>();
    const componentSet = new Set<string>();

    data.forEach(cell => {
      siteSet.set(cell.siteId, cell.siteName);
      componentSet.add(cell.componentName);
    });

    const sitesList = Array.from(siteSet.entries()).map(([id, name]) => ({ id, name }));
    const componentsList = Array.from(componentSet).sort();

    // Build grid lookup
    const gridMap = new Map<string, number>();
    data.forEach(cell => {
      const key = `${cell.siteId}::${cell.componentName}`;
      gridMap.set(key, cell.criticalCount);
    });

    return {
      sites: sitesList,
      components: componentsList,
      grid: gridMap,
    };
  }, [data]);

  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value <= 2) return 'bg-amber-100';
    if (value <= 5) return 'bg-orange-200';
    if (value <= 10) return 'bg-red-300';
    return 'bg-red-600';
  };

  const getTextColor = (value: number) => {
    if (value > 10) return 'text-white';
    return 'text-gray-900';
  };

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <ChartHeader title="Risk Heatmap: Sites × Components" subtitle="No critical cases to display" info={VISUALIZATION_INFO.riskHeatmap} />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Risk Heatmap: Sites × Components
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Critical case count by site and component. Darker = higher risk.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-gray-50 border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-800">
                Site
              </th>
              {components.map(comp => (
                <th
                  key={comp}
                  className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 min-w-[80px]"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {comp}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sites.map(site => (
              <tr key={site.id}>
                <td className="sticky left-0 bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-black">
                  {site.name}
                </td>
                {components.map(comp => {
                  const key = `${site.id}::${comp}`;
                  const value = grid.get(key) || 0;
                  return (
                    <td
                      key={comp}
                      className={`border border-gray-300 px-3 py-2 text-center text-sm font-semibold cursor-pointer hover:opacity-80 ${getColor(value)} ${getTextColor(value)}`}
                      onClick={() => value > 0 && onCellClick?.(site.id, comp)}
                      title={`${site.name} - ${comp}: ${value} critical cases`}
                    >
                      {value > 0 ? value : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300" />
          <span>0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-amber-100 border border-gray-300" />
          <span>1-2</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-200 border border-gray-300" />
          <span>3-5</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-300 border border-gray-300" />
          <span>6-10</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-600 border border-gray-300" />
          <span className="text-white">10+</span>
        </div>
      </div>
    </div>
  );
}
