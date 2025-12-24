import React, { useState, useEffect } from 'react';
import { resolveBars } from '../lib/barsParser';
import { BarsResolverOutput } from '../types';

const BarsComposer: React.FC = () => {
  const [stanza, setStanza] = useState('SCOPE: [WEB, LANDING]; VIBE: [COFFEE, WARM]; URGENCY: [MED];');
  const [result, setResult] = useState<BarsResolverOutput | null>(null);

  useEffect(() => {
    const res = resolveBars(stanza);
    setResult(res);
  }, [stanza]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-dark-card border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-neon-cyan font-mono text-sm tracking-widest">BARS COMPOSER V1.0</h3>
        <span className="text-xs text-gray-500">Notation of Resonance</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 h-96">
        {/* Editor */}
        <div className="border-r border-gray-800 flex flex-col">
          <textarea
            value={stanza}
            onChange={(e) => setStanza(e.target.value)}
            className="flex-1 bg-black text-neon-cyan font-mono text-sm p-4 focus:outline-none resize-none"
            spellCheck={false}
          />
          <div className="bg-dark-surface p-2 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
             <span>KEYWORDS: SCOPE, VIBE, URGENCY, TECH</span>
             <button onClick={() => setStanza('')} className="hover:text-white">CLEAR</button>
          </div>
        </div>

        {/* Visualizer */}
        <div className="bg-dark-surface p-6 flex flex-col justify-center">
          {result ? (
            <div className="space-y-6 animate-pulse-slow">
              <div>
                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Human Translation</h4>
                <p className="text-white text-lg font-light leading-relaxed">"{result.summary}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Scope</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.scope.map((s, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-800 text-neon-gold text-xs rounded border border-gray-700">{s}</span>
                      ))}
                    </div>
                 </div>
                 <div>
                    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Urgency</h4>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${result.urgency === 'HIGH' ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                      {result.urgency}
                    </span>
                 </div>
              </div>
            </div>
          ) : (
             <div className="text-gray-600 text-center">Awaiting Input...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarsComposer;