import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useBlock } from '../../contexts/BlockContext';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  source: string;
  message: string;
}

export default function SystemLogs() {
  const { activeBlock } = useBlock();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({ errors: 0, warnings: 0, success: 0, total: 0 });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Fetch live telemetry data and generate log entries from it
        const res = await fetch(`http://localhost:5000/api/stats/inverter-telemetry?block=${activeBlock}`);
        const data = await res.json();

        if (data.status === 'success' && data.data.length > 0) {
          const generatedLogs: LogEntry[] = [];
          let errorCount = 0, warningCount = 0, successCount = 0;

          data.data.forEach((inv: any, idx: number) => {
            const invName = `INV-${idx + 1}`;
            const now = new Date().toISOString();

            if (inv.temperature > 85) {
              generatedLogs.push({
                id: `err-temp-${idx}`,
                timestamp: now,
                type: 'error',
                source: invName,
                message: `Critical temperature threshold exceeded (${inv.temperature}°C)`
              });
              errorCount++;
            } else if (inv.temperature > 75) {
              generatedLogs.push({
                id: `warn-temp-${idx}`,
                timestamp: now,
                type: 'warning',
                source: invName,
                message: `Temperature trending upward — ${inv.temperature}°C`
              });
              warningCount++;
            }

            if (inv.powerOutput === 0) {
              generatedLogs.push({
                id: `err-power-${idx}`,
                timestamp: now,
                type: 'error',
                source: invName,
                message: `Zero power output detected — inverter may be offline`
              });
              errorCount++;
            } else if (inv.powerOutput < 10) {
              generatedLogs.push({
                id: `warn-power-${idx}`,
                timestamp: now,
                type: 'warning',
                source: invName,
                message: `Low power output: ${inv.powerOutput} kW`
              });
              warningCount++;
            }

            if (inv.health === 'healthy' && inv.powerOutput > 0) {
              generatedLogs.push({
                id: `ok-${idx}`,
                timestamp: now,
                type: 'success',
                source: invName,
                message: `Operating normally — ${inv.powerOutput} kW at ${inv.temperature}°C, efficiency ${inv.efficiency}%`
              });
              successCount++;
            }

            if (inv.voltage > 0 && inv.voltage < 200) {
              generatedLogs.push({
                id: `warn-volt-${idx}`,
                timestamp: now,
                type: 'warning',
                source: invName,
                message: `Low PV voltage detected: ${inv.voltage}V`
              });
              warningCount++;
            }
          });

          // Sort: errors first, then warnings, then others
          const typeOrder = { error: 0, warning: 1, info: 2, success: 3 };
          generatedLogs.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

          setLogs(generatedLogs);
          setStats({
            errors: errorCount,
            warnings: warningCount,
            success: successCount,
            total: generatedLogs.length
          });
        } else {
          setLogs([]);
          setStats({ errors: 0, warnings: 0, success: 0, total: 0 });
        }
      } catch (err) {
        console.error('Failed to fetch system logs:', err);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [activeBlock]);

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
        <p className="text-gray-400">
          Live telemetry events for {activeBlock === 'All' ? 'All Blocks' : `Block ${activeBlock}`}
        </p>
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
              <p className="text-2xl font-bold">{stats.errors}</p>
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
              <p className="text-2xl font-bold">{stats.warnings}</p>
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
              <p className="text-gray-400 text-xs">Healthy</p>
              <p className="text-2xl font-bold">{stats.success}</p>
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
              <p className="text-gray-400 text-xs">Total Events</p>
              <p className="text-2xl font-bold">{stats.total}</p>
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
        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No telemetry events detected</p>
            <p className="text-sm mt-1">All inverters are operating within normal parameters.</p>
          </div>
        ) : (
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
                  transition={{ delay: index * 0.03 }}
                  className={`border-b border-gray-800/50 hover:bg-gradient-to-r ${getLogBg(log.type)} transition-all`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
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
        )}
      </motion.div>
    </div>
  );
}
