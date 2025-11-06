import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { KPISummary } from '../../types';
import { ChartHeader } from '../common/ChartHeader';
import { VISUALIZATION_INFO } from '../../config/visualizationInfo';

interface CaseFunnelProps {
  funnel: KPISummary['caseFunnel'];
}

export function CaseFunnel({ funnel }: CaseFunnelProps) {
  const data = [
    { stage: 'Created', count: funnel.created, color: '#3b82f6' },
    { stage: 'Inspected', count: funnel.inspected, color: '#8b5cf6' },
    { stage: 'Confirmed', count: funnel.confirmed, color: '#f59e0b' },
    { stage: 'Closed', count: funnel.closed, color: '#10b981' },
  ];

  // Calculate conversion rates (as % of created, not previous stage)
  const inspectionRate = funnel.created > 0 ? (funnel.inspected / funnel.created) * 100 : 0;
  const confirmationRate = funnel.created > 0 ? (funnel.confirmed / funnel.created) * 100 : 0;
  const closureRate = funnel.created > 0 ? (funnel.closed / funnel.created) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <ChartHeader
        title="Case Lifecycle Funnel"
        subtitle="Case progression through lifecycle stages (filtered data)"
        info={VISUALIZATION_INFO.caseFunnel}
      />

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;

              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                  <p className="font-semibold text-sm">{data.stage}</p>
                  <p className="text-sm">Count: {data.count}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList dataKey="count" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-700">% Inspected</div>
          <div className="text-lg font-semibold text-violet-600">
            {inspectionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">{funnel.inspected} of {funnel.created}</div>
        </div>
        <div>
          <div className="text-gray-700">% Confirmed</div>
          <div className="text-lg font-semibold text-amber-600">
            {confirmationRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">{funnel.confirmed} of {funnel.created}</div>
        </div>
        <div>
          <div className="text-gray-700">% Closed</div>
          <div className="text-lg font-semibold text-emerald-600">
            {closureRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">{funnel.closed} of {funnel.created}</div>
        </div>
      </div>
    </div>
  );
}
