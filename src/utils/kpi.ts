import {
  subDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';
import type {
  Case,
  Action,
  Severity,
  KPISummary,
  SiteKPI,
  HeatmapCell,
  RepeatFailure,
  DashboardFilters,
} from '../types';
import { ACTION_AGING_BUCKETS } from '../config/thresholds';

/**
 * Filters cases based on dashboard filters
 */
export function filterCases(cases: Case[], filters: DashboardFilters): Case[] {
  return cases.filter(caseItem => {
    // Date range
    if (filters.dateRange.start && filters.dateRange.end) {
      const inRange = isWithinInterval(caseItem.createdAt, {
        start: filters.dateRange.start,
        end: filters.dateRange.end,
      });
      if (!inRange) return false;
    }

    // Sites
    if (filters.sites.length > 0 && !filters.sites.includes(caseItem.siteId)) {
      return false;
    }

    // Turbines
    if (filters.turbines.length > 0 && !filters.turbines.includes(caseItem.turbineId)) {
      return false;
    }

    // Severities
    if (filters.severities.length > 0 && !filters.severities.includes(caseItem.severity)) {
      return false;
    }

    // Components
    if (filters.components.length > 0 && !filters.components.includes(caseItem.componentName)) {
      return false;
    }

    // Failure modes
    if (filters.failureModes.length > 0 && !filters.failureModes.includes(caseItem.failureModeName)) {
      return false;
    }

    // Quick toggles
    if (filters.openOnly && !caseItem.isOpen) {
      return false;
    }

    if (filters.criticalOnly && !caseItem.isCritical) {
      return false;
    }

    return true;
  });
}

/**
 * Filters actions based on dashboard filters
 */
export function filterActions(actions: Action[], filters: DashboardFilters): Action[] {
  return actions.filter(action => {
    // Date range
    if (filters.dateRange.start && filters.dateRange.end) {
      const inRange = isWithinInterval(action.createdAt, {
        start: filters.dateRange.start,
        end: filters.dateRange.end,
      });
      if (!inRange) return false;
    }

    // Statuses
    if (filters.statuses.length > 0 && !filters.statuses.includes(action.status)) {
      return false;
    }

    // Priorities
    if (filters.priorities.length > 0 && !filters.priorities.includes(action.priority)) {
      return false;
    }

    // With deadline only
    if (filters.withDeadlineOnly && !action.deadline) {
      return false;
    }

    return true;
  });
}

/**
 * Calculates median of an array of numbers
 */
function median(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

/**
 * Computes open cases by severity with 7-day sparkline
 */
function computeOpenCases(cases: Case[]) {
  const openCases = cases.filter(c => c.isOpen);
  const now = new Date();

  const bySeverity: Record<Severity, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  openCases.forEach(c => {
    bySeverity[c.severity]++;
  });

  // 7-day sparkline: count of open cases created each day
  const sparkline7d: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const count = cases.filter(c =>
      c.isOpen &&
      isWithinInterval(c.createdAt, { start: dayStart, end: dayEnd })
    ).length;

    sparkline7d.push(count);
  }

  return {
    total: openCases.length,
    bySeverity,
    sparkline7d,
  };
}

/**
 * Computes critical backlog >14 days
 */
function computeCriticalBacklog14d(cases: Case[]): number {
  return cases.filter(c =>
    c.isOpen &&
    c.isCritical &&
    c.ageDays > 14
  ).length;
}

/**
 * Computes lifecycle medians (d2i, i2c, c2close)
 */
function computeLifecycleMedians(cases: Case[]) {
  const d2iValues = cases.map(c => c.d2i).filter((v): v is number => v !== null);
  const i2cValues = cases.map(c => c.i2c).filter((v): v is number => v !== null);
  const c2closeValues = cases.map(c => c.c2close).filter((v): v is number => v !== null);

  return {
    d2i: median(d2iValues),
    i2c: median(i2cValues),
    c2close: median(c2closeValues),
  };
}

/**
 * Computes case funnel (Created → Inspected → Confirmed → Closed)
 */
function computeCaseFunnel(cases: Case[]) {
  return {
    created: cases.length,
    inspected: cases.filter(c => c.inspectedAt !== null).length,
    confirmed: cases.filter(c => c.confirmedAt !== null).length,
    closed: cases.filter(c => c.closedAt !== null).length,
  };
}

/**
 * Computes SLA hit rate (last 30 days) with 7-day sparkline
 */
function computeSLAHitRate30d(actions: Action[]) {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const actionsLast30d = actions.filter(a =>
    a.deadline &&
    isWithinInterval(a.createdAt, { start: thirtyDaysAgo, end: now })
  );

  const metSLACount = actionsLast30d.filter(a => a.metSLA === true).length;
  const totalWithDeadline = actionsLast30d.length;

  const rate = totalWithDeadline > 0 ? metSLACount / totalWithDeadline : 0;

  // 7-day sparkline: daily SLA hit rates
  const sparkline7d: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const dayActions = actions.filter(a =>
      a.deadline &&
      a.status === 'Closed' &&
      isWithinInterval(a.updatedAt, { start: dayStart, end: dayEnd })
    );

    const dayMetSLA = dayActions.filter(a => a.metSLA === true).length;
    const dayTotal = dayActions.length;

    const dayRate = dayTotal > 0 ? dayMetSLA / dayTotal : 0;
    sparkline7d.push(dayRate);
  }

  return {
    rate,
    sparkline7d,
  };
}

/**
 * Computes overdue actions count
 */
function computeOverdueActions(actions: Action[]): number {
  return actions.filter(a => a.isOverdue).length;
}

/**
 * Computes priority churn percentage
 */
function computePriorityChurnPercent(actions: Action[]): number {
  const total = actions.length;
  if (total === 0) return 0;

  const changed = actions.filter(a => a.priorityChanged).length;
  return (changed / total) * 100;
}

/**
 * Computes action aging histogram
 */
function computeActionAgingBuckets(actions: Action[]) {
  const openActions = actions.filter(a => a.status !== 'Closed');

  return ACTION_AGING_BUCKETS.map(bucket => {
    const count = openActions.filter(a =>
      a.ageDays >= bucket.min && a.ageDays <= bucket.max
    ).length;

    return {
      label: bucket.label,
      count,
    };
  });
}

/**
 * Computes full KPI summary
 */
export function computeKPIs(
  cases: Case[],
  actions: Action[],
  filters: DashboardFilters
): KPISummary {
  const filteredCases = filterCases(cases, filters);
  const filteredActions = filterActions(actions, filters);

  return {
    openCases: computeOpenCases(filteredCases),
    criticalBacklog14d: computeCriticalBacklog14d(filteredCases),
    lifecycleMedians: computeLifecycleMedians(filteredCases),
    caseFunnel: computeCaseFunnel(filteredCases),
    slaHitRate30d: computeSLAHitRate30d(filteredActions),
    overdueActions: computeOverdueActions(filteredActions),
    priorityChurnPercent: computePriorityChurnPercent(filteredActions),
    actionAgingBuckets: computeActionAgingBuckets(filteredActions),
  };
}

/**
 * Computes site-level KPIs
 */
export function computeSiteKPIs(cases: Case[], actions: Action[]): SiteKPI[] {
  const siteMap = new Map<string, {
    siteId: string;
    siteName: string;
    openCases: number;
    criticalCases: number;
    turbineIds: Set<string>;
  }>();

  // Aggregate cases by site
  cases.forEach(c => {
    if (!siteMap.has(c.siteId)) {
      siteMap.set(c.siteId, {
        siteId: c.siteId,
        siteName: c.siteName,
        openCases: 0,
        criticalCases: 0,
        turbineIds: new Set(),
      });
    }

    const site = siteMap.get(c.siteId)!;

    if (c.isOpen) {
      site.openCases++;
      if (c.isCritical) {
        site.criticalCases++;
      }
    }

    site.turbineIds.add(c.turbineId);
  });

  // Count overdue actions per site
  const caseIdToSite = new Map(cases.map(c => [c.id, c.siteId]));
  const overdueActionsBySite = new Map<string, number>();

  actions.forEach(a => {
    if (a.isOverdue) {
      const siteId = caseIdToSite.get(a.caseId);
      if (siteId) {
        overdueActionsBySite.set(siteId, (overdueActionsBySite.get(siteId) || 0) + 1);
      }
    }
  });

  // Build result
  return Array.from(siteMap.values()).map(site => ({
    siteId: site.siteId,
    siteName: site.siteName,
    openCases: site.openCases,
    criticalCases: site.criticalCases,
    overdueActions: overdueActionsBySite.get(site.siteId) || 0,
    turbineCount: site.turbineIds.size,
    casesPerTurbine: site.turbineIds.size > 0 ? site.openCases / site.turbineIds.size : 0,
  }));
}

/**
 * Computes risk heatmap (Sites × Components)
 */
export function computeHeatmap(cases: Case[]): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  const map = new Map<string, HeatmapCell>();

  cases.forEach(c => {
    const key = `${c.siteId}::${c.componentName}`;

    if (!map.has(key)) {
      map.set(key, {
        siteId: c.siteId,
        siteName: c.siteName,
        componentName: c.componentName,
        criticalCount: 0,
        openCount: 0,
      });
    }

    const cell = map.get(key)!;

    if (c.isOpen) {
      cell.openCount++;
      if (c.isCritical) {
        cell.criticalCount++;
      }
    }
  });

  return Array.from(map.values());
}

/**
 * Computes repeat failures (by component or failure mode)
 */
export function computeRepeatFailures(
  cases: Case[],
  groupBy: 'component' | 'failureMode' = 'component'
): RepeatFailure[] {
  const map = new Map<string, { count: number; sites: Set<string> }>();

  cases.forEach(c => {
    if (!c.isOpen) return;

    const key = groupBy === 'component' ? c.componentName : c.failureModeName;

    if (!map.has(key)) {
      map.set(key, { count: 0, sites: new Set() });
    }

    const entry = map.get(key)!;
    entry.count++;
    entry.sites.add(c.siteId);
  });

  const failures: RepeatFailure[] = Array.from(map.entries())
    .map(([key, data]) => ({
      key,
      label: key,
      count: data.count,
      sites: data.sites.size,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10

  return failures;
}

/**
 * Gets unique filter options from data
 */
export function getFilterOptions(cases: Case[], actions: Action[]) {
  const sites = Array.from(new Set(cases.map(c => c.siteId)))
    .map(id => {
      const c = cases.find(c => c.siteId === id);
      return { id, name: c?.siteName || id };
    });

  const turbines = Array.from(new Set(cases.map(c => c.turbineId)))
    .map(id => {
      const c = cases.find(c => c.turbineId === id);
      return { id, name: c?.turbineName || id };
    });

  const components = Array.from(new Set(cases.map(c => c.componentName))).sort();
  const failureModes = Array.from(new Set(cases.map(c => c.failureModeName))).sort();

  const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = Array.from(new Set(actions.map(a => a.status)));
  const priorities = Array.from(new Set(actions.map(a => a.priority)));

  return {
    sites,
    turbines,
    components,
    failureModes,
    severities,
    statuses,
    priorities,
  };
}

/**
 * Computes case creation trend over time (daily aggregation)
 */
export function computeCaseTrend(cases: Case[], days: number = 30) {
  const now = new Date();
  const trend: { date: string; Critical: number; High: number; Medium: number; Low: number; total: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const dayCases = cases.filter(c =>
      isWithinInterval(c.createdAt, { start: dayStart, end: dayEnd })
    );

    const bySeverity = {
      Critical: dayCases.filter(c => c.severity === 'Critical').length,
      High: dayCases.filter(c => c.severity === 'High').length,
      Medium: dayCases.filter(c => c.severity === 'Medium').length,
      Low: dayCases.filter(c => c.severity === 'Low').length,
    };

    trend.push({
      date: day.toISOString().split('T')[0],
      ...bySeverity,
      total: dayCases.length,
    });
  }

  return trend;
}

/**
 * Computes backlog growth over time (created vs closed with actual backlog count)
 */
export function computeBacklogGrowth(cases: Case[], days: number = 90) {
  const now = new Date();
  const growth: { date: string; created: number; closed: number; netBacklog: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    // Cases created on this day
    const created = cases.filter(c =>
      isWithinInterval(c.createdAt, { start: dayStart, end: dayEnd })
    ).length;

    // Cases closed on this day
    const closed = cases.filter(c =>
      c.closedAt && isWithinInterval(c.closedAt, { start: dayStart, end: dayEnd })
    ).length;

    // Actual backlog at end of this day = cases that existed and were still open
    const netBacklog = cases.filter(c =>
      c.createdAt <= dayEnd && (c.closedAt === null || c.closedAt > dayEnd)
    ).length;

    growth.push({
      date: day.toISOString().split('T')[0],
      created,
      closed,
      netBacklog,
    });
  }

  return growth;
}

/**
 * Computes turbine make comparison metrics
 */
export function computeTurbineMakeMetrics(cases: Case[], actions: Action[]) {
  const makeMap = new Map<string, {
    make: string;
    totalCases: number;
    openCases: number;
    criticalCases: number;
    avgAgeDays: number;
    turbineCount: number;
  }>();

  // Aggregate by make
  cases.forEach(c => {
    if (!makeMap.has(c.turbineMake)) {
      makeMap.set(c.turbineMake, {
        make: c.turbineMake,
        totalCases: 0,
        openCases: 0,
        criticalCases: 0,
        avgAgeDays: 0,
        turbineCount: 0,
      });
    }

    const make = makeMap.get(c.turbineMake)!;
    make.totalCases++;
    if (c.isOpen) make.openCases++;
    if (c.isCritical) make.criticalCases++;
    make.avgAgeDays += c.ageDays;
  });

  // Calculate averages and turbine counts
  const turbineCounts = new Map<string, Set<string>>();
  cases.forEach(c => {
    if (!turbineCounts.has(c.turbineMake)) {
      turbineCounts.set(c.turbineMake, new Set());
    }
    turbineCounts.get(c.turbineMake)!.add(c.turbineId);
  });

  return Array.from(makeMap.values()).map(make => {
    const turbineCount = turbineCounts.get(make.make)?.size || 1;
    return {
      ...make,
      avgAgeDays: make.totalCases > 0 ? make.avgAgeDays / make.totalCases : 0,
      turbineCount,
      casesPerTurbine: make.totalCases / turbineCount,
    };
  }).sort((a, b) => b.totalCases - a.totalCases);
}

/**
 * Computes action resolution velocity (time from creation to completion)
 */
export function computeActionResolutionVelocity(actions: Action[]) {
  const closedActions = actions.filter(a => a.status === 'Closed');

  const velocityBuckets = [
    { label: '0-1d', min: 0, max: 1, count: 0 },
    { label: '1-3d', min: 1, max: 3, count: 0 },
    { label: '3-7d', min: 3, max: 7, count: 0 },
    { label: '7-14d', min: 7, max: 14, count: 0 },
    { label: '14-30d', min: 14, max: 30, count: 0 },
    { label: '30+d', min: 30, max: Infinity, count: 0 },
  ];

  closedActions.forEach(action => {
    const resolutionDays = differenceInDays(action.updatedAt, action.createdAt);

    for (const bucket of velocityBuckets) {
      if (resolutionDays >= bucket.min && resolutionDays < bucket.max) {
        bucket.count++;
        break;
      }
    }
  });

  return velocityBuckets;
}

/**
 * Computes severity distribution (for pie chart)
 */
export function computeSeverityDistribution(cases: Case[]) {
  const distribution = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  cases.forEach(c => {
    distribution[c.severity]++;
  });

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
    percentage: cases.length > 0 ? (value / cases.length) * 100 : 0,
  }));
}

/**
 * Computes site comparison metrics for radar chart
 */
export function computeSiteRadarMetrics(cases: Case[], actions: Action[], siteIds: string[]) {
  return siteIds.map(siteId => {
    const siteCases = cases.filter(c => c.siteId === siteId);
    const siteActions = actions.filter(a => {
      const caseItem = cases.find(c => c.id === a.caseId);
      return caseItem?.siteId === siteId;
    });

    const openCases = siteCases.filter(c => c.isOpen).length;
    const criticalCases = siteCases.filter(c => c.isCritical).length;
    const avgAge = siteCases.length > 0
      ? siteCases.reduce((sum, c) => sum + c.ageDays, 0) / siteCases.length
      : 0;
    const overdueActions = siteActions.filter(a => a.isOverdue).length;
    const slaRate = siteActions.filter(a => a.deadline).length > 0
      ? siteActions.filter(a => a.metSLA === true).length / siteActions.filter(a => a.deadline).length
      : 0;

    return {
      site: siteCases[0]?.siteName || siteId,
      openCases: Math.min(openCases, 100), // Normalize for radar
      criticalCases: Math.min(criticalCases, 50),
      avgAge: Math.min(avgAge, 100),
      overdueActions: Math.min(overdueActions, 50),
      slaRate: slaRate * 100,
    };
  });
}

/**
 * Computes changes since yesterday (last 24 hours)
 */
export function computeDailyChanges(cases: Case[], actions: Action[], hours: number = 24) {
  const now = new Date();
  const lookbackTime = new Date(now.getTime() - (hours * 60 * 60 * 1000));
  const timeStart = lookbackTime;

  // New cases created since yesterday
  const newCases = cases.filter(c =>
    c.createdAt >= timeStart
  );

  // New actions created since yesterday
  const newActions = actions.filter(a =>
    a.createdAt >= timeStart
  );

  // Cases closed since yesterday
  const closedCases = cases.filter(c =>
    c.closedAt && c.closedAt >= timeStart
  );

  // Priority escalations (priority changed in last 24h)
  const priorityEscalations = actions.filter(a =>
    a.priorityChanged && a.updatedAt >= timeStart
  );

  return {
    newCases: {
      total: newCases.length,
      bySeverity: {
        Critical: newCases.filter(c => c.severity === 'Critical').length,
        High: newCases.filter(c => c.severity === 'High').length,
        Medium: newCases.filter(c => c.severity === 'Medium').length,
        Low: newCases.filter(c => c.severity === 'Low').length,
      },
    },
    newActions: {
      total: newActions.length,
      byStatus: {
        Open: newActions.filter(a => a.status === 'Open').length,
        'In Progress': newActions.filter(a => a.status === 'In Progress').length,
        Closed: newActions.filter(a => a.status === 'Closed').length,
        Blocked: newActions.filter(a => a.status === 'Blocked').length,
      },
    },
    closedCases: closedCases.length,
    priorityEscalations: {
      total: priorityEscalations.length,
      actions: priorityEscalations.slice(0, 10), // Top 10 recent escalations
    },
    newCritical: newCases.filter(c => c.severity === 'Critical').length,
    newOverdue: newActions.filter(a => a.isOverdue).length,
  };
}

/**
 * Computes action-case distribution and relationship metrics
 */
export function computeActionCaseDistribution(cases: Case[], actions: Action[]) {
  // Group actions by case
  const actionsByCase = new Map<string, Action[]>();
  
  actions.forEach(action => {
    if (!actionsByCase.has(action.caseId)) {
      actionsByCase.set(action.caseId, []);
    }
    actionsByCase.get(action.caseId)!.push(action);
  });

  // Count distribution
  const distribution = [
    { actionsCount: '1', cases: 0 },
    { actionsCount: '2', cases: 0 },
    { actionsCount: '3', cases: 0 },
    { actionsCount: '4', cases: 0 },
    { actionsCount: '5+', cases: 0 },
  ];

  actionsByCase.forEach((acts, caseId) => {
    const count = acts.length;
    if (count === 1) distribution[0].cases++;
    else if (count === 2) distribution[1].cases++;
    else if (count === 3) distribution[2].cases++;
    else if (count === 4) distribution[3].cases++;
    else distribution[4].cases++;
  });

  // Build detailed case list with actions
  const casesWithActions = cases
    .map(c => ({
      case: c,
      actions: actionsByCase.get(c.id) || [],
      actionCount: (actionsByCase.get(c.id) || []).length,
    }))
    .filter(item => item.actionCount > 0) // Only cases with actions
    .sort((a, b) => b.actionCount - a.actionCount); // Most actions first

  // Orphaned actions (no matching case)
  const validCaseIds = new Set(cases.map(c => c.id));
  const orphanedActions = actions.filter(a => !validCaseIds.has(a.caseId));

  return {
    distribution,
    casesWithActions,
    orphanedActions,
    totalActions: actions.length,
    totalCases: cases.length,
    casesWithMultipleActions: casesWithActions.filter(c => c.actionCount > 1).length,
    avgActionsPerCase: casesWithActions.length > 0 
      ? actions.length / casesWithActions.length 
      : 0,
  };
}

/**
 * Computes action creation trend over time (daily aggregation)
 */
export function computeActionTrend(actions: Action[], days: number = 30) {
  const now = new Date();
  const trend: { date: string; Critical: number; High: number; Medium: number; Low: number; total: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const dayActions = actions.filter(a =>
      isWithinInterval(a.createdAt, { start: dayStart, end: dayEnd })
    );

    // Group by priority (handle both naming conventions)
    const byPriority = {
      Critical: dayActions.filter(a => a.priority === 'Critical' || a.priority === 'P1').length,
      High: dayActions.filter(a => a.priority === 'High' || a.priority === 'P2').length,
      Medium: dayActions.filter(a => a.priority === 'Medium' || a.priority === 'P3').length,
      Low: dayActions.filter(a => a.priority === 'Low' || a.priority === 'P4').length,
    };

    trend.push({
      date: day.toISOString().split('T')[0],
      ...byPriority,
      total: dayActions.length,
    });
  }

  return trend;
}

/**
 * Computes priority distribution for actions
 */
export function computePriorityDistribution(actions: Action[]) {
  const distribution = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };

  actions.forEach(a => {
    if (a.priority === 'Critical' || a.priority === 'P1') distribution.Critical++;
    else if (a.priority === 'High' || a.priority === 'P2') distribution.High++;
    else if (a.priority === 'Medium' || a.priority === 'P3') distribution.Medium++;
    else distribution.Low++;
  });

  const total = actions.length;

  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0,
  }));
}

/**
 * Computes action backlog growth over time
 */
export function computeActionBacklogGrowth(actions: Action[], days: number = 90) {
  const now = new Date();
  const growth: { date: string; created: number; closed: number; openActions: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(now, i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    // Actions created on this day
    const created = actions.filter(a =>
      isWithinInterval(a.createdAt, { start: dayStart, end: dayEnd })
    ).length;

    // Actions closed on this day  
    const closed = actions.filter(a =>
      a.status === 'Closed' &&
      isWithinInterval(a.updatedAt, { start: dayStart, end: dayEnd })
    ).length;

    // Open actions at end of this day
    const openActions = actions.filter(a =>
      a.createdAt <= dayEnd && 
      (a.status !== 'Closed' || a.updatedAt > dayEnd)
    ).length;

    growth.push({
      date: day.toISOString().split('T')[0],
      created,
      closed,
      openActions,
    });
  }

  return growth;
}
