import { KPITile } from './KPITile';
import { Sparkline } from './Sparkline';
import { InfoButton } from '../common/InfoButton';
import { KPISummary } from '../../types';
import {
  evaluateSLAThreshold,
  evaluateCriticalBacklogThreshold,
  evaluateOverdueActionsThreshold,
  evaluateOpenCriticalCasesThreshold,
} from '../../utils/thresholds';
import { COLORS } from '../../config/thresholds';
import { VISUALIZATION_INFO } from '../../config/visualizationInfo';

interface ExecSnapshotProps {
  kpis: KPISummary;
  onTileClick?: (metric: string) => void;
}

export function ExecSnapshot({ kpis, onTileClick }: ExecSnapshotProps) {
  const slaLevel = evaluateSLAThreshold(kpis.slaHitRate30d.rate);
  const backlogLevel = evaluateCriticalBacklogThreshold(kpis.criticalBacklog14d);
  const overdueLevel = evaluateOverdueActionsThreshold(kpis.overdueActions);
  const criticalLevel = evaluateOpenCriticalCasesThreshold(kpis.openCases.bySeverity.Critical);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-black">Executive Snapshot</h2>
        <InfoButton {...VISUALIZATION_INFO.execSnapshot} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile
          title="Open Cases"
          value={kpis.openCases.total}
          subtitle={`Critical: ${kpis.openCases.bySeverity.Critical} | High: ${kpis.openCases.bySeverity.High}`}
          thresholdLevel={criticalLevel}
          sparkline={
            <Sparkline
              data={kpis.openCases.sparkline7d}
              color={COLORS.threshold[criticalLevel]}
            />
          }
          tooltip="Total open cases with 7-day trend"
          onClick={() => onTileClick?.('openCases')}
        />

        <KPITile
          title="Critical Backlog >14d"
          value={kpis.criticalBacklog14d}
          subtitle="Critical cases aged >14 days"
          thresholdLevel={backlogLevel}
          tooltip="Critical severity cases open for more than 14 days"
          onClick={() => onTileClick?.('criticalBacklog')}
        />

        <KPITile
          title="SLA Hit Rate (30d)"
          value={`${(kpis.slaHitRate30d.rate * 100).toFixed(1)}%`}
          subtitle="Actions meeting deadline"
          thresholdLevel={slaLevel}
          sparkline={
            <Sparkline
              data={kpis.slaHitRate30d.sparkline7d.map(v => v * 100)}
              color={COLORS.threshold[slaLevel]}
            />
          }
          tooltip="Percentage of actions completed by deadline (last 30 days)"
          onClick={() => onTileClick?.('slaHitRate')}
        />

        <KPITile
          title="Overdue Actions"
          value={kpis.overdueActions}
          subtitle="Past deadline, not closed"
          thresholdLevel={overdueLevel}
          tooltip="Actions past their deadline that are still open"
          onClick={() => onTileClick?.('overdueActions')}
        />
      </div>
    </div>
  );
}
