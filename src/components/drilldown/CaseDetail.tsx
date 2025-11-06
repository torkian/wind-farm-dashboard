import { format } from 'date-fns';
import { Case, Action } from '../../types';

interface CaseDetailProps {
  caseData: Case;
  actions: Action[];
}

export function CaseDetail({ caseData, actions }: CaseDetailProps) {
  const caseActions = actions.filter(a => a.caseId === caseData.id);

  return (
    <div className="space-y-6">
      {/* Case Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Case ID</h3>
          <p className="text-lg font-semibold">{caseData.id}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Severity</h3>
          <p className={`text-lg font-semibold ${
            caseData.severity === 'Critical' ? 'text-red-600' :
            caseData.severity === 'High' ? 'text-orange-600' :
            caseData.severity === 'Medium' ? 'text-amber-600' :
            'text-lime-600'
          }`}>
            {caseData.severity}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Site</h3>
          <p className="text-lg">{caseData.siteName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Turbine</h3>
          <p className="text-lg">{caseData.turbineName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Component</h3>
          <p className="text-lg">{caseData.componentName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Failure Mode</h3>
          <p className="text-lg">{caseData.failureModeName}</p>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Case Timeline</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
            <div className="flex-1">
              <div className="font-medium">Created</div>
              <div className="text-sm text-gray-600">
                {format(caseData.createdAt, 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          </div>

          {caseData.inspectedAt && (
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-violet-500" />
              <div className="flex-1">
                <div className="font-medium">Inspected</div>
                <div className="text-sm text-gray-600">
                  {format(caseData.inspectedAt, 'MMM d, yyyy HH:mm')}
                </div>
                {caseData.d2i !== null && (
                  <div className="text-xs text-gray-500">
                    Detection → Inspection: {caseData.d2i.toFixed(1)} hours
                  </div>
                )}
              </div>
            </div>
          )}

          {caseData.confirmedAt && (
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-amber-500" />
              <div className="flex-1">
                <div className="font-medium">Confirmed</div>
                <div className="text-sm text-gray-600">
                  {format(caseData.confirmedAt, 'MMM d, yyyy HH:mm')}
                </div>
                {caseData.i2c !== null && (
                  <div className="text-xs text-gray-500">
                    Inspection → Confirmation: {caseData.i2c.toFixed(1)} hours
                  </div>
                )}
              </div>
            </div>
          )}

          {caseData.closedAt && (
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <div className="font-medium">Closed</div>
                <div className="text-sm text-gray-600">
                  {format(caseData.closedAt, 'MMM d, yyyy HH:mm')}
                </div>
                {caseData.c2close !== null && (
                  <div className="text-xs text-gray-500">
                    Confirmation → Close: {caseData.c2close.toFixed(1)} hours
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linked Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Linked Actions ({caseActions.length})
        </h3>
        {caseActions.length === 0 ? (
          <p className="text-gray-500">No actions linked to this case</p>
        ) : (
          <div className="space-y-3">
            {caseActions.map(action => (
              <div key={action.actionId} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{action.activity}</div>
                    <div className="text-sm text-gray-600">{action.details}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      action.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                      action.status === 'In Progress' ? 'bg-violet-100 text-violet-700' :
                      action.status === 'Closed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {action.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      action.priority.includes('Critical') || action.priority === 'P1' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {action.priority}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <div>Created: {format(action.createdAt, 'MMM d, yyyy')}</div>
                  {action.deadline && (
                    <div className={action.isOverdue ? 'text-red-600 font-semibold' : ''}>
                      Deadline: {format(action.deadline, 'MMM d, yyyy')}
                      {action.isOverdue && ' (OVERDUE)'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
