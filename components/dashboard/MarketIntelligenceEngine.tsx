import React, { useState } from 'react';

const MarketIntelligenceEngine: React.FC = () => {
  const [activeSource, setActiveSource] = useState<'reddit' | 'linkedin' | 'twitter'>('reddit');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="bg-carbon-900 border border-carbon-700 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🧠</span> Market Intelligence Engine
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Real-time social listening & trend analysis
          </p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
            ${isScanning 
              ? 'bg-carbon-800 text-gray-500 cursor-not-allowed' 
              : 'bg-locale-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'}
          `}
        >
          {isScanning ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Scanning...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Scan Networks
            </>
          )}
        </button>
      </div>

      {/* Source Tabs */}
      <div className="flex gap-2 mb-6 border-b border-carbon-700 pb-1">
        {(['reddit', 'linkedin', 'twitter'] as const).map(source => (
          <button
            key={source}
            onClick={() => setActiveSource(source)}
            className={`
              px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative top-[1px]
              ${activeSource === source 
                ? 'text-white border-b-2 border-locale-blue bg-carbon-800/50' 
                : 'text-gray-500 hover:text-gray-300'}
            `}
          >
            {source.charAt(0).toUpperCase() + source.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {/* Mock Data Items */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-carbon-800/50 rounded-xl p-4 border border-carbon-700/50 hover:border-carbon-600 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`
                  w-2 h-2 rounded-full 
                  ${activeSource === 'reddit' ? 'bg-orange-500' : activeSource === 'linkedin' ? 'bg-blue-600' : 'bg-sky-400'}
                `} />
                <span className="text-xs font-mono text-gray-400">
                  {activeSource === 'reddit' ? 'r/freelance' : activeSource === 'linkedin' ? 'Remote Work Group' : '#hiring'}
                </span>
              </div>
              <span className="text-xs text-gray-500">2h ago</span>
            </div>
            
            <h3 className="text-white font-medium mb-2">
              {activeSource === 'reddit' 
                ? "Looking for a video editor for my YouTube channel (100k subs)" 
                : "We are expanding our design team! Need UI/UX experts."}
            </h3>
            
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              I need someone who can handle fast-paced editing with motion graphics. Budget is flexible for the right person...
            </p>

            <div className="flex items-center gap-3">
              <button className="text-xs bg-locale-blue/10 text-locale-blue px-3 py-1.5 rounded-lg hover:bg-locale-blue/20 transition-colors">
                Generate Proposal
              </button>
              <button className="text-xs bg-carbon-700 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-carbon-600 transition-colors">
                Analyze Sentiment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketIntelligenceEngine;
