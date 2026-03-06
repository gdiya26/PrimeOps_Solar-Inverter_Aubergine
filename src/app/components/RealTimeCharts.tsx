import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';

const powerData = [
  { time: '00:00', power: 0 },
  { time: '06:00', power: 120 },
  { time: '08:00', power: 580 },
  { time: '10:00', power: 920 },
  { time: '12:00', power: 1200 },
  { time: '14:00', power: 1150 },
  { time: '16:00', power: 850 },
  { time: '18:00', power: 380 },
  { time: '20:00', power: 50 },
  { time: '22:00', power: 0 },
];

const voltageData = [
  { time: '10:00', inv1: 580, inv2: 575, inv3: 582, inv4: 540 },
  { time: '11:00', inv1: 585, inv2: 578, inv3: 580, inv4: 535 },
  { time: '12:00', inv1: 590, inv2: 582, inv3: 588, inv4: 520 },
  { time: '13:00', inv1: 588, inv2: 580, inv3: 585, inv4: 510 },
  { time: '14:00', inv1: 592, inv2: 585, inv3: 590, inv4: 525 },
  { time: '15:00', inv1: 587, inv2: 583, inv3: 586, inv4: 515 },
];

const temperatureData = [
  { inverter: 'INV-1', temp: 45, status: 'normal' },
  { inverter: 'INV-2', temp: 62, status: 'warning' },
  { inverter: 'INV-3', temp: 48, status: 'normal' },
  { inverter: 'INV-4', temp: 67, status: 'critical' },
  { inverter: 'INV-5', temp: 51, status: 'normal' },
  { inverter: 'INV-6', temp: 47, status: 'normal' },
  { inverter: 'INV-7', temp: 59, status: 'warning' },
  { inverter: 'INV-8', temp: 49, status: 'normal' },
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

export default function RealTimeCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Power Output Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-bold mb-4">Power Output Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={powerData}>
            <defs>
              <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="time" stroke="#666" style={{ fontSize: '12px' }} />
            <YAxis stroke="#666" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="power"
              stroke="#1E88E5"
              strokeWidth={2}
              fill="url(#powerGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* PV Voltage Stability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-bold mb-4">PV Voltage Stability</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={voltageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="time" stroke="#666" style={{ fontSize: '12px' }} />
            <YAxis stroke="#666" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="inv1" stroke="#00E676" strokeWidth={2} dot={false} animationDuration={1500} />
            <Line type="monotone" dataKey="inv2" stroke="#FFC107" strokeWidth={2} dot={false} animationDuration={1500} />
            <Line type="monotone" dataKey="inv3" stroke="#1E88E5" strokeWidth={2} dot={false} animationDuration={1500} />
            <Line type="monotone" dataKey="inv4" stroke="#FF5252" strokeWidth={2} dot={false} animationDuration={1500} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Inverter Temperature */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800 lg:col-span-2"
      >
        <h3 className="text-lg font-bold mb-4">Inverter Temperature Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={temperatureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="inverter" stroke="#666" style={{ fontSize: '12px' }} />
            <YAxis stroke="#666" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="temp"
              radius={[8, 8, 0, 0]}
              animationDuration={1500}
            >
              {temperatureData.map((entry, index) => (
                <motion.rect
                  key={`cell-${index}`}
                  fill={
                    entry.status === 'critical'
                      ? '#FF5252'
                      : entry.status === 'warning'
                      ? '#FFC107'
                      : '#00E676'
                  }
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
