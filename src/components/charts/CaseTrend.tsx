// Component: CaseTrend
// Purpose: LineChart showing daily case creation over time by severity
// File: CaseTrend.tsx

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { COLORS } from '../../config/thresholds';

interface CaseTrendProps {
  data: {
    date: string;
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
    total: number;
  }[];
}

export function CaseTrend({ data }: CaseTrendProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-black">Case Trend</h3>
        <p className="text-sm text-gray-500 mt-1">Daily case creation over time by severity</p>
        <div className="mt-8 text-center text-gray-500">No data available</div>
      </div>
    );
  }

  // Calculate statistics
  const totalCases = data.reduce((sum, day) => sum + day.total, 0);
  const peakDay = data.reduce((max, day) => (day.total > max.total ? day : max), data[0]);
  const avgPerDay = totalCases / data.length;

  // Calculate trend (compare first half vs second half)
  const midpoint = Math.floor(data.length / 2);
  const firstHalfAvg = data.slice(0, midpoint).reduce((sum, d) => sum + d.total, 0) / midpoint;
  const secondHalfAvg = data.slice(midpoint).reduce((sum, d) => sum + d.total, 0) / (data.length - midpoint);
  const trend = secondHalfAvg > firstHalfAvg ? 'rising' : 'falling';
  const trendColor = trend === 'rising' ? 'text-red-600' : 'text-green-600';

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-black">Case Trend</h3>
      <p className="text-sm text-gray-500 mt-1">Daily case creation over time by severity</p>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;

              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                  <p className="font-semibold text-sm mb-2">{data.date}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <span style={{ color: COLORS.severity.Critical }}>Critical:</span>
                      <span className="font-semibold">{data.Critical}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span style={{ color: COLORS.severity.High }}>High:</span>
                      <span className="font-semibold">{data.High}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span style={{ color: COLORS.severity.Medium }}>Medium:</span>
                      <span className="font-semibold">{data.Medium}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span style={{ color: COLORS.severity.Low }}>Low:</span>
                      <span className="font-semibold">{data.Low}</span>
                    </div>
                    <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
                      <span className="text-gray-800">Total:</span>
                      <span className="font-bold">{data.total}</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Critical"
            stroke={COLORS.severity.Critical}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="High"
            stroke={COLORS.severity.High}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Medium"
            stroke={COLORS.severity.Medium}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Low"
            stroke={COLORS.severity.Low}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-4 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-700">Total Cases</div>
          <div className="text-lg font-semibold text-blue-600">
            {totalCases}
          </div>
          <div className="text-xs text-gray-500">{data.length} days</div>
        </div>
        <div>
          <div className="text-gray-700">Peak Day</div>
          <div className="text-lg font-semibold text-violet-600">
            {peakDay.total}
          </div>
          <div className="text-xs text-gray-500">{peakDay.date}</div>
        </div>
        <div>
          <div className="text-gray-700">Avg/Day</div>
          <div className="text-lg font-semibold text-amber-600">
            {avgPerDay.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">mean daily cases</div>
        </div>
        <div>
          <div className="text-gray-700">Trend</div>
          <div className={`text-lg font-semibold ${trendColor}`}>
            {trend === 'rising' ? 'Rising' : 'Falling'}
          </div>
          <div className="text-xs text-gray-500">
            {((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
