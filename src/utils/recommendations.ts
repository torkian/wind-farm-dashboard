import { SiteKPI } from '../types';

/**
 * Recommendation priority levels
 */
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface Recommendation {
  action: string;
  priority: RecommendationPriority;
  reason: string;
  iconName: string; // Name of Lucide icon to use
}

/**
 * Generates priority action recommendations for a site based on multiple factors
 */
export function generateSiteRecommendation(site: SiteKPI): Recommendation {
  const issues: { score: number; rec: Recommendation }[] = [];

  // Critical backlog issue
  if (site.criticalCases > 15) {
    issues.push({
      score: 100 + site.criticalCases,
      rec: {
        action: 'Emergency: Address critical backlog',
        priority: 'critical',
        reason: `${site.criticalCases} critical cases require immediate resolution`,
        iconName: 'AlertTriangle',
      },
    });
  } else if (site.criticalCases > 10) {
    issues.push({
      score: 90 + site.criticalCases,
      rec: {
        action: 'Urgent: Triage critical cases',
        priority: 'critical',
        reason: `${site.criticalCases} critical cases need prioritization`,
        iconName: 'AlertCircle',
      },
    });
  } else if (site.criticalCases > 5) {
    issues.push({
      score: 70 + site.criticalCases,
      rec: {
        action: 'Review critical cases',
        priority: 'high',
        reason: `${site.criticalCases} critical cases need attention`,
        iconName: 'AlertTriangle',
      },
    });
  }

  // Overdue actions issue
  if (site.overdueActions > 20) {
    issues.push({
      score: 85 + site.overdueActions,
      rec: {
        action: 'Clear overdue action backlog',
        priority: 'critical',
        reason: `${site.overdueActions} actions past deadline`,
        iconName: 'Clock',
      },
    });
  } else if (site.overdueActions > 10) {
    issues.push({
      score: 75 + site.overdueActions,
      rec: {
        action: 'Address overdue actions',
        priority: 'high',
        reason: `${site.overdueActions} overdue actions need resolution`,
        iconName: 'Calendar',
      },
    });
  }

  // High case volume issue
  const casesPerTurbineThreshold = 3;
  if (site.casesPerTurbine > casesPerTurbineThreshold * 2) {
    issues.push({
      score: 80,
      rec: {
        action: 'Reduce case load per turbine',
        priority: 'high',
        reason: `${site.casesPerTurbine.toFixed(1)} cases/turbine exceeds target`,
        iconName: 'BarChart3',
      },
    });
  } else if (site.casesPerTurbine > casesPerTurbineThreshold) {
    issues.push({
      score: 60,
      rec: {
        action: 'Monitor case accumulation',
        priority: 'medium',
        reason: `${site.casesPerTurbine.toFixed(1)} cases/turbine trending high`,
        iconName: 'ClipboardList',
      },
    });
  }

  // High open case volume
  if (site.openCases > 100) {
    issues.push({
      score: 75,
      rec: {
        action: 'Scale up case resolution',
        priority: 'high',
        reason: `${site.openCases} open cases require more resources`,
        iconName: 'TrendingUp',
      },
    });
  } else if (site.openCases > 50) {
    issues.push({
      score: 65,
      rec: {
        action: 'Increase case closure rate',
        priority: 'medium',
        reason: `${site.openCases} open cases need attention`,
        iconName: 'FileEdit',
      },
    });
  }

  // Low turbine count with high issues (concentrated problems)
  if (site.turbineCount < 20 && site.criticalCases > 3) {
    issues.push({
      score: 70,
      rec: {
        action: 'Investigate systemic issues',
        priority: 'high',
        reason: `High critical rate for small fleet (${site.turbineCount} turbines)`,
        iconName: 'Search',
      },
    });
  }

  // No critical issues - good performance
  if (issues.length === 0) {
    if (site.openCases > 0) {
      return {
        action: 'Monitor and maintain',
        priority: 'low',
        reason: 'No critical issues, continue current operations',
        iconName: 'Check',
      };
    } else {
      return {
        action: 'Excellent performance',
        priority: 'low',
        reason: 'No open cases, exemplary site',
        iconName: 'Star',
      };
    }
  }

  // Return highest priority issue
  issues.sort((a, b) => b.score - a.score);
  return issues[0].rec;
}

/**
 * Get color class for recommendation priority
 */
export function getRecommendationColor(priority: RecommendationPriority): string {
  switch (priority) {
    case 'critical':
      return 'text-red-600 font-bold';
    case 'high':
      return 'text-orange-600 font-semibold';
    case 'medium':
      return 'text-amber-600';
    case 'low':
      return 'text-green-600';
  }
}

/**
 * Get background color for recommendation priority
 */
export function getRecommendationBgColor(priority: RecommendationPriority): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-50';
    case 'high':
      return 'bg-orange-50';
    case 'medium':
      return 'bg-amber-50';
    case 'low':
      return 'bg-green-50';
  }
}
