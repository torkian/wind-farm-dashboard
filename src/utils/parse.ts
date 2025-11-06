import Papa from 'papaparse';
import { parseISO, isValid, differenceInDays, differenceInHours } from 'date-fns';
import type {
  RawCase,
  RawAction,
  RawSiteLocation,
  Case,
  Action,
  SiteLocation,
  Severity,
  Status,
  Priority,
  ValidationResult,
} from '../types';
import { CSV_COLUMN_MAPPINGS } from '../config/thresholds';

/**
 * Normalizes CSV column headers to camelCase
 */
function normalizeHeaders(headers: string[]): string[] {
  return headers.map((header) => {
    const cleaned = header.trim().toLowerCase();
    return CSV_COLUMN_MAPPINGS[cleaned as keyof typeof CSV_COLUMN_MAPPINGS] ||
           header.trim().replace(/\s+/g, '');
  });
}

/**
 * Trims whitespace and converts empty strings to null
 */
function cleanField(value: any): any {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
  return value;
}

/**
 * Parses a date string to Date object, returns null if invalid
 */
function parseDate(dateStr: any): Date | null {
  if (!dateStr || dateStr === null) return null;

  const cleaned = cleanField(dateStr);
  if (!cleaned) return null;

  try {
    const parsed = parseISO(cleaned);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Normalizes severity to one of: Critical | High | Medium | Low
 */
function normalizeSeverity(value: any): Severity {
  if (!value) return 'Low';

  const cleaned = String(value).trim().toLowerCase();

  if (cleaned.includes('crit')) return 'Critical';
  if (cleaned.includes('high') || cleaned === 'p1') return 'High';
  if (cleaned.includes('med') || cleaned === 'p2') return 'Medium';
  if (cleaned.includes('low') || cleaned === 'p3' || cleaned === 'p4') return 'Low';

  return 'Low';
}

/**
 * Normalizes status to one of: Open | In Progress | Closed | Blocked
 */
function normalizeStatus(value: any): Status {
  if (!value) return 'Open';

  const cleaned = String(value).trim().toLowerCase();

  if (cleaned.includes('clos') || cleaned === 'done' || cleaned === 'complete') return 'Closed';
  if (cleaned.includes('progress') || cleaned === 'in-progress' || cleaned === 'inprogress') return 'In Progress';
  if (cleaned.includes('block')) return 'Blocked';
  if (cleaned.includes('open') || cleaned === 'new' || cleaned === 'pending') return 'Open';

  return 'Open';
}

/**
 * Normalizes priority to one of: Critical | High | Medium | Low | P1 | P2 | P3 | P4
 * Detects whether source uses P-notation or word notation
 */
function normalizePriority(value: any): Priority {
  if (!value) return 'Low';

  const cleaned = String(value).trim().toLowerCase();

  // P-notation
  if (cleaned === 'p1') return 'P1';
  if (cleaned === 'p2') return 'P2';
  if (cleaned === 'p3') return 'P3';
  if (cleaned === 'p4') return 'P4';

  // Word notation
  if (cleaned.includes('crit')) return 'Critical';
  if (cleaned.includes('high')) return 'High';
  if (cleaned.includes('med')) return 'Medium';
  if (cleaned.includes('low')) return 'Low';

  return 'Low';
}

/**
 * Coerces to boolean
 */
function normalizeBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const cleaned = value.trim().toLowerCase();
    return cleaned === 'true' || cleaned === '1' || cleaned === 'yes';
  }
  return false;
}

/**
 * Computes derived fields for a case
 */
function computeCaseDerivedFields(
  caseData: Omit<Case, 'isOpen' | 'ageDays' | 'd2i' | 'i2c' | 'c2close' | 'isCritical' | 'latitude' | 'longitude' | 'noGeo'>
): Case {
  const now = new Date();

  const isOpen = caseData.closedAt === null;
  const ageDays = differenceInDays(now, caseData.createdAt);

  const d2i = caseData.inspectedAt && caseData.createdAt
    ? differenceInHours(caseData.inspectedAt, caseData.createdAt)
    : null;

  const i2c = caseData.confirmedAt && caseData.inspectedAt
    ? differenceInHours(caseData.confirmedAt, caseData.inspectedAt)
    : null;

  const c2close = caseData.closedAt && caseData.confirmedAt
    ? differenceInHours(caseData.closedAt, caseData.confirmedAt)
    : null;

  const isCritical = caseData.severity === 'Critical';

  return {
    ...caseData,
    isOpen,
    ageDays,
    d2i,
    i2c,
    c2close,
    isCritical,
    latitude: null,
    longitude: null,
    noGeo: true,
  };
}

/**
 * Computes derived fields for an action
 */
function computeActionDerivedFields(
  actionData: Omit<Action, 'isOverdue' | 'metSLA' | 'ageDays'>
): Action {
  const now = new Date();

  const ageDays = differenceInDays(now, actionData.createdAt);

  const isOverdue = actionData.deadline !== null &&
    actionData.status !== 'Closed' &&
    now > actionData.deadline;

  const metSLA = actionData.deadline !== null && actionData.status === 'Closed'
    ? actionData.updatedAt <= actionData.deadline
    : null;

  return {
    ...actionData,
    isOverdue,
    metSLA,
    ageDays,
  };
}

/**
 * Parses cases CSV
 */
export async function parseCasesCSV(file: File): Promise<Case[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawCase>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header, index) => {
        const headers = [header]; // We'll handle this in complete
        return header;
      },
      complete: (results) => {
        try {
          // Normalize headers
          const rawHeaders = results.meta.fields || [];
          const normalizedHeaders = normalizeHeaders(rawHeaders);

          const cases: Case[] = results.data.map((row: any) => {
            // Map raw data with normalized headers
            const normalized: any = {};
            rawHeaders.forEach((rawHeader, idx) => {
              normalized[normalizedHeaders[idx]] = cleanField(row[rawHeader]);
            });

            const caseData = {
              id: normalized.id || '',
              siteId: normalized.siteId || '',
              siteName: normalized.siteName || '',
              turbineId: normalized.turbineId || '',
              turbineName: normalized.turbineName || '',
              turbineMake: normalized.turbineMake || '',
              componentId: normalized.componentId || '',
              componentName: normalized.componentName || '',
              failureModeId: normalized.failureModeId || '',
              failureModeName: normalized.failureModeName || '',
              severity: normalizeSeverity(normalized.severity),
              createdAt: parseDate(normalized.createdAt) || new Date(),
              inspectedAt: parseDate(normalized.inspectedAt),
              confirmedAt: parseDate(normalized.confirmedAt),
              closedAt: parseDate(normalized.closedAt),
              updatedAt: parseDate(normalized.updatedAt) || new Date(),
            };

            return computeCaseDerivedFields(caseData);
          });

          resolve(cases);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Parses actions CSV
 */
export async function parseActionsCSV(file: File): Promise<Action[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawAction>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawHeaders = results.meta.fields || [];
          const normalizedHeaders = normalizeHeaders(rawHeaders);

          const actions: Action[] = results.data.map((row: any) => {
            const normalized: any = {};
            rawHeaders.forEach((rawHeader, idx) => {
              normalized[normalizedHeaders[idx]] = cleanField(row[rawHeader]);
            });

            const actionData = {
              actionId: normalized.actionId || '',
              caseId: normalized.caseId || '',
              createdAt: parseDate(normalized.createdAt) || new Date(),
              updatedAt: parseDate(normalized.updatedAt) || new Date(),
              deadline: parseDate(normalized.deadline),
              priority: normalizePriority(normalized.priority),
              priorityChanged: normalizeBoolean(normalized.priorityChanged),
              status: normalizeStatus(normalized.status),
              activity: normalized.activity || '',
              details: normalized.details || '',
            };

            return computeActionDerivedFields(actionData);
          });

          resolve(actions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Parses site locations CSV
 */
export async function parseSiteLocationsCSV(file: File): Promise<SiteLocation[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawSiteLocation>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawHeaders = results.meta.fields || [];
          const normalizedHeaders = normalizeHeaders(rawHeaders);

          const sites: SiteLocation[] = results.data.map((row: any) => {
            const normalized: any = {};
            rawHeaders.forEach((rawHeader, idx) => {
              normalized[normalizedHeaders[idx]] = cleanField(row[rawHeader]);
            });

            return {
              siteId: normalized.siteId || '',
              siteName: normalized.siteName || '',
              latitude: parseFloat(normalized.latitude) || 0,
              longitude: parseFloat(normalized.longitude) || 0,
            };
          });

          resolve(sites);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Joins site location data to cases
 */
export function joinSiteLocations(cases: Case[], sites: SiteLocation[]): Case[] {
  const siteMap = new Map(sites.map(s => [s.siteId, s]));

  return cases.map(caseItem => {
    const site = siteMap.get(caseItem.siteId);

    if (site) {
      return {
        ...caseItem,
        latitude: site.latitude,
        longitude: site.longitude,
        noGeo: false,
      };
    }

    return caseItem;
  });
}

/**
 * Validates data and checks referential integrity
 */
export function validateData(cases: Case[], actions: Action[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const orphanedActions: Action[] = [];

  // Check for empty datasets
  if (cases.length === 0) {
    errors.push('No cases loaded');
  }

  if (actions.length === 0) {
    warnings.push('No actions loaded');
  }

  // Check referential integrity: actions must reference valid cases
  const caseIds = new Set(cases.map(c => c.id));

  actions.forEach(action => {
    if (!caseIds.has(action.caseId)) {
      orphanedActions.push(action);
    }
  });

  if (orphanedActions.length > 0) {
    warnings.push(`${orphanedActions.length} orphaned actions found (no matching case)`);
  }

  // Check for cases with no geo data
  const noGeoCount = cases.filter(c => c.noGeo).length;
  if (noGeoCount > 0) {
    warnings.push(`${noGeoCount} cases have no geolocation data`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    orphanedActions,
  };
}

/**
 * Enriches actions with case data for convenience
 */
export function enrichActions(actions: Action[], cases: Case[]): Action[] {
  const caseMap = new Map(cases.map(c => [c.id, c]));

  return actions.map(action => {
    const caseItem = caseMap.get(action.caseId);

    if (caseItem) {
      return {
        ...action,
        siteName: caseItem.siteName,
        turbineName: caseItem.turbineName,
        severity: caseItem.severity,
      };
    }

    return action;
  });
}
