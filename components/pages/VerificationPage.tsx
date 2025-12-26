/**
 * Verification Standards Page
 * Explains the trust & verification process for Locale
 */

import React from 'react';
import { Link } from 'react-router-dom';

const VerificationPage: React.FC = () => {
  const verificationLevels = [
    {
      level: 'Garage',
      icon: '🏠',
      color: 'orange',
      requirements: [
        'Email verification',
        'Phone number verification',
        'Profile completion (75%+)',
        'Accept Terms of Service',
      ],
      benefits: [
        'List services locally',
        'Receive job requests',
        'Basic payment processing',
      ],
    },
    {
      level: 'Community',
      icon: '🤝',
      color: 'blue',
      requirements: [
        'Government ID verification via Ballerine',
        'Liveness check (selfie match)',
        'Address verification',
        '5+ completed jobs with 4.0+ rating',
        'Background check consent',
      ],
      benefits: [
        'Verified badge on profile',
        'Priority in search results',
        'Lower platform fees (10%)',
        'Access to higher-value jobs',
      ],
    },
    {
      level: 'Global',
      icon: '🌎',
      color: 'emerald',
      requirements: [
        'All Community requirements',
        '25+ completed jobs with 4.5+ rating',
        'Professional credentials verified',
        'Tax documentation on file',
        'Enterprise readiness audit',
      ],
      benefits: [
        'Global Elite badge',
        'Lowest platform fees (5%)',
        'Enterprise client access',
        'Featured placement',
        'Dedicated support',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-carbon-900 pb-24">
      {/* Hero */}
      <div className="relative pt-24 pb-16 px-6 text-center border-b border-carbon-800">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          TRUST & SAFETY
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
          Verification <span className="text-emerald-400">Standards</span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Our multi-tier verification system ensures trust and safety for everyone on the Locale platform.
        </p>
      </div>

      {/* Verification Levels */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {verificationLevels.map((tier) => (
            <div 
              key={tier.level}
              className={`bg-carbon-800 rounded-2xl p-6 border border-carbon-700 hover:border-${tier.color}-500/50 transition-all`}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{tier.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white">{tier.level}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tier</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Requirements</h4>
                <ul className="space-y-2">
                  {tier.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className={`text-${tier.color}-500 mt-0.5`}>✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Benefits</h4>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-emerald-500 mt-0.5">★</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ballerine Partnership */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-purple-500/30 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Powered by Ballerine</h3>
          <p className="text-gray-400 mb-6">
            Our identity verification is powered by Ballerine, ensuring bank-grade security 
            and compliance. Your documents are processed securely and never stored on our servers.
          </p>
          <div className="flex justify-center gap-4">
            <div className="px-4 py-2 bg-carbon-800 rounded-lg text-sm text-gray-400">
              🔒 SOC 2 Compliant
            </div>
            <div className="px-4 py-2 bg-carbon-800 rounded-lg text-sm text-gray-400">
              🛡️ GDPR Ready
            </div>
            <div className="px-4 py-2 bg-carbon-800 rounded-lg text-sm text-gray-400">
              ✓ KYC/AML
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-12">
        <h3 className="text-3xl font-bold text-white mb-6">Ready to Get Verified?</h3>
        <Link 
          to="/register" 
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl transition-colors"
        >
          Start Verification Process
        </Link>
      </div>
    </div>
  );
};

export default VerificationPage;
