import { motion } from 'motion/react';
import AIFailurePrediction from '../AIFailurePrediction';
import AIPredictiveTimeline from '../AIPredictiveTimeline';

export default function FailurePredictions() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Failure Predictions</h1>
        <p className="text-gray-400">AI-powered predictive maintenance insights</p>
      </motion.div>

      {/* Predictive Timeline */}
      <AIPredictiveTimeline />

      {/* Failure Predictions */}
      <AIFailurePrediction />

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1E88E5]/10 to-transparent border-l-4 border-[#1E88E5] rounded-lg p-6"
      >
        <h3 className="text-lg font-bold mb-3">About the Prediction Model</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            Our AI model uses machine learning algorithms trained on historical inverter data to predict potential failures
            before they occur.
          </p>
          <p>
            <span className="font-semibold text-white">Model Accuracy:</span> 94.7% based on last 6 months of validation
          </p>
          <p>
            <span className="font-semibold text-white">Key Factors Analyzed:</span> Temperature trends, voltage stability,
            power output patterns, efficiency metrics, and operational age
          </p>
        </div>
      </motion.div>
    </div>
  );
}
