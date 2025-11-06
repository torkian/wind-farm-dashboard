import { describe, it, expect } from 'vitest';
import { subDays, addHours } from 'date-fns';
import type { Case, Action, DashboardFilters } from '../types';
import { computeKPIs, filterCases, filterActions } from './kpi';

// Helper to create test case
function createTestCase(overrides: Partial<Case> = {}): Case {
  const now = new Date();
  return {
    id: 'case-1',
    siteId: 'site-1',
    siteName: 'Site 1',
    turbineId: 'turbine-1',
    turbineName: 'Turbine 1',
    turbineMake: 'Maker A',
    componentId: 'comp-1',
    componentName: 'Gearbox',
    failureModeId: 'fm-1',
    failureModeName: 'Bearing failure',
    severity: 'Critical',
    createdAt: subDays(now, 10),
    inspectedAt: addHours(subDays(now, 10), 2),
    confirmedAt: addHours(subDays(now, 10), 6),
    closedAt: null,
    updatedAt: now,
    isOpen: true,
    ageDays: 10,
    d2i: 2,
    i2c: 4,
    c2close: null,
    isCritical: true,
    latitude: 40.0,
    longitude: -80.0,
    noGeo: false,
    ...overrides,
  };
}

// Helper to create test action
function createTestAction(overrides: Partial<Action> = {}): Action {
  const now = new Date();
  return {
    actionId: 'action-1',
    caseId: 'case-1',
    createdAt: subDays(now, 5),
    updatedAt: now,
    deadline: addHours(now, 24),
    priority: 'High',
    priorityChanged: false,
    status: 'Open',
    activity: 'Inspect component',
    details: 'Detailed inspection required',
    isOverdue: false,
    metSLA: null,
    ageDays: 5,
    ...overrides,
  };
}

// Default filters
const defaultFilters: DashboardFilters = {
  dateRange: {
    start: subDays(new Date(), 30),
    end: new Date(),
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

describe('KPI Calculations', () => {
  describe('filterCases', () => {
    it('should return all cases when no filters applied', () => {
      const cases = [createTestCase(), createTestCase({ id: 'case-2' })];
      const filtered = filterCases(cases, defaultFilters);
      expect(filtered).toHaveLength(2);
    });

    it('should filter by severity', () => {
      const cases = [
        createTestCase({ severity: 'Critical' }),
        createTestCase({ id: 'case-2', severity: 'Low' }),
      ];
      const filters = { ...defaultFilters, severities: ['Critical' as const] };
      const filtered = filterCases(cases, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].severity).toBe('Critical');
    });

    it('should filter by openOnly toggle', () => {
      const cases = [
        createTestCase({ isOpen: true }),
        createTestCase({ id: 'case-2', isOpen: false, closedAt: new Date() }),
      ];
      const filters = { ...defaultFilters, openOnly: true };
      const filtered = filterCases(cases, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isOpen).toBe(true);
    });

    it('should filter by criticalOnly toggle', () => {
      const cases = [
        createTestCase({ severity: 'Critical', isCritical: true }),
        createTestCase({ id: 'case-2', severity: 'Low', isCritical: false }),
      ];
      const filters = { ...defaultFilters, criticalOnly: true };
      const filtered = filterCases(cases, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isCritical).toBe(true);
    });
  });

  describe('filterActions', () => {
    it('should return all actions when no filters applied', () => {
      const actions = [createTestAction(), createTestAction({ actionId: 'action-2' })];
      const filtered = filterActions(actions, defaultFilters);
      expect(filtered).toHaveLength(2);
    });

    it('should filter by status', () => {
      const actions = [
        createTestAction({ status: 'Open' }),
        createTestAction({ actionId: 'action-2', status: 'Closed' }),
      ];
      const filters = { ...defaultFilters, statuses: ['Open' as const] };
      const filtered = filterActions(actions, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('Open');
    });

    it('should filter by withDeadlineOnly toggle', () => {
      const actions = [
        createTestAction({ deadline: addHours(new Date(), 24) }),
        createTestAction({ actionId: 'action-2', deadline: null }),
      ];
      const filters = { ...defaultFilters, withDeadlineOnly: true };
      const filtered = filterActions(actions, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].deadline).not.toBeNull();
    });
  });

  describe('computeKPIs', () => {
    it('should compute open cases correctly', () => {
      const cases = [
        createTestCase({ severity: 'Critical', isOpen: true }),
        createTestCase({ id: 'case-2', severity: 'High', isOpen: true }),
        createTestCase({ id: 'case-3', severity: 'Critical', isOpen: false, closedAt: new Date() }),
      ];
      const actions: Action[] = [];

      const kpis = computeKPIs(cases, actions, defaultFilters);

      expect(kpis.openCases.total).toBe(2);
      expect(kpis.openCases.bySeverity.Critical).toBe(1);
      expect(kpis.openCases.bySeverity.High).toBe(1);
    });

    it('should compute critical backlog >14 days correctly', () => {
      const cases = [
        createTestCase({ severity: 'Critical', isOpen: true, ageDays: 20, isCritical: true }),
        createTestCase({ id: 'case-2', severity: 'Critical', isOpen: true, ageDays: 10, isCritical: true }),
        createTestCase({ id: 'case-3', severity: 'High', isOpen: true, ageDays: 20 }),
      ];
      const actions: Action[] = [];

      const kpis = computeKPIs(cases, actions, defaultFilters);

      expect(kpis.criticalBacklog14d).toBe(1);
    });

    it('should compute overdue actions correctly', () => {
      const now = new Date();
      const cases: Case[] = [];
      const actions = [
        createTestAction({ isOverdue: true, deadline: subDays(now, 1), status: 'Open' }),
        createTestAction({ actionId: 'action-2', isOverdue: false, deadline: addHours(now, 24), status: 'Open' }),
        createTestAction({ actionId: 'action-3', isOverdue: false, deadline: subDays(now, 1), status: 'Closed' }),
      ];

      const kpis = computeKPIs(cases, actions, defaultFilters);

      expect(kpis.overdueActions).toBe(1);
    });

    it('should compute lifecycle medians correctly', () => {
      const cases = [
        createTestCase({ d2i: 2, i2c: 4, c2close: 10 }),
        createTestCase({ id: 'case-2', d2i: 4, i2c: 6, c2close: 20 }),
        createTestCase({ id: 'case-3', d2i: 6, i2c: 8, c2close: 30 }),
      ];
      const actions: Action[] = [];

      const kpis = computeKPIs(cases, actions, defaultFilters);

      expect(kpis.lifecycleMedians.d2i).toBe(4);
      expect(kpis.lifecycleMedians.i2c).toBe(6);
      expect(kpis.lifecycleMedians.c2close).toBe(20);
    });

    it('should compute SLA hit rate correctly', () => {
      const now = new Date();
      const cases: Case[] = [];
      const actions = [
        createTestAction({
          deadline: subDays(now, 20),
          updatedAt: subDays(now, 21),
          status: 'Closed',
          metSLA: true,
          createdAt: subDays(now, 25),
        }),
        createTestAction({
          actionId: 'action-2',
          deadline: subDays(now, 20),
          updatedAt: subDays(now, 19),
          status: 'Closed',
          metSLA: false,
          createdAt: subDays(now, 25),
        }),
      ];

      const kpis = computeKPIs(cases, actions, defaultFilters);

      expect(kpis.slaHitRate30d.rate).toBe(0.5);
    });

    it('should compute case funnel correctly', () => {
      const cases = [
        createTestCase({
          createdAt: subDays(new Date(), 10),
          inspectedAt: subDays(new Date(), 9),
          confirmedAt: subDays(new Date(), 8),
          closedAt: subDays(new Date(), 7),
        }),
        createTestCase({
          id: 'case-2',
          createdAt: subDays(new Date(), 10),
          inspectedAt: subDays(new Date(), 9),
          confirmedAt: null,
          closedAt: null,
        }),
        createTestCase({
          id: 'case-3',
          createdAt: subDays(new Date(), 10),
          inspectedAt: null,
          confirmedAt: null,
          closedAt: null,
        }),
      ];
      const actions: Action[] = [];

      const kpis = computeKPIs(cases, actions, defaultFilters);

      expect(kpis.caseFunnel.created).toBe(3);
      expect(kpis.caseFunnel.inspected).toBe(2);
      expect(kpis.caseFunnel.confirmed).toBe(1);
      expect(kpis.caseFunnel.closed).toBe(1);
    });
  });
});
