
import React, { useState } from 'react';

const FileSystem: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'active'>('active');

  const MOCK_FILES = [
    { id: '1', name: 'Project_Brief_Alpha.pdf', type: 'pdf', size: '2.4 MB', date: '2 hrs ago' },
    { id: '2', name: 'Financial_Q1_Report.csv', type: 'csv', size: '1.1 MB', date: 'Yesterday' },
    { id: '3', name: 'Contract_SOW_Draft.docx', type: 'doc', size: '850 KB', date: '3 days ago' },
    { id: '4', name: 'Site_Assets_Bundle.zip', type: 'zip', size: '145 MB', date: '1 week ago' },
  ];

  const handleProcessWithGemma = () => {
    if (!selectedFile) return;
    setProcessing(true);
    setTimeout(() => {
        setProcessing(false);
        alert(`Function Gemma has analyzed ${selectedFile} and updated your CRM.`);
    }, 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      
      {/* LEFT: File Manager (Google Drive Style) */}
      <div className="lg:col-span-2 bg-carbon-800 rounded-2xl border border-carbon-700 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-carbon-700 flex justify-between items-center bg-carbon-900/50">
            <h3 className="text-white font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 002-2V7.5L14.5 0H4a2 2 0 00-2 2v18a2 2 0 002 2zm11.5-19l3.5 4.5h-3.5V3zM6 15h12v2H6v-2zm0-4h12v2H6v-2z"/></svg>
                Google File Manager
            </h3>
            <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-carbon-700 text-xs text-white rounded hover:bg-carbon-600 transition-colors">+ Upload</button>
                <button className="px-3 py-1.5 bg-carbon-700 text-xs text-white rounded hover:bg-carbon-600 transition-colors">New Folder</button>
            </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {MOCK_FILES.map(file => (
                <div 
                    key={file.id} 
                    onClick={() => setSelectedFile(file.name)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedFile === file.name ? 'bg-locale-blue/10 border-locale-blue' : 'bg-carbon-900/30 border-carbon-700 hover:border-gray-500'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-carbon-700 rounded flex items-center justify-center text-gray-400">
                           <span className="uppercase text-xs font-bold">{file.type}</span>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">{file.name}</div>
                            <div className="text-xs text-gray-500">{file.size} • {file.date}</div>
                        </div>
                    </div>
                    {selectedFile === file.name && (
                         <div className="w-3 h-3 rounded-full bg-locale-blue shadow-glow"></div>
                    )}
                </div>
            ))}
        </div>

        {/* Cloud Run Status */}
        <div className="p-4 border-t border-carbon-700 bg-carbon-900 flex items-center justify-between">
             <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${deploymentStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                 <span className="text-xs text-gray-400 font-mono uppercase">Cloud Run: {deploymentStatus}</span>
             </div>
             <div className="text-xs text-gray-600 font-mono">us-central1</div>
        </div>
      </div>

      {/* RIGHT: Function Gemma Integration */}
      <div className="bg-carbon-800 rounded-2xl border border-carbon-700 flex flex-col p-6">
         <div className="mb-6">
             <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 border border-purple-500/20">
                 <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             </div>
             <h3 className="text-lg font-bold text-white mb-1">Function Gemma</h3>
             <p className="text-xs text-gray-400">Gemini Interactions API</p>
         </div>

         <div className="flex-1 bg-carbon-900 rounded-xl p-4 border border-carbon-700 mb-6 font-mono text-xs text-gray-300 relative overflow-hidden">
             {selectedFile ? (
                 <div className="space-y-2">
                     <p><span className="text-purple-400">$</span> load_context("{selectedFile}")</p>
                     <p className="text-gray-500">Reading file metadata...</p>
                     <p className="text-gray-500">Extracting key entities...</p>
                     {processing && (
                        <>
                           <p className="text-yellow-400">Analysis running...</p>
                           <p className="text-locale-blue">Updating CRM records...</p>
                        </>
                     )}
                 </div>
             ) : (
                 <div className="h-full flex items-center justify-center text-gray-600">
                     Select a file to begin analysis
                 </div>
             )}
         </div>

         <button 
            disabled={!selectedFile || processing}
            onClick={handleProcessWithGemma}
            className="w-full py-3 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
         >
            {processing ? 'Processing...' : 'Run Analysis'}
         </button>
      </div>

    </div>
  );
};

export default FileSystem;
