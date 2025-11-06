interface SiteRadarProps {
  data: {
    site: string;
    openCases: number;
    criticalCases: number;
    avgAge: number;
    overdueActions: number;
    slaRate: number;
  }[];
}

export function SiteRadar({ data }: SiteRadarProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Sites Performance</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Sites Performance</h3>
      <p className="text-sm text-gray-600 mb-4">
        Key metrics for the {data.length} sites with most cases
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Open Cases</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Critical</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Age (days)</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Overdue Actions</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">SLA Rate %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((site, index) => (
              <tr key={site.site} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-black">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    {site.site}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={site.openCases > 50 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                    {site.openCases}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={site.criticalCases > 10 ? 'text-red-600 font-bold' : site.criticalCases > 0 ? 'text-orange-600 font-semibold' : 'text-gray-400'}>
                    {site.criticalCases}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-800">
                  {site.avgAge.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={site.overdueActions > 10 ? 'text-orange-600 font-semibold' : 'text-gray-700'}>
                    {site.overdueActions}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <span className={site.slaRate >= 80 ? 'text-green-600 font-semibold' : site.slaRate >= 60 ? 'text-amber-600' : 'text-red-600 font-semibold'}>
                    {site.slaRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-center">
        <div className="p-2 bg-green-50 rounded">
          <span className="text-green-700 font-semibold">🟢 Good:</span> SLA ≥80%, Low critical
        </div>
        <div className="p-2 bg-amber-50 rounded">
          <span className="text-amber-700 font-semibold">🟡 Warning:</span> SLA 60-80%, Some critical
        </div>
        <div className="p-2 bg-red-50 rounded">
          <span className="text-red-700 font-semibold">🔴 Alert:</span> SLA &lt;60%, High critical
        </div>
      </div>
    </div>
  );
}
