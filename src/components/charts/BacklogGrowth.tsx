// Component: BacklogGrowth
// Purpose: AreaChart showing case creation vs closure rates and net backlog trend
// File: BacklogGrowth.tsx

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from 'recharts';

interface BacklogGrowthProps {
  data: {
    date: string;
    created: number;
    closed: number;
    netBacklog: number;
  }[];
}

export function BacklogGrowth({ data }: BacklogGrowthProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-black">Backlog Growth</h3>
        <p className="text-sm text-gray-500 mt-1">Case creation vs closure rates and net backlog accumulation</p>
        <div className="mt-8 text-center text-gray-500">No data available</div>
      </div>
    );
  }

  // Calculate statistics
  const currentBacklog = data[data.length - 1].netBacklog;
  const initialBacklog = data[0].netBacklog;
  const backlogChange = currentBacklog - initialBacklog;
  const backlogChangePercent = initialBacklog > 0
    ? ((backlogChange / initialBacklog) * 100).toFixed(1)
    : 'N/A';

  // Determine trend
  const trend = backlogChange > 0 ? 'Growing' : backlogChange < 0 ? 'Shrinking' : 'Stable';
  const trendColor = backlogChange > 0
    ? 'text-red-600'
    : backlogChange < 0
    ? 'text-green-600'
    : 'text-gray-600';

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-black">Backlog Growth</h3>
      <p className="text-sm text-gray-500 mt-1">Case creation vs closure rates and net backlog accumulation</p>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 60, left: 20, bottom: 60 }}
        >
          <defs>
            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          {/* Left Y-axis for daily cases */}
          <YAxis
            yAxisId="left"
            label={{ value: 'Daily Cases', angle: -90, position: 'insideLeft' }}
          />
          {/* Right Y-axis for net backlog */}
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Net Backlog', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;

              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                  <p className="font-semibold text-sm mb-2">{data.date}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-red-600">Created:</span>
                      <span className="font-semibold">{data.created}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-green-600">Closed:</span>
                      <span className="font-semibold">{data.closed}</span>
                    </div>
                    <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
                      <span className="text-blue-600">Net Backlog:</span>
                      <span className="font-bold">{data.netBacklog}</span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Legend verticalAlign="top" height={36} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="created"
            name="Created"
            stroke="#dc2626"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorCreated)"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="closed"
            name="Closed"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorClosed)"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="netBacklog"
            name="Net Backlog"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={0}
            dot={{ r: 2 }}
          />
          <Brush
            dataKey="date"
            height={30}
            stroke="#8884d8"
            startIndex={0}
            endIndex={data.length - 1}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-700">Current Backlog</div>
          <div className="text-lg font-semibold text-blue-600">
            {currentBacklog}
          </div>
          <div className="text-xs text-gray-500">open cases</div>
        </div>
        <div>
          <div className="text-gray-700">Backlog Change</div>
          <div className={`text-lg font-semibold ${trendColor}`}>
            {backlogChange > 0 ? '+' : ''}{backlogChange}
          </div>
          <div className="text-xs text-gray-500">
            {typeof backlogChangePercent === 'string' ? backlogChangePercent : `${backlogChangePercent}%`}
          </div>
        </div>
        <div>
          <div className="text-gray-700">Trend</div>
          <div className={`text-lg font-semibold ${trendColor}`}>
            {trend}
          </div>
          <div className="text-xs text-gray-500">
            {data.length} day period
          </div>
        </div>
      </div>
    </div>
  );
}
