import React from 'react';
import { JigsawMap } from '../map/JigsawMap';
import { motion } from 'framer-motion';

export const MapPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <div className="container mx-auto px-4 h-[calc(100vh-80px)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
        >
          <JigsawMap />
        </motion.div>
      </div>
    </div>
  );
};
