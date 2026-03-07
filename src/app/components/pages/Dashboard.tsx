import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Zap, AlertCircle, Sun, TrendingUp, X, RefreshCw } from 'lucide-react';
import MetricCard from '../MetricCard';
import SolarPlantVisualization from '../SolarPlantVisualization';
import RealTimeCharts from '../RealTimeCharts';
import AIFailurePrediction from '../AIFailurePrediction';
import AIDiagnosticInsights from '../AIDiagnosticInsights';
import AIPredictiveTimeline from '../AIPredictiveTimeline';
import { useBlock } from '../../contexts/BlockContext';

export default function Dashboard() {
  const { activeBlock } = useBlock();
  const [selectedInverter, setSelectedInverter] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inverterCount, setInverterCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [criticalAlerts, setCriticalAlerts] = useState(0);
  const [totalPowerDisplay, setTotalPowerDisplay] = useState('—');
  const [inverterNodes, setInverterNodes] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch dashboard stats
      const statsRes = await fetch(`http://localhost:5000/api/stats?block=${activeBlock}`);
      if (!statsRes.ok) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      const statsData = await statsRes.json();
      
      if (statsData.status === 'success') {
          const { totalInverters, activeInverters, criticalAlerts: cAlerts, totalPowerToday } = statsData.data;
          setInverterCount(totalInverters ?? 0);
          setOnlineCount(activeInverters ?? 0);
          setCriticalAlerts(cAlerts ?? 0);
          setTotalPowerDisplay(typeof totalPowerToday === 'number' ? totalPowerToday.toFixed(1) : '0.0');
      }

      // 2. Fetch REAL per-inverter telemetry from plantX_Y tables
      const telRes = await fetch(`http://localhost:5000/api/stats/inverter-telemetry?block=${activeBlock}`);
      const telData = await telRes.json();

      if (telData.status === 'success' && telData.data.length > 0) {
        const mappedNodes = telData.data.map((inv: any) => ({
          id: `${inv.tableSource}-inv${inv.inverterIndex}`,
          serial_number: `Block ${inv.block} — INV ${inv.inverterIndex + 1}`,
          health: inv.health,
          temperature: inv.temperature,
          powerOutput: inv.powerOutput,
          voltage: inv.voltage,
          efficiency: inv.efficiency,
          ambientTemp: inv.ambientTemp,
          riskScore: inv.riskScore,
          block: inv.block
        }));

        setInverterNodes(mappedNodes);
        // Use telemetry count as the real inverter count
        setInverterCount(mappedNodes.length);
        setOnlineCount(mappedNodes.length);
      } else {
        // Fallback: fetch structural inverter data if telemetry is unavailable
        const invRes = await fetch(`http://localhost:5000/api/inverters?block=${activeBlock}`);
        const invData = await invRes.json();
        if (invData.status === 'success') {
          const inverters = invData.data;
          setInverterCount(inverters.length);
          setOnlineCount(inverters.filter((i: any) => i.status?.toLowerCase() === 'online' || i.status?.toLowerCase() === 'active').length);
          const mappedNodes = inverters.map((inv: any, idx: number) => ({
            id: inv.id,
            serial_number: inv.serial_number || `INV-${idx + 1}`,
            health: inv.status === 'offline' ? 'critical' : 'healthy',
            temperature: 0,
            powerOutput: 0,
            voltage: 0,
            efficiency: 0,
            ambientTemp: 0,
            riskScore: inv.status === 'offline' ? 75 : 10
          }));
          setInverterNodes(mappedNodes);
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard metrics from backend.", error);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  // Re-fetch when the active block changes
  useEffect(() => {
    fetchDashboardData();
  }, [activeBlock]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Solar Plant Control Center</h1>
          <p className="text-gray-400">Real-time monitoring and AI-powered predictive maintenance</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-[#1A1D29] hover:bg-[#252B3D] text-white border border-gray-800 px-4 py-2.5 rounded-lg transition-colors font-medium self-start sm:self-auto disabled:opacity-70"
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw className="w-4 h-4 text-[#FFC107]" />
          </motion.div>
          {isRefreshing ? 'Syncing...' : 'Refresh Data'}
        </motion.button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Inverters"
          value={inverterCount}
          icon={<Activity className="w-6 h-6" />}
          color="#1E88E5"
        />
        <MetricCard
          title="Inverters Online"
          value={onlineCount}
          icon={<Zap className="w-6 h-6" />}
          color="#00E676"
          trend={0}
        />
        <MetricCard
          title="Active Fault Alerts"
          value={criticalAlerts}
          icon={<AlertCircle className="w-6 h-6" />}
          color="#FF5252"
          alert={criticalAlerts > 0}
          trend={criticalAlerts > 0 ? 15 : 0}
        />
        <MetricCard
          title="Energy Generated Today"
          value={totalPowerDisplay}
          unit="MWh"
          icon={<Sun className="w-6 h-6" />}
          color="#FFC107"
          trend={5}
        />
        <MetricCard
          title="Predicted Failures (7d)"
          value={inverterNodes.filter(n => n.riskScore > 75).length}
          icon={<TrendingUp className="w-6 h-6" />}
          color="#FF9800"
          alert={inverterNodes.some(n => n.riskScore > 75)}
        />
      </div>

      {/* Solar Plant Visualization */}
      {inverterNodes.length > 0 ? (
        <SolarPlantVisualization 
          inverters={inverterNodes} 
          onInverterClick={setSelectedInverter} 
        />
      ) : (
        <div className="bg-[#1A1D29] rounded-xl p-8 border border-gray-800 flex items-center justify-center">
           <p className="text-gray-400">Loading plant topology...</p>
        </div>
      )}

      {/* Real-Time Charts */}
      <RealTimeCharts />

      {/* AI Predictions and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIFailurePrediction />
        <AIDiagnosticInsights />
      </div>

      {/* Predictive Timeline */}
      <AIPredictiveTimeline />

      {/* Inverter Details Side Panel */}
      <AnimatePresence>
        {selectedInverter && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInverter(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-96 bg-[#1A1D29] border-l border-gray-800 z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedInverter.serial_number || `Inverter ${selectedInverter.id}`}</h2>
                  <button
                    onClick={() => setSelectedInverter(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status Badge */}
                <div
                  className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6"
                  style={{
                    backgroundColor:
                      selectedInverter.health === 'healthy'
                        ? '#00E67620'
                        : selectedInverter.health === 'warning'
                          ? '#FFC10720'
                          : '#FF525220',
                    color:
                      selectedInverter.health === 'healthy'
                        ? '#00E676'
                        : selectedInverter.health === 'warning'
                          ? '#FFC107'
                          : '#FF5252',
                  }}
                >
                  {selectedInverter.health.toUpperCase()}
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                  <div className="bg-[#0E1117] rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Temperature</p>
                    <p className="text-2xl font-bold">{selectedInverter.temperature}°C</p>
                  </div>

                  <div className="bg-[#0E1117] rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Power Output</p>
                    <p className="text-2xl font-bold">{selectedInverter.powerOutput} kW</p>
                  </div>

                  <div className="bg-[#0E1117] rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Failure Risk Score</p>
                    <p className="text-2xl font-bold">{selectedInverter.riskScore}%</p>
                    <div className="w-full h-2 bg-[#1A1D29] rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${selectedInverter.riskScore}%`,
                          backgroundColor:
                            selectedInverter.riskScore > 70
                              ? '#FF5252'
                              : selectedInverter.riskScore > 40
                                ? '#FFC107'
                                : '#00E676',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Diagnostics */}
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-3">Quick Diagnostics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">PV Voltage:</span>
                      <span className="text-white">{selectedInverter.voltage ?? '—'}V</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Efficiency:</span>
                      <span className="text-white">{selectedInverter.efficiency ?? '—'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ambient Temp:</span>
                      <span className="text-white">{selectedInverter.ambientTemp ?? '—'}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Power Output:</span>
                      <span className="text-white">{selectedInverter.powerOutput ?? '—'} kW</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
