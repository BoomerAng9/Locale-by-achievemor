
import React, { useState } from 'react';
import { Profile, UserRole, ProgressionStage, VerificationStatus } from '../../types';

interface ScraperState {
  status: 'idle' | 'scanning' | 'extracting' | 'visualizing' | 'success';
  logs: string[];
}

const TalentScraper: React.FC = () => {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<ScraperState>({ status: 'idle', logs: [] });
  const [rawData, setRawData] = useState<any>(null);
  const [cleanedProfile, setCleanedProfile] = useState<Partial<Profile> | null>(null);

  // Simulated Scraping Logic
  const handleScan = () => {
    if (!url.includes('linkedin.com/in/')) {
       addLog('Error: Invalid LinkedIn URL provided.');
       return;
    }

    setState({ status: 'scanning', logs: ['Initializing headless browser...', 'Connecting to LinkedIn via proxy...'] });
    
    // Simulate delays
    setTimeout(() => {
        addLog('DOM extracted successfully.');
        addLog('Parsing metadata tags...');
        setState(prev => ({ ...prev, status: 'extracting' }));
        
        setTimeout(() => {
            const mockRaw = {
                "og:title": "Sarah Connor | Senior Resistance Leader | Techstars Mentor",
                "og:description": "Experienced operational leader specializing in AI defense systems. 10+ years managing distributed teams.",
                "profile:location": "Los Angeles, CA",
                "scraped_skills": "Leadership, C++, Robotics, Strategic Planning, Public Speaking",
                "img_src": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
            };
            setRawData(mockRaw);
            addLog('Raw data captured.');
            addLog('Applying heuristic cleaning algorithms...');
            
            // Heuristic Cleaning
            const clean: Partial<Profile> = {
                displayName: "Sarah Connor",
                title: "Senior Resistance Leader",
                bio: "Experienced operational leader specializing in AI defense systems. 10+ years managing distributed teams.",
                location: "Los Angeles, CA",
                skills: ["Leadership", "C++", "Robotics", "Strategy"],
                avatarUrl: mockRaw.img_src,
                hourlyRate: 150, // AI Estimated
            };
            setCleanedProfile(clean);
            setState(prev => ({ ...prev, status: 'visualizing' }));

        }, 2000);
    }, 2000);
  };

  const addLog = (msg: string) => {
    setState(prev => ({ ...prev, logs: [...prev.logs, `> ${msg}`] }));
  };

  const handleImport = () => {
    // In a real app, this would POST to the backend API to save the profile
    setState(prev => ({ ...prev, status: 'success' }));
  };

  const handleFieldChange = (field: keyof Profile, value: any) => {
     if (cleanedProfile) {
         setCleanedProfile({ ...cleanedProfile, [field]: value });
     }
  };

  return (
    <div className="bg-carbon-800 border border-carbon-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-carbon-900 p-6 border-b border-carbon-700 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn Talent Scraper
                </h2>
                <p className="text-sm text-gray-500">Import external profiles directly into your Locale network.</p>
            </div>
            <div className="text-xs font-mono text-gray-500">V1.2.0 (BETA)</div>
        </div>

        {/* Input Area */}
        {state.status === 'idle' && (
            <div className="p-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Profile URL</label>
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.linkedin.com/in/username"
                        className="flex-1 bg-carbon-900 border border-carbon-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-locale-blue transition-colors"
                    />
                    <button 
                        onClick={handleScan}
                        className="bg-locale-blue hover:bg-locale-darkBlue text-white font-bold px-8 rounded-xl transition-colors shadow-lg"
                    >
                        Start Scan
                    </button>
                </div>
                <div className="mt-6 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl text-xs text-blue-200">
                    <span className="font-bold">Note:</span> This tool simulates a headless browser session to extract public DOM elements. Ensure you comply with platform Terms of Service.
                </div>
            </div>
        )}

        {/* Console / Processing */}
        {(state.status === 'scanning' || state.status === 'extracting') && (
            <div className="p-8 font-mono text-xs">
                <div className="bg-black p-4 rounded-xl border border-carbon-700 h-64 overflow-y-auto text-green-400 space-y-1">
                    {state.logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                    <div className="animate-pulse">_</div>
                </div>
            </div>
        )}

        {/* Visualization & Cleaning */}
        {state.status === 'visualizing' && rawData && cleanedProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 h-[600px]">
                {/* Left: Raw Data */}
                <div className="p-6 border-r border-carbon-700 bg-carbon-900/50 overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Raw Extracted Data</h3>
                    <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap break-all">
                        {JSON.stringify(rawData, null, 2)}
                    </pre>
                </div>

                {/* Right: Cleaned Data Editor */}
                <div className="p-6 overflow-y-auto bg-carbon-800">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xs font-bold text-locale-blue uppercase tracking-widest">Cleaned Profile Preview</h3>
                        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/30">92% Confidence</span>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-6">
                            <img src={cleanedProfile.avatarUrl} className="w-16 h-16 rounded-full border-2 border-carbon-600" />
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Display Name</label>
                                <input 
                                    type="text" 
                                    value={cleanedProfile.displayName}
                                    onChange={(e) => handleFieldChange('displayName', e.target.value)}
                                    className="w-full bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Professional Title</label>
                            <input 
                                type="text" 
                                value={cleanedProfile.title}
                                onChange={(e) => handleFieldChange('title', e.target.value)}
                                className="w-full bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Bio</label>
                            <textarea 
                                value={cleanedProfile.bio}
                                onChange={(e) => handleFieldChange('bio', e.target.value)}
                                className="w-full bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm h-24"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Detected Skills (Comma Separated)</label>
                            <input 
                                type="text" 
                                value={cleanedProfile.skills?.join(', ')}
                                onChange={(e) => handleFieldChange('skills', e.target.value.split(',').map(s => s.trim()))}
                                className="w-full bg-carbon-900 border border-carbon-600 rounded px-3 py-2 text-white text-sm"
                            />
                        </div>

                        <div className="pt-6 border-t border-carbon-700 flex justify-end gap-3">
                            <button 
                                onClick={() => setState({ status: 'idle', logs: [] })}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                            >
                                Discard
                            </button>
                            <button 
                                onClick={handleImport}
                                className="px-6 py-2 bg-locale-blue hover:bg-locale-darkBlue text-white font-bold rounded-lg shadow-lg text-sm"
                            >
                                Import to Database
                            </button>
                        </div>
                     </div>
                </div>
            </div>
        )}

        {/* Success State */}
        {state.status === 'success' && (
            <div className="p-12 text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Profile Imported!</h2>
                <p className="text-gray-400 mb-8">The talent has been added to the staging area for verification.</p>
                <button 
                    onClick={() => {
                        setState({ status: 'idle', logs: [] });
                        setRawData(null);
                        setCleanedProfile(null);
                        setUrl('');
                    }}
                    className="text-locale-blue hover:text-white font-bold"
                >
                    Scan Another Profile
                </button>
            </div>
        )}
    </div>
  );
};

export default TalentScraper;
