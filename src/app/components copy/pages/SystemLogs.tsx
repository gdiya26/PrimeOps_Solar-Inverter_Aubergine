import { motion } from 'motion/react';
import { FileText, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
}

const logs: LogEntry[] = [
  {
    id: 1,
    timestamp: '2026-03-06 14:35:22',
    type: 'error',
    source: 'INV-004',
    message: 'Critical temperature threshold exceeded (67°C)',
  },
  {
    id: 2,
    timestamp: '2026-03-06 14:20:15',
    type: 'warning',
    source: 'INV-002',
    message: 'Voltage fluctuation detected - monitoring increased',
  },
  {
    id: 3,
    timestamp: '2026-03-06 14:05:08',
    type: 'info',
    source: 'System',
    message: 'Hourly data sync completed successfully',
  },
  {
    id: 4,
    timestamp: '2026-03-06 13:45:33',
    type: 'warning',
    source: 'INV-007',
    message: 'Temperature trending upward - 59°C',
  },
  {
    id: 5,
    timestamp: '2026-03-06 13:30:11',
    type: 'success',
    source: 'INV-006',
    message: 'Performance optimization complete - efficiency at 98.2%',
  },
  {
    id: 6,
    timestamp: '2026-03-06 13:15:44',
    type: 'info',
    source: 'AI Model',
    message: 'Predictive analysis completed for all inverters',
  },
  {
    id: 7,
    timestamp: '2026-03-06 13:00:00',
    type: 'info',
    source: 'System',
    message: 'Daily report generated and sent to operators',
  },
  {
    id: 8,
    timestamp: '2026-03-06 12:45:27',
    type: 'success',
    source: 'INV-003',
    message: 'Maintenance completed - all systems nominal',
  },
  {
    id: 9,
    timestamp: '2026-03-06 12:30:19',
    type: 'error',
    source: 'INV-004',
    message: 'PV voltage instability detected - 8% variance',
  },
  {
    id: 10,
    timestamp: '2026-03-06 12:15:55',
    type: 'info',
    source: 'Grid',
    message: 'Grid connection stable - 50.1Hz',
  },
];

export default function SystemLogs() {
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'error':
        return '#FF5252';
      case 'warning':
        return '#FFC107';
      case 'success':
        return '#00E676';
      default:
        return '#1E88E5';
    }
  };

  const getLogBg = (type: string) => {
    switch (type) {
      case 'error':
        return 'from-[#FF5252]/10 to-transparent';
      case 'warning':
        return 'from-[#FFC107]/10 to-transparent';
      case 'success':
        return 'from-[#00E676]/10 to-transparent';
      default:
        return 'from-[#1E88E5]/10 to-transparent';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">System Logs</h1>
        <p className="text-gray-400">Real-time system events and operational logs</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1D29] rounded-xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF5252]/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-[#FF5252]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Errors</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1A1D29] rounded-xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFC107]/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#FFC107]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Warnings</p>
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00E676]/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#00E676]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Success</p>
              <p className="text-2xl font-bold">2</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1A1D29] rounded-xl p-5 border border-gray-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E88E5]/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#1E88E5]" />
            </div>
            <div>
              <p className="text-gray-400 text-xs">Total Logs</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1D29] rounded-xl border border-gray-800 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0E1117] border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Message
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-gray-800/50 hover:bg-gradient-to-r ${getLogBg(log.type)} transition-all`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: `${getLogColor(log.type)}20`,
                        color: getLogColor(log.type),
                      }}
                    >
                      {getLogIcon(log.type)}
                      {log.type.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {log.source}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {log.message}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Export Options */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 bg-[#1A1D29] border border-gray-800 hover:border-[#FFC107] rounded-lg text-sm transition-colors">
          Export as CSV
        </button>
        <button className="px-4 py-2 bg-gradient-to-r from-[#FFC107] to-[#FF9800] rounded-lg text-sm font-medium text-[#0E1117] hover:shadow-lg hover:shadow-[#FFC107]/20 transition-all">
          Download Full Log
        </button>
      </div>
    </div>
  );
}
