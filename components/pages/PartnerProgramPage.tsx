
import React from 'react';
import { Link } from 'react-router-dom';

const PartnerProgramPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-carbon-900 pb-32">
      {/* Hero */}
      <div className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/20 to-carbon-900 z-0"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold tracking-widest mb-6 uppercase">
            Locale Partner Program
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">
            Build Solutions with <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-locale-blue">Superpowers</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
             Join as a verified Partner. Access our exclusive AI Solution Suite to deliver work 10x faster, reduce overhead, and connect with high-value enterprise clients.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard?role=partner_setup" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-glow text-lg">
              Become a Partner
            </Link>
            <Link to="/pricing" className="px-8 py-4 bg-carbon-800 text-white font-bold rounded-xl border border-carbon-600 hover:border-white transition-colors">
              View Plans
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-carbon-800 p-8 rounded-3xl border border-carbon-700">
                <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-6 text-2xl">⚡</div>
                <h3 className="text-xl font-bold text-white mb-3">AI Solution Suite</h3>
                <p className="text-gray-400">
                    Don't just work harder. Use our proprietary Gemini-powered tools to analyze documents, generate code, and automate client reporting.
                </p>
            </div>
            <div className="bg-carbon-800 p-8 rounded-3xl border border-carbon-700">
                <div className="w-12 h-12 bg-locale-blue/20 text-locale-blue rounded-xl flex items-center justify-center mb-6 text-2xl">🤝</div>
                <h3 className="text-xl font-bold text-white mb-3">Client Discounts</h3>
                <p className="text-gray-400">
                    Clients on the Pro plan get a 15% discount when they hire YOU to implement AI solutions, subsidized by the platform to drive your volume.
                </p>
            </div>
            <div className="bg-carbon-800 p-8 rounded-3xl border border-carbon-700">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-6 text-2xl">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-3">Service Agreement</h3>
                <p className="text-gray-400">
                    We handle the legal infrastructure. Automated SOWs, escrow payments, and dispute resolution included in your partnership.
                </p>
            </div>
        </div>
      </div>

      {/* Agreement Preview */}
      <div className="max-w-4xl mx-auto px-6 mt-12">
        <div className="bg-carbon-800/50 border border-carbon-700 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Partner Agreement Overview</h2>
                <span className="bg-carbon-700 px-3 py-1 rounded text-xs text-gray-300">DRAFT PREVIEW</span>
            </div>
            <div className="prose prose-invert max-w-none text-sm text-gray-400 space-y-4">
                <p>By joining the Locale Partner Program, you agree to the following core tenets:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Quality Standard:</strong> Partners must maintain a Reputation Score above 80 to remain in the directory.</li>
                    <li><strong>Tool Usage:</strong> Partners gain a license to use the "Locale AI Suite" for commercial client work delivered via the platform.</li>
                    <li><strong>Platform Fees:</strong> Partners enjoy reduced platform fees (starting at 10% vs standard 15%) as they progress tiers.</li>
                    <li><strong>Exclusivity:</strong> Leads generated via the AI Matchmaker must be transacted on-platform to ensure payment security.</li>
                </ul>
            </div>
            <div className="mt-8 pt-8 border-t border-carbon-700 flex justify-end">
                 <Link to="/dashboard?role=partner_setup" className="flex items-center gap-2 text-white font-bold hover:text-purple-400 transition-colors">
                    Sign & Join <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                 </Link>
            </div>
        </div>
      </div>

    </div>
  );
};

export default PartnerProgramPage;
