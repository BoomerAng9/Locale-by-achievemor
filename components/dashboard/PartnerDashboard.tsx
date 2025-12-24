/**
 * Partner Dashboard Component
 * Shows affiliate stats, referral code, and commission earnings
 */

import React, { useState, useEffect } from 'react';
import { auth, db } from '../../lib/gcp';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { activatePartner, getPartnerStats } from '../../lib/firestore/partner';
import { formatCurrency } from '../../lib/stripe/financialRouter';

interface PartnerStats {
  tier: string;
  affiliateCode: string | null;
  totalReferrals: number;
  totalEarnings: number;
}

const TIER_COLORS: Record<string, string> = {
  none: 'bg-gray-600',
  bronze: 'bg-orange-600',
  silver: 'bg-gray-400',
  gold: 'bg-yellow-500',
};

const TIER_BENEFITS: Record<string, string[]> = {
  none: ['Become a partner to unlock benefits'],
  bronze: ['15% commission on referrals', 'Partner badge', 'Basic analytics'],
  silver: ['15% commission + Priority support', 'Featured in directory', 'Advanced analytics'],
  gold: ['15% commission + VIP perks', 'Top directory placement', 'Custom commission rates'],
};

const PartnerDashboard: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setDisplayName(user.displayName || 'Partner');
        
        const partnerStats = await getPartnerStats(user.uid);
        setStats(partnerStats);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleActivatePartner = async () => {
    if (!userId) return;
    
    setActivating(true);
    try {
      const code = await activatePartner(userId, displayName);
      if (code) {
        setStats((prev) => prev ? { ...prev, affiliateCode: code, tier: 'bronze' } : null);
      }
    } catch (err) {
      console.error('Failed to activate partner:', err);
    } finally {
      setActivating(false);
    }
  };

  const copyReferralLink = () => {
    if (!stats?.affiliateCode) return;
    
    const link = `${window.location.origin}/#/signup?ref=${stats.affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-carbon-800 rounded-2xl border border-carbon-700 p-8">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-locale-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="bg-carbon-800 rounded-2xl border border-carbon-700 p-8 text-center">
        <p className="text-gray-400">Please log in to access your Partner Dashboard.</p>
      </div>
    );
  }

  const tier = stats?.tier || 'none';
  const hasCode = !!stats?.affiliateCode;

  return (
    <div className="bg-carbon-800 rounded-2xl border border-carbon-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-carbon-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <span className="text-2xl">🤝</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Partner Dashboard</h2>
            <p className="text-sm text-gray-500">Earn 15% commission on referrals</p>
          </div>
        </div>

        {/* Tier Badge */}
        <div className={`px-4 py-2 rounded-full ${TIER_COLORS[tier]} text-white font-bold uppercase text-sm`}>
          {tier === 'none' ? 'Not Active' : `${tier} Partner`}
        </div>
      </div>

      {/* Stats Grid */}
      {hasCode ? (
        <div className="p-6">
          {/* Referral Code Card */}
          <div className="bg-carbon-900 rounded-xl border border-carbon-700 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Referral Code</p>
                <p className="text-2xl font-mono font-bold text-white">{stats?.affiliateCode}</p>
              </div>
              <button
                onClick={copyReferralLink}
                className="px-4 py-2 bg-locale-blue hover:bg-locale-darkBlue text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Share this link: <code className="text-gray-400">{window.location.origin}/#/signup?ref={stats?.affiliateCode}</code>
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-carbon-900 rounded-xl border border-carbon-700 p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Referrals</p>
              <p className="text-3xl font-bold text-white">{stats?.totalReferrals || 0}</p>
            </div>
            <div className="bg-carbon-900 rounded-xl border border-carbon-700 p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Earnings</p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency((stats?.totalEarnings || 0) * 100)}</p>
            </div>
          </div>

          {/* Tier Benefits */}
          <div className="bg-carbon-900 rounded-xl border border-carbon-700 p-5">
            <p className="text-sm font-bold text-white mb-3 uppercase tracking-wide">{tier} Tier Benefits</p>
            <ul className="space-y-2">
              {TIER_BENEFITS[tier]?.map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="text-green-500">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Become a Partner</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Activate your partner account to get a unique referral code. Earn 15% of the platform fee on every transaction from users you refer!
          </p>
          <button
            onClick={handleActivatePartner}
            disabled={activating}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mx-auto"
          >
            {activating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Activating...
              </>
            ) : (
              <>
                <span>⚡</span>
                Activate Partner Status
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PartnerDashboard;
