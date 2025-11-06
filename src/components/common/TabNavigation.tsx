import { ReactNode } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Settings,
  MapPin,
  CheckSquare,
  LucideIcon,
} from 'lucide-react';

export type TabId = 'overview' | 'trends' | 'sites' | 'components' | 'map' | 'actions';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'trends', label: 'Trends & Analytics', icon: TrendingUp },
  { id: 'sites', label: 'Site Intelligence', icon: Building2 },
  { id: 'components', label: 'Component Analysis', icon: Settings },
  { id: 'map', label: 'Geographic Map', icon: MapPin },
  { id: 'actions', label: 'Action Queue', icon: CheckSquare },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6">
        <nav className="flex space-x-1 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-6 py-4 text-sm font-medium border-b-3 transition-all whitespace-nowrap flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'border-[#24a4ab] text-[#24a4ab] bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={18} className={activeTab === tab.id ? 'text-[#24a4ab]' : 'text-gray-500'} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

interface TabPanelProps {
  activeTab: TabId;
  tabId: TabId;
  children: ReactNode;
}

export function TabPanel({ activeTab, tabId, children }: TabPanelProps) {
  if (activeTab !== tabId) return null;

  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
}
