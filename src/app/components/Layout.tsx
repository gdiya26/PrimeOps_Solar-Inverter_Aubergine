import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  MessageSquare,
  FileText,
  Menu,
  X,
  Zap,
  Settings as SettingsIcon,
  User,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NotificationCenter from './NotificationCenter';
import FloatingChatbot from './FloatingChatbot';
import { useBlock } from '../contexts/BlockContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inverter-health', label: 'Inverter Health', icon: Activity },
  { path: '/failure-predictions', label: 'Failure Predictions', icon: AlertTriangle },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/ai-insights', label: 'AI Insights', icon: Brain },
  { path: '/chatbot', label: 'Chatbot', icon: MessageSquare },
  { path: '/system-logs', label: 'System Logs', icon: FileText },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const { activeBlock, setActiveBlock } = useBlock();

  return (
    <div className="min-h-screen bg-[#0E1117] text-white">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-64 bg-[#1A1D29] border-r border-gray-800 z-50 overflow-y-auto"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-800">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#0E1117]" />
              </div>
              <div>
                <h1 className="text-lg font-bold">SolarAI</h1>
                <p className="text-xs text-gray-400">Predictive Monitor</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative block"
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-gradient-to-r from-[#FFC107]/20 to-[#FF9800]/10 text-[#FFC107] border border-[#FFC107]/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFC107] rounded-r-full"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* Status Indicator */}
            <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#0E1117] rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse" />
                <span className="text-xs text-gray-400">System Status</span>
              </div>
              <p className="text-sm text-white">All Systems Online</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#1A1D29]/80 backdrop-blur-lg border-b border-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Last Updated</p>
                <p className="text-sm font-medium">Just now</p>
              </div>
              <NotificationCenter />
              
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="p-2 ml-2 hover:bg-gray-800 rounded-lg transition-colors border border-gray-800 focus:outline-none focus:border-[#FFC107]"
                >
                  <User className="w-5 h-5 text-gray-300" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-48 bg-[#1A1D29] border border-gray-800 rounded-xl shadow-2xl py-2 z-50 overflow-hidden"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <div className="h-px bg-gray-800 my-1 mx-4" />
                      <Link
                        to="/login"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Block Selection Tabs */}
          {location.pathname !== '/chatbot' && (
            <div className="px-6 py-2 bg-[#0E1117] flex gap-4 overflow-x-auto no-scrollbar border-b border-gray-800">
               {['All', 'A', 'B', 'C', 'D', 'E', 'F'].map((blockName) => (
                  <button
                      key={blockName}
                      onClick={() => setActiveBlock(blockName as 'All' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F')}
                      className={`px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        activeBlock === blockName 
                          ? 'bg-[#FFC107] text-black' 
                          : 'bg-[#1A1D29] text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                  >
                      {blockName === 'All' ? 'All Blocks' : `Block ${blockName}`}
                  </button>
               ))}
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Floating Chatbot */}
      {location.pathname !== '/chatbot' && <FloatingChatbot />}
    </div>
  );
}
