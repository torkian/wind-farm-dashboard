import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Action } from '../../types';
import { useMemo } from 'react';

interface ActionStatusProps {
  actions: Action[];
}

const STATUS_COLORS = {
  'Open': '#3b82f6',        // blue
  'In Progress': '#8b5cf6', // violet
  'Closed': '#10b981',      // green
  'Blocked': '#ef4444',     // red
};

export function ActionStatus({ actions }: ActionStatusProps) {
  const statusData = useMemo(() => {
    const counts = {
      'Open': 0,
      'In Progress': 0,
      'Closed': 0,
      'Blocked': 0,
    };

    actions.forEach(a => {
      counts[a.status]++;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percentage: actions.length > 0 ? (value / actions.length) * 100 : 0,
    })).filter(d => d.value > 0); // Only show statuses that exist
  }, [actions]);

  const totalActions = actions.length;
  const overdue = actions.filter(a => a.isOverdue).length;
  const withDeadline = actions.filter(a => a.deadline !== null).length;
  const priorityChanged = actions.filter(a => a.priorityChanged).length;

  if (totalActions === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Status Distribution</h3>
        <p className="text-gray-500 text-center py-8">No actions to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Action Status Distribution</h3>
      <p className="text-sm text-gray-600 mb-4">
        Current state of all work actions in the system
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) =>
              percentage > 5 ? `${name}: ${percentage.toFixed(1)}%` : ''
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => {
              const percentage = totalActions > 0 ? ((value / totalActions) * 100).toFixed(1) : '0';
              return [`${value} (${percentage}%)`, name];
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const item = statusData.find(d => d.name === value);
              return `${value}: ${item?.value || 0}`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-center">
          <div className="text-2xl font-bold text-black">{totalActions}</div>
          <div className="text-xs text-gray-600">Total Actions</div>
        </div>
        <div className="p-3 bg-red-50 rounded border border-red-200 text-center">
          <div className="text-2xl font-bold text-red-600">{overdue}</div>
          <div className="text-xs text-red-700">Overdue</div>
        </div>
        <div className="p-3 bg-blue-50 rounded border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{withDeadline}</div>
          <div className="text-xs text-blue-700">With Deadline</div>
        </div>
        <div className="p-3 bg-amber-50 rounded border border-amber-200 text-center">
          <div className="text-2xl font-bold text-amber-600">{priorityChanged}</div>
          <div className="text-xs text-amber-700">Priority Changed</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {statusData.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: STATUS_COLORS[item.name as keyof typeof STATUS_COLORS] }}
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
