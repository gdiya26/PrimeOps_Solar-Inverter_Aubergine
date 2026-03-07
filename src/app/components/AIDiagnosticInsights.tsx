import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Lightbulb } from 'lucide-react';
import { useBlock } from '../contexts/BlockContext';

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
  const { activeBlock } = useBlock();
  const [shapData, setShapData] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [criticalText, setCriticalText] = useState('');

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/stats/inverter-telemetry?block=${activeBlock}`);
        const data = await res.json();
        if (data.status === 'success' && data.data.length > 0) {
          // Compute average metrics across all inverters
          const invs = data.data;
          const avgTemp = invs.reduce((s: number, i: any) => s + i.temperature, 0) / invs.length;
          const avgPower = invs.reduce((s: number, i: any) => s + i.powerOutput, 0) / invs.length;
          const avgVoltage = invs.reduce((s: number, i: any) => s + i.voltage, 0) / invs.length;
          const avgEff = invs.reduce((s: number, i: any) => s + i.efficiency, 0) / invs.length;

          // Compute relative impact weights
          const tempImpact = avgTemp > 85 ? 0.4 : (avgTemp > 75 ? 0.2 : 0.05);
          const powerImpact = avgPower < 50 ? 0.35 : (avgPower < 150 ? 0.15 : 0.03);
          const voltageImpact = avgVoltage < 300 ? 0.2 : 0.02;
          const total = tempImpact + powerImpact + voltageImpact + 0.01;

          setShapData([
            { factor: 'Temperature', impact: tempImpact / total, positive: false },
            { factor: 'Power Output', impact: powerImpact / total, positive: false },
            { factor: 'PV Voltage', impact: voltageImpact / total, positive: false },
            { factor: 'Efficiency', impact: 0.01 / total, positive: true },
          ]);

          // Determine the dominant factor
          const dominant = tempImpact >= powerImpact ? 'Temperature' : 'Power Output';
          setCriticalText(
            `Analysis of ${invs.length} inverters: Average temperature is ${avgTemp.toFixed(1)}°C, ` +
            `average power output is ${avgPower.toFixed(2)} kW, and average efficiency is ${avgEff.toFixed(1)}%. ` +
            `The dominant contributing factor is ${dominant}.`
          );

          // Dynamic recommendations
          const recs: string[] = [];
          if (avgTemp > 85) recs.push(`Monitor high temperature inverters (avg ${avgTemp.toFixed(1)}°C)`);
          if (avgPower < 50) recs.push(`Investigate low power output (avg ${avgPower.toFixed(2)} kW)`);
          if (avgVoltage < 300) recs.push(`Check PV string connections for voltage drops (avg ${avgVoltage.toFixed(0)}V)`);
          recs.push(`Continue monitoring efficiency trends (current avg: ${avgEff.toFixed(1)}%)`);
          setRecommendations(recs);
        } else {
          setCriticalText('No telemetry data available for analysis.');
          setRecommendations([]);
          setShapData([]);
        }
      } catch (err) {
        console.error('Failed to fetch diagnostics:', err);
      }
    };
    fetchDiagnostics();
  }, [activeBlock]);

  return (
    <div className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-[#0E1117]" />
        </div>
        <div>
          <h2 className="text-xl font-bold">AI Diagnostic Insights</h2>
          <p className="text-sm text-gray-400">Live Feature Importance Analysis</p>
        </div>
      </div>

      {/* AI Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#FF5252]/10 to-transparent border-l-4 border-[#FF5252] rounded-lg p-4 mb-6"
      >
        <p className="text-sm leading-relaxed">
          <span className="font-bold text-[#FF5252]">Live Analysis:</span>{' '}
          {criticalText || 'Loading diagnostics...'}
        </p>
      </motion.div>

      {/* Contributing Factors Chart */}
      {shapData.length > 0 && (
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-gray-400">Top Contributing Factors</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={shapData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" horizontal={false} />
            <XAxis type="number" stroke="#666" style={{ fontSize: '12px' }} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
            <YAxis type="category" dataKey="factor" stroke="#666" style={{ fontSize: '12px' }} width={100} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="impact" radius={[0, 8, 8, 0]} animationDuration={1500}>
              {shapData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === 0 ? '#FF5252' : index === 1 ? '#FFC107' : '#1E88E5'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400">Recommended Actions</h3>
        {recommendations.map((recommendation, index) => (
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
      )}
    </div>
  );
}
