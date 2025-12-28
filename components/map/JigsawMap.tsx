import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Lock, User, Globe } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { springTransition, popHover } from '@/src/lib/animations';

// Types
interface Region {
  id: string;
  name: string;
  status: 'available' | 'claimed' | 'locked';
  owner?: string;
  price?: number;
  coordinates: { x: number; y: number }; // Grid coordinates
}

// Mock Data
const MOCK_REGIONS: Region[] = [
  { id: 'r1', name: 'Austin, TX', status: 'available', price: 5000, coordinates: { x: 1, y: 1 } },
  { id: 'r2', name: 'San Francisco, CA', status: 'claimed', owner: 'TechGiant', coordinates: { x: 0, y: 1 } },
  { id: 'r3', name: 'New York, NY', status: 'available', price: 8000, coordinates: { x: 2, y: 1 } },
  { id: 'r4', name: 'London, UK', status: 'locked', coordinates: { x: 3, y: 1 } },
  { id: 'r5', name: 'Tokyo, JP', status: 'available', price: 6000, coordinates: { x: 4, y: 2 } },
];

// Puzzle Piece Generator
const TILE_SIZE = 100;

const getPiecePath = (top: number, right: number, bottom: number, left: number) => {
  // 0: flat, 1: out, -1: in
  // Basic square path: M 0 0 L 100 0 L 100 100 L 0 100 Z
  
  let path = `M 0 0`;
  
  // Top
  if (top === 0) path += ` L ${TILE_SIZE} 0`;
  else {
    path += ` L ${TILE_SIZE * 0.4} 0`;
    path += ` C ${TILE_SIZE * 0.4} ${top * TILE_SIZE * -0.2}, ${TILE_SIZE * 0.6} ${top * TILE_SIZE * -0.2}, ${TILE_SIZE * 0.6} 0`;
    path += ` L ${TILE_SIZE} 0`;
  }

  // Right
  if (right === 0) path += ` L ${TILE_SIZE} ${TILE_SIZE}`;
  else {
    path += ` L ${TILE_SIZE} ${TILE_SIZE * 0.4}`;
    path += ` C ${TILE_SIZE + right * TILE_SIZE * 0.2} ${TILE_SIZE * 0.4}, ${TILE_SIZE + right * TILE_SIZE * 0.2} ${TILE_SIZE * 0.6}, ${TILE_SIZE} ${TILE_SIZE * 0.6}`;
    path += ` L ${TILE_SIZE} ${TILE_SIZE}`;
  }

  // Bottom
  if (bottom === 0) path += ` L 0 ${TILE_SIZE}`;
  else {
    path += ` L ${TILE_SIZE * 0.6} ${TILE_SIZE}`;
    path += ` C ${TILE_SIZE * 0.6} ${TILE_SIZE + bottom * TILE_SIZE * 0.2}, ${TILE_SIZE * 0.4} ${TILE_SIZE + bottom * TILE_SIZE * 0.2}, ${TILE_SIZE * 0.4} ${TILE_SIZE}`;
    path += ` L 0 ${TILE_SIZE}`;
  }

  // Left
  if (left === 0) path += ` L 0 0`;
  else {
    path += ` L 0 ${TILE_SIZE * 0.6}`;
    path += ` C ${left * TILE_SIZE * -0.2} ${TILE_SIZE * 0.6}, ${left * TILE_SIZE * -0.2} ${TILE_SIZE * 0.4}, 0 ${TILE_SIZE * 0.4}`;
    path += ` L 0 0`;
  }

  return path;
};

export const JigsawMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Generate a 5x3 grid
  const rows = 3;
  const cols = 5;
  const grid = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Determine tabs (randomly or deterministically for visual consistency)
      // For a perfect grid, internal edges must match (right of (x,y) must match left of (x+1,y))
      // We'll use a pseudo-random function based on coords to decide tab direction
      const seed = (x * 13 + y * 7);
      
      // Edges are flat (0)
      const top = y === 0 ? 0 : ((seed + 1) % 2 === 0 ? 1 : -1);
      const bottom = y === rows - 1 ? 0 : ((seed + 2) % 2 === 0 ? 1 : -1); // This needs to match the cell below's top
      const left = x === 0 ? 0 : ((seed + 3) % 2 === 0 ? 1 : -1);
      const right = x === cols - 1 ? 0 : ((seed + 4) % 2 === 0 ? 1 : -1); // This needs to match cell to right's left

      // Actually, to ensure they fit, we define vertical and horizontal edges first
      // But for this visual demo, let's just make them look "jigsaw-y" and overlap slightly or just use a simpler logic
      // Let's just use a fixed pattern for now to ensure fit
      
      // Simplified: All internal vertical edges: Left gets Out(1), Right gets In(-1)
      // All internal horizontal edges: Top gets Out(1), Bottom gets In(-1)
      // This is a boring puzzle (all same pieces), but it fits.
      // Let's alternate.
      
      const pieceTop = y === 0 ? 0 : ( (x+y)%2===0 ? 1 : -1 );
      const pieceBottom = y === rows - 1 ? 0 : ( (x+y+1)%2===0 ? -1 : 1 ); // Inverse of next row's top
      const pieceLeft = x === 0 ? 0 : ( (x+y)%2===0 ? 1 : -1 );
      const pieceRight = x === cols - 1 ? 0 : ( (x+y+1)%2===0 ? -1 : 1 ); // Inverse of next col's left

      const region = MOCK_REGIONS.find(r => r.coordinates.x === x && r.coordinates.y === y);

      grid.push({
        x, y,
        top: pieceTop,
        right: pieceRight,
        bottom: pieceBottom,
        left: pieceLeft,
        region
      });
    }
  }

  return (
    <div className="w-full h-full min-h-150 bg-slate-900 relative overflow-hidden p-8 flex flex-col items-center justify-center">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="mb-8 text-center z-10">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Globe className="w-8 h-8 text-blue-400" />
          Global Territory Map
        </h2>
        <p className="text-slate-400">Select a region to claim your digital territory.</p>
      </div>

      <div className="relative w-125 h-75">
        {grid.map((cell, i) => (
          <motion.div
            key={`${cell.x}-${cell.y}`}
            className="absolute"
            style={{
              left: cell.x * TILE_SIZE,
              top: cell.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              zIndex: hoveredRegion === cell.region?.id ? 10 : 1
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...springTransition, delay: i * 0.05 }}
          >
            <svg
              width={TILE_SIZE}
              height={TILE_SIZE}
              viewBox={`0 0 ${TILE_SIZE} ${TILE_SIZE}`}
              className="overflow-visible drop-shadow-lg"
            >
              <motion.path
                d={getPiecePath(cell.top, cell.right, cell.bottom, cell.left)}
                fill={
                  cell.region
                    ? cell.region.status === 'claimed'
                      ? '#3b82f6' // Blue for claimed
                      : cell.region.status === 'locked'
                      ? '#334155' // Slate for locked
                      : '#10b981' // Emerald for available
                    : '#1e293b' // Slate-800 for empty
                }
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                variants={popHover}
                whileHover="hover"
                whileTap="tap"
                onClick={() => cell.region && setSelectedRegion(cell.region)}
                onMouseEnter={() => cell.region && setHoveredRegion(cell.region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                className="cursor-pointer transition-colors duration-300"
                style={{
                  filter: cell.region?.status === 'available' ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' : 'none'
                }}
              />
              
              {cell.region && (
                <g className="pointer-events-none">
                  <foreignObject x="10" y="10" width="80" height="80">
                    <div className="w-full h-full flex flex-col items-center justify-center text-center">
                      {cell.region.status === 'locked' && <Lock className="w-6 h-6 text-slate-400 mb-1" />}
                      {cell.region.status === 'claimed' && <User className="w-6 h-6 text-white mb-1" />}
                      {cell.region.status === 'available' && <MapPin className="w-6 h-6 text-white mb-1" />}
                      
                      <span className="text-[10px] font-bold text-white leading-tight shadow-black drop-shadow-md">
                        {cell.region.name}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              )}
            </svg>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRegion(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedRegion.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                    selectedRegion.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                    selectedRegion.status === 'claimed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {selectedRegion.status.toUpperCase()}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400">Territory Value</span>
                    <span className="text-xl font-bold text-white">
                      {selectedRegion.price ? `$${selectedRegion.price.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Potential Reach</span>
                    <span className="text-white">~50k Businesses</span>
                  </div>
                </div>

                {selectedRegion.status === 'available' ? (
                  <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Claim Territory
                  </button>
                ) : selectedRegion.status === 'claimed' ? (
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-blue-300">Owned by {selectedRegion.owner}</p>
                    <button className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline">
                      Make an Offer
                    </button>
                  </div>
                ) : (
                  <button disabled className="w-full py-3 bg-slate-700 text-slate-400 font-bold rounded-lg cursor-not-allowed">
                    Locked Region
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
