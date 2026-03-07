import { motion } from 'motion/react';
import { Clock } from 'lucide-react';

interface TimelineEvent {
  day: number;
  inverterId: string;
  event: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const timelineEvents: TimelineEvent[] = [
  { day: 2, inverterId: 'INV-3', event: 'Efficiency degradation', riskLevel: 'medium' },
  { day: 4, inverterId: 'INV-1', event: 'String 1 anomaly detected', riskLevel: 'high' },
  { day: 5, inverterId: 'INV-1', event: 'Predicted power drop', riskLevel: 'high' },
  { day: 8, inverterId: 'INV-3', event: 'Monitor temperature', riskLevel: 'medium' },
];

export default function AIPredictiveTimeline() {
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

  return (
    <div className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-5 h-5 text-[#FFC107]" />
        <h2 className="text-xl font-bold">AI Predictive Timeline</h2>
        <span className="text-sm text-gray-400">(Next 10 Days)</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Bar */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-[#0E1117]" />

        {/* Days */}
        <div className="relative flex justify-between items-start">
          {[...Array(11)].map((_, index) => {
            const dayEvents = timelineEvents.filter((e) => e.day === index);
            const hasEvent = dayEvents.length > 0;

            return (
              <div key={index} className="flex flex-col items-center relative" style={{ flex: 1 }}>
                {/* Day marker */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-3 h-3 rounded-full z-10 mb-2 ${
                    hasEvent ? '' : 'bg-gray-700'
                  }`}
                  style={{
                    backgroundColor: hasEvent ? getRiskColor(dayEvents[0].riskLevel) : undefined,
                    boxShadow: hasEvent
                      ? `0 0 20px ${getRiskColor(dayEvents[0].riskLevel)}`
                      : undefined,
                  }}
                >
                  {/* Pulse animation for events */}
                  {hasEvent && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: `2px solid ${getRiskColor(dayEvents[0].riskLevel)}`,
                      }}
                      animate={{
                        scale: [1, 2, 1],
                        opacity: [0.8, 0, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </motion.div>

                {/* Day label */}
                <span className="text-xs text-gray-500 font-medium">
                  {index === 0 ? 'Today' : `Day ${index}`}
                </span>

                {/* Event details */}
                {hasEvent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="absolute top-16 mt-2 w-32"
                  >
                    <div
                      className="rounded-lg p-3 border-2 text-center"
                      style={{
                        backgroundColor: `${getRiskColor(dayEvents[0].riskLevel)}10`,
                        borderColor: getRiskColor(dayEvents[0].riskLevel),
                      }}
                    >
                      <p
                        className="text-xs font-bold mb-1"
                        style={{ color: getRiskColor(dayEvents[0].riskLevel) }}
                      >
                        {dayEvents[0].inverterId}
                      </p>
                      <p className="text-xs text-gray-300">{dayEvents[0].event}</p>
                    </div>
                    {/* Arrow */}
                    <div
                      className="w-0 h-0 mx-auto -mt-2"
                      style={{
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: `8px solid ${getRiskColor(dayEvents[0].riskLevel)}`,
                      }}
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-32 pt-6 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5252]" />
          <span className="text-xs text-gray-400">Critical Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FFC107]" />
          <span className="text-xs text-gray-400">Warning Event</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-700" />
          <span className="text-xs text-gray-400">No Events</span>
        </div>
      </div>
    </div>
  );
}
