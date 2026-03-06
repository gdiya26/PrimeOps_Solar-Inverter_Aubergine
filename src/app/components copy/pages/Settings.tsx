import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Mail, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(false);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [muteDuration, setMuteDuration] = useState('0');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Alert Settings
        </h1>
        <p className="text-sm text-gray-400">Configure your email notifications and alert preferences</p>
      </header>

      <div className="bg-[#1A1D29] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-800">
          <div className="p-2 bg-[#FFC107]/10 rounded-lg">
            <Bell className="w-5 h-5 text-[#FFC107]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Email Notifications</h2>
        </div>

        <div className="space-y-6">
          {/* Critical Alerts */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-1.5 bg-red-500/10 rounded-md">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Critical Fault Alerts</h3>
                <p className="text-sm text-gray-400 max-w-md">
                  Receive immediate email notifications when an inverter goes offline or a critical failure is predicted.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={criticalAlerts}
                onChange={() => setCriticalAlerts(!criticalAlerts)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E676]"></div>
            </label>
          </div>

          <div className="h-px bg-gray-800" />

          {/* Maintenance Alerts */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-1.5 bg-[#FF9800]/10 rounded-md">
                <ShieldCheck className="w-4 h-4 text-[#FF9800]" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Upcoming Maintenance</h3>
                <p className="text-sm text-gray-400 max-w-md">
                  Get notified 48 hours before scheduled maintenance or routine checkups are required.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={maintenanceAlerts}
                onChange={() => setMaintenanceAlerts(!maintenanceAlerts)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E676]"></div>
            </label>
          </div>

          <div className="h-px bg-gray-800" />

          {/* Daily Digest */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-1.5 bg-blue-500/10 rounded-md">
                <Mail className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">Daily Performance Digest</h3>
                <p className="text-sm text-gray-400 max-w-md">
                  A daily summary email of total power generated, efficiency metrics, and overall plant health.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={dailyDigest}
                onChange={() => setDailyDigest(!dailyDigest)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E676]"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1D29] border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-lg font-semibold text-white">Quiet Hours & Muting</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h3 className="font-medium text-white mb-1">Temporary Mute</h3>
            <p className="text-sm text-gray-400">Suspend non-critical notifications for a set duration.</p>
          </div>
          <select
            value={muteDuration}
            onChange={(e) => setMuteDuration(e.target.value)}
            className="bg-[#0E1117] border border-gray-800 text-white text-sm rounded-lg focus:ring-[#FFC107] focus:border-[#FFC107] block p-2.5 min-w-[160px]"
          >
            <option value="0">Do not mute</option>
            <option value="1">1 Hour</option>
            <option value="4">4 Hours</option>
            <option value="8">8 Hours</option>
            <option value="24">24 Hours</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="bg-gradient-to-r from-[#FFC107] to-[#FF9800] text-[#0E1117] font-semibold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
