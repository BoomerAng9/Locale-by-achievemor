import React from 'react';
import { BingeJob, JobPhase } from '../types';

const phases = Object.values(JobPhase) as JobPhase[];

interface BoardProps {
  jobs: BingeJob[];
}

const BingePipelineBoard: React.FC<BoardProps> = ({ jobs }) => {
  return (
    <div className="flex overflow-x-auto gap-4 p-4 min-h-[500px] w-full">
      {phases.map((phase) => {
        const phaseJobs = jobs.filter(j => j.phase === phase);
        
        return (
          <div key={phase} className="min-w-[280px] flex-1 bg-dark-card border border-gray-800 rounded-lg flex flex-col">
            {/* Column Header */}
            <div className="p-3 border-b border-gray-700 bg-gray-900/50 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-300">{phase}</h3>
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                  {phaseJobs.length}
                </span>
              </div>
              <div className="h-1 w-full bg-gray-800 mt-2 rounded-full overflow-hidden">
                 <div className="h-full bg-neon-cyan w-1/3"></div>
              </div>
            </div>

            {/* Drop Zone / List */}
            <div className="p-3 flex-1 flex flex-col gap-3">
              {phaseJobs.map(job => (
                <div key={job.id} className="bg-dark-surface p-3 rounded border border-gray-700 hover:border-neon-cyan cursor-grab shadow-sm group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-neon-orange font-mono">{job.id}</span>
                    <div className="w-2 h-2 rounded-full bg-gray-600 group-hover:bg-neon-cyan"></div>
                  </div>
                  <h4 className="text-white text-sm font-bold mb-1">{job.title}</h4>
                  <p className="text-gray-500 text-xs mb-3">{job.clientName}</p>
                  
                  <div className="flex justify-between items-end">
                    <div className="text-xs text-gray-400">
                      <div>TOKENS</div>
                      <span className="text-white font-mono">{job.actualTokens}/{job.estimatedTokens}</span>
                    </div>
                    {job.barsBrief && (
                      <div className="text-[10px] bg-gray-800 px-1 rounded text-gray-400 border border-gray-700">BARS</div>
                    )}
                  </div>
                </div>
              ))}
              
              {phaseJobs.length === 0 && (
                <div className="h-24 border-2 border-dashed border-gray-800 rounded flex items-center justify-center text-gray-700 text-xs">
                  Empty Phase
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BingePipelineBoard;