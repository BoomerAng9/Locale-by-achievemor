import React from 'react';
import { motion } from 'framer-motion';

const SockeyeDashboard: React.FC = () => {
  return (
    <div className="relative bg-sockeye-dark rounded-3xl overflow-hidden border border-sockeye-red/30 p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] text-gray-100 font-mono">
       {/* Background Grid & Scanlines */}
       <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-size-[20px_20px]" />
       <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-size-[100%_4px] opacity-10" />

       {/* Scanline Animation */}
       <motion.div 
         className="absolute top-0 left-0 right-0 h-1 bg-sockeye-red/50 shadow-[0_0_20px_rgba(220,38,38,1)] z-10"
         animate={{ top: ['0%', '100%'] }}
         transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
       />

       {/* Header */}
       <div className="flex justify-between items-center mb-8 border-b border-sockeye-red/30 pb-4">
          <div>
             <div className="text-xs text-sockeye-salmon uppercase tracking-[0.2em] mb-1 font-dots">Infrastructure Health</div>
             <div className="text-2xl font-bold text-white flex items-center space-x-2 font-dots">
                <span className="w-3 h-3 bg-sockeye-red rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                <span>SOCKEYE OS v4.2.1 - DEEP WATER</span>
             </div>
          </div>
          <div className="text-right text-xs text-sockeye-cyan font-mono">
             <div>X: -0.00153.1</div>
             <div>Y: -1.80572.0</div>
             <div>DEPTH: 4200M</div>
          </div>
       </div>

       {/* Main Content Grid */}
       <div className="grid grid-cols-12 gap-8 relative z-0">
          
          {/* Left Panel: Gauges */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
             {/* Power Gauge */}
             <div className="bg-sockeye-panel/50 p-4 rounded-xl border border-sockeye-red/20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-sockeye-red/5 group-hover:bg-sockeye-red/10 transition-colors" />
                <div className="relative z-10">
                   <div className="w-20 h-20 mx-auto rounded-full border-4 border-sockeye-red/20 border-t-sockeye-red flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                      <span className="text-2xl font-bold text-white font-dots">98%</span>
                   </div>
                   <div className="text-xs text-sockeye-salmon uppercase tracking-widest font-dots">Power</div>
                </div>
             </div>

             {/* Cooling Gauge */}
             <div className="bg-sockeye-panel/50 p-4 rounded-xl border border-sockeye-cyan/20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-sockeye-cyan/5 group-hover:bg-sockeye-cyan/10 transition-colors" />
                <div className="relative z-10">
                   <div className="w-20 h-20 mx-auto rounded-full border-4 border-sockeye-cyan/20 border-r-sockeye-cyan flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(34,211,209,0.2)]">
                      <span className="text-2xl font-bold text-white font-dots">85%</span>
                   </div>
                   <div className="text-xs text-sockeye-cyan uppercase tracking-widest font-dots">Cooling</div>
                </div>
             </div>

             {/* System Performance List */}
             <div className="bg-sockeye-panel/80 p-4 rounded-xl border border-white/5 space-y-3 font-mono text-xs">
                <div className="text-sockeye-salmon uppercase tracking-widest border-b border-white/5 pb-2 mb-2 font-dots">System Performance</div>
                {[
                   { label: 'CPU LOAD', value: '0.0%', color: 'text-gray-400' },
                   { label: 'MEMORY USAGE', value: '18.5%', color: 'text-yellow-400' },
                   { label: 'NETWORK I/O', value: '0 M/s', color: 'text-gray-400' },
                ].map((stat) => (
                   <div key={stat.label}>
                      <div className="flex justify-between mb-1">
                         <span className="text-gray-500">{stat.label}</span>
                         <span className={stat.color}>{stat.value}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-sockeye-red/50 w-1/3 animate-pulse" />
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Center Panel: Circuit Visualization */}
          <div className="col-span-12 lg:col-span-6 relative flex items-center justify-center min-h-100">
             {/* Central Core */}
             <div className="relative w-64 h-64">
                {/* Rings */}
                <div className="absolute inset-0 rounded-full border border-sockeye-red/20 animate-spin-slow" />
                <div className="absolute inset-4 rounded-full border border-sockeye-red/30 animate-spin-reverse-slow" />
                <div className="absolute inset-12 rounded-full border-2 border-sockeye-red/50 shadow-[0_0_30px_rgba(220,38,38,0.4)]" />
                
                {/* Core Chip */}
                <div className="absolute inset-20 bg-sockeye-dark/40 backdrop-blur-md rounded-lg border border-sockeye-red flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    <div className="grid grid-cols-2 gap-1 p-2">
                       <div className="w-1.5 h-1.5 bg-sockeye-red rounded-full animate-ping" />
                       <div className="w-1.5 h-1.5 bg-sockeye-red rounded-full" />
                       <div className="w-1.5 h-1.5 bg-sockeye-red rounded-full" />
                       <div className="w-1.5 h-1.5 bg-sockeye-red rounded-full animate-ping delay-75" />
                    </div>
                </div>

                {/* Connecting Lines (Decorations) */}
                <svg className="absolute -inset-12.5 w-[calc(100%+100px)] h-[calc(100%+100px)] pointer-events-none">
                   <path d="M50 180 L120 180 L150 150" fill="none" stroke="rgba(220,38,38,0.4)" strokeWidth="1" />
                   <path d="M350 180 L280 180 L250 150" fill="none" stroke="rgba(220,38,38,0.4)" strokeWidth="1" />
                   <circle cx="50" cy="180" r="3" fill="#dc2626" />
                   <circle cx="350" cy="180" r="3" fill="#dc2626" />
                </svg>
             </div>

             {/* Beam Effect */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sockeye-red/5 rounded-full blur-3xl pointer-events-none" />
             
             {/* Action Button */}
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <button className="px-8 py-3 bg-sockeye-panel border border-sockeye-red/50 text-sockeye-salmon font-bold rounded-lg hover:bg-sockeye-red/10 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all flex items-center space-x-2 font-dots">
                   <div className="w-6 h-6 border-2 border-sockeye-red rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-sockeye-red rounded-sm" />
                   </div>
                   <span>SCAN CIRCUITS</span>
                </button>
             </div>
          </div>

          {/* Right Panel: Environmental Data & Analysis */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
             {/* Analysis Log */}
             <div className="bg-sockeye-panel/80 p-4 rounded-xl border border-white/5 h-48 overflow-hidden relative">
                <div className="text-sockeye-salmon uppercase tracking-widest border-b border-white/5 pb-2 mb-2 text-xs font-dots">Circuit Analysis</div>
                <div className="space-y-1 font-mono text-[10px] text-gray-400">
                   {['scanning node 1...', 'link verified (2.30V)', 'optimizing flow...', 'secure gateway: active', 'data hub: synced'].map((log, i) => (
                      <div key={i} className="flex justify-between">
                         <span className="uppercase">{log}</span>
                         <span className="text-green-500">OK</span>
                      </div>
                   ))}
                </div>
             </div>

             {/* Environmental Data */}
             <div className="bg-sockeye-panel/80 p-4 rounded-xl border border-white/5 text-xs font-mono">
                <div className="text-sockeye-salmon uppercase tracking-widest border-b border-white/5 pb-2 mb-2 font-dots">Environmental Data</div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <div className="text-gray-500 mb-1">WATER TEMP</div>
                      <div className="text-xl text-white font-dots">24.5°C</div>
                   </div>
                   <div className="text-right">
                      <div className="text-gray-500 mb-1">SALINITY</div>
                      <div className="text-xl text-white font-dots">33.3%</div>
                   </div>
                   <div>
                      <div className="text-gray-500 mb-1">PRESSURE</div>
                      <div className="text-xl text-white font-dots">2680M</div>
                   </div>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
};

export default SockeyeDashboard;
