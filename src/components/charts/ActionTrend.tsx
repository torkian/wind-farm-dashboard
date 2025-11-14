import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { COLORS } from '../../config/thresholds';

interface ActionTrendProps {
  data: { date: string; Critical: number; High: number; Medium: number; Low: number; total: number }[];
}

export function ActionTrend({ data }: ActionTrendProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Creation Trend</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const totalActions = data.reduce((sum, d) => sum + d.total, 0);
  const peakDay = Math.max(...data.map(d => d.total));
  const avgPerDay = totalActions / data.length;

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Action Creation Trend (30d)</h3>
      <p className="text-sm text-gray-600 mb-4">
        Daily action creation by priority - shows NextEra notification volume
      </p>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis label={{ value: 'Actions Created', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend iconType="line" />
          <Line type="monotone" dataKey="Critical" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} name="Critical/P1" />
          <Line type="monotone" dataKey="High" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} name="High/P2" />
          <Line type="monotone" dataKey="Medium" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Medium/P3" />
          <Line type="monotone" dataKey="Low" stroke="#84cc16" strokeWidth={2} dot={{ r: 3 }} name="Low/P4" />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-center">
        <div>
          <div className="text-gray-600">Total Actions</div>
          <div className="text-2xl font-bold text-gray-900">{totalActions}</div>
        </div>
        <div>
          <div className="text-gray-600">Peak Day</div>
          <div className="text-2xl font-bold text-gray-900">{peakDay}</div>
        </div>
        <div>
          <div className="text-gray-600">Avg/Day</div>
          <div className="text-2xl font-bold text-gray-900">{avgPerDay.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}
