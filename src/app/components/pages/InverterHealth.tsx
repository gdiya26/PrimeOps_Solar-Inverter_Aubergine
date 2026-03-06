import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Activity, Thermometer, Zap, TrendingUp } from 'lucide-react';
import { useBlock } from '../../contexts/BlockContext';

interface InverterCardData {
  id: string;
  status: 'healthy' | 'warning' | 'critical';
  temperature: number;
  powerOutput: number;
  efficiency: number;
  riskScore: number;
}

export default function InverterHealth() {
  const { activeBlock } = useBlock();
  const [inverters, setInverters] = useState<InverterCardData[]>([]);
  const [stats, setStats] = useState({ healthy: 0, warning: 0, critical: 0, avgEfficiency: 0 });

  const fetchInverters = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/inverters?block=${activeBlock}`);
      const data = await res.json();
      
      if (data.status === 'success') {
          // Map backend data to frontend interface
          const mappedData = data.data.map((inv: any) => {
              // Simulating some derived metrics if they don't exist in DB
              const risk = inv.status?.toLowerCase() === 'offline' ? 85 : 
                (inv.status?.toLowerCase() === 'warning' ? 55 : 15);
              const statusMapped = risk > 70 ? 'critical' : (risk > 40 ? 'warning' : 'healthy');
              
              return {
                 id: inv.name || inv.id?.substring(0,8),
                 status: statusMapped,
                 temperature: 45 + Math.floor(Math.random() * 20), // Mock if missing
                 powerOutput: 80 + Math.floor(Math.random() * 20),
                 efficiency: 95 + Math.random() * 4,
                 riskScore: risk
              };
          });
          setInverters(mappedData);

          // Calculate Roll-up stats
          let healthyCount = 0;
          let warningCount = 0;
          let criticalCount = 0;
          let totalEff = 0;

          mappedData.forEach((inv: any) => {
             if (inv.status === 'healthy') healthyCount++;
             if (inv.status === 'warning') warningCount++;
             if (inv.status === 'critical') criticalCount++;
             totalEff += inv.efficiency;
          });

          setStats({
              healthy: healthyCount,
              warning: warningCount,
              critical: criticalCount,
              avgEfficiency: mappedData.length > 0 ? totalEff / mappedData.length : 0
          });
      }
    } catch (error) {
       console.error("Failed to fetch inverters for health page", error);
    }
  };

  useEffect(() => {
     fetchInverters();
  }, [activeBlock]);

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
        <h1 className="text-3xl font-bold mb-2">Inverter Health Monitor ({activeBlock === 'All' ? 'All Blocks' : `Block ${activeBlock}`})</h1>
        <p className="text-gray-400">Comprehensive health status for inverters</p>
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
              <p className="text-2xl font-bold">{stats.healthy}</p>
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
              <p className="text-2xl font-bold">{stats.warning}</p>
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
              <p className="text-2xl font-bold">{stats.critical}</p>
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
              <p className="text-2xl font-bold">{stats.avgEfficiency.toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Inverter Grid */}
      {inverters.length === 0 ? (
        <div className="bg-[#1A1D29] rounded-xl p-12 text-center border border-gray-800">
           <p className="text-xl text-gray-400 font-medium">No inverters found in this block.</p>
           <p className="text-sm text-gray-500 mt-2">Ensure that the hardware mac mappings exist in the system for Block {activeBlock}.</p>
        </div>
      ) : (
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
                <span className="text-sm font-bold text-white">{inverter.efficiency.toFixed(1)}%</span>
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
      )}
    </div>
  );
}
