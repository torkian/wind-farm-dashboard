export const VISUALIZATION_INFO = {
  execSnapshot: {
    title: 'Executive Snapshot - KPI Tiles',
    description: 'Four key performance indicators providing an at-a-glance view of fleet health. Color-coded thresholds (green/yellow/red) indicate performance levels. Sparklines show 7-day trends.',
    interpretation: 'Green = Good performance, Yellow = Needs attention, Red = Critical. Click tiles to see detailed breakdowns.',
  },

  openCases: {
    title: 'Open Cases',
    description: 'Total number of cases that have not been closed, broken down by severity level (Critical, High, Medium, Low).',
    formula: 'count(cases where closedAt == null)',
    interpretation: 'Higher numbers indicate more active issues. Critical and High severity cases should be prioritized.',
    example: 'If you see 721 open cases with 129 Critical, focus on reducing the critical backlog first.',
  },

  criticalBacklog: {
    title: 'Critical Backlog >14 Days',
    description: 'Number of critical severity cases that have been open for more than 14 days without resolution.',
    formula: 'count(cases where severity==Critical AND closedAt==null AND ageDays>14)',
    interpretation: 'This is an SLA violation indicator. Threshold: Green ≤2, Yellow ≤5, Red >5.',
    example: 'A score of 105 means 105 critical cases have been aging beyond acceptable limits.',
  },

  slaHitRate: {
    title: 'SLA Hit Rate (30d)',
    description: 'Percentage of actions completed by their deadline in the last 30 days. Measures team responsiveness and efficiency.',
    formula: 'SLA Rate = (actions closed by deadline / total actions with deadline) × 100',
    interpretation: 'Target: ≥90% (green). 80-90% is warning (yellow). <80% is critical (red).',
    example: '0.0% means no actions with deadlines were completed on time in the period.',
  },

  overdueActions: {
    title: 'Overdue Actions',
    description: 'Number of actions that have passed their deadline and are still not closed.',
    formula: 'count(actions where deadline < now AND status != Closed)',
    interpretation: 'Direct measure of backlog. Threshold: Green ≤10, Yellow ≤25, Red >25.',
    example: '267 overdue actions means immediate action is needed to clear the queue.',
  },

  caseTrend: {
    title: 'Case Creation Trend (30d)',
    description: 'Daily case creation volume over the last 30 days, separated by severity level. Shows if problems are increasing or decreasing.',
    formula: 'For each day: count(cases created on that day) grouped by severity',
    interpretation: 'Upward trend = problems increasing. Spikes may indicate specific events. Critical and High lines should trend downward.',
    example: 'A spike in Critical cases on a specific date might correlate with a weather event or equipment failure.',
  },

  severityPie: {
    title: 'Severity Distribution',
    description: 'Breakdown of all cases by severity level. Helps understand the overall risk profile of the fleet.',
    formula: 'Percentage = (cases of each severity / total cases) × 100',
    interpretation: 'A healthy fleet has fewer Critical/High cases. Large Critical slice indicates fleet-wide risk.',
    example: 'If 60% of cases are Low severity, the fleet is relatively healthy.',
  },

  actionVelocity: {
    title: 'Action Resolution Velocity',
    description: 'Distribution of time taken to complete actions (from creation to closure). Shows team efficiency.',
    formula: 'For closed actions: group by time buckets (0-1d, 1-3d, 3-7d, etc.)',
    interpretation: 'More actions in left buckets (0-3 days) = faster team. Right-heavy distribution = slower resolution.',
    example: 'If most actions take 14-30 days, consider increasing resources or streamlining processes.',
  },

  backlogGrowth: {
    title: 'Backlog Growth Trend (90d)',
    description: 'Shows created vs closed cases over time with net backlog line. The brush control lets you zoom into specific periods.',
    formula: 'Net Backlog = count(cases created ≤ date AND (closedAt == null OR closedAt > date))',
    interpretation: 'Rising blue line = growing backlog (bad). Flat/falling = stable/improving. Red area > green area = creating faster than closing.',
    example: 'Current Backlog 303, Change +303 means the backlog grew by 303 cases in the period.',
  },

  siteScorecard: {
    title: 'Site Scorecard',
    description: 'Comprehensive table showing key metrics for all sites. Health Score is calculated from critical cases, open cases, and overdue actions.',
    formula: 'Health Score = 100 - (criticalCases × 10) - (openCases × 2) - (overdueActions × 5)',
    interpretation: 'Score 100 = perfect, 0 = critical. Click column headers to sort. Click rows to filter dashboard.',
    example: 'A site with score 35 needs immediate attention. Score 85+ is performing well.',
  },

  bottomSites: {
    title: 'Sites Needing Immediate Attention',
    description: 'Bottom 10 sites ranked by health score (worst first). Includes AI-generated priority actions based on site metrics.',
    formula: 'Sites sorted by health score ascending. Priority action determined by highest-scoring issue.',
    interpretation: 'Rank #1 = worst performing site. Priority Action column shows recommended next step.',
    example: 'Site with 15 critical cases gets "🚨 Emergency: Address critical backlog" recommendation.',
  },

  turbineMake: {
    title: 'Turbine Make Comparison',
    description: 'Compares performance across different turbine manufacturers (OEMs). Shows total cases, open cases, critical cases, and cases per turbine.',
    formula: 'Grouped by turbineMake field. Cases/Turbine = total cases / unique turbine count',
    interpretation: 'Higher cases/turbine for a specific make may indicate reliability issues or warranty claims.',
    example: 'If GE turbines have 5 cases/turbine vs Vestas at 2, investigate GE reliability.',
  },

  riskHeatmap: {
    title: 'Risk Heatmap: Sites × Components',
    description: 'Matrix showing critical case count for each site-component combination. Darker colors = higher risk.',
    formula: 'For each (site, component) pair: count critical open cases',
    interpretation: 'Focus on dark red cells (10+ critical). Click cells to filter by site AND component.',
    example: 'If Appaloosa Run + Gearbox shows 15 critical cases, that combination needs immediate investigation.',
  },

  componentTreeMap: {
    title: 'Component TreeMap',
    description: 'Hierarchical visualization showing component failures. Box size = case count, color = severity. Nested view shows component → severity breakdown.',
    formula: 'Top 15 components by case volume, subdivided by severity',
    interpretation: 'Larger boxes = more failures. Red = critical severity. Hover for detailed breakdown.',
    example: 'A large red box for "GEARBOX_PLANETARY" indicates many critical gearbox issues across the fleet.',
  },

  repeatFailures: {
    title: 'Top Repeat Failures',
    description: 'Most frequently occurring failure patterns in open cases. Helps identify systemic issues requiring fleet-wide action.',
    formula: 'Group open cases by component or failure mode, sort by count, take top 10',
    interpretation: 'High counts indicate recurring problems. May require design changes, maintenance SOPs, or supplier engagement.',
    example: 'If "ROTOR_BEARING" appears 390 times, this is a fleet-wide issue requiring systematic intervention.',
  },

  caseFunnel: {
    title: 'Case Lifecycle Funnel',
    description: 'Shows how many cases progress through each lifecycle stage: Created → Inspected → Confirmed → Closed.',
    formula: 'Created = all cases\nInspected = cases with inspectedAt != null\nConfirmed = cases with confirmedAt != null\nClosed = cases with closedAt != null\n\nPercentages show % of created cases reaching each stage.',
    interpretation: 'Low percentages indicate process bottlenecks or data entry gaps. Cases can skip stages.',
    example: '1% inspection rate means only 1 out of 100 created cases were formally inspected. This may indicate automated workflows or data gaps.',
  },

  siteMap: {
    title: 'Geographic Site Map',
    description: 'Interactive map showing all sites with markers sized by open case count and colored by criticality level.',
    formula: 'Marker size = open case count × 2 (min 10, max 40)\nColor based on critical case thresholds: 0=green, 1-5=amber, 6-10=orange, 10+=red',
    interpretation: 'Pan and zoom to explore. Click markers or the site list below to filter dashboard. Clusters indicate geographic risk patterns.',
    example: 'Large red markers indicate sites with many critical cases. Geographic clusters might indicate regional weather events or shared equipment issues.',
  },

  actionQueue: {
    title: 'Action Queue',
    description: 'Complete list of all work actions with sorting, filtering, and pagination. Shows priority, status, deadlines, and SLA compliance.',
    formula: 'Filtered by dashboard filters. Default sort: overdue (descending), then deadline (ascending)',
    interpretation: 'Red rows = overdue. Orange backgrounds = linked to critical cases. Click rows to see full case details.',
    example: 'Use this to plan daily work. Focus on red (overdue) rows first, then P1/Critical priority items.',
  },
};
