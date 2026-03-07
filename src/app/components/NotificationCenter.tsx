import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';

interface Notification {
  id: number | string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  message: string;
  timestamp: string;
  inverterId?: string;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/alerts?block=All');
        const data = await res.json();
        if (data.status === 'success' && data.data.length > 0) {
          const mapped = data.data.slice(0, 10).map((alert: any) => ({
            id: alert.id,
            type: alert.severity === 'high' ? 'critical' : (alert.severity === 'medium' ? 'warning' : 'info'),
            title: alert.type || 'System Alert',
            message: alert.message || 'An alert was triggered.',
            timestamp: alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Just now',
            inverterId: alert.inverter_id?.substring(0, 8) || undefined,
          }));
          setNotifications(mapped);
        } else {
          // Fallback: fetch telemetry-derived alerts
          const telRes = await fetch('http://localhost:5000/api/alerts/telemetry?block=All');
          const telData = await telRes.json();
          if (telData.status === 'success' && telData.data.length > 0) {
            const mapped = telData.data.slice(0, 10).map((alert: any) => ({
              id: alert.id,
              type: alert.severity === 'high' ? 'critical' : (alert.severity === 'medium' ? 'warning' : 'info'),
              title: alert.type || 'Telemetry Alert',
              message: alert.message,
              timestamp: alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Just now',
              inverterId: alert.inverter_id || undefined,
            }));
            setNotifications(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical':
        return '#FF5252';
      case 'warning':
        return '#FFC107';
      default:
        return '#1E88E5';
    }
  };

  const removeNotification = (id: number | string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF5252] rounded-full flex items-center justify-center text-xs font-bold"
          >
            {notifications.length}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: 10 }}
              className="absolute right-0 top-12 w-96 bg-[#1A1D29] border border-gray-800 rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-bold">Notifications</h3>
                <p className="text-sm text-gray-400">{notifications.length} active alerts</p>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No notifications
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="relative bg-[#0E1117] rounded-lg p-4 border-l-4"
                        style={{ borderLeftColor: getTypeColor(notification.type) }}
                      >
                        {/* Pulse effect for critical */}
                        {notification.type === 'critical' && (
                          <motion.div
                            className="absolute inset-0 rounded-lg"
                            style={{ 
                              border: `2px solid ${getTypeColor(notification.type)}`,
                            }}
                            animate={{
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        )}

                        <div className="relative">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">{notification.title}</h4>
                              {notification.inverterId && (
                                <span className="text-xs text-gray-500">{notification.inverterId}</span>
                              )}
                            </div>
                            <button
                              onClick={() => removeNotification(notification.id)}
                              className="p-1 hover:bg-gray-800 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{notification.message}</p>
                          <span className="text-xs text-gray-600">{notification.timestamp}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-800">
                  <button
                    onClick={() => setNotifications([])}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
