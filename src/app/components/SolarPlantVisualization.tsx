import { motion } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

interface InverterNode {
  id: number | string;
  health: 'healthy' | 'warning' | 'critical';
  temperature: number;
  powerOutput: number;
  riskScore: number;
  serial_number?: string;
  block?: string;
}

export default function SolarPlantVisualization({ 
  onInverterClick,
  inverters = []
}: { 
  onInverterClick?: (inverter: InverterNode) => void;
  inverters?: InverterNode[];
}) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return '#00E676';
      case 'warning':
        return '#FFC107';
      case 'critical':
        return '#FF5252';
      default:
        return '#666';
    }
  };

  // Group inverters by block
  const blockGroups: Record<string, InverterNode[]> = {};
  inverters.forEach(inv => {
    const block = (inv as any).block || '?';
    if (!blockGroups[block]) blockGroups[block] = [];
    blockGroups[block].push(inv);
  });

  const blockOrder = ['A', 'B', 'C', 'E', 'F'];
  const sortedBlocks = Object.keys(blockGroups).sort((a, b) => {
    const ai = blockOrder.indexOf(a);
    const bi = blockOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // Check if we're viewing a single block or all blocks
  const isSingleBlock = sortedBlocks.length <= 1;

  return (
    <div className="bg-[#1A1D29] rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Live Solar Plant Overview</h2>
        <span className="text-sm text-gray-400">{inverters.length} inverters</span>
      </div>

      <div className="relative">
        {/* Flow diagram */}
        <div className="flex items-center justify-between">
          {/* Solar Panels */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FFC107] to-[#FF9800] rounded-lg flex items-center justify-center mb-2">
              <svg className="w-12 h-12 text-[#0E1117]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.18l6 3v9.64l-6 3-6-3V7.18l6-3z"/>
              </svg>
            </div>
            <p className="text-xs text-gray-400 font-medium">Solar Panels</p>
            <p className="text-sm text-[#00E676]">Active</p>
          </div>

          {/* Arrow */}
          <div className="flex-1 h-0.5 bg-gradient-to-r from-[#FFC107] to-transparent mx-4" />

          {/* Inverters — grouped by block */}
          <TooltipProvider>
            <div className="flex-[3]">
              {sortedBlocks.map((block) => (
                <div key={block} className="mb-4 last:mb-0">
                  {!isSingleBlock && (
                    <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">
                      Block {block} <span className="text-gray-600">({blockGroups[block].length} inv)</span>
                    </p>
                  )}
                  <div className={`grid gap-3 ${blockGroups[block].length > 8 ? 'grid-cols-6' : blockGroups[block].length > 4 ? 'grid-cols-4' : 'grid-cols-4'}`}>
                    {blockGroups[block].map((inverter, idx) => (
                      <Tooltip key={inverter.id}>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onInverterClick?.(inverter)}
                            className="relative w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer"
                            style={{
                              backgroundColor: `${getHealthColor(inverter.health)}20`,
                              border: `2px solid ${getHealthColor(inverter.health)}`,
                            }}
                          >
                            {/* Pulse animation for critical */}
                            {inverter.health === 'critical' && (
                              <motion.div
                                className="absolute inset-0 rounded-lg"
                                style={{
                                  border: `2px solid ${getHealthColor(inverter.health)}`,
                                }}
                                animate={{
                                  scale: [1, 1.3, 1],
                                  opacity: [0.8, 0, 0.8],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                }}
                              />
                            )}

                            <span className="text-xs font-bold" style={{ color: getHealthColor(inverter.health) }}>
                              {idx + 1}
                            </span>
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent
                          className="bg-[#0E1117] border border-gray-800 rounded-lg p-3 shadow-xl z-50"
                          sideOffset={5}
                        >
                          <div className="text-xs space-y-1">
                            <p className="font-bold text-white">{inverter.serial_number || `Inverter ${inverter.id}`}</p>
                            <p className="text-gray-400">Temperature: {inverter.temperature}°C</p>
                            <p className="text-gray-400">Power: {inverter.powerOutput} kW</p>
                            <p className="text-gray-400">Risk: {inverter.riskScore}%</p>
                            <p className="font-medium" style={{ color: getHealthColor(inverter.health) }}>
                              {inverter.health.toUpperCase()}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TooltipProvider>

          {/* Arrow */}
          <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent to-[#1E88E5] mx-4" />

          {/* Grid */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] rounded-lg flex items-center justify-center mb-2">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 font-medium">Power Grid</p>
            <p className="text-sm text-[#00E676]">Connected</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00E676]" />
            <span className="text-xs text-gray-400">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFC107]" />
            <span className="text-xs text-gray-400">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5252]" />
            <span className="text-xs text-gray-400">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
