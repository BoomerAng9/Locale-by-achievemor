/**
 * Super Admin Dashboard
 * 
 * CENTRAL COMMAND CENTER
 * - Agent Health Monitoring
 * - Global Infrastructure Settings
 * - Tenant Provisioning
 * - Billing & Metering
 * 
 * ACCESS LEVEL: SUPERADMIN ONLY
 */

import React, { useState } from 'react';
import HealthDashboard from './HealthDashboard';

const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'health' | 'tenants' | 'billing'>('health');

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">
              SUPERADMIN <span className="text-red-500">COMMAND</span>
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Restricted Access • Infrastructure Level 0
            </p>
          </div>
          <div className="flex gap-2">
            {['health', 'tenants', 'billing'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab 
                    ? 'bg-red-500 text-black' 
                    : 'bg-zinc-900 text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Main Panel */}
          <div className="col-span-8 space-y-8">
            {activeTab === 'health' && (
              <HealthDashboard />
            )}

            {activeTab === 'tenants' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-gray-500">
                Tenant Management & Partitioning Placeholder
              </div>
            )}
             
            {activeTab === 'billing' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-gray-500">
                Global Billing & Metering Placeholder
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="col-span-4 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Global Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">API Gateway</span>
                  <span className="text-xs font-bold text-green-400">OPERATIONAL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Vertex AI Video</span>
                  <span className="text-xs font-bold text-green-400">CONNECTED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Agent Health</span>
                  <span className="text-xs font-bold text-green-400">MONITORING</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Live Metering</h3>
              <div className="text-3xl font-black text-white mb-1">14,293</div>
              <div className="text-xs text-gray-500">Tokens Processed (Last Hour)</div>
              <div className="h-1 w-full bg-zinc-800 mt-4 rounded-full overflow-hidden">
                <div className="h-full w-[45%] bg-purple-500" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
