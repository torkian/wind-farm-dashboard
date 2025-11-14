import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PRIORITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#f59e0b',
  Low: '#84cc16',
};

interface PriorityDistributionProps {
  data: { name: string; value: number; percentage: number }[];
}

export function PriorityDistribution({ data }: PriorityDistributionProps) {
  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Priority Distribution</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Action Priority Distribution</h3>
      <p className="text-sm text-gray-600 mb-4">
        Breakdown of all actions by priority level
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) =>
              percentage > 5 ? `${name}: ${percentage.toFixed(1)}%` : ''
            }
            outerRadius={100}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return [`${value} (${percentage}%)`, 'Actions'];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: PRIORITY_COLORS[item.name as keyof typeof PRIORITY_COLORS] }}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <div className="text-sm">
              <span className="font-bold">{item.value}</span>
              <span className="text-gray-500 ml-1">({item.percentage.toFixed(1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
