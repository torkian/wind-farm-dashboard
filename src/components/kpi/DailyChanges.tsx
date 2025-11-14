import { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Bell, ArrowUp } from 'lucide-react';

interface DailyChangesProps {
  onTimeRangeChange: (hours: number) => void;
  timeRange: number;
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

export function DailyChanges({ changes, onTimeRangeChange, timeRange }: DailyChangesProps) {
  const [isCustom, setIsCustom] = useState(false);
  const [customHours, setCustomHours] = useState(timeRange);

  const handlePresetChange = (hours: number) => {
    setIsCustom(false);
    onTimeRangeChange(hours);
  };

  const handleCustomSubmit = () => {
    if (customHours > 0 && customHours <= 720) { // Max 30 days
      onTimeRangeChange(customHours);
    }
  };

  const getTimeLabel = () => {
    if (timeRange === 24) return 'Yesterday';
    if (timeRange === 48) return 'Last 2 Days';
    if (timeRange === 168) return 'Last Week';
    return `Last ${timeRange} Hours`;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={24} className="text-[#24a4ab]" />
          <h2 className="text-xl font-bold text-gray-900">What's Changed - {getTimeLabel()}</h2>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Lookback period:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePresetChange(24)}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === 24 ? 'bg-[#24a4ab] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              24h
            </button>
            <button
              onClick={() => handlePresetChange(48)}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === 48 ? 'bg-[#24a4ab] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              48h
            </button>
            <button
              onClick={() => handlePresetChange(168)}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === 168 ? 'bg-[#24a4ab] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              7 days
            </button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max="720"
                value={customHours}
                onChange={(e) => setCustomHours(Number(e.target.value))}
                onFocus={() => setIsCustom(true)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="hrs"
              />
              <button
                onClick={handleCustomSubmit}
                className="px-3 py-1 text-sm bg-[#24a4ab] text-white rounded hover:bg-[#1d8289]"
              >
                Go
              </button>
            </div>
          </div>
        </div>
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
