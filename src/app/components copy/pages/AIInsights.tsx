import { motion } from 'motion/react';
import AIDiagnosticInsights from '../AIDiagnosticInsights';
import { Brain, Lightbulb, Cpu } from 'lucide-react';

export default function AIInsights() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">AI Insights</h1>
        <p className="text-gray-400">Deep learning analysis and explainable AI diagnostics</p>
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
              <h3 className="font-bold">ML Model</h3>
              <p className="text-xs text-gray-400">Random Forest</p>
            </div>
          </div>
          <p className="text-sm text-gray-300">Trained on 2+ years of operational data from 1,200+ inverters</p>
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
              <h3 className="font-bold">Accuracy</h3>
              <p className="text-xs text-gray-400">94.7%</p>
            </div>
          </div>
          <p className="text-sm text-gray-300">Validated against 6 months of real-world failure events</p>
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
              <h3 className="font-bold">Explainability</h3>
              <p className="text-xs text-gray-400">SHAP Values</p>
            </div>
          </div>
          <p className="text-sm text-gray-300">Transparent AI with interpretable feature importance</p>
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
        <h2 className="text-xl font-bold mb-6">Global Feature Importance</h2>
        <div className="space-y-4">
          {[
            { feature: 'Temperature Trends', importance: 35, color: '#FF5252' },
            { feature: 'PV Voltage Stability', importance: 28, color: '#FFC107' },
            { feature: 'Efficiency Degradation', importance: 18, color: '#1E88E5' },
            { feature: 'Power Output Variance', importance: 12, color: '#00E676' },
            { feature: 'Operational Age', importance: 7, color: '#9C27B0' },
          ].map((item, index) => (
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
      </motion.div>

      {/* AI Training Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1E88E5]/10 to-transparent border-l-4 border-[#1E88E5] rounded-lg p-6"
      >
        <h3 className="text-lg font-bold mb-3">Model Training Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Training Dataset Size</p>
            <p className="font-semibold text-white">2.4M data points</p>
          </div>
          <div>
            <p className="text-gray-400">Last Updated</p>
            <p className="font-semibold text-white">March 1, 2026</p>
          </div>
          <div>
            <p className="text-gray-400">Features Used</p>
            <p className="font-semibold text-white">24 parameters</p>
          </div>
          <div>
            <p className="text-gray-400">Update Frequency</p>
            <p className="font-semibold text-white">Weekly retraining</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
