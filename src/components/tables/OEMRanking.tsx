import { useMemo, useState } from 'react';
import { Trophy, TrendingDown, TrendingUp, Award, Medal, Info } from 'lucide-react';
import { InfoButton } from '../common/InfoButton';

interface OEMRankingProps {
  data: {
    make: string;
    totalCases: number;
    openCases: number;
    criticalCases: number;
    avgAgeDays: number;
    turbineCount: number;
    casesPerTurbine: number;
  }[];
}

type NormalizationMethod = 'percentile' | 'zscore';

export function OEMRanking({ data }: OEMRankingProps) {
  const [method, setMethod] = useState<NormalizationMethod>('percentile');

  const rankedData = useMemo(() => {
    if (data.length === 0) return [];

    const enriched = data.map(oem => {
      const criticalRate = oem.totalCases > 0 ? (oem.criticalCases / oem.totalCases) * 100 : 0;
      const openRate = oem.totalCases > 0 ? (oem.openCases / oem.totalCases) * 100 : 0;

      return {
        ...oem,
        criticalRate,
        openRate,
      };
    });

    // Calculate scores based on method
    if (method === 'percentile') {
      // Percentile-Based: Rank and convert to 0-100 scale
      const sorted = [...enriched].sort((a, b) => {
        // Lower is better for both metrics
        const scoreA = a.casesPerTurbine + (a.criticalRate / 10);
        const scoreB = b.casesPerTurbine + (b.criticalRate / 10);
        return scoreA - scoreB;
      });

      return sorted.map((oem, index) => ({
        ...oem,
        reliabilityScore: Math.round(((sorted.length - index - 1) / (sorted.length - 1)) * 100),
        rank: index + 1,
      }));

    } else {
      // Z-Score: Statistical normalization
      const casesPerTurbineValues = enriched.map(o => o.casesPerTurbine);
      const criticalRateValues = enriched.map(o => o.criticalRate);

      const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const stdDev = (arr: number[], meanVal: number) =>
        Math.sqrt(arr.reduce((sum, val) => sum + Math.pow(val - meanVal, 2), 0) / arr.length);

      const cptMean = mean(casesPerTurbineValues);
      const cptStd = stdDev(casesPerTurbineValues, cptMean);
      const crMean = mean(criticalRateValues);
      const crStd = stdDev(criticalRateValues, crMean);

      const withScores = enriched.map(oem => {
        // Calculate Z-scores (negative because lower is better)
        const cptZScore = cptStd > 0 ? -(oem.casesPerTurbine - cptMean) / cptStd : 0;
        const crZScore = crStd > 0 ? -(oem.criticalRate - crMean) / crStd : 0;

        // Combined Z-score (weighted average)
        const combinedZ = (cptZScore * 0.6) + (crZScore * 0.4);

        // Convert to 0-100 scale (roughly -3 to +3 becomes 0 to 100)
        const reliabilityScore = Math.round(Math.max(0, Math.min(100, 50 + (combinedZ * 16.67))));

        return {
          ...oem,
          reliabilityScore,
        };
      });

      return withScores
        .sort((a, b) => b.reliabilityScore - a.reliabilityScore)
        .map((oem, index) => ({ ...oem, rank: index + 1 }));
    }
  }, [data, method]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Award size={24} className="text-yellow-500 fill-yellow-500" />;
    if (index === 1) return <Medal size={24} className="text-gray-400 fill-gray-400" />;
    if (index === 2) return <Medal size={24} className="text-orange-500 fill-orange-500" />;
    return <span className="text-lg font-bold text-gray-600">#{index + 1}</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">OEM Model Reliability Ranking</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const methodInfo = {
    percentile: {
      title: 'Percentile-Based Ranking',
      description: 'Models are ranked by performance (cases/turbine + critical rate) and converted to a 0-100 percentile scale. Best model = 100, worst model = 0.',
      formula: 'Score = ((N - rank) / (N - 1)) × 100\n\nWhere N = total number of models\nRank 1 (best) = 100, Rank N (worst) = 0',
      interpretation: 'Easy to understand: Top model is 100th percentile, bottom is 0th percentile. Each model\'s score represents what percentage of models it outperforms.',
      example: 'If GE 2.8-127 ranks 3rd out of 10 models:\nScore = ((10-3)/(10-1)) × 100 = 77.8\nMeaning: Outperforms 77.8% of models',
    },
    zscore: {
      title: 'Z-Score Statistical Normalization',
      description: 'Uses statistical distribution to normalize scores. Accounts for how far each model deviates from the fleet average (mean). Penalizes outliers.',
      formula: 'Z-Score = -(value - mean) / standard deviation\n\nCombined Score = (casesPerTurbine Z × 0.6) + (criticalRate Z × 0.4)\n\nConverted to 0-100 scale',
      interpretation: 'Statistical method that accounts for data distribution. Models close to average get ~50. Exceptional models get 80-100. Poor models get 0-20.',
      example: 'If fleet average is 5 cases/turbine with std dev of 2:\nModel with 3 cases/turbine: Z = -(3-5)/2 = +1.0 (better than average)\nModel with 9 cases/turbine: Z = -(9-5)/2 = -2.0 (worse than average)',
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-[#24a4ab]" />
            <h3 className="text-lg font-semibold text-gray-900">OEM Model Reliability Ranking</h3>
            <InfoButton {...methodInfo[method]} />
          </div>

          {/* Method Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMethod('percentile')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                method === 'percentile'
                  ? 'bg-[#24a4ab] text-white shadow'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Percentile
            </button>
            <button
              onClick={() => setMethod('zscore')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                method === 'zscore'
                  ? 'bg-[#24a4ab] text-white shadow'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Z-Score
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {method === 'percentile'
            ? 'Simple ranking: Best model = 100, worst = 0. Click Z-Score for statistical normalization.'
            : 'Statistical method accounting for fleet-wide distribution. Click Percentile for simple ranking.'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                {method === 'percentile' ? 'Percentile Score' : 'Z-Score'}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Turbines</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cases/Turbine</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Critical %</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Cases</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rankedData.map((oem, index) => {
              const isBest = index < 3;

              return (
                <tr
                  key={oem.make}
                  className={`hover:bg-gray-50 ${isBest ? 'bg-yellow-50/30' : ''}`}
                >
                  <td className="px-4 py-3 text-sm">
                    {getRankIcon(index)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-black">
                    {oem.make}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={`px-3 py-1 rounded-full font-bold border-2 ${getScoreColor(oem.reliabilityScore)}`}>
                      {oem.reliabilityScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {oem.turbineCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={oem.casesPerTurbine < 2 ? 'text-green-600 font-semibold' : oem.casesPerTurbine > 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                      {oem.casesPerTurbine.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <span className={oem.criticalRate > 20 ? 'text-red-600 font-semibold' : oem.criticalRate > 10 ? 'text-orange-600' : 'text-green-600'}>
                      {oem.criticalRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {oem.totalCases}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {oem.reliabilityScore >= 80 ? (
                        <>
                          <TrendingUp size={16} className="text-green-600" />
                          <span className="text-green-600 font-semibold">Excellent</span>
                        </>
                      ) : oem.reliabilityScore >= 60 ? (
                        <span className="text-yellow-600">Average</span>
                      ) : (
                        <>
                          <TrendingDown size={16} className="text-red-600" />
                          <span className="text-red-600 font-semibold">Needs Review</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Current Method: {method === 'percentile' ? 'Percentile-Based' : 'Z-Score Statistical'}</span>
            <p className="text-xs text-blue-700 mt-1">
              {method === 'percentile'
                ? 'Models ranked by combined performance (cases/turbine + critical rate). Best = 100, worst = 0. Simple and easy to understand.'
                : 'Statistical normalization using standard deviations from fleet mean. Accounts for data distribution. Score ~50 = average, >80 = exceptional, <20 = problematic.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
