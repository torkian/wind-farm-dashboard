/**
 * Dashboard threshold configuration
 *
 * These values determine the color-coding of KPI tiles:
 * - Green: healthy/good performance
 * - Yellow: warning/needs attention
 * - Red: critical/requires immediate action
 *
 * To adjust thresholds, modify the values below and rebuild the app.
 */
export const THRESHOLDS = {
  // SLA Hit Rate: percentage of actions meeting their deadline
  slaHitRate: {
    green: 0.90,  // >= 90% is green
    yellow: 0.80, // >= 80% is yellow, < 90%
    // < 80% is red
  },

  // Critical Backlog >14 days: count of critical cases open for more than 14 days
  criticalBacklog14d: {
    green: 2,   // <= 2 is green (fleet-level)
    yellow: 5,  // <= 5 is yellow, > 2
    // > 5 is red
  },

  // Overdue Actions: count of actions past deadline and not closed
  overdueActions: {
    green: 10,  // <= 10 is green
    yellow: 25, // <= 25 is yellow, > 10
    // > 25 is red
  },

  // Open Critical Cases: total critical severity cases still open
  openCriticalCases: {
    green: 10,  // <= 10 is green
    yellow: 30, // <= 30 is yellow, > 10
    // > 30 is red
  },
};

/**
 * Per-site threshold adjustments
 * If you want different thresholds per site (e.g., larger sites tolerate more backlog),
 * define multipliers here. For now, using fleet-level thresholds for all sites.
 */
export const SITE_THRESHOLD_MULTIPLIERS: Record<string, number> = {
  // Example: 'SITE001': 1.5, // 50% more tolerance for this site
};

/**
 * Date range presets
 */
export const DATE_PRESETS = {
  last7: 7,
  last30: 30,
  last90: 90,
} as const;

/**
 * Action aging buckets (in days)
 */
export const ACTION_AGING_BUCKETS = [
  { label: '0-7d', min: 0, max: 7 },
  { label: '8-14d', min: 8, max: 14 },
  { label: '15-30d', min: 15, max: 30 },
  { label: '31-60d', min: 31, max: 60 },
  { label: '60+d', min: 61, max: Infinity },
];

/**
 * Severity order (for sorting)
 */
export const SEVERITY_ORDER = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
} as const;

/**
 * Priority order (supports both naming conventions)
 */
export const PRIORITY_ORDER = {
  Critical: 1,
  P1: 1,
  High: 2,
  P2: 2,
  Medium: 3,
  P3: 3,
  Low: 4,
  P4: 4,
} as const;

/**
 * Status order (for sorting)
 */
export const STATUS_ORDER = {
  Blocked: 1,
  'In Progress': 2,
  Open: 3,
  Closed: 4,
} as const;

/**
 * Chart colors
 */
export const COLORS = {
  severity: {
    Critical: '#dc2626', // red-600
    High: '#ea580c',     // orange-600
    Medium: '#f59e0b',   // amber-500
    Low: '#84cc16',      // lime-500
  },
  status: {
    Open: '#3b82f6',        // blue-500
    'In Progress': '#8b5cf6', // violet-500
    Closed: '#10b981',      // emerald-500
    Blocked: '#ef4444',     // red-500
  },
  threshold: {
    green: '#10b981',  // emerald-500
    yellow: '#f59e0b', // amber-500
    red: '#dc2626',    // red-600
  },
} as const;

/**
 * Table page sizes
 */
export const TABLE_PAGE_SIZES = [10, 25, 50, 100];

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  dashboardFilters: 'windFarmDashboard_filters',
  lastDataLoad: 'windFarmDashboard_lastLoad',
} as const;

/**
 * CSV column name mappings (case-insensitive)
 * Maps common variations to our standard camelCase field names
 */
export const CSV_COLUMN_MAPPINGS = {
  // Cases
  'site id': 'siteId',
  'site_id': 'siteId',
  'siteid': 'siteId',
  'site name': 'siteName',
  'site_name': 'siteName',
  'turbine id': 'turbineId',
  'turbine_id': 'turbineId',
  'turbineid': 'turbineId',
  'turbine name': 'turbineName',
  'turbine_name': 'turbineName',
  'turbine make': 'turbineMake',
  'turbine_make': 'turbineMake',
  'component id': 'componentId',
  'component_id': 'componentId',
  'componentid': 'componentId',
  'component name': 'componentName',
  'component_name': 'componentName',
  'failure mode id': 'failureModeId',
  'failure_mode_id': 'failureModeId',
  'failuremodeid': 'failureModeId',
  'failure mode name': 'failureModeName',
  'failuremode': 'failureModeName',
  'failure mode': 'failureModeName',
  'failure_mode_name': 'failureModeName',
  'created at': 'createdAt',
  'created_at': 'createdAt',
  'inspected at': 'inspectedAt',
  'inspected_at': 'inspectedAt',
  'confirmed at': 'confirmedAt',
  'confirmed_at': 'confirmedAt',
  'closed at': 'closedAt',
  'closed_at': 'closedAt',
  'updated at': 'updatedAt',
  'updated_at': 'updatedAt',

  // Actions
  'action id': 'actionId',
  'action_id': 'actionId',
  'actionid': 'actionId',
  'case id': 'caseId',
  'case_id': 'caseId',
  'caseid': 'caseId',
  'priority changed': 'priorityChanged',
  'priority_changed': 'priorityChanged',

  // Locations (avoiding duplicates by using different keys)
  'siteid': 'siteId',
  'site id': 'siteId',
  'site_id': 'siteId',
  'sitename': 'siteName',
  'site name': 'siteName',
  'site_name': 'siteName',
  'latitude': 'latitude',
  'lat': 'latitude',
  'longitude': 'longitude',
  'lng': 'longitude',
  'lon': 'longitude',
  'long': 'longitude',
} as const;
