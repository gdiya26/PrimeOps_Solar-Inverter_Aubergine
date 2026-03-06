import { motion } from 'motion/react';
import RealTimeCharts from '../RealTimeCharts';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const energyData = [
  { month: 'Jan', energy: 245 },
  { month: 'Feb', energy: 289 },
  { month: 'Mar', energy: 312 },
  { month: 'Apr', energy: 298 },
  { month: 'May', energy: 325 },
  { month: 'Jun', energy: 340 },
];

const performanceData = [
  { name: 'Excellent', value: 62.5, color: '#00E676' },
  { name: 'Good', value: 25, color: '#FFC107' },
  { name: 'Needs Attention', value: 12.5, color: '#FF5252' },
];

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
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Performance metrics and historical trends</p>
      </motion.div>

      {/* Real-Time Charts */}
      <RealTimeCharts />

      {/* Historical Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Energy Generation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-bold mb-4">Monthly Energy Generation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
              <XAxis dataKey="month" stroke="#666" style={{ fontSize: '12px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="energy" fill="#FFC107" radius={[8, 8, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-bold mb-4">Inverter Performance Distribution</h3>
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
        </motion.div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h4 className="text-sm text-gray-400 mb-2">Average Uptime</h4>
          <p className="text-3xl font-bold text-[#00E676] mb-2">99.4%</p>
          <p className="text-xs text-gray-500">Last 30 days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h4 className="text-sm text-gray-400 mb-2">Total Energy (YTD)</h4>
          <p className="text-3xl font-bold text-[#FFC107] mb-2">1,809 MWh</p>
          <p className="text-xs text-gray-500">+12% vs last year</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
        >
          <h4 className="text-sm text-gray-400 mb-2">System Efficiency</h4>
          <p className="text-3xl font-bold text-[#1E88E5] mb-2">95.8%</p>
          <p className="text-xs text-gray-500">Above industry avg (93%)</p>
        </motion.div>
      </div>
    </div>
  );
}
