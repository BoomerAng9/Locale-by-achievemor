/**
 * BARS Composer - Blueprint Automation & Resonance System
 * The intelligent notation system for structured AI prompting
 */

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
    <div className="min-h-screen bg-carbon-900 py-8 px-6">
      {/* Header with Logo */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-6 mb-6">
          <img 
            src="/assets/bars-logo.jpg" 
            alt="BARS" 
            className="w-24 h-24 rounded-2xl shadow-2xl border-2 border-amber-500/30"
          />
          <div>
            <h1 className="text-3xl font-black text-white mb-2">
              <span className="text-amber-400">BARS</span> Composer
            </h1>
            <p className="text-gray-400 text-lg">Blueprint Automation & Resonance System</p>
          </div>
        </div>

        {/* What is BARS */}
        <div className="bg-carbon-800 rounded-2xl p-6 border border-carbon-700 mb-8">
          <h2 className="text-xl font-bold text-amber-400 mb-4">What is BARS?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 leading-relaxed mb-4">
                <strong className="text-white">BARS</strong> (Blueprint Automation & Resonance System) is a 
                <span className="text-amber-400"> structured notation language</span> for AI prompting. 
                It transforms human intent into machine-readable blueprints that any AI agent can execute.
              </p>
              <p className="text-gray-400 text-sm">
                Think of it as "sheet music for AI" - a universal language that captures the 
                <span className="text-green-400"> scope</span>, 
                <span className="text-blue-400"> vibe</span>, 
                <span className="text-red-400"> urgency</span>, and 
                <span className="text-purple-400"> technical requirements</span> of any task.
              </p>
            </div>
            <div className="bg-carbon-900 rounded-xl p-4 border border-carbon-600">
              <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Example Notation</h3>
              <code className="text-amber-300 font-mono text-sm block">
                SCOPE: [WEB, API];<br/>
                VIBE: [MINIMAL, FAST];<br/>
                URGENCY: [HIGH];<br/>
                TECH: [REACT, TYPESCRIPT];
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Composer Interface */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-carbon-800 border border-carbon-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-carbon-900 px-6 py-3 border-b border-carbon-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <h3 className="text-amber-400 font-mono text-sm tracking-widest">BARS COMPOSER V1.0</h3>
            </div>
            <span className="text-xs text-gray-500">Notation of Resonance</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
            {/* Editor */}
            <div className="border-r border-carbon-700 flex flex-col">
              <div className="px-4 py-2 bg-carbon-900/50 border-b border-carbon-700">
                <span className="text-xs text-gray-500">EDITOR</span>
              </div>
              <textarea
                value={stanza}
                onChange={(e) => setStanza(e.target.value)}
                className="flex-1 bg-carbon-900 text-amber-300 font-mono text-sm p-4 focus:outline-none resize-none"
                spellCheck={false}
                placeholder="Enter your BARS notation..."
              />
              <div className="bg-carbon-900 p-3 border-t border-carbon-700 text-xs text-gray-500 flex justify-between">
                <span>KEYWORDS: SCOPE, VIBE, URGENCY, TECH, TARGET, STYLE</span>
                <button onClick={() => setStanza('')} className="hover:text-white transition-colors">CLEAR</button>
              </div>
            </div>

            {/* Visualizer */}
            <div className="bg-carbon-900/50 p-6 flex flex-col justify-center">
              {result ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Human Translation</h4>
                    <p className="text-white text-lg font-light leading-relaxed">"{result.summary}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Scope</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.scope.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded border border-amber-500/30">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Urgency</h4>
                      <span className={`text-xs font-bold px-3 py-1 rounded ${
                        result.urgency === 'HIGH' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : result.urgency === 'MED'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      }`}>
                        {result.urgency}
                      </span>
                    </div>
                  </div>

                  {/* Execute Button */}
                  <button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                    Execute BARS Notation →
                  </button>
                </div>
              ) : (
                <div className="text-gray-600 text-center py-12">
                  <div className="text-4xl mb-4">🎼</div>
                  <p>Awaiting BARS Input...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarsComposer;