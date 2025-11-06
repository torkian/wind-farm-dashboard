import { THRESHOLDS } from '../config/thresholds';

/**
 * Evaluates SLA hit rate threshold
 */
export function evaluateSLAThreshold(rate: number): 'green' | 'yellow' | 'red' {
  if (rate >= THRESHOLDS.slaHitRate.green) return 'green';
  if (rate >= THRESHOLDS.slaHitRate.yellow) return 'yellow';
  return 'red';
}

/**
 * Evaluates critical backlog threshold
 */
export function evaluateCriticalBacklogThreshold(count: number): 'green' | 'yellow' | 'red' {
  if (count <= THRESHOLDS.criticalBacklog14d.green) return 'green';
  if (count <= THRESHOLDS.criticalBacklog14d.yellow) return 'yellow';
  return 'red';
}

/**
 * Evaluates overdue actions threshold
 */
export function evaluateOverdueActionsThreshold(count: number): 'green' | 'yellow' | 'red' {
  if (count <= THRESHOLDS.overdueActions.green) return 'green';
  if (count <= THRESHOLDS.overdueActions.yellow) return 'yellow';
  return 'red';
}

/**
 * Evaluates open critical cases threshold
 */
export function evaluateOpenCriticalCasesThreshold(count: number): 'green' | 'yellow' | 'red' {
  if (count <= THRESHOLDS.openCriticalCases.green) return 'green';
  if (count <= THRESHOLDS.openCriticalCases.yellow) return 'yellow';
  return 'red';
}

/**
 * Returns Tailwind classes for threshold level
 */
export function getThresholdClasses(level: 'green' | 'yellow' | 'red'): {
  bg: string;
  text: string;
  border: string;
} {
  switch (level) {
    case 'green':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'yellow':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    case 'red':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
      };
  }
}
