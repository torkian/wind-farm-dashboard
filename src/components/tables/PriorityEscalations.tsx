import { Action } from '../../types';
import { ArrowUp } from 'lucide-react';
import { format } from 'date-fns';

interface PriorityEscalationsProps {
  actions: Action[];
}

export function PriorityEscalations({ actions }: PriorityEscalationsProps) {
  if (actions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Priority Escalations</h3>
        <p className="text-gray-500 text-center py-8">No priority changes in the last 24 hours</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-orange-200 bg-orange-50/20">
      <div className="mb-4 flex items-center gap-2">
        <ArrowUp size={20} className="text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Recent Priority Escalations (Last 24h)</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Actions where priority was increased - requiring immediate attention
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-orange-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-900 uppercase">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-900 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-900 uppercase">Site</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-900 uppercase">Turbine</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-900 uppercase">Activity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-900 uppercase">Deadline</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-900 uppercase">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {actions.map(action => (
              <tr key={action.actionId} className="hover:bg-orange-50">
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <ArrowUp size={14} className="text-orange-600" />
                    <span className={`font-semibold ${
                      action.priority === 'Critical' || action.priority === 'P1' ? 'text-red-600' :
                      action.priority === 'High' || action.priority === 'P2' ? 'text-orange-600' :
                      'text-gray-700'
                    }`}>
                      {action.priority}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    action.status === 'Blocked' ? 'bg-red-100 text-red-700' :
                    action.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {action.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{action.siteName || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{action.turbineName || '-'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{action.activity}</td>
                <td className="px-4 py-3 text-sm">
                  {action.deadline ? (
                    <span className={action.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                      {format(action.deadline, 'MMM d')}
                      {action.isOverdue && ' (OVERDUE)'}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {format(action.updatedAt, 'MMM d, HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-orange-50 rounded border border-orange-200">
        <p className="text-sm text-orange-800">
          <span className="font-semibold">Escalated:</span> These actions had their priority increased, indicating growing urgency. Review immediately.
        </p>
      </div>
    </div>
  );
}
