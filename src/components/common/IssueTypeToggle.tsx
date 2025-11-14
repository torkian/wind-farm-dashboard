import { Cpu, Wrench, Layers } from 'lucide-react';
import { IssueType } from '../../utils/issueTypeFilter';

interface IssueTypeToggleProps {
  issueType: IssueType;
  onIssueTypeChange: (type: IssueType) => void;
}

export function IssueTypeToggle({ issueType, onIssueTypeChange }: IssueTypeToggleProps) {
  return (
    <div className="bg-white border-b border-gray-200 py-3 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-medium text-gray-700">View:</span>
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => onIssueTypeChange('all')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md transition-all ${
                issueType === 'all'
                  ? 'bg-[#24a4ab] text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Layers size={18} />
              All Issues
            </button>
            <button
              onClick={() => onIssueTypeChange('cms_hardware')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md transition-all ${
                issueType === 'cms_hardware'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Cpu size={18} />
              CMS Hardware
            </button>
            <button
              onClick={() => onIssueTypeChange('mechanical')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-md transition-all ${
                issueType === 'mechanical'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Wrench size={18} />
              Mechanical Drivetrain
            </button>
          </div>

          {issueType !== 'all' && (
            <div className="text-xs text-gray-600 ml-4">
              {issueType === 'cms_hardware'
                ? 'Showing: Sensors, accelerometers, DAQ, cables (CMS team)'
                : 'Showing: Gearbox, bearings, generators, blades (Mechanical team)'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
