import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import AIDiagnosticInsights from '../AIDiagnosticInsights';
import { Brain, Lightbulb, Cpu } from 'lucide-react';
import { useBlock } from '../../contexts/BlockContext';

export default function AIInsights() {
  const { activeBlock } = useBlock();
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);
  const [modelStats, setModelStats] = useState({ inverterCount: 0, avgTemp: '—', avgPower: '—' });

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/stats/inverter-telemetry?block=${activeBlock}`);
        const data = await res.json();
        if (data.status === 'success' && data.data.length > 0) {
          const invs = data.data;
          const avgTemp = invs.reduce((s: number, i: any) => s + i.temperature, 0) / invs.length;
          const avgPower = invs.reduce((s: number, i: any) => s + i.powerOutput, 0) / invs.length;
          const avgVoltage = invs.reduce((s: number, i: any) => s + i.voltage, 0) / invs.length;
          const avgEff = invs.reduce((s: number, i: any) => s + i.efficiency, 0) / invs.length;

          // Compute relative importance from telemetry variance
          const tempVariance = invs.reduce((s: number, i: any) => s + Math.abs(i.temperature - avgTemp), 0) / invs.length;
          const powerVariance = invs.reduce((s: number, i: any) => s + Math.abs(i.powerOutput - avgPower), 0) / invs.length;
          const voltVariance = invs.reduce((s: number, i: any) => s + Math.abs(i.voltage - avgVoltage), 0) / invs.length;
          const effVariance = invs.reduce((s: number, i: any) => s + Math.abs(i.efficiency - avgEff), 0) / invs.length;

          const total = tempVariance + powerVariance + voltVariance + effVariance + 0.01;

          setFeatureImportance([
            { feature: 'Temperature Trends', importance: parseFloat(((tempVariance / total) * 100).toFixed(1)), color: '#FF5252' },
            { feature: 'PV Voltage Stability', importance: parseFloat(((voltVariance / total) * 100).toFixed(1)), color: '#FFC107' },
            { feature: 'Efficiency Degradation', importance: parseFloat(((effVariance / total) * 100).toFixed(1)), color: '#1E88E5' },
            { feature: 'Power Output Variance', importance: parseFloat(((powerVariance / total) * 100).toFixed(1)), color: '#00E676' },
          ]);

          setModelStats({
            inverterCount: invs.length,
            avgTemp: avgTemp.toFixed(1),
            avgPower: avgPower.toFixed(2)
          });
        }
      } catch (err) {
        console.error('Failed to fetch feature importance:', err);
      }
    };
    fetchFeatures();
  }, [activeBlock]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
        <p className="text-gray-400">
          Live analysis for {activeBlock === 'All' ? 'All Blocks' : `Block ${activeBlock}`}
        </p>
      </motion.div>

      {/* AI Model Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Inverters Analyzed</h3>
              <p className="text-xs text-gray-400">{modelStats.inverterCount} inverters</p>
            </div>
          </div>
          <p className="text-sm text-gray-300">
            Live telemetry from {activeBlock === 'All' ? 'all blocks' : `Block ${activeBlock}`}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00E676] to-[#00C853] rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Avg Temperature</h3>
              <p className="text-xs text-gray-400">{modelStats.avgTemp}°C</p>
            </div>
          </div>
          <p className="text-sm text-gray-300">Based on latest telemetry readings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-lg flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-[#0E1117]" />
            </div>
            <div>
              <h3 className="font-bold">Avg Power Output</h3>
              <p className="text-xs text-gray-400">{modelStats.avgPower} kW</p>
            </div>
          </div>
          <p className="text-sm text-gray-300">Power across all analyzed inverters</p>
        </motion.div>
      </div>

      {/* Diagnostic Insights */}
      <AIDiagnosticInsights />

      {/* Feature Importance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
      >
        <h2 className="text-xl font-bold mb-6">Live Feature Importance</h2>
        {featureImportance.length > 0 ? (
        <div className="space-y-4">
          {featureImportance.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">{item.feature}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>
                  {item.importance}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#0E1117] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.importance}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          <div className="text-center text-gray-500 py-8">No telemetry data available for analysis.</div>
        )}
      </motion.div>

      {/* AI Training Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1E88E5]/10 to-transparent border-l-4 border-[#1E88E5] rounded-lg p-6"
      >
        <h3 className="text-lg font-bold mb-3">Analysis Method</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Data Source</p>
            <p className="font-semibold text-white">Live Supabase Telemetry</p>
          </div>
          <div>
            <p className="text-gray-400">Analysis Type</p>
            <p className="font-semibold text-white">Real-time variance analysis</p>
          </div>
          <div>
            <p className="text-gray-400">Parameters Tracked</p>
            <p className="font-semibold text-white">Temperature, Power, Voltage, Efficiency</p>
          </div>
          <div>
            <p className="text-gray-400">Refresh Interval</p>
            <p className="font-semibold text-white">On block selection change</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
