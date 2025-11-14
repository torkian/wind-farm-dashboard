import { Case } from '../types';

export type IssueType = 'all' | 'cms_hardware' | 'mechanical';

// CMS Hardware components
const CMS_COMPONENTS = [
  'CMS_DAQ_SYSTEM',
];

// CMS Hardware failure modes
const CMS_FAILURE_MODES = [
  'BAD_CABLE',
  'BAD_MOUNTING',
  'BAD_SENSOR',
  'NO_COMMUNICATION',
  'NO_DATA',
  'SIGNAL_NOISE',
];

/**
 * Determines if a case is a CMS Hardware issue
 */
export function isCMSHardwareIssue(caseItem: Case): boolean {
  // Check if component is in CMS list
  if (CMS_COMPONENTS.includes(caseItem.componentName)) {
    return true;
  }

  // Check if component name contains ACCELEROMETER
  if (caseItem.componentName.includes('ACCELEROMETER')) {
    return true;
  }

  // Check if component name contains SPEED_SENSOR
  if (caseItem.componentName.includes('SPEED_SENSOR')) {
    return true;
  }

  // Check if failure mode is CMS-related
  if (CMS_FAILURE_MODES.includes(caseItem.failureModeName)) {
    return true;
  }

  return false;
}

/**
 * Filters cases by issue type
 */
export function filterByIssueType(cases: Case[], issueType: IssueType): Case[] {
  if (issueType === 'all') {
    return cases;
  }

  if (issueType === 'cms_hardware') {
    return cases.filter(c => isCMSHardwareIssue(c));
  }

  // mechanical = NOT CMS hardware
  return cases.filter(c => !isCMSHardwareIssue(c));
}
