import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  icon: React.ReactNode;
  color?: string;
  alert?: boolean;
}

export default function MetricCard({ 
  title, 
  value, 
  unit = '', 
  trend, 
  icon, 
  color = '#FFC107',
  alert = false 
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 1500;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative bg-[#1A1D29] rounded-xl p-6 border ${
        alert 
          ? 'border-[#FF5252] shadow-[0_0_20px_rgba(255,82,82,0.3)]' 
          : 'border-gray-800'
      } overflow-hidden`}
    >
      {/* Background glow */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: color }}
      />

      <div className="relative">
        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>

        {/* Title */}
        <p className="text-gray-400 text-sm mb-2">{title}</p>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-2">
          <motion.span 
            className="text-3xl font-bold"
            key={typeof value === 'number' ? displayValue : value}
          >
            {typeof value === 'number' ? displayValue : value}
          </motion.span>
          {unit && <span className="text-gray-500 text-lg">{unit}</span>}
        </div>

        {/* Trend */}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            trend > 0 ? 'text-[#00E676]' : trend < 0 ? 'text-[#FF5252]' : 'text-gray-500'
          }`}>
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend < 0 ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}

        {/* Pulse animation for alerts */}
        {alert && (
          <motion.div
            className="absolute top-4 right-4 w-3 h-3 bg-[#FF5252] rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
