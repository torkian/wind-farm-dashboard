import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface TurbineMakeData {
  make: string;
  totalCases: number;
  openCases: number;
  criticalCases: number;
  avgAgeDays: number;
  turbineCount: number;
  casesPerTurbine: number;
}

interface TurbineMakeComparisonProps {
  data: TurbineMakeData[];
}

export function TurbineMakeComparison({ data }: TurbineMakeComparisonProps) {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Turbine Make Comparison</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Turbine Make Comparison</h3>
      <p className="text-sm text-gray-600 mb-4">
        OEM performance analysis: case volume and criticality by manufacturer
      </p>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="make"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            label={{ value: 'Case Count', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Cases per Turbine', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '12px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'casesPerTurbine') {
                return [value.toFixed(2), 'Cases/Turbine'];
              }
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          <Bar
            yAxisId="left"
            dataKey="totalCases"
            name="Total Cases"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} opacity={0.3} />
            ))}
          </Bar>

          <Bar
            yAxisId="left"
            dataKey="openCases"
            name="Open Cases"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} opacity={0.7} />
            ))}
          </Bar>

          <Bar
            yAxisId="left"
            dataKey="criticalCases"
            name="Critical Cases"
            fill="#dc2626"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#dc2626" />
            ))}
          </Bar>

          <Bar
            yAxisId="right"
            dataKey="casesPerTurbine"
            name="Cases/Turbine"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {data.map((make, idx) => (
          <div key={make.make} className="p-3 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900 mb-1">{make.make}</div>
            <div className="text-gray-700">
              {make.turbineCount} turbines | {make.totalCases} cases
            </div>
            <div className={`font-semibold ${make.criticalCases > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {make.criticalCases} critical
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
