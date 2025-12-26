import React, { useState } from 'react';

const AutoInviteSystem: React.FC = () => {
  const [targetIndustry, setTargetIndustry] = useState('Real Estate');
  const [location, setLocation] = useState('Palm Beach, FL');
  const [status, setStatus] = useState<'idle' | 'crawling' | 'inviting'>('idle');

  const startCampaign = () => {
    setStatus('crawling');
    // Mock process
    setTimeout(() => setStatus('inviting'), 2000);
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <div className="bg-carbon-900 border border-carbon-700 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl text-purple-400">
          🚀
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Auto-Invite System</h2>
          <p className="text-sm text-gray-400">Reverse Marketplace Engine</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Target Industry</label>
          <select 
            value={targetIndustry}
            onChange={(e) => setTargetIndustry(e.target.value)}
            className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          >
            <option>Real Estate</option>
            <option>Legal Services</option>
            <option>Hospitality</option>
            <option>Tech Startups</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Location</label>
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div className="bg-carbon-800/30 rounded-xl p-4 border border-carbon-700/50 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Campaign Status</span>
          <span className={`
            text-xs font-bold px-2 py-1 rounded uppercase
            ${status === 'idle' ? 'bg-gray-700 text-gray-300' : 'bg-green-500/20 text-green-400 animate-pulse'}
          `}>
            {status}
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Leads Found</span>
            <span className="text-white font-mono">1,240</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Invites Sent</span>
            <span className="text-white font-mono">856</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Conversion Rate</span>
            <span className="text-green-400 font-mono">12.4%</span>
          </div>
        </div>

        {status !== 'idle' && (
          <div className="mt-4 space-y-1">
            <div className="text-[10px] text-gray-500 font-mono">
              &gt; Crawling Google Maps for "{targetIndustry}" in {location}...
            </div>
            <div className="text-[10px] text-gray-500 font-mono">
              &gt; Extracting contact info...
            </div>
            {status === 'inviting' && (
              <div className="text-[10px] text-purple-400 font-mono">
                &gt; Sending personalized invites via SendGrid...
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={startCampaign}
        disabled={status !== 'idle'}
        className={`
          w-full py-3 rounded-xl font-bold text-sm transition-all
          ${status !== 'idle'
            ? 'bg-carbon-800 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20'}
        `}
      >
        {status === 'idle' ? 'Launch Campaign' : 'Campaign Running...'}
      </button>
    </div>
  );
};

export default AutoInviteSystem;
