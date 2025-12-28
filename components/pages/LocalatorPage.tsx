
import React from 'react';
import Localator from '../Localator';

const LocalatorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-carbon-900 pb-24">
      {/* Hero Section */}
      <div className="relative bg-carbon-800 border-b border-carbon-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-linear-to-r from-carbon-900 via-transparent to-carbon-900/50"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-locale-blue/10 border border-locale-blue/30 text-locale-blue text-xs font-bold tracking-widest mb-6 uppercase">
            Financial Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            The Localator <span className="text-locale-blue">Engine</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            Stop guessing your rates. Our advanced algorithm calculates platform fees, taxes, and tool costs to reveal your 
            <span className="text-white font-bold"> True Net Profit</span>. 
            Powered by ACHEEVY for real-time financial analysis.
          </p>
        </div>
      </div>

      {/* Main Tool Section */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <Localator />
      </div>

      {/* Intro / Value Prop */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-carbon-800 rounded-xl flex items-center justify-center border border-carbon-700 shadow-lg">
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white">Profit First</h3>
          <p className="text-gray-400 text-sm leading-relaxed">We reverse engineer your hourly rate based on your desired take-home pay, ensuring you never underprice a project again.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 bg-carbon-800 rounded-xl flex items-center justify-center border border-carbon-700 shadow-lg">
            <svg className="w-6 h-6 text-locale-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white">Market Data</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Real-time comparison against thousands of other professionals in your category and location.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 bg-carbon-800 rounded-xl flex items-center justify-center border border-carbon-700 shadow-lg">
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-white">AI Analysis</h3>
          <p className="text-gray-400 text-sm leading-relaxed">Get personalized advice from ACHEEVY on how to optimize your tax strategy and expense management.</p>
        </div>
      </div>
    </div>
  );
};

export default LocalatorPage;
