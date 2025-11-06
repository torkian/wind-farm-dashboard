import { create } from 'zustand';
import { subDays } from 'date-fns';
import type {
  Case,
  Action,
  SiteLocation,
  DashboardFilters,
  DrilldownState,
  LoadedData,
  DateRange,
} from '../types';
import { STORAGE_KEYS } from '../config/thresholds';
import {
  parseCasesCSV,
  parseActionsCSV,
  parseSiteLocationsCSV,
  joinSiteLocations,
  validateData,
  enrichActions,
} from '../utils/parse';

interface DashboardState {
  // Data
  cases: Case[];
  actions: Action[];
  sites: SiteLocation[];
  loadedData: LoadedData | null;
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: DashboardFilters;

  // Drill-down
  drilldown: DrilldownState;

  // Actions
  loadCSVFiles: (casesFile: File, actionsFile: File, sitesFile: File) => Promise<void>;
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  setDrilldown: (drilldown: Partial<DrilldownState>) => void;
  resetDrilldown: () => void;
  persistFilters: () => void;
  loadPersistedFilters: () => void;
}

const getDefaultFilters = (): DashboardFilters => {
  const now = new Date();
  return {
    dateRange: {
      start: subDays(now, 30),
      end: now,
      preset: 'last30',
    },
    sites: [],
    turbines: [],
    severities: [],
    priorities: [],
    statuses: [],
    components: [],
    failureModes: [],
    openOnly: false,
    criticalOnly: false,
    withDeadlineOnly: false,
  };
};

const getDefaultDrilldown = (): DrilldownState => ({
  view: 'fleet',
});

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  cases: [],
  actions: [],
  sites: [],
  loadedData: null,
  isLoading: false,
  error: null,

  filters: getDefaultFilters(),
  drilldown: getDefaultDrilldown(),

  // Load CSV files
  loadCSVFiles: async (casesFile: File, actionsFile: File, sitesFile: File) => {
    set({ isLoading: true, error: null });

    try {
      // Parse all CSVs in parallel
      const [rawCases, rawActions, rawSites] = await Promise.all([
        parseCasesCSV(casesFile),
        parseActionsCSV(actionsFile),
        parseSiteLocationsCSV(sitesFile),
      ]);

      // Join site locations to cases
      const casesWithGeo = joinSiteLocations(rawCases, rawSites);

      // Validate data
      const validation = validateData(casesWithGeo, rawActions);

      // Enrich actions with case data
      const enrichedActions = enrichActions(rawActions, casesWithGeo);

      const loadedData: LoadedData = {
        cases: casesWithGeo,
        actions: enrichedActions,
        sites: rawSites,
        validation,
        loadedAt: new Date(),
      };

      set({
        cases: casesWithGeo,
        actions: enrichedActions,
        sites: rawSites,
        loadedData,
        isLoading: false,
        error: null,
      });

      // Reset drill-down to fleet view after loading new data
      get().resetDrilldown();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load CSV files';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // Set filters (partial update)
  setFilters: (newFilters: Partial<DashboardFilters>) => {
    set(state => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));

    // Debounced persistence happens in the component
  },

  // Reset filters to default
  resetFilters: () => {
    set({ filters: getDefaultFilters() });
    get().persistFilters();
  },

  // Set drill-down state
  setDrilldown: (newDrilldown: Partial<DrilldownState>) => {
    set(state => ({
      drilldown: {
        ...state.drilldown,
        ...newDrilldown,
      },
    }));
  },

  // Reset drill-down to fleet view
  resetDrilldown: () => {
    set({ drilldown: getDefaultDrilldown() });
  },

  // Persist filters to localStorage
  persistFilters: () => {
    const { filters } = get();
    try {
      const serialized = {
        ...filters,
        dateRange: {
          ...filters.dateRange,
          start: filters.dateRange.start?.toISOString() || null,
          end: filters.dateRange.end?.toISOString() || null,
        },
      };
      localStorage.setItem(STORAGE_KEYS.dashboardFilters, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist filters:', error);
    }
  },

  // Load persisted filters from localStorage
  loadPersistedFilters: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.dashboardFilters);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Convert date strings back to Date objects
        if (parsed.dateRange) {
          parsed.dateRange.start = parsed.dateRange.start ? new Date(parsed.dateRange.start) : null;
          parsed.dateRange.end = parsed.dateRange.end ? new Date(parsed.dateRange.end) : null;
        }

        set({ filters: parsed });
      }
    } catch (error) {
      console.error('Failed to load persisted filters:', error);
    }
  },
}));

// Helper hook to debounce filter persistence
export function useFilterPersistence() {
  const persistFilters = useDashboardStore(state => state.persistFilters);

  // Debounce persistence by 500ms
  let timeout: NodeJS.Timeout;

  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      persistFilters();
    }, 500);
  };
}
