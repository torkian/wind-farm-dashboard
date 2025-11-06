import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ChartHeader } from '../common/ChartHeader';
import { VISUALIZATION_INFO } from '../../config/visualizationInfo';
import { RepeatFailure } from '../../types';

interface RepeatFailuresProps {
  data: RepeatFailure[];
  title?: string;
}

export function RepeatFailures({ data, title = 'Top Repeat Failures' }: RepeatFailuresProps) {
  const colors = [
    '#dc2626', // red-600
    '#ea580c', // orange-600
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#22c55e', // green-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#0ea5e9', // sky-500
  ];

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        Most common failure patterns (open cases only)
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            angle={-45}
            textAnchor="end"
            height={120}
            tick={{ fontSize: 11 }}
            interval={0}
          />
          <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;

              const data = payload[0].payload as RepeatFailure;
              return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                  <p className="font-semibold text-sm mb-1">{data.label}</p>
                  <p className="text-xs">Occurrences: {data.count}</p>
                  <p className="text-xs">Sites affected: {data.sites}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
            <LabelList dataKey="count" position="top" style={{ fontSize: 12 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
