import { motion } from 'motion/react';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface Prediction {
  inverterId: string;
  riskLevel: 'low' | 'medium' | 'high';
  probability: number;
  predictionWindow: string;
  topFactors: string[];
}

const mockPredictions: Prediction[] = [
  {
    inverterId: 'INV-004',
    riskLevel: 'high',
    probability: 82,
    predictionWindow: 'Possible shutdown within 7 days',
    topFactors: ['High temperature (67°C)', 'Unstable PV voltage', 'Efficiency drop'],
  },
  {
    inverterId: 'INV-002',
    riskLevel: 'medium',
    probability: 58,
    predictionWindow: 'Monitor for next 14 days',
    topFactors: ['Elevated temperature (62°C)', 'Slight voltage fluctuation'],
  },
  {
    inverterId: 'INV-007',
    riskLevel: 'medium',
    probability: 45,
    predictionWindow: 'Low risk in short term',
    topFactors: ['Temperature trending up', 'Normal voltage patterns'],
  },
];

export default function AIFailurePrediction() {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return '#FF5252';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#00E676';
      default:
        return '#666';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return 'Critical Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
        return 'Healthy';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">AI Failure Predictions</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>Predictive Model v2.1</span>
        </div>
      </div>

      <div className="space-y-4">
        {mockPredictions.map((prediction, index) => (
          <motion.div
            key={prediction.inverterId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#0E1117] rounded-lg p-5 border-l-4"
            style={{ borderLeftColor: getRiskColor(prediction.riskLevel) }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold mb-1">{prediction.inverterId}</h3>
                <p className="text-sm text-gray-400">{prediction.predictionWindow}</p>
              </div>
              <div className="flex items-center gap-3">
                {prediction.riskLevel === 'high' && (
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <AlertTriangle className="w-5 h-5 text-[#FF5252]" />
                  </motion.div>
                )}
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${getRiskColor(prediction.riskLevel)}20`,
                    color: getRiskColor(prediction.riskLevel),
                  }}
                >
                  {getRiskBadge(prediction.riskLevel)}
                </span>
              </div>
            </div>

            {/* Probability Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Failure Probability</span>
                <span className="text-lg font-bold" style={{ color: getRiskColor(prediction.riskLevel) }}>
                  {prediction.probability}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#1A1D29] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.probability}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: getRiskColor(prediction.riskLevel),
                  }}
                />
              </div>
            </div>

            {/* Top Contributing Factors */}
            <div>
              <p className="text-xs text-gray-400 mb-2">Top Contributing Factors:</p>
              <div className="space-y-1">
                {prediction.topFactors.map((factor, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + idx * 0.05 }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getRiskColor(prediction.riskLevel) }}
                    />
                    <span className="text-gray-300">{factor}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
