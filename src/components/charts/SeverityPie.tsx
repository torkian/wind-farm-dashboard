// Component: SeverityPie
// Purpose: PieChart showing case breakdown by severity with percentages
// File: SeverityPie.tsx

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { COLORS } from '../../config/thresholds';

interface SeverityPieProps {
  data: {
    name: string;
    value: number;
    percentage: number;
  }[];
}

export function SeverityPie({ data }: SeverityPieProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-black">Severity Distribution</h3>
        <p className="text-sm text-gray-500 mt-1">Case breakdown by severity level</p>
        <div className="mt-8 text-center text-gray-500">No data available</div>
      </div>
    );
  }

  // Map severity names to colors
  const getColor = (name: string): string => {
    return COLORS.severity[name as keyof typeof COLORS.severity] || '#6b7280';
  };

  // Custom label renderer to show percentage on pie
  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  // Calculate total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-black">Severity Distribution</h3>
      <p className="text-sm text-gray-500 mt-1">Case breakdown by severity level</p>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;

              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                  <p className="font-semibold text-sm">{data.name}</p>
                  <p className="text-sm">Count: {data.value}</p>
                  <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
                </div>
              );
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-gray-600 font-medium">Severity</th>
              <th className="text-right py-2 px-3 text-gray-600 font-medium">Count</th>
              <th className="text-right py-2 px-3 text-gray-600 font-medium">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 px-3 flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: getColor(item.name) }}
                  />
                  <span className="font-medium">{item.name}</span>
                </td>
                <td className="text-right py-2 px-3 font-semibold">
                  {item.value}
                </td>
                <td className="text-right py-2 px-3 text-gray-700">
                  {item.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-300 font-bold">
              <td className="py-2 px-3">Total</td>
              <td className="text-right py-2 px-3">{total}</td>
              <td className="text-right py-2 px-3">100.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
