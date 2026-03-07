import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import RealTimeCharts from '../RealTimeCharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useBlock } from '../../contexts/BlockContext';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0E1117] border border-gray-800 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { activeBlock } = useBlock();
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [avgEfficiency, setAvgEfficiency] = useState('—');
  const [totalPower, setTotalPower] = useState('—');
  const [onlinePercent, setOnlinePercent] = useState('—');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch telemetry for power trend chart
        const telRes = await fetch(`http://localhost:5000/api/stats/telemetry?block=${activeBlock}`);
        const telData = await telRes.json();
        if (telData.status === 'success') {
          // Use power data as energy trend
          setEnergyData(
            telData.data.powerData.map((d: any) => ({ time: d.time, energy: d.power }))
          );
        }

        // Fetch per-inverter telemetry for performance distribution
        const invRes = await fetch(`http://localhost:5000/api/stats/inverter-telemetry?block=${activeBlock}`);
        const invData = await invRes.json();
        if (invData.status === 'success' && invData.data.length > 0) {
          const invs = invData.data;
          let excellent = 0, good = 0, attention = 0;
          let totalEff = 0;
          let totalPow = 0;

          invs.forEach((inv: any) => {
            totalEff += inv.efficiency;
            totalPow += inv.powerOutput;
            if (inv.health === 'healthy' && inv.efficiency > 80) excellent++;
            else if (inv.health === 'warning') good++;
            else attention++;
          });

          const total = invs.length;
          setPerformanceData([
            { name: 'Excellent', value: parseFloat(((excellent / total) * 100).toFixed(1)), color: '#00E676' },
            { name: 'Good', value: parseFloat(((good / total) * 100).toFixed(1)), color: '#FFC107' },
            { name: 'Needs Attention', value: parseFloat(((attention / total) * 100).toFixed(1)), color: '#FF5252' },
          ]);

          setAvgEfficiency((totalEff / total).toFixed(1));
          setTotalPower(totalPow.toFixed(2));

          // Online percent
          const onlineCount = invs.filter((i: any) => i.health !== 'critical').length;
          setOnlinePercent(((onlineCount / total) * 100).toFixed(1));
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };
    fetchAnalytics();
  }, [activeBlock]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">
          Live performance metrics for {activeBlock === 'All' ? 'All Blocks' : `Block ${activeBlock}`}
        </p>
      </motion.div>

      {/* Real-Time Charts */}
      <RealTimeCharts />

      {/* Historical Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Power Output Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-bold mb-4">Power Output Trend</h3>
          {energyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
              <XAxis dataKey="time" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="energy" name="Power (kW)" fill="#FFC107" radius={[8, 8, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">No telemetry data available</div>
          )}
        </motion.div>

        {/* Performance Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-bold mb-4">Inverter Performance Distribution</h3>
          {performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">No telemetry data available</div>
          )}
        </motion.div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h4 className="text-sm text-gray-400 mb-2">Online Rate</h4>
          <p className="text-3xl font-bold text-[#00E676] mb-2">{onlinePercent}%</p>
          <p className="text-xs text-gray-500">Based on live telemetry</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h4 className="text-sm text-gray-400 mb-2">Total Power Output</h4>
          <p className="text-3xl font-bold text-[#FFC107] mb-2">{totalPower} kW</p>
          <p className="text-xs text-gray-500">Latest telemetry reading</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h4 className="text-sm text-gray-400 mb-2">Average Efficiency</h4>
          <p className="text-3xl font-bold text-[#1E88E5] mb-2">{avgEfficiency}%</p>
          <p className="text-xs text-gray-500">Across all active inverters</p>
        </motion.div>
      </div>
    </div>
  );
}
