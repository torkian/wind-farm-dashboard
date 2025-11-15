import { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Bell, ArrowUp } from 'lucide-react';

interface DailyChangesProps {
  startDate: Date | null;
  endDate: Date | null;
  changes: {
    newCases: {
      total: number;
      bySeverity: {
        Critical: number;
        High: number;
        Medium: number;
        Low: number;
      };
    };
    newActions: {
      total: number;
      byStatus: Record<string, number>;
    };
    closedCases: number;
    priorityEscalations: {
      total: number;
      actions: any[];
    };
    newCritical: number;
    newOverdue: number;
  };
}

export function DailyChanges({ changes, startDate, endDate }: DailyChangesProps) {
  const getDateRangeLabel = () => {
    if (!startDate || !endDate) return 'All Time';

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) return 'Last 24 Hours';
    if (daysDiff === 7) return 'Last 7 Days';
    if (daysDiff === 30) return 'Last 30 Days';
    if (daysDiff === 90) return 'Last 90 Days';

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={24} className="text-[#24a4ab]" />
        <h2 className="text-xl font-bold text-gray-900">What's Changed - {getDateRangeLabel()}</h2>
        <span className="text-sm text-gray-600">(Use filter panel to adjust date range)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* NEW ACTIONS - MOST IMPORTANT FOR NEXTERA */}
        <div className="bg-[#24a4ab] p-6 rounded-lg border-2 border-[#1d8289] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-white" />
              <h3 className="text-sm font-medium text-white">NEW ACTIONS</h3>
            </div>
            <AlertCircle size={20} className="text-white" />
          </div>
          <div className="text-4xl font-bold text-white">{changes.newActions.total}</div>
          <div className="mt-2 text-xs text-white/90">
            <div className="font-medium">For NextEra Attention</div>
            <div className="mt-1">Open: {changes.newActions.byStatus.Open || 0} | Blocked: {changes.newActions.byStatus.Blocked || 0}</div>
          </div>
        </div>

        {/* Priority Escalations - URGENT */}
        <div className="bg-white p-6 rounded-lg border-2 border-orange-200 bg-orange-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ArrowUp size={18} className="text-orange-600" />
              <h3 className="text-sm font-medium text-orange-900">PRIORITY ESCALATIONS</h3>
            </div>
            <AlertCircle size={20} className="text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{changes.priorityEscalations.total}</div>
          <div className="mt-2 text-xs text-orange-700">
            Actions got more urgent
          </div>
        </div>

        {/* New Cases - Context for CMS Engineers */}
        <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">New Cases (CMS Internal)</h3>
            <TrendingUp size={20} className="text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{changes.newCases.total}</div>
          <div className="mt-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="text-red-600">Critical: {changes.newCases.bySeverity.Critical}</span>
              <span className="text-orange-600">High: {changes.newCases.bySeverity.High}</span>
            </div>
          </div>
        </div>

        {/* Actions Completed */}
        <div className="bg-white p-6 rounded-lg border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Actions Completed</h3>
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">{changes.newActions.byStatus.Closed || 0}</div>
          <div className="mt-2 text-xs text-gray-600">
            {changes.closedCases} cases also closed
          </div>
        </div>
      </div>
    </div>
  );
}
