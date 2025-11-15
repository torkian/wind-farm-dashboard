import { useState } from 'react';
import { DashboardFilters, Severity, Status, Priority } from '../../types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterPanelProps {
  filters: DashboardFilters;
  filterOptions: {
    sites: { id: string; name: string }[];
    turbines: { id: string; name: string }[];
    severities: Severity[];
    statuses: Status[];
    priorities: Priority[];
    components: string[];
    failureModes: string[];
  };
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  onReset: () => void;
}

export function FilterPanel({ filters, filterOptions, onFilterChange, onReset }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 mb-6">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:text-blue-600 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          <h3 className="text-lg font-semibold text-black">Filters</h3>
        </button>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="p-6">

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Date Range Pickers */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                const start = e.target.value ? new Date(e.target.value) : null;
                onFilterChange({
                  dateRange: { ...filters.dateRange, start, preset: 'custom' },
                });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <span className="text-gray-600 self-center">to</span>
            <input
              type="date"
              value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                const end = e.target.value ? new Date(e.target.value) : new Date();
                onFilterChange({
                  dateRange: { ...filters.dateRange, end, preset: 'custom' },
                });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                onFilterChange({ dateRange: { start, end, preset: 'last7' } });
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-[#24a4ab] hover:text-white rounded"
            >
              7d
            </button>
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                onFilterChange({ dateRange: { start, end, preset: 'last30' } });
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-[#24a4ab] hover:text-white rounded"
            >
              30d
            </button>
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                onFilterChange({ dateRange: { start, end, preset: 'last90' } });
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-[#24a4ab] hover:text-white rounded"
            >
              90d
            </button>
            <button
              onClick={() => {
                onFilterChange({ dateRange: { start: null, end: null, preset: 'allTime' } });
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-[#24a4ab] hover:text-white rounded"
            >
              All
            </button>
          </div>
        </div>

        {/* Sites */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Sites ({filters.sites.length} selected)
          </label>
          <select
            multiple
            value={filters.sites}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              onFilterChange({ sites: selected });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
          >
            {filterOptions.sites.map(site => (
              <option className="text-black" key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>

        {/* Severities */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Severity ({filters.severities.length} selected)
          </label>
          <select
            multiple
            value={filters.severities}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value) as Severity[];
              onFilterChange({ severities: selected });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
          >
            {filterOptions.severities.map(sev => (
              <option className="text-black" key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>
        </div>

        {/* Statuses */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Status ({filters.statuses.length} selected)
          </label>
          <select
            multiple
            value={filters.statuses}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value) as Status[];
              onFilterChange({ statuses: selected });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
          >
            {filterOptions.statuses.map(status => (
              <option className="text-black" key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Components */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Components ({filters.components.length} selected)
          </label>
          <select
            multiple
            value={filters.components}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              onFilterChange({ components: selected });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
          >
            {filterOptions.components.map(comp => (
              <option className="text-black" key={comp} value={comp}>
                {comp}
              </option>
            ))}
          </select>
        </div>

        {/* Priorities */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Priority ({filters.priorities.length} selected)
          </label>
          <select
            multiple
            value={filters.priorities}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value) as Priority[];
              onFilterChange({ priorities: selected });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
          >
            {filterOptions.priorities.map(priority => (
              <option className="text-black" key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        {/* Turbines */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Turbines ({filters.turbines.length} selected)
          </label>
          <select
            multiple
            value={filters.turbines}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              onFilterChange({ turbines: selected });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
          >
            {filterOptions.turbines.map(turbine => (
              <option className="text-black" key={turbine.id} value={turbine.id}>
                {turbine.name}
              </option>
            ))}
          </select>
        </div>

        {/* Failure Modes */}
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Failure Modes ({filters.failureModes.length} selected)
          </label>
          <select
            multiple
            value={filters.failureModes}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              onFilterChange({ failureModes: selected });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-20"
          >
            {filterOptions.failureModes.map(fm => (
              <option className="text-black" key={fm} value={fm}>
                {fm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Toggle Checkboxes */}
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.openOnly}
            onChange={(e) => onFilterChange({ openOnly: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Open cases only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.criticalOnly}
            onChange={(e) => onFilterChange({ criticalOnly: e.target.checked })}
            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm text-gray-700">Critical only</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.withDeadlineOnly}
            onChange={(e) => onFilterChange({ withDeadlineOnly: e.target.checked })}
            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">With deadline only</span>
        </label>
      </div>

      {/* Active Filters Summary Chips */}
      {(filters.sites.length > 0 || filters.turbines.length > 0 || filters.severities.length > 0 ||
        filters.statuses.length > 0 || filters.priorities.length > 0 || filters.components.length > 0 ||
        filters.failureModes.length > 0 || filters.openOnly || filters.criticalOnly || filters.withDeadlineOnly) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.sites.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {filters.sites.length} site(s)
              </span>
            )}
            {filters.turbines.length > 0 && (
              <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-medium">
                {filters.turbines.length} turbine(s)
              </span>
            )}
            {filters.severities.length > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                {filters.severities.join(', ')}
              </span>
            )}
            {filters.statuses.length > 0 && (
              <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                {filters.statuses.join(', ')}
              </span>
            )}
            {filters.priorities.length > 0 && (
              <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium">
                {filters.priorities.join(', ')}
              </span>
            )}
            {filters.components.length > 0 && (
              <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-medium">
                {filters.components.length} component(s)
              </span>
            )}
            {filters.failureModes.length > 0 && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                {filters.failureModes.length} failure mode(s)
              </span>
            )}
            {filters.openOnly && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                Open only
              </span>
            )}
            {filters.criticalOnly && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                Critical only
              </span>
            )}
            {filters.withDeadlineOnly && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                With deadline
              </span>
            )}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
