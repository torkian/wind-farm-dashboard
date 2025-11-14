import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';

interface ActionBacklogGrowthProps {
  data: { date: string; created: number; closed: number; openActions: number }[];
}

export function ActionBacklogGrowth({ data }: ActionBacklogGrowthProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Backlog Growth</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const currentBacklog = data[data.length - 1]?.openActions || 0;
  const startBacklog = data[0]?.openActions || 0;
  const backlogChange = currentBacklog - startBacklog;

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Action Backlog Growth (90d)</h3>
      <p className="text-sm text-gray-600 mb-4">
        Track open action volume over time - shows NextEra workload trend
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <defs>
            <linearGradient id="colorCreatedActions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorClosedActions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorOpenActions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#24a4ab" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#24a4ab" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="left"
            label={{ value: 'Daily Actions', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Open Action Count', angle: 90, position: 'insideRight' }}
          />
          <Tooltip />
          <Legend />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="created"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorCreatedActions)"
            name="Created"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="closed"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorClosedActions)"
            name="Closed"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="openActions"
            stroke="#24a4ab"
            fillOpacity={1}
            fill="url(#colorOpenActions)"
            strokeWidth={2}
            name="Open Actions"
          />

          <Brush dataKey="date" height={30} stroke="#24a4ab" startIndex={Math.max(0, data.length - 30)} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-center">
        <div>
          <div className="text-gray-600">Current Open Actions</div>
          <div className="text-2xl font-bold text-[#24a4ab]">{currentBacklog}</div>
        </div>
        <div>
          <div className="text-gray-600">Change (90d)</div>
          <div className={`text-2xl font-bold ${backlogChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {backlogChange > 0 ? '+' : ''}{backlogChange}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Trend</div>
          <div className={`text-xl font-bold ${backlogChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {backlogChange > 0 ? '↗ Growing' : backlogChange < 0 ? '↘ Shrinking' : '→ Stable'}
          </div>
        </div>
      </div>
    </div>
  );
}
