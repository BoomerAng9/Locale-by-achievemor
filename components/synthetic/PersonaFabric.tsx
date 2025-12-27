/**
 * Persona Fabric - Synthetic User Visualization
 * 
 * "Visualizing the invisible crowd."
 * A dashboard component to view and interact with generated synthetic user cohorts.
 */

import React, { useState } from 'react';
import { SyntheticUserProfile, generatePersonaSystemPrompt } from '../../lib/synthetic/SyntheticUserSchema';
import { useSyntheticUserGenerator } from '../../lib/synthetic/useSyntheticUserGenerator';

interface PersonaFabricProps {
  onSimulateChat?: (systemPrompt: string, userGroup: string) => void;
}

const PersonaFabric: React.FC<PersonaFabricProps> = ({ onSimulateChat }) => {
  const { generateClassroom, isGenerating } = useSyntheticUserGenerator();
  const [cohort, setCohort] = useState<SyntheticUserProfile[]>([]);
  const [topic, setTopic] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) return;
    const users = await generateClassroom(100, topic); // Generate a realistic sample size
    setCohort(users);
  };

  const getSegmentCount = (seg: string) => cohort.filter(u => u.cohort_segment === seg).length;

  const handleInteract = (segment: string) => {
    // Pick a random user from this segment to represent the group for 1:1 chat simulation
    // OR create an aggregate system prompt
    const representative = cohort.find(u => u.cohort_segment === segment);
    if (representative && onSimulateChat) {
      const prompt = generatePersonaSystemPrompt(representative);
      onSimulateChat(prompt, segment);
      setSelectedSegment(segment);
    } else {
        alert(`Simulating chat with ${segment} users... (Connect to Chat Widget to proceed)`);
    }
  };

  return (
    <div className="bg-carbon-900 border border-carbon-700 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-carbon-900 px-8 py-6 border-b border-carbon-700 flex justify-between items-center">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <span className="text-3xl">🧩</span>
             <h2 className="text-2xl font-black text-white tracking-tight">PERSONA FABRIC</h2>
           </div>
           <p className="text-indigo-200 text-sm font-light">Massive Scale Human Simulation Engine</p>
        </div>
        <div className="text-right">
             <div className="text-4xl font-black text-white">{cohort.length > 0 ? cohort.length : '0'}</div>
             <div className="text-xs uppercase tracking-widest text-indigo-400 font-bold">Active Synthetics</div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="p-8 bg-carbon-800">
        {!cohort.length ? (
            <div className="flex gap-4">
                <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter Class/Product Topic (e.g. 'Intro to Biology')"
                    className="flex-1 bg-carbon-900 border border-carbon-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                    {isGenerating ? 'Synthesizing...' : 'Generate 100 Personas'}
                </button>
            </div>
        ) : (
            <div>
                 <div className="grid grid-cols-4 gap-4 mb-8">
                    {['Alpha', 'Standard', 'Struggler', 'Edge Case'].map(seg => (
                        <div key={seg} className="bg-carbon-700/50 p-4 rounded-2xl border border-carbon-600 hover:border-indigo-500/50 transition-colors group relative overflow-hidden">
                             <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                    seg === 'Alpha' ? 'text-green-400' :
                                    seg === 'Struggler' ? 'text-red-400' :
                                    seg === 'Edge Case' ? 'text-yellow-400' : 'text-blue-400'
                                }`}>{seg}</span>
                                <span className="text-2xl font-black text-white">{getSegmentCount(seg)}</span>
                             </div>
                             <div className="h-1.5 w-full bg-carbon-600 rounded-full overflow-hidden mb-4">
                                 <div 
                                    className={`h-full ${
                                        seg === 'Alpha' ? 'bg-green-400' :
                                        seg === 'Struggler' ? 'bg-red-400' :
                                        seg === 'Edge Case' ? 'bg-yellow-400' : 'bg-blue-400'
                                    }`} 
                                    style={{ width: `${(getSegmentCount(seg) / cohort.length) * 100}%` }}
                                 />
                             </div>
                             
                             <button 
                                onClick={() => handleInteract(seg)}
                                className="w-full py-2 bg-carbon-600 hover:bg-white hover:text-carbon-900 text-xs font-bold rounded-lg transition-all"
                             >
                                TALK TO SEGMENT
                             </button>
                        </div>
                    ))}
                 </div>

                 <div className="bg-carbon-900 rounded-2xl border border-carbon-700 p-6 h-96 overflow-y-auto">
                    <h3 className="text-white font-bold mb-4 sticky top-0 bg-carbon-900 pb-2 border-b border-carbon-800 z-10">Roster Snapshot</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cohort.slice(0, 50).map(user => ( // Show first 50
                            <div key={user.sup_id} className="p-3 bg-carbon-800 rounded-lg border border-carbon-700 flex items-center gap-3 hover:bg-carbon-750 transition-colors">
                                <div className={`w-2 h-10 rounded-full ${
                                    user.cohort_segment === 'Alpha' ? 'bg-green-500' :
                                    user.cohort_segment === 'Struggler' ? 'bg-red-500' :
                                    user.cohort_segment === 'Edge Case' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">{user.name}</div>
                                    <div className="text-xs text-gray-400 truncate">{user.demographics.major} • {user.demographics.location}</div>
                                    <div className="flex gap-1 mt-1">
                                        <span className="px-1.5 py-0.5 rounded bg-black text-[10px] text-gray-500 border border-gray-800">{user.psychographics.learning_style}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
                 
                 <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => setCohort([])}
                        className="text-gray-500 hover:text-white text-sm underline"
                    >
                        Reset Simulation
                    </button>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PersonaFabric;
