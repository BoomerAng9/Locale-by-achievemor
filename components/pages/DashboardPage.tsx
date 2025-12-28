
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/gcp';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import VerificationFlow from '../verification/VerificationFlow';
import TalentScraper from '../dashboard/TalentScraper';
import FileSystem from '../dashboard/FileSystem';
import InteractiveWorldMap from '../dashboard/InteractiveWorldMap';
import MarketIntelligenceEngine from '../dashboard/MarketIntelligenceEngine';
import AutoInviteSystem from '../dashboard/AutoInviteSystem';
import ProfileCustomizer from '../profile/ProfileCustomizer';
import { Profile } from '../../types';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'talent' | 'verify' | 'map' | 'intelligence'>('overview');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch User Profile from Firestore
          const docRef = doc(db, 'profiles', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            console.log("No profile found, redirecting to setup...");
            // Optional: Redirect to onboarding if profile missing
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        // Not logged in
        navigate('/register');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
     return (
        <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
            <div className="w-8 h-8 border-t-2 border-locale-blue rounded-full animate-spin"></div>
        </div>
     );
  }

  // Determine Tiers and Roles based on Real Data
  const isGoldTier = userProfile?.stage === 'global';
  const isPartner = userProfile?.role === 'partner' || userProfile?.role === 'partner_setup';
  const isClient = userProfile?.role === 'client';

  return (
    <div className="min-h-screen bg-carbon-900 pb-24 relative">
      
      {/* Gold Overlay for Global Tier Users */}
      {isGoldTier && (
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-yellow-600 via-yellow-300 to-yellow-600 z-50 shadow-[0_0_20px_rgba(212,175,55,0.4)]"></div>
      )}

      {/* Dashboard Hero */}
      <div className="bg-carbon-800 border-b border-carbon-700 relative overflow-hidden">
        {/* Subtle Gold Background Tint for Pro */}
        {isGoldTier && (
            <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>
        )}
        
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome, {userProfile?.displayName?.split(' ')[0] || 'User'}
                    </h1>
                    <p className="text-gray-400 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isGoldTier ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                        {userProfile?.role === 'partner_setup' ? 'Partner Applicant' : userProfile?.role || 'Member'} • {userProfile?.stage?.toUpperCase() || 'GARAGE'} Tier
                    </p>
                </div>
                <div className="hidden md:block">
                     <div className="bg-carbon-900 border border-carbon-700 rounded-lg px-4 py-2 text-right">
                         <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Account ID</div>
                         <div className="text-xs text-gray-300 font-mono">{auth.currentUser?.uid.slice(0,8)}...</div>
                     </div>
                </div>
            </div>
            
            {/* Dynamic Tabs */}
            <div className="flex gap-6 mt-8 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'text-locale-blue border-locale-blue' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                    Overview
                </button>

                <button 
                    onClick={() => setActiveTab('map')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'map' ? 'text-locale-blue border-locale-blue' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                    Global Map
                </button>

                <button 
                    onClick={() => setActiveTab('intelligence')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'intelligence' ? 'text-locale-blue border-locale-blue' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                    Intelligence
                </button>
                
                {/* File System is for Partners/Pros */}
                {isPartner && (
                    <button 
                        onClick={() => setActiveTab('files')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'files' ? 'text-locale-blue border-locale-blue' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                    >
                        Smart Files
                    </button>
                )}

                {/* Talent Scraper is mostly for Recruiters/Clients or Global Partners */}
                {(isClient || isGoldTier) && (
                    <button 
                        onClick={() => setActiveTab('talent')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'talent' ? 'text-locale-blue border-locale-blue' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                    >
                        Talent Sourcing (Beta)
                    </button>
                )}

                {/* Verification Tab - Show if pending */}
                {userProfile?.verificationStatus !== 'verified' && (
                    <button 
                        onClick={() => setActiveTab('verify')}
                        className={`pb-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'verify' ? 'text-locale-blue border-locale-blue' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                    >
                        Identity Verification <span className="ml-1 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-carbon-800 p-6 rounded-2xl border border-carbon-700">
                        <div className="text-sm text-gray-500 mb-1">Total Spend/Earnings</div>
                        <div className="text-3xl font-bold text-white">$0.00</div>
                        <div className="text-xs text-gray-500 mt-2">Start your first project today</div>
                    </div>
                    <div className="bg-carbon-800 p-6 rounded-2xl border border-carbon-700">
                        <div className="text-sm text-gray-500 mb-1">Jobs Completed</div>
                        <div className="text-3xl font-bold text-white">{userProfile?.jobsCompleted || 0}</div>
                        <div className="text-xs text-green-500 mt-2">Ready for more</div>
                    </div>
                    <div className="bg-carbon-800 p-6 rounded-2xl border border-carbon-700">
                        <div className="text-sm text-gray-500 mb-1">Reputation Score</div>
                        <div className="text-3xl font-bold text-white">{userProfile?.reputationScore || 0}</div>
                        <div className="text-xs text-gray-400 mt-2">
                             {userProfile?.reputationScore > 50 ? 'Good Standing' : 'Building Trust'}
                        </div>
                    </div>
                </div>

                <div className="bg-carbon-800 p-8 rounded-2xl border border-carbon-700 text-center">
                    <h3 className="text-xl font-bold text-white mb-4">Customize Your Digital Presence</h3>
                    <p className="text-gray-400 mb-8 max-w-lg mx-auto">Stand out in the marketplace with a unique card theme. Upgrade to Neon or Royal to get 2x more clicks.</p>
                    <Link to="/profile/customize" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                        Launch Customizer
                    </Link>
                </div>
            </div>
        )}

        {/* TAB: GLOBAL MAP */}
        {activeTab === 'map' && (
            <div className="animate-fade-in-up">
                <InteractiveWorldMap />
            </div>
        )}

        {/* TAB: INTELLIGENCE */}
        {activeTab === 'intelligence' && (
            <div className="animate-fade-in-up space-y-8">
                <MarketIntelligenceEngine />
                <AutoInviteSystem />
            </div>
        )}

        {/* TAB: FILES */}
        {activeTab === 'files' && (
            <div className="animate-fade-in-up">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Smart File System</h2>
                        <p className="text-gray-400">Integrated with Google Cloud & Function Gemma.</p>
                    </div>
                    <span className="text-xs font-mono bg-purple-500/10 text-purple-400 px-3 py-1 rounded border border-purple-500/20">AI ENHANCED</span>
                </div>
                <FileSystem />
            </div>
        )}

        {/* TAB: TALENT SCRAPER */}
        {activeTab === 'talent' && (
            <div className="animate-fade-in-up">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">AI Talent Scout</h2>
                    <p className="text-gray-400">Import external profiles from LinkedIn to build your private talent pool.</p>
                </div>
                <TalentScraper />
            </div>
        )}

        {/* TAB: VERIFICATION */}
        {activeTab === 'verify' && (
            <div className="animate-fade-in-up max-w-2xl mx-auto">
                <VerificationFlow onComplete={() => window.location.reload()} />
            </div>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;
