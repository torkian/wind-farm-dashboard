import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Case } from '../../types';
import { useMemo } from 'react';
import { COLORS } from '../../config/thresholds';

interface ComponentBreakdownProps {
  cases: Case[];
}

export function ComponentBreakdown({ cases }: ComponentBreakdownProps) {
  const chartData = useMemo(() => {
    // Group by component → severity
    const componentMap = new Map<string, { component: string; Critical: number; High: number; Medium: number; Low: number; total: number }>();

    cases.forEach(c => {
      if (!componentMap.has(c.componentName)) {
        componentMap.set(c.componentName, {
          component: c.componentName,
          Critical: 0,
          High: 0,
          Medium: 0,
          Low: 0,
          total: 0,
        });
      }

      const comp = componentMap.get(c.componentName)!;
      comp[c.severity]++;
      comp.total++;
    });

    // Sort by total and take top 15
    return Array.from(componentMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);
  }, [cases]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Breakdown by Severity</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Component Breakdown by Severity</h3>
      <p className="text-sm text-gray-600 mb-4">
        Top 15 components by case volume - stacked by severity level
      </p>

      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 200, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis
            dataKey="component"
            type="category"
            width={190}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '12px',
            }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;

              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                  <p className="font-semibold text-sm mb-2">{data.component}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-red-600">Critical:</span>
                      <span className="font-semibold">{data.Critical}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-orange-600">High:</span>
                      <span className="font-semibold">{data.High}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-amber-600">Medium:</span>
                      <span className="font-semibold">{data.Medium}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-lime-600">Low:</span>
                      <span className="font-semibold">{data.Low}</span>
                    </div>
                    <div className="flex justify-between gap-3 pt-1 border-t border-gray-200">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold">{data.total}</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          <Bar dataKey="Critical" stackId="a" fill={COLORS.severity.Critical} name="Critical" />
          <Bar dataKey="High" stackId="a" fill={COLORS.severity.High} name="High" />
          <Bar dataKey="Medium" stackId="a" fill={COLORS.severity.Medium} name="Medium" />
          <Bar dataKey="Low" stackId="a" fill={COLORS.severity.Low} name="Low" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {chartData.slice(0, 4).map((comp, idx) => (
          <div key={comp.component} className="p-3 bg-gray-50 rounded border border-gray-200">
            <div className="font-semibold text-gray-900 mb-2 text-sm">#{idx + 1} {comp.component.substring(0, 25)}</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-red-600">Critical:</span>
                <span className="font-bold">{comp.Critical}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">{comp.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
