import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lightbulb } from 'lucide-react';

const shapData = [
  { factor: 'String 1 Current', impact: 0.993, positive: false },
  { factor: 'Temperature', impact: 0.006, positive: false },
  { factor: 'Voltage V_ab', impact: 0.001, positive: false },
  { factor: 'Ambient Temp', impact: 0.000, positive: false },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0E1117] border border-gray-800 rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-white">{payload[0].payload.factor}</p>
        <p className="text-xs text-gray-400">
          Impact: {(payload[0].value * 100).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

export default function AIDiagnosticInsights() {
  return (
    <div className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-[#0E1117]" />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI Diagnostic Insights</h2>
          <p className="text-sm text-gray-400">Feature Importance from Power Output Random Forest Model</p>
        </div>
      </div>

      {/* AI Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#FF5252]/10 to-transparent border-l-4 border-[#FF5252] rounded-lg p-4 mb-6"
      >
        <p className="text-sm leading-relaxed">
          <span className="font-bold text-[#FF5252]">Critical Analysis:</span> The Random Forest Regression model identified that{' '}
          <span className="text-[#FFC107] font-medium">String 1 Current anomalies</span> have an overwhelming 99.3% contribution to the drops in power output. Temperature and Voltage fluctuations contribute minimally.
        </p>
      </motion.div>

      {/* Contributing Factors Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-gray-400">Top Contributing Factors</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={shapData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" horizontal={false} />
            <XAxis type="number" stroke="#666" style={{ fontSize: '12px' }} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <YAxis type="category" dataKey="factor" stroke="#666" style={{ fontSize: '12px' }} width={100} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="impact" radius={[0, 8, 8, 0]} animationDuration={1500}>
              {shapData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === 0
                      ? '#FF5252'
                      : index === 1
                      ? '#FFC107'
                      : '#1E88E5'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400">Recommended Actions</h3>
        {[
          'Schedule immediate inspection of String 1 connections on INV-1',
          'Deploy field team to investigate potential shading on String 1',
          'Monitor overall plant voltage for cascading impact',
          'Optimize inverter MPPT sweeps to compensate for string unbalance'
        ].map((recommendation, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 bg-[#0E1117] rounded-lg p-3"
          >
            <div className="w-6 h-6 bg-[#FFC107]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-[#FFC107]">{index + 1}</span>
            </div>
            <p className="text-sm text-gray-300">{recommendation}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
