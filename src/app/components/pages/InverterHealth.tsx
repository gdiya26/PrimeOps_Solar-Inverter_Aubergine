import { motion } from 'motion/react';
import { Activity, Thermometer, Zap, TrendingUp } from 'lucide-react';

interface InverterCardData {
  id: string;
  status: 'healthy' | 'warning' | 'critical';
  temperature: number;
  powerOutput: number;
  efficiency: number;
  riskScore: number;
}

const inverters: InverterCardData[] = [
  { id: 'INV-001', status: 'healthy', temperature: 45, powerOutput: 98, efficiency: 97.8, riskScore: 15 },
  { id: 'INV-002', status: 'warning', temperature: 62, powerOutput: 85, efficiency: 94.2, riskScore: 58 },
  { id: 'INV-003', status: 'healthy', temperature: 48, powerOutput: 96, efficiency: 97.5, riskScore: 22 },
  { id: 'INV-004', status: 'critical', temperature: 67, powerOutput: 72, efficiency: 89.1, riskScore: 82 },
  { id: 'INV-005', status: 'healthy', temperature: 51, powerOutput: 94, efficiency: 96.9, riskScore: 18 },
  { id: 'INV-006', status: 'healthy', temperature: 47, powerOutput: 99, efficiency: 98.2, riskScore: 12 },
  { id: 'INV-007', status: 'warning', temperature: 59, powerOutput: 88, efficiency: 95.3, riskScore: 45 },
  { id: 'INV-008', status: 'healthy', temperature: 49, powerOutput: 97, efficiency: 97.6, riskScore: 20 },
];

export default function InverterHealth() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#00E676';
      case 'warning':
        return '#FFC107';
      case 'critical':
        return '#FF5252';
      default:
        return '#666';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Inverter Health Monitor</h1>
        <p className="text-gray-400">Comprehensive health status for all inverters</p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1D29] rounded-xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#00E676]/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#00E676]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Healthy</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1D29] rounded-xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFC107]/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#FFC107]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Warning</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1A1D29] rounded-xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FF5252]/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#FF5252]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Critical</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A1D29] rounded-xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#1E88E5]/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#1E88E5]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Avg Efficiency</p>
              <p className="text-2xl font-bold">95.8%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Inverter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {inverters.map((inverter, index) => (
          <motion.div
            key={inverter.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -8 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#1A1D29] rounded-xl p-6 border-2 cursor-pointer"
            style={{
              borderColor: getStatusColor(inverter.status),
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{inverter.id}</h3>
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: getStatusColor(inverter.status) }}
              />
            </div>

            {/* Status Badge */}
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{
                backgroundColor: `${getStatusColor(inverter.status)}20`,
                color: getStatusColor(inverter.status),
              }}
            >
              {inverter.status.toUpperCase()}
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              {/* Temperature */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Temperature</span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: inverter.temperature > 60 ? '#FF5252' : inverter.temperature > 55 ? '#FFC107' : '#00E676',
                  }}
                >
                  {inverter.temperature}°C
                </span>
              </div>

              {/* Power Output */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Power</span>
                </div>
                <span className="text-sm font-bold text-white">{inverter.powerOutput}%</span>
              </div>

              {/* Efficiency */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Efficiency</span>
                </div>
                <span className="text-sm font-bold text-white">{inverter.efficiency}%</span>
              </div>

              {/* Risk Score */}
              <div className="pt-3 border-t border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-400">Failure Risk</span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: inverter.riskScore > 70 ? '#FF5252' : inverter.riskScore > 40 ? '#FFC107' : '#00E676',
                    }}
                  >
                    {inverter.riskScore}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#0E1117] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${inverter.riskScore}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        inverter.riskScore > 70 ? '#FF5252' : inverter.riskScore > 40 ? '#FFC107' : '#00E676',
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
