import { SiteKPI } from '../../types';
import { generateSiteRecommendation, getRecommendationColor } from '../../utils/recommendations';
import { InfoButton } from '../common/InfoButton';
import { RecommendationIcon } from '../common/RecommendationIcon';
import { VISUALIZATION_INFO } from '../../config/visualizationInfo';
import { AlertTriangle, Circle } from 'lucide-react';

interface BottomSitesProps {
  sites: SiteKPI[];
  onSiteClick?: (siteId: string) => void;
}

export function BottomSites({ sites, onSiteClick }: BottomSitesProps) {
  if (sites.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sites Needing Attention</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  // Calculate health score (lower = worse)
  const getHealthScore = (site: SiteKPI): number => {
    const criticalPenalty = site.criticalCases * 10;
    const openPenalty = site.openCases * 2;
    const overduePenalty = site.overdueActions * 5;
    const score = Math.max(0, 100 - criticalPenalty - openPenalty - overduePenalty);
    return Math.round(score);
  };

  // Sort by health score (worst first) and take bottom 10
  const worstSites = [...sites]
    .sort((a, b) => getHealthScore(a) - getHealthScore(b))
    .slice(0, 10);

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Circle size={12} className="fill-green-500 text-green-500" />;
    if (score >= 60) return <Circle size={12} className="fill-yellow-500 text-yellow-500" />;
    return <Circle size={12} className="fill-red-500 text-red-500" />;
  };

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-red-200 bg-red-50/30">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
            <AlertTriangle size={24} className="text-red-600" />
            Sites Needing Immediate Attention
          </h3>
          <InfoButton {...VISUALIZATION_INFO.bottomSites} />
        </div>
        <p className="text-sm text-red-700">
          Bottom {worstSites.length} sites by health score - sorted worst first
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-red-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-900 uppercase">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-900 uppercase">Site</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-red-900 uppercase">Health Score</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-red-900 uppercase">Critical Cases</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-red-900 uppercase">Open Cases</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-red-900 uppercase">Overdue Actions</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-red-900 uppercase">Cases/Turbine</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-red-900 uppercase">Priority Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {worstSites.map((site, idx) => {
              const score = getHealthScore(site);
              const recommendation = generateSiteRecommendation(site);

              return (
                <tr
                  key={site.siteId}
                  className="hover:bg-amber-50 cursor-pointer transition-colors"
                  onClick={() => onSiteClick?.(site.siteId)}
                >
                  <td className="px-4 py-3 text-sm font-bold text-black">
                    #{idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-black">
                    {site.siteName}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      {getScoreBadge(score)}
                      <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${getHealthColor(score)}`}>
                        {score}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className="text-red-600 font-bold text-base">
                      {site.criticalCases}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">
                    {site.openCases}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={site.overdueActions > 5 ? 'text-orange-600 font-semibold' : 'text-gray-700'}>
                      {site.overdueActions}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {site.casesPerTurbine.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className={`${getRecommendationColor(recommendation.priority)} flex items-center gap-2`}>
                      <RecommendationIcon iconName={recommendation.iconName} size={14} className={getRecommendationColor(recommendation.priority)} />
                      {recommendation.action}
                    </div>
                    <div className="text-gray-500 text-xs mt-1" title={recommendation.reason}>
                      {recommendation.reason}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
        <p className="text-sm text-red-800">
          <span className="font-semibold">Action Required:</span> These sites have the lowest health scores
          and require immediate operational focus. Click a row to filter the dashboard by that site.
        </p>
      </div>
    </div>
  );
}
