import { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useDashboardStore } from './state/useDashboardStore';
import {
  computeKPIs,
  computeHeatmap,
  computeRepeatFailures,
  getFilterOptions,
  computeSiteKPIs,
  computeCaseTrend,
  computeBacklogGrowth,
  computeTurbineMakeMetrics,
  computeActionResolutionVelocity,
  computeSeverityDistribution,
  computeSiteRadarMetrics,
  filterCases,
  filterActions,
  computeDailyChanges,
  computeActionCaseDistribution,
  computeActionTrend,
  computePriorityDistribution,
  computeActionBacklogGrowth,
} from './utils/kpi';
import { ExecSnapshot } from './components/kpi/ExecSnapshot';
import { DailyChanges } from './components/kpi/DailyChanges';
import { PriorityEscalations } from './components/tables/PriorityEscalations';
import { FilterPanel } from './components/filters/FilterPanel';
import { RiskHeatmap } from './components/charts/RiskHeatmap';
import { CaseFunnel } from './components/charts/CaseFunnel';
import { RepeatFailures } from './components/charts/RepeatFailures';
import { SiteScorecard } from './components/tables/SiteScorecard';
import { BottomSites } from './components/tables/BottomSites';
import { CaseTrend } from './components/charts/CaseTrend';
import { ActionTrend } from './components/charts/ActionTrend';
import { OEMRanking } from './components/tables/OEMRanking';
import { ActionStatus } from './components/charts/ActionStatus';
import { SeverityPie } from './components/charts/SeverityPie';
import { PriorityDistribution } from './components/charts/PriorityDistribution';
import { BacklogGrowth } from './components/charts/BacklogGrowth';
import { ActionBacklogGrowth } from './components/charts/ActionBacklogGrowth';
import { SiteRadar } from './components/charts/SiteRadar';
import { ComponentBreakdown } from './components/charts/ComponentBreakdown';
import { SiteMap } from './components/charts/SiteMap';
import { ActionQueue } from './components/tables/ActionQueue';
import { ActionCaseRelationship } from './components/tabs/ActionCaseRelationship';
import { DrilldownPanel } from './components/drilldown/DrilldownPanel';
import { CaseDetail } from './components/drilldown/CaseDetail';
import { FullscreenWrapper } from './components/common/FullscreenWrapper';
import { TabNavigation, TabPanel, TabId } from './components/common/TabNavigation';
import { IssueTypeToggle } from './components/common/IssueTypeToggle';
import { IssueType, filterByIssueType } from './utils/issueTypeFilter';
import type { Case } from './types';

function App() {
  const {
    cases,
    actions,
    sites,
    loadedData,
    isLoading,
    error,
    filters,
    loadCSVFiles,
    setFilters,
    resetFilters,
    loadPersistedFilters,
    persistFilters,
  } = useDashboardStore();

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [changeTimeRange, setChangeTimeRange] = useState(24); // Default 24 hours
  const [issueType, setIssueType] = useState<IssueType>('all'); // CMS Hardware vs Mechanical

  // File upload state
  const [casesFile, setCasesFile] = useState<File | null>(null);
  const [actionsFile, setActionsFile] = useState<File | null>(null);
  const [sitesFile, setSitesFile] = useState<File | null>(null);

  // Load persisted filters on mount
  useEffect(() => {
    loadPersistedFilters();
  }, [loadPersistedFilters]);

  // Persist filters with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      persistFilters();
    }, 500);

    return () => clearTimeout(timeout);
  }, [filters, persistFilters]);

  // Compute KPIs
  // Apply issue type filter FIRST (CMS Hardware vs Mechanical)
  const issueFilteredCases = useMemo(() => filterByIssueType(cases, issueType), [cases, issueType]);

  // Filter actions based on their linked case's issue type
  const issueFilteredActions = useMemo(() => {
    const validCaseIds = new Set(issueFilteredCases.map(c => c.id));
    return actions.filter(a => validCaseIds.has(a.caseId));
  }, [actions, issueFilteredCases]);

  // Then apply regular filters
  const filteredCases = useMemo(() => filterCases(issueFilteredCases, filters), [issueFilteredCases, filters]);
  const filteredActions = useMemo(() => filterActions(issueFilteredActions, filters), [issueFilteredActions, filters]);

  const kpis = useMemo(() => {
    if (cases.length === 0) return null;
    return computeKPIs(issueFilteredCases, issueFilteredActions, filters);
  }, [issueFilteredCases, issueFilteredActions, filters]);

  // Compute daily changes (configurable time range)
  const dailyChanges = useMemo(() => {
    if (cases.length === 0) return null;
    return computeDailyChanges(issueFilteredCases, issueFilteredActions, changeTimeRange);
  }, [issueFilteredCases, issueFilteredActions, changeTimeRange]);


  // Compute heatmap data
  const heatmapData = useMemo(() => {
    if (filteredCases.length === 0) return [];
    return computeHeatmap(filteredCases.filter(c => c.isOpen && c.isCritical));
  }, [filteredCases]);

  // Compute repeat failures
  const repeatFailures = useMemo(() => {
    if (filteredCases.length === 0) return [];
    return computeRepeatFailures(filteredCases, 'component');
  }, [filteredCases]);

  // Get filter options (from ALL data, not filtered)
  const filterOptions = useMemo(() => {
    if (cases.length === 0) {
      return {
        sites: [],
        turbines: [],
        components: [],
        failureModes: [],
        severities: [] as any[],
        statuses: [],
        priorities: [],
      };
    }
    return getFilterOptions(cases, actions);
  }, [cases, actions]);

  // Compute new visualizations data (all using filtered data)
  const siteScores = useMemo(() => computeSiteKPIs(filteredCases, filteredActions), [filteredCases, filteredActions]);
  const caseTrend = useMemo(() => computeCaseTrend(filteredCases, 30), [filteredCases]);
  const backlogGrowth = useMemo(() => computeBacklogGrowth(filteredCases, 90), [filteredCases]);
  const turbineMakeMetrics = useMemo(() => computeTurbineMakeMetrics(filteredCases, filteredActions), [filteredCases, filteredActions]);
  const actionVelocity = useMemo(() => computeActionResolutionVelocity(filteredActions), [filteredActions]);
  const severityDist = useMemo(() => computeSeverityDistribution(filteredCases), [filteredCases]);
  const topSites = useMemo(() => siteScores.slice(0, 5).map(s => s.siteId), [siteScores]);
  const siteRadarData = useMemo(() => computeSiteRadarMetrics(filteredCases, filteredActions, topSites), [filteredCases, filteredActions, topSites]);

  // Compute action-case relationships (use filtered data)
  const actionCaseData = useMemo(() => computeActionCaseDistribution(filteredCases, filteredActions), [filteredCases, filteredActions]);

  // Compute action-focused trend data
  const actionTrend = useMemo(() => computeActionTrend(filteredActions, 30), [filteredActions]);
  const priorityDist = useMemo(() => computePriorityDistribution(filteredActions), [filteredActions]);
  const actionBacklog = useMemo(() => computeActionBacklogGrowth(filteredActions, 90), [filteredActions]);

  // Handle file upload
  const handleUpload = async () => {
    if (!casesFile || !actionsFile || !sitesFile) {
      alert('Please select all three CSV files');
      return;
    }

    await loadCSVFiles(casesFile, actionsFile, sitesFile);
  };

  // Handle case click
  const handleCaseClick = useCallback((caseId: string) => {
    const caseData = cases.find(c => c.id === caseId);
    if (caseData) {
      setSelectedCase(caseData);
      setIsDrilldownOpen(true);
    }
  }, [cases]);

  // Handle action click
  const handleActionClick = useCallback((actionId: string) => {
    const action = actions.find(a => a.actionId === actionId);
    if (action) {
      const caseData = cases.find(c => c.id === action.caseId);
      if (caseData) {
        setSelectedCase(caseData);
        setIsDrilldownOpen(true);
      }
    }
  }, [actions, cases]);

  // Handle site click - filter dashboard by site
  const handleSiteClick = useCallback((siteId: string) => {
    setFilters({ sites: [siteId] });
    setActiveTab('overview'); // Switch to overview to see filtered results
  }, [setFilters]);

  // Handle heatmap cell click - filter by site and component
  const handleHeatmapCellClick = useCallback((siteId: string, componentName: string) => {
    setFilters({ sites: [siteId], components: [componentName] });
    setActiveTab('overview');
  }, [setFilters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-black">
                  Wind Farm Health & Productivity Dashboard
                </h1>
                {loadedData && (
                  <p className="text-sm text-gray-700 mt-1">
                    Last updated: {format(loadedData.loadedAt, 'MMM d, yyyy HH:mm')} |{' '}
                    {cases.length} cases, {actions.length} actions
                  </p>
                )}
              </div>
            </div>

            {!loadedData && (
              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCasesFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                    {casesFile ? '✓ Cases' : 'Upload Cases CSV'}
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setActionsFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                    {actionsFile ? '✓ Actions' : 'Upload Actions CSV'}
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setSitesFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm">
                    {sitesFile ? '✓ Sites' : 'Upload Sites CSV'}
                  </div>
                </label>

                <button
                  onClick={handleUpload}
                  disabled={!casesFile || !actionsFile || !sitesFile || isLoading}
                  className="px-6 py-2 bg-[#24a4ab] text-white rounded hover:bg-[#1d8289] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isLoading ? 'Loading...' : 'Load Data'}
                </button>
              </div>
            )}
          </div>

          {/* Validation warnings */}
          {loadedData?.validation && loadedData.validation.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="text-sm font-medium text-yellow-800 mb-1">Warnings:</div>
              {loadedData.validation.warnings.map((warning, idx) => (
                <div key={idx} className="text-sm text-yellow-700">
                  • {warning}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <div className="text-sm font-medium text-red-800">Error: {error}</div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 py-8">
        {!loadedData ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to the Wind Farm Dashboard
            </h2>
            <p className="text-gray-600">
              Upload your CSV files to get started
            </p>
          </div>
        ) : (
          <>
            {/* Issue Type Toggle - CMS Hardware vs Mechanical */}
            <IssueTypeToggle issueType={issueType} onIssueTypeChange={setIssueType} />

            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Filters */}
            <FilterPanel
              filters={filters}
              filterOptions={filterOptions}
              onFilterChange={(newFilters) => setFilters(newFilters)}
              onReset={resetFilters}
            />

            {/* OVERVIEW TAB */}
            <TabPanel activeTab={activeTab} tabId="overview">
              {/* Daily Changes - What's New Since Yesterday */}
              {dailyChanges && (
                <DailyChanges
                  changes={dailyChanges}
                  timeRange={changeTimeRange}
                  onTimeRangeChange={setChangeTimeRange}
                />
              )}

              {/* Priority Escalations Table */}
              {dailyChanges && dailyChanges.priorityEscalations.total > 0 && (
                <div className="mb-8">
                  <PriorityEscalations actions={dailyChanges.priorityEscalations.actions} />
                </div>
              )}

              {/* Executive Snapshot */}
              {kpis && <ExecSnapshot kpis={kpis} />}

              {/* Quick Stats Grid */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Insights</h2>
                <FullscreenWrapper title="Case Lifecycle Funnel">
                  <CaseFunnel funnel={kpis.caseFunnel} />
                </FullscreenWrapper>
              </div>

              {/* Top Repeat Failures */}
              <div className="mb-8">
                <FullscreenWrapper title="Top Repeat Failures">
                  <RepeatFailures data={repeatFailures} />
                </FullscreenWrapper>
              </div>
            </TabPanel>

            {/* TRENDS TAB */}
            <TabPanel activeTab={activeTab} tabId="trends">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Trends & Analytics</h2>

                {/* Action Trends */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Action Trends</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    <FullscreenWrapper title="Action Creation Trend (30d)">
                      <ActionTrend data={actionTrend} />
                    </FullscreenWrapper>
                    <FullscreenWrapper title="Action Priority Distribution">
                      <PriorityDistribution data={priorityDist} />
                    </FullscreenWrapper>
                  </div>

                  <FullscreenWrapper title="Action Backlog Growth (90d)">
                    <ActionBacklogGrowth data={actionBacklog} />
                  </FullscreenWrapper>
                </div>

                {/* Case Trends */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Case Trends</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    <FullscreenWrapper title="Case Creation Trend (30d)">
                      <CaseTrend data={caseTrend} />
                    </FullscreenWrapper>
                    <FullscreenWrapper title="Case Severity Distribution">
                      <SeverityPie data={severityDist} />
                    </FullscreenWrapper>
                  </div>

                  <FullscreenWrapper title="Case Backlog Growth (90d)">
                    <BacklogGrowth data={backlogGrowth} />
                  </FullscreenWrapper>
                </div>

                {/* Action Status Overview */}
                <div className="mb-6">
                  <FullscreenWrapper title="Action Status Distribution">
                    <ActionStatus actions={filteredActions} />
                  </FullscreenWrapper>
                </div>
              </div>
            </TabPanel>

            {/* SITES TAB */}
            <TabPanel activeTab={activeTab} tabId="sites">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Site Intelligence</h2>

                {/* Alert: Worst Performing Sites */}
                <div className="mb-6">
                  <FullscreenWrapper title="Sites Needing Immediate Attention">
                    <BottomSites sites={siteScores} onSiteClick={handleSiteClick} />
                  </FullscreenWrapper>
                </div>

                {/* Full Site Scorecard */}
                <div className="mb-6">
                  <FullscreenWrapper title="Complete Site Scorecard">
                    <SiteScorecard sites={siteScores} onSiteClick={handleSiteClick} />
                  </FullscreenWrapper>
                </div>

                {/* OEM & Top Sites Analysis */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <FullscreenWrapper title="OEM Model Reliability Ranking">
                    <OEMRanking data={turbineMakeMetrics} />
                  </FullscreenWrapper>
                  <FullscreenWrapper title="Top 5 Sites - Quick View">
                    <SiteRadar data={siteRadarData} />
                  </FullscreenWrapper>
                </div>
              </div>
            </TabPanel>

            {/* COMPONENTS TAB */}
            <TabPanel activeTab={activeTab} tabId="components">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Component & Risk Analysis</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                  <FullscreenWrapper title="Risk Heatmap: Sites × Components">
                    <RiskHeatmap data={heatmapData} onCellClick={handleHeatmapCellClick} />
                  </FullscreenWrapper>
                  <FullscreenWrapper title="Component Breakdown by Severity">
                    <ComponentBreakdown cases={filteredCases.filter(c => c.isOpen)} />
                  </FullscreenWrapper>
                </div>

                <FullscreenWrapper title="Top Repeat Failures">
                  <RepeatFailures data={repeatFailures} />
                </FullscreenWrapper>
              </div>
            </TabPanel>

            {/* MAP TAB */}
            <TabPanel activeTab={activeTab} tabId="map">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Geographic View</h2>
                <FullscreenWrapper title="Interactive Site Map">
                  <SiteMap sites={sites} cases={filteredCases} onSiteClick={handleSiteClick} />
                </FullscreenWrapper>
              </div>
            </TabPanel>

            {/* ACTION-CASE LINKS TAB */}
            <TabPanel activeTab={activeTab} tabId="actionlinks">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Action-Case Relationship Analysis</h2>
                <ActionCaseRelationship
                  distribution={actionCaseData.distribution}
                  casesWithActions={actionCaseData.casesWithActions}
                  orphanedActions={actionCaseData.orphanedActions}
                  stats={{
                    totalActions: actionCaseData.totalActions,
                    totalCases: actionCaseData.totalCases,
                    casesWithMultipleActions: actionCaseData.casesWithMultipleActions,
                    avgActionsPerCase: actionCaseData.avgActionsPerCase,
                  }}
                />
              </div>
            </TabPanel>

            {/* ACTIONS TAB */}
            <TabPanel activeTab={activeTab} tabId="actions">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Action Management</h2>
                <FullscreenWrapper title="Action Queue">
                  <ActionQueue actions={filteredActions} onActionClick={handleActionClick} />
                </FullscreenWrapper>
              </div>
            </TabPanel>
          </>
        )}
      </main>

      {/* Drill-down Panel */}
      {selectedCase && (
        <DrilldownPanel
          isOpen={isDrilldownOpen}
          onClose={() => {
            setIsDrilldownOpen(false);
            setSelectedCase(null);
          }}
          title={`Case: ${selectedCase.id}`}
        >
          <CaseDetail caseData={selectedCase} actions={actions} />
        </DrilldownPanel>
      )}
    </div>
  );
}

export default App;
