import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'motion/react';
import { useBlock } from '../contexts/BlockContext';

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
  const { activeBlock } = useBlock();
  const [powerData, setPowerData] = useState<any[]>([]);
  const [voltageData, setVoltageData] = useState<any[]>([]);
  const [temperatureData, setTemperatureData] = useState<any[]>([]);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/stats/telemetry?block=${activeBlock}`);
        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success') {
            setPowerData(json.data.powerData);
            setVoltageData(json.data.voltageData);
            setTemperatureData(json.data.temperatureData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch telemetry data:", err);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, [activeBlock]);

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
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
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
        </div>
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
