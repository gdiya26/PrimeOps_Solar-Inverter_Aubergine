import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Zap, AlertCircle, Sun, TrendingUp, X, RefreshCw } from 'lucide-react';
import MetricCard from '../MetricCard';
import SolarPlantVisualization from '../SolarPlantVisualization';
import RealTimeCharts from '../RealTimeCharts';
import AIFailurePrediction from '../AIFailurePrediction';
import AIDiagnosticInsights from '../AIDiagnosticInsights';
import AIPredictiveTimeline from '../AIPredictiveTimeline';

export default function Dashboard() {
  const [selectedInverter, setSelectedInverter] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate real data fetching delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
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
          value={8}
          icon={<Activity className="w-6 h-6" />}
          color="#1E88E5"
        />
        <MetricCard
          title="Inverters Online"
          value={8}
          icon={<Zap className="w-6 h-6" />}
          color="#00E676"
          trend={0}
        />
        <MetricCard
          title="Active Fault Alerts"
          value={3}
          icon={<AlertCircle className="w-6 h-6" />}
          color="#FF5252"
          alert={true}
          trend={15}
        />
        <MetricCard
          title="Energy Generated Today"
          value="8.4"
          unit="MWh"
          icon={<Sun className="w-6 h-6" />}
          color="#FFC107"
          trend={5}
        />
        <MetricCard
          title="Predicted Failures (7d)"
          value={2}
          icon={<TrendingUp className="w-6 h-6" />}
          color="#FF9800"
          alert={true}
        />
      </div>

      {/* Solar Plant Visualization */}
      <SolarPlantVisualization onInverterClick={setSelectedInverter} />

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
                  <h2 className="text-2xl font-bold">Inverter {selectedInverter.id}</h2>
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
                    <p className="text-2xl font-bold">{selectedInverter.powerOutput}%</p>
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
                      <span className="text-white">580V</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AC Output:</span>
                      <span className="text-white">415V</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Efficiency:</span>
                      <span className="text-white">97.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Grid Frequency:</span>
                      <span className="text-white">50.1Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-white">99.8%</span>
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
