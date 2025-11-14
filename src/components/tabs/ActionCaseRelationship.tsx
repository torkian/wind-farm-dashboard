import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronRight, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { Case, Action } from '../../types';
import { format } from 'date-fns';

interface ActionCaseRelationshipProps {
  distribution: { actionsCount: string; cases: number }[];
  casesWithActions: { case: Case; actions: Action[]; actionCount: number }[];
  orphanedActions: Action[];
  stats: {
    totalActions: number;
    totalCases: number;
    casesWithMultipleActions: number;
    avgActionsPerCase: number;
  };
}

export function ActionCaseRelationship({
  distribution,
  casesWithActions,
  orphanedActions,
  stats
}: ActionCaseRelationshipProps) {
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());

  const toggleExpand = (caseId: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(caseId)) {
      newExpanded.delete(caseId);
    } else {
      newExpanded.add(caseId);
    }
    setExpandedCases(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <div className="text-sm text-gray-600">Total Actions</div>
          <div className="text-3xl font-bold text-[#24a4ab]">{stats.totalActions}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <div className="text-sm text-gray-600">Cases with Actions</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalCases}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
          <div className="text-sm text-gray-600">Complex Cases (2+ actions)</div>
          <div className="text-3xl font-bold text-orange-600">{stats.casesWithMultipleActions}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <div className="text-sm text-gray-600">Avg Actions/Case</div>
          <div className="text-3xl font-bold text-gray-900">{stats.avgActionsPerCase.toFixed(1)}</div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions per Case Distribution</h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows complexity: Cases with multiple actions may indicate persistent or complex issues
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="actionsCount" label={{ value: 'Number of Actions', position: 'bottom' }} />
            <YAxis label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="cases" fill="#24a4ab" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expandable Cases Table */}
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cases with Linked Actions</h3>
        <p className="text-sm text-gray-600 mb-4">
          Click to expand and see all actions associated with each case
        </p>

        <div className="space-y-2">
          {casesWithActions.map(({ case: caseItem, actions: linkedActions, actionCount }) => {
            const isExpanded = expandedCases.has(caseItem.id);

            return (
              <div key={caseItem.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Case Header Row */}
                <div
                  onClick={() => toggleExpand(caseItem.id)}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button className="text-gray-600">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        caseItem.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                        caseItem.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                        caseItem.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {caseItem.severity}
                      </span>

                      <div>
                        <div className="font-mono text-sm text-gray-900">Case: {caseItem.id.substring(0, 8)}...</div>
                        <div className="text-xs text-gray-600">{caseItem.siteName} | {caseItem.turbineName}</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700">
                      <span className="font-semibold">{caseItem.componentName}</span>
                      <span className="text-gray-500"> • {caseItem.failureModeName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Timeline */}
                    <div className="text-xs text-gray-600">
                      <div>Created: {format(caseItem.createdAt, 'MMM d')}</div>
                      {caseItem.closedAt && <div className="text-green-600">Closed: {format(caseItem.closedAt, 'MMM d')}</div>}
                      {!caseItem.closedAt && <div className="text-orange-600">Age: {caseItem.ageDays}d</div>}
                    </div>

                    {/* Action Count Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#24a4ab] text-white rounded-full">
                      <LinkIcon size={14} />
                      <span className="font-semibold">{actionCount} action{actionCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Actions List */}
                {isExpanded && (
                  <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <div className="text-sm font-semibold text-gray-900 mb-3">Linked Actions for this Case:</div>
                    <div className="space-y-2">
                      {linkedActions.map(action => (
                        <div key={action.actionId} className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                action.priority === 'Critical' || action.priority === 'P1' ? 'bg-red-100 text-red-700' :
                                action.priority === 'High' || action.priority === 'P2' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {action.priority}
                              </span>

                              <span className={`px-2 py-1 rounded text-xs ${
                                action.status === 'Blocked' ? 'bg-red-100 text-red-700' :
                                action.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                action.status === 'Closed' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {action.status}
                              </span>

                              <span className="font-medium text-gray-900">{action.activity}</span>
                            </div>

                            <div className="flex items-center gap-4 text-xs">
                              {action.deadline && (
                                <span className={action.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                  Due: {format(action.deadline, 'MMM d')}
                                  {action.isOverdue && ' (OVERDUE)'}
                                </span>
                              )}
                              <span className="text-gray-500">
                                Updated: {format(action.updatedAt, 'MMM d')}
                              </span>
                            </div>
                          </div>
                          {action.details && (
                            <div className="mt-2 text-xs text-gray-600">{action.details}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Orphaned Actions Warning */}
      {orphanedActions.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-red-600" />
            <h4 className="font-semibold text-red-900">Data Quality Alert</h4>
          </div>
          <p className="text-sm text-red-700">
            {orphanedActions.length} actions found with invalid case IDs (orphaned). These actions cannot be linked to cases.
          </p>
        </div>
      )}
    </div>
  );
}
