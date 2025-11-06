// Core Data Types

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type Status = 'Open' | 'In Progress' | 'Closed' | 'Blocked';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low' | 'P1' | 'P2' | 'P3' | 'P4';

// Raw CSV row types (before normalization)
export interface RawCase {
  id: string;
  siteId: string;
  siteName: string;
  turbineId: string;
  turbineName: string;
  turbineMake: string;
  componentId: string;
  componentName: string;
  failureModeId: string;
  failureModeName: string;
  severity: string;
  createdAt: string;
  inspectedAt?: string;
  confirmedAt?: string;
  closedAt?: string;
  updatedAt: string;
}

export interface RawAction {
  actionId: string;
  caseId: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  priority: string;
  priorityChanged: string | boolean | number;
  status: string;
  activity: string;
  details: string;
}

export interface RawSiteLocation {
  siteId: string;
  siteName: string;
  latitude: string | number;
  longitude: string | number;
}

// Normalized/Processed types
export interface Case {
  id: string;
  siteId: string;
  siteName: string;
  turbineId: string;
  turbineName: string;
  turbineMake: string;
  componentId: string;
  componentName: string;
  failureModeId: string;
  failureModeName: string;
  severity: Severity;
  createdAt: Date;
  inspectedAt: Date | null;
  confirmedAt: Date | null;
  closedAt: Date | null;
  updatedAt: Date;

  // Derived fields
  isOpen: boolean;
  ageDays: number;
  d2i: number | null; // detection to inspection (hours)
  i2c: number | null; // inspection to confirmation (hours)
  c2close: number | null; // confirmation to close (hours)
  isCritical: boolean;

  // Geospatial (from join)
  latitude: number | null;
  longitude: number | null;
  noGeo: boolean;
}

export interface Action {
  actionId: string;
  caseId: string;
  createdAt: Date;
  updatedAt: Date;
  deadline: Date | null;
  priority: Priority;
  priorityChanged: boolean;
  status: Status;
  activity: string;
  details: string;

  // Derived fields
  isOverdue: boolean;
  metSLA: boolean | null;
  ageDays: number;

  // Joined from case for convenience
  siteName?: string;
  turbineName?: string;
  severity?: Severity;
}

export interface SiteLocation {
  siteId: string;
  siteName: string;
  latitude: number;
  longitude: number;
}

// Filter Types
export interface DateRange {
  start: Date | null;
  end: Date | null;
  preset: 'last7' | 'last30' | 'last90' | 'allTime' | 'custom';
}

export interface DashboardFilters {
  dateRange: DateRange;
  sites: string[]; // siteIds
  turbines: string[]; // turbineIds
  severities: Severity[];
  priorities: Priority[];
  statuses: Status[];
  components: string[]; // componentNames
  failureModes: string[]; // failureModeNames

  // Quick toggles
  openOnly: boolean;
  criticalOnly: boolean;
  withDeadlineOnly: boolean;
}

// KPI Types
export interface KPISummary {
  // Backlog & Flow
  openCases: {
    total: number;
    bySeverity: Record<Severity, number>;
    sparkline7d: number[]; // daily counts for last 7 days
  };
  criticalBacklog14d: number;

  // Lifecycle medians (hours)
  lifecycleMedians: {
    d2i: number | null;
    i2c: number | null;
    c2close: number | null;
  };

  // Case funnel
  caseFunnel: {
    created: number;
    inspected: number;
    confirmed: number;
    closed: number;
  };

  // Execution
  slaHitRate30d: {
    rate: number; // 0-1
    sparkline7d: number[]; // daily rates for last 7 days
  };
  overdueActions: number;
  priorityChurnPercent: number;

  // Action aging histogram
  actionAgingBuckets: {
    label: string;
    count: number;
  }[];
}

export interface SiteKPI {
  siteId: string;
  siteName: string;
  openCases: number;
  criticalCases: number;
  overdueActions: number;
  turbineCount: number;
  casesPerTurbine: number;
}

export interface HeatmapCell {
  siteId: string;
  siteName: string;
  componentName: string;
  criticalCount: number;
  openCount: number;
}

export interface RepeatFailure {
  key: string; // componentName or failureModeName
  label: string;
  count: number;
  sites: number; // number of unique sites affected
}

// Drill-down view types
export type DrilldownView = 'fleet' | 'site' | 'turbine' | 'case' | 'action';

export interface DrilldownState {
  view: DrilldownView;
  siteId?: string;
  turbineId?: string;
  caseId?: string;
  actionId?: string;
}

// State persistence
export interface PersistedState {
  filters: DashboardFilters;
  lastUpdated: string;
}

// Data validation
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  orphanedActions: Action[]; // actions with no matching case
}

// Chart data types
export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface BarChartData {
  category: string;
  value: number;
  fill?: string;
}

// Threshold configuration
export interface ThresholdConfig {
  slaHitRate: {
    green: number; // >= this value
    yellow: number; // >= this value, < green
    // red is < yellow
  };
  criticalBacklog14d: {
    green: number; // <= this value
    yellow: number; // <= this value, > green
    // red is > yellow
  };
  overdueActions: {
    green: number; // <= this value
    yellow: number; // <= this value, > green
    // red is > yellow
  };
  openCriticalCases: {
    green: number; // <= this value
    yellow: number; // <= this value, > green
    // red is > yellow
  };
}

export type ThresholdLevel = 'green' | 'yellow' | 'red';

// Helper types
export interface CSVUploadState {
  cases: File | null;
  actions: File | null;
  locations: File | null;
}

export interface LoadedData {
  cases: Case[];
  actions: Action[];
  sites: SiteLocation[];
  validation: ValidationResult;
  loadedAt: Date;
}
