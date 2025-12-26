import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WORLD_REGIONS, Region } from '../../lib/avva_noon/assets/map_regions';

const InteractiveWorldMap: React.FC = () => {
  const [viewStack, setViewStack] = useState<Region[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const currentRegion = viewStack.length > 0 ? viewStack[viewStack.length - 1] : null;
  const regionsDisplay = currentRegion ? currentRegion.subRegions || [] : WORLD_REGIONS;

  const handleRegionClick = (region: Region) => {
    if (region.subRegions && region.subRegions.length > 0) {
      setViewStack([...viewStack, region]);
    } else {
      // Leaf node - trigger action (e.g., open onboarding for this location)
      console.log(`Selected location: ${region.name}`);
      // TODO: Trigger onboarding modal
    }
  };

  const handleBack = () => {
    setViewStack(viewStack.slice(0, -1));
  };

  return (
    <div className="w-full h-[600px] bg-carbon-900 rounded-2xl border border-carbon-700 overflow-hidden relative flex flex-col">
      
      {/* Header / Breadcrumbs */}
      <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Global Talent Map</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <button 
              onClick={() => setViewStack([])}
              className="hover:text-locale-blue transition-colors"
            >
              World
            </button>
            {viewStack.map((region, idx) => (
              <React.Fragment key={region.id}>
                <span>/</span>
                <button 
                  onClick={() => setViewStack(viewStack.slice(0, idx + 1))}
                  className="hover:text-locale-blue transition-colors"
                >
                  {region.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {viewStack.length > 0 && (
          <button 
            onClick={handleBack}
            className="pointer-events-auto px-4 py-2 bg-carbon-800 hover:bg-carbon-700 text-white rounded-lg border border-carbon-700 transition-all"
          >
            Zoom Out
          </button>
        )}
      </div>

      {/* Map Visualization Area */}
      <div className="flex-1 relative flex items-center justify-center bg-[#0a0a0a]">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentRegion ? currentRegion.id : 'world'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* This would be the actual SVG map */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-12 max-w-4xl w-full">
              {regionsDisplay.map((region) => (
                <motion.div
                  key={region.id}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRegionClick(region)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className={`
                    aspect-square rounded-xl border-2 cursor-pointer relative overflow-hidden group
                    ${hoveredRegion === region.id ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'border-transparent'}
                  `}
                  style={{ 
                    backgroundColor: region.color + '20', // 20% opacity
                    borderColor: region.color
                  }}
                >
                  {/* Jigsaw Connector Visuals (Conceptual) */}
                  <div className="absolute -right-2 top-1/2 w-4 h-4 rounded-full bg-carbon-900 border border-carbon-700 transform -translate-y-1/2 z-10" />
                  <div className="absolute -left-2 top-1/2 w-4 h-4 rounded-full bg-current transform -translate-y-1/2" style={{ color: region.color + '20' }} />
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-4xl mb-2 opacity-80">{getRegionIcon(region.name)}</span>
                    <h3 className="text-xl font-bold text-white">{region.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {region.subRegions ? `${region.subRegions.length} Regions` : 'Explore Talent'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend / Stats */}
      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
        <div className="bg-carbon-800/90 backdrop-blur p-4 rounded-xl border border-carbon-700 pointer-events-auto">
          <div className="text-xs text-gray-500 uppercase mb-1">Active Users</div>
          <div className="text-2xl font-mono text-white">24,592</div>
        </div>
        
        <div className="bg-carbon-800/90 backdrop-blur p-4 rounded-xl border border-carbon-700 pointer-events-auto max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 animate-pulse" />
            <div>
              <p className="text-sm text-gray-300">
                <span className="text-white font-bold">Live Activity:</span> New "Video Editor" request in Palm Beach, FL.
              </p>
              <p className="text-xs text-gray-500 mt-1">Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for icons
function getRegionIcon(name: string): string {
  if (name.includes('America')) return '🌎';
  if (name.includes('Europe')) return '🌍';
  if (name.includes('Asia')) return '🌏';
  if (name.includes('United States')) return '🇺🇸';
  if (name.includes('Florida')) return '🐊';
  if (name.includes('Palm Beach')) return '🌴';
  return '📍';
}

export default InteractiveWorldMap;
