
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Stripe Product IDs (set these in your Stripe Dashboard)
const STRIPE_PRODUCTS = {
  client: {
    coffee: 'price_client_coffee_9',
    pro: 'price_client_pro_29',
    enterprise: 'price_client_enterprise_199'
  },
  partner: {
    toolkit: 'price_partner_toolkit_9',
    community: 'price_partner_community_49',
    global: 'price_partner_global_149'
  }
};

const handleSubscribe = async (priceId: string, planName: string) => {
  try {
    // In production, this calls your backend to create a Stripe Checkout Session
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, planName })
    });
    
    if (response.ok) {
      const { url } = await response.json();
      window.location.href = url;
    } else {
      // Fallback: Direct to signup with plan context
      window.location.href = `/signup?plan=${planName}`;
    }
  } catch (error) {
    console.log('Stripe not configured, redirecting to signup');
    window.location.href = `/signup?plan=${planName}`;
  }
};

const PricingPage: React.FC = () => {
  const [view, setView] = useState<'client' | 'partner'>('client');

  return (
    <div className="min-h-screen bg-carbon-900 pb-32">
      {/* Hero */}
      <div className="relative pt-24 pb-12 px-6 text-center border-b border-carbon-800 bg-gradient-to-b from-carbon-900 via-carbon-800/50 to-carbon-900">
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
          Invest in Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-locale-blue to-purple-500">Infrastructure</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
           Whether you are hiring or building, we have the tools you need.
        </p>
        
        {/* Role Toggle */}
        <div className="inline-flex items-center bg-carbon-800 rounded-xl p-1.5 border border-carbon-700">
          <button 
            onClick={() => setView('client')}
            className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${view === 'client' ? 'bg-locale-blue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            I'm a Client
          </button>
          <button 
            onClick={() => setView('partner')}
            className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${view === 'partner' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            I'm a Partner (Expert)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 mt-12 relative z-10">
         
         {/* CLIENT PLANS */}
         {view === 'client' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto animate-fade-in-up">
                {/* Basic */}
                <div className="bg-carbon-800 p-6 rounded-3xl border border-carbon-700 flex flex-col hover:border-gray-500 transition-colors shadow-xl">
                   <div className="mb-4 text-gray-400 font-bold tracking-widest text-xs uppercase bg-carbon-900 w-max px-3 py-1 rounded">ACCESS</div>
                   <div className="text-4xl font-black text-white mb-2">$0</div>
                   <div className="text-sm text-gray-500 mb-6">Forever Free</div>
                   <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-green-500">✓</span> Browse Talent Directory</li>
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-green-500">✓</span> Secure Payments</li>
                   </ul>
                   <Link to="/dashboard" className="w-full py-3 border border-carbon-600 rounded-xl text-white font-bold hover:bg-carbon-700 transition-colors text-center text-sm">Get Started</Link>
                </div>

                {/* Coffee Tier (New) */}
                <div className="bg-carbon-800 p-6 rounded-3xl border border-orange-500/30 flex flex-col hover:border-orange-500/60 transition-colors relative overflow-hidden group shadow-xl">
                   <div className="mb-4 text-orange-400 font-bold tracking-widest text-xs uppercase bg-orange-900/20 w-max px-3 py-1 rounded border border-orange-500/20">STARTER</div>
                   <div className="text-4xl font-black text-white mb-2">$9<span className="text-lg font-normal text-gray-500">/mo</span></div>
                   <div className="text-sm text-gray-500 mb-6">"Buy me a coffee"</div>
                   <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex gap-3 text-sm text-gray-200 font-medium"><span className="text-orange-500">✓</span> Access Expert Services</li>
                      <li className="flex gap-3 text-sm text-gray-200 font-medium"><span className="text-orange-500">✓</span> 5% Discount on Hires</li>
                      <li className="flex gap-3 text-sm text-gray-200 font-medium"><span className="text-orange-500">✓</span> Basic File Manager</li>
                   </ul>
                   <button 
                     onClick={() => handleSubscribe(STRIPE_PRODUCTS.client.coffee, 'starter')}
                     className="w-full py-3 bg-orange-600 rounded-xl text-white font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-orange-900/20 text-sm"
                   >
                     Support Now
                   </button>
                </div>

                {/* Pro (Featured) */}
                <div className="bg-carbon-800 p-6 rounded-3xl border-2 border-locale-blue relative transform md:-translate-y-4 shadow-2xl flex flex-col z-20">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-locale-blue text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg">RECOMMENDED</div>
                   <div className="mb-4 text-locale-blue font-bold tracking-widest text-xs uppercase bg-locale-blue/10 w-max px-3 py-1 rounded">PRO CLIENT</div>
                   <div className="text-4xl font-black text-white mb-2">$29<span className="text-lg font-normal text-gray-500">/mo</span></div>
                   <div className="text-sm text-gray-500 mb-6">Maximize your hires</div>
                   <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex gap-3 text-sm text-white font-medium"><span className="text-locale-blue">✓</span> <span className="text-yellow-400 font-bold">15% Discount</span> on Experts</li>
                      <li className="flex gap-3 text-sm text-white font-medium"><span className="text-locale-blue">✓</span> AI Project Manager</li>
                      <li className="flex gap-3 text-sm text-white font-medium"><span className="text-locale-blue">✓</span> <strong>Google File Manager</strong></li>
                      <li className="flex gap-3 text-sm text-white font-medium"><span className="text-locale-blue">✓</span> Priority Support</li>
                   </ul>
                   <button 
                     onClick={() => handleSubscribe(STRIPE_PRODUCTS.client.pro, 'pro')}
                     className="w-full py-3 bg-locale-blue rounded-xl text-white font-bold hover:bg-locale-darkBlue transition-colors shadow-glow text-sm"
                   >
                     Start Free Trial
                   </button>
                </div>

                {/* Enterprise */}
                <div className="bg-carbon-800 p-6 rounded-3xl border border-carbon-700 flex flex-col hover:border-gray-500 transition-colors shadow-xl">
                   <div className="mb-4 text-gray-400 font-bold tracking-widest text-xs uppercase bg-carbon-900 w-max px-3 py-1 rounded">ENTERPRISE</div>
                   <div className="text-4xl font-black text-white mb-2">$199<span className="text-lg font-normal text-gray-500">/mo</span></div>
                   <div className="text-sm text-gray-500 mb-6">For scaling teams</div>
                   <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-green-500">✓</span> Dedicated Manager</li>
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-green-500">✓</span> Custom Legal Agreements</li>
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-green-500">✓</span> 20% Expert Discount</li>
                   </ul>
                   <button 
                     onClick={() => handleSubscribe(STRIPE_PRODUCTS.client.enterprise, 'enterprise')}
                     className="w-full py-3 border border-carbon-600 rounded-xl text-white font-bold hover:bg-carbon-700 transition-colors text-sm"
                   >
                     Contact Sales
                   </button>
                </div>
            </div>
         )}

         {/* PARTNER PLANS */}
         {view === 'partner' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto animate-fade-in-up">
                {/* Starter */}
                <div className="bg-carbon-800 p-6 rounded-3xl border border-carbon-700 flex flex-col hover:border-gray-500 transition-colors shadow-xl">
                   <div className="mb-4 text-gray-400 font-bold tracking-widest text-xs uppercase bg-carbon-900 w-max px-3 py-1 rounded">GARAGE</div>
                   <div className="text-4xl font-black text-white mb-2">$0</div>
                   <div className="text-sm text-gray-500 mb-6">Get Discovered</div>
                   <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-purple-500">✓</span> Basic Profile Listing</li>
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-purple-500">✓</span> 15% Platform Fee</li>
                   </ul>
                   <Link to="/partners" className="w-full py-3 border border-carbon-600 rounded-xl text-white font-bold hover:bg-carbon-700 transition-colors text-center text-sm">Join Network</Link>
                </div>

                {/* Coffee Tier (Partner) */}
                <div className="bg-carbon-800 p-6 rounded-3xl border border-orange-500/30 flex flex-col hover:border-orange-500/60 transition-colors relative overflow-hidden group shadow-xl">
                   <div className="mb-4 text-orange-400 font-bold tracking-widest text-xs uppercase bg-orange-900/20 w-max px-3 py-1 rounded border border-orange-500/20">TOOLKIT</div>
                   <div className="text-4xl font-black text-white mb-2">$9<span className="text-lg font-normal text-gray-500">/mo</span></div>
                   <div className="text-sm text-gray-500 mb-6">"Buy me a coffee"</div>
                   <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex gap-3 text-sm text-gray-200 font-medium"><span className="text-orange-500">✓</span> Access Pro Tools</li>
                      <li className="flex gap-3 text-sm text-gray-200 font-medium"><span className="text-orange-500">✓</span> 5GB Cloud Storage</li>
                      <li className="flex gap-3 text-sm text-gray-200 font-medium"><span className="text-orange-500">✓</span> CRM Lite</li>
                   </ul>
                   <button 
                     onClick={() => handleSubscribe(STRIPE_PRODUCTS.partner.toolkit, 'partner-toolkit')}
                     className="w-full py-3 bg-orange-600 rounded-xl text-white font-bold hover:bg-orange-500 transition-colors shadow-lg shadow-orange-900/20 text-sm"
                   >
                     Unlock Tools
                   </button>
                </div>

                {/* Growth */}
                <div className="bg-carbon-800 p-6 rounded-3xl border-2 border-purple-500 relative transform md:-translate-y-4 shadow-2xl flex flex-col z-20">
                   <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg">POPULAR</div>
                   <div className="mb-4 text-purple-400 font-bold tracking-widest text-xs uppercase bg-purple-900/30 w-max px-3 py-1 rounded">COMMUNITY</div>
                   <div className="text-4xl font-black text-white mb-2">$49<span className="text-lg font-normal text-gray-500">/mo</span></div>
                   <div className="text-sm text-gray-500 mb-6">Power your business</div>
                   <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex gap-3 text-sm text-white font-medium"><span className="text-purple-400">✓</span> <strong>AI Solution Suite</strong></li>
                      <li className="flex gap-3 text-sm text-white font-medium"><span className="text-purple-400">✓</span> Function Gemma + Gemini API</li>
                      <li className="flex gap-3 text-sm text-white font-medium"><span className="text-purple-400">✓</span> Cloud Run Integration</li>
                      <li className="flex gap-3 text-sm text-white font-medium"><span className="text-purple-400">✓</span> Google Drive Manager</li>
                   </ul>
                   <button 
                     onClick={() => handleSubscribe(STRIPE_PRODUCTS.partner.community, 'partner-community')}
                     className="w-full py-3 bg-purple-600 rounded-xl text-white font-bold hover:bg-purple-700 transition-colors shadow-lg text-center text-sm"
                   >
                     Upgrade Partner
                   </button>
                </div>

                {/* Global */}
                <div className="bg-carbon-800 p-6 rounded-3xl border border-carbon-700 flex flex-col hover:border-gray-500 transition-colors shadow-xl">
                   <div className="mb-4 text-yellow-500 font-bold tracking-widest text-xs uppercase bg-yellow-900/20 w-max px-3 py-1 rounded">GLOBAL</div>
                   <div className="text-4xl font-black text-white mb-2">$149<span className="text-lg font-normal text-gray-500">/mo</span></div>
                   <div className="text-sm text-gray-500 mb-6">Scale Agency</div>
                   <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-yellow-500">✓</span> Unlimited AI Usage</li>
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-yellow-500">✓</span> Lowest Fee (5%)</li>
                      <li className="flex gap-3 text-sm text-gray-300"><span className="text-yellow-500">✓</span> Priority in Matchmaker</li>
                   </ul>
                   <button 
                     onClick={() => handleSubscribe(STRIPE_PRODUCTS.partner.global, 'partner-global')}
                     className="w-full py-3 border border-yellow-500/50 text-yellow-500 rounded-xl font-bold hover:bg-yellow-500/10 transition-colors text-sm"
                   >
                     Apply for Global
                   </button>
                </div>
            </div>
         )}

      </div>
      
    </div>
  );
};

export default PricingPage;
