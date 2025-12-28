import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface BusinessLead {
  id: string;
  name: string;
  industry: string;
  email?: string;
  phone?: string;
  city: string;
  state: string;
  website?: string;
  source: 'chamber' | 'llc_registry' | 'google_places' | 'bbb' | 'yelp' | 'linkedin' | 'manual';
  inviteStatus: 'pending' | 'invited' | 'joined' | 'declined' | 'bounced';
  retryCount: number;
  draftPageUrl?: string;
}

interface InviteCampaign {
  id: string;
  city: string;
  state: string;
  industry: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  totalLeads: number;
  invitesSent: number;
  opens: number;
  clicks: number;
  conversions: number;
  createdAt: Date;
}

interface DraftPartnerPage {
  businessLeadId: string;
  slug: string;
  businessName: string;
  industry: string;
  prefilledData: Record<string, string>;
  status: 'draft' | 'active' | 'claimed';
  expiresAt: Date;
}

type CampaignStep = 'idle' | 'discovering' | 'generating_pages' | 'sending_invites' | 'monitoring';

// ============================================
// MOCK DATA (replace with Firestore hooks)
// ============================================

const INDUSTRIES = [
  'Real Estate',
  'Legal Services', 
  'Accounting',
  'Insurance',
  'Construction',
  'Electrical Services',
  'Plumbing',
  'Food & Beverage',
  'Fitness',
  'Beauty & Wellness',
  'Automotive',
  'Healthcare',
  'Photography',
  'Travel',
];

const TRACKED_CITIES = [
  { name: 'Atlanta', state: 'GA', leads: 342 },
  { name: 'Austin', state: 'TX', leads: 287 },
  { name: 'Miami', state: 'FL', leads: 456 },
  { name: 'West Palm Beach', state: 'FL', leads: 189 },
  { name: 'Dallas', state: 'TX', leads: 398 },
  { name: 'New York', state: 'NY', leads: 892 },
  { name: 'Los Angeles', state: 'CA', leads: 743 },
];

const MOCK_LEADS: BusinessLead[] = [
  { id: '1', name: 'Smith & Associates Law', industry: 'Legal Services', email: 'contact@smithlaw.com', phone: '555-0101', city: 'Atlanta', state: 'GA', source: 'google_places', inviteStatus: 'pending', retryCount: 0 },
  { id: '2', name: 'Palm Beach Realty', industry: 'Real Estate', email: 'info@pbr.com', phone: '555-0102', city: 'West Palm Beach', state: 'FL', source: 'chamber', inviteStatus: 'invited', retryCount: 1 },
  { id: '3', name: 'Austin Fitness Studio', industry: 'Fitness', email: 'hello@austinfit.com', city: 'Austin', state: 'TX', source: 'google_places', inviteStatus: 'pending', retryCount: 0 },
  { id: '4', name: 'Miami Dental Care', industry: 'Healthcare', email: 'appointments@miamidc.com', phone: '555-0104', city: 'Miami', state: 'FL', source: 'bbb', inviteStatus: 'joined', retryCount: 0 },
  { id: '5', name: 'Dallas Auto Repair', industry: 'Automotive', email: 'service@dallasauto.com', city: 'Dallas', state: 'TX', source: 'google_places', inviteStatus: 'bounced', retryCount: 3 },
];

// ============================================
// COMPONENT
// ============================================

const AutoInviteSystem: React.FC = () => {
  // Campaign configuration
  const [targetIndustry, setTargetIndustry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [emailSubject, setEmailSubject] = useState<string>('Join Locale - Your AI-Powered Business Hub');
  const [emailTemplate, setEmailTemplate] = useState<'friendly' | 'professional' | 'urgent'>('professional');
  
  // Pipeline state
  const [step, setStep] = useState<CampaignStep>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Data
  const [leads, setLeads] = useState<BusinessLead[]>(MOCK_LEADS);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [campaigns, setCampaigns] = useState<InviteCampaign[]>([]);
  const [draftPages, setDraftPages] = useState<DraftPartnerPage[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalLeads: 2847,
    pendingInvites: 1240,
    invitesSent: 856,
    conversions: 106,
    bounced: 45,
    activePages: 892,
  });

  // ============================================
  // PIPELINE FUNCTIONS
  // ============================================

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev.slice(-20), `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const generateDraftPartnerPage = (lead: BusinessLead): DraftPartnerPage => {
    const slug = `${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${lead.id}`;
    return {
      businessLeadId: lead.id,
      slug,
      businessName: lead.name,
      industry: lead.industry,
      prefilledData: {
        name: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        city: lead.city,
        state: lead.state,
      },
      status: 'draft',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
  };

  const generatePersonalizedEmail = (lead: BusinessLead, page: DraftPartnerPage): string => {
    const templates = {
      friendly: `Hey ${lead.name.split(' ')[0]}! 👋\n\nWe've been admiring your work in ${lead.city}'s ${lead.industry} scene. We built you a custom partner page on Locale - check it out!\n\n🔗 locale.ai/p/${page.slug}\n\nBest,\nThe Locale Team`,
      professional: `Dear ${lead.name},\n\nWe've identified your business as a standout in ${lead.city}'s ${lead.industry} sector. As part of our Reverse Marketplace initiative, we've pre-created a partner profile for you.\n\nClaim your page: locale.ai/p/${page.slug}\n\nThis page expires in 30 days.\n\nBest regards,\nLocale Business Development`,
      urgent: `⚡ EXCLUSIVE: ${lead.name}\n\nYour ${lead.industry} competitors in ${lead.city} are already on Locale. Don't miss out - we've reserved your spot:\n\n→ locale.ai/p/${page.slug}\n\nClaim in the next 48 hours for priority placement.`,
    };
    return templates[emailTemplate];
  };

  const runCampaign = async () => {
    // Filter leads
    const targetLeads = leads.filter(lead => {
      if (lead.inviteStatus !== 'pending') return false;
      if (targetIndustry !== 'all' && lead.industry !== targetIndustry) return false;
      if (selectedCity !== 'all' && `${lead.city}, ${lead.state}` !== selectedCity) return false;
      return true;
    });

    if (targetLeads.length === 0) {
      addLog('❌ No pending leads match your criteria');
      return;
    }

    addLog(`🚀 Starting campaign for ${targetLeads.length} leads...`);
    setStep('discovering');
    setProgress(0);

    // Step 1: Discovery (simulated)
    for (let i = 0; i < 3; i++) {
      await new Promise(r => setTimeout(r, 800));
      setProgress(prev => Math.min(prev + 10, 30));
      addLog(`📡 Scanning ${TRACKED_CITIES[i % TRACKED_CITIES.length].name} business directories...`);
    }

    // Step 2: Generate Draft Pages
    setStep('generating_pages');
    addLog('📝 Generating draft partner pages...');
    
    const newPages: DraftPartnerPage[] = [];
    for (let i = 0; i < targetLeads.length; i++) {
      await new Promise(r => setTimeout(r, 200));
      const page = generateDraftPartnerPage(targetLeads[i]);
      newPages.push(page);
      setProgress(30 + (i / targetLeads.length) * 30);
      if (i % 5 === 0) {
        addLog(`   ✓ Created page for ${targetLeads[i].name}`);
      }
    }
    setDraftPages(prev => [...prev, ...newPages]);
    addLog(`✅ ${newPages.length} draft pages generated`);

    // Step 3: Send Invites
    setStep('sending_invites');
    addLog('📧 Sending personalized invites via SendGrid...');
    
    for (let i = 0; i < targetLeads.length; i++) {
      await new Promise(r => setTimeout(r, 150));
      const lead = targetLeads[i];
      const page = newPages[i];
      
      // Simulate email sending
      const emailContent = generatePersonalizedEmail(lead, page);
      console.log(`[SendGrid Mock] To: ${lead.email}\nSubject: ${emailSubject}\n\n${emailContent}`);
      
      // Update lead status
      setLeads(prev => prev.map(l => 
        l.id === lead.id ? { ...l, inviteStatus: 'invited' as const, draftPageUrl: `locale.ai/p/${page.slug}` } : l
      ));
      
      setProgress(60 + (i / targetLeads.length) * 30);
      if (i % 3 === 0) {
        addLog(`   📤 Invite sent to ${lead.email || lead.name}`);
      }
    }
    addLog(`✅ ${targetLeads.length} invites sent`);

    // Step 4: Monitoring
    setStep('monitoring');
    setProgress(95);
    addLog('👁️ Campaign now in monitoring mode...');
    
    await new Promise(r => setTimeout(r, 1000));
    setProgress(100);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      pendingInvites: prev.pendingInvites - targetLeads.length,
      invitesSent: prev.invitesSent + targetLeads.length,
      activePages: prev.activePages + newPages.length,
    }));

    // Create campaign record
    const newCampaign: InviteCampaign = {
      id: `campaign-${Date.now()}`,
      city: selectedCity,
      state: '',
      industry: targetIndustry,
      status: 'completed',
      totalLeads: targetLeads.length,
      invitesSent: targetLeads.length,
      opens: 0,
      clicks: 0,
      conversions: 0,
      createdAt: new Date(),
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    
    addLog('🎉 Campaign completed successfully!');
    
    // Reset after delay
    setTimeout(() => {
      setStep('idle');
      setProgress(0);
    }, 2000);
  };

  // ============================================
  // RENDER
  // ============================================

  const filteredLeads = leads.filter(lead => {
    if (targetIndustry !== 'all' && lead.industry !== targetIndustry) return false;
    if (selectedCity !== 'all' && `${lead.city}, ${lead.state}` !== selectedCity) return false;
    return true;
  });

  return (
    <div className="bg-carbon-900 border border-carbon-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-carbon-700 bg-linear-to-r from-purple-900/30 to-blue-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20">
              🚀
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Auto-Invite System</h2>
              <p className="text-sm text-gray-400">Reverse Marketplace Intelligence Engine</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <motion.div
            animate={{ 
              scale: step !== 'idle' ? [1, 1.05, 1] : 1,
              opacity: 1 
            }}
            transition={{ repeat: step !== 'idle' ? Infinity : 0, duration: 1.5 }}
            className={`
              px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide
              ${step === 'idle' ? 'bg-gray-700 text-gray-300' : 
                step === 'discovering' ? 'bg-yellow-500/20 text-yellow-400' :
                step === 'generating_pages' ? 'bg-blue-500/20 text-blue-400' :
                step === 'sending_invites' ? 'bg-purple-500/20 text-purple-400' :
                'bg-green-500/20 text-green-400'}
            `}
          >
            {step === 'idle' ? 'Ready' : step.replace(/_/g, ' ')}
          </motion.div>
        </div>

        {/* AVVA-NOON Watermark */}
        <div className="mt-3 text-[10px] text-gray-600 font-mono opacity-50">
          AVVA-NOON Plausibility: (-10¹⁸ ≤ x, y ≤ 10¹⁸)
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-carbon-700">
        {[
          { label: 'Total Leads', value: stats.totalLeads, color: 'text-white' },
          { label: 'Pending', value: stats.pendingInvites, color: 'text-yellow-400' },
          { label: 'Invited', value: stats.invitesSent, color: 'text-blue-400' },
          { label: 'Conversions', value: stats.conversions, color: 'text-green-400' },
          { label: 'Bounced', value: stats.bounced, color: 'text-red-400' },
          { label: 'Active Pages', value: stats.activePages, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-carbon-800 p-3 text-center">
            <div className={`text-xl font-bold font-mono ${stat.color}`}>
              {stat.value.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* Configuration Panel */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Campaign Config</h3>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Target Industry</label>
            <select 
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Industries</option>
              {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Target City</label>
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Cities</option>
              {TRACKED_CITIES.map(city => (
                <option key={`${city.name}-${city.state}`} value={`${city.name}, ${city.state}`}>
                  {city.name}, {city.state} ({city.leads} leads)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email Subject</label>
            <input 
              type="text" 
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email Template</label>
            <div className="grid grid-cols-3 gap-2">
              {(['friendly', 'professional', 'urgent'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setEmailTemplate(t)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                    emailTemplate === t
                      ? 'bg-purple-500 text-white'
                      : 'bg-carbon-800 text-gray-400 hover:bg-carbon-700'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {step !== 'idle' && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-carbon-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-purple-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Launch Button */}
          <button
            onClick={runCampaign}
            disabled={step !== 'idle'}
            className={`
              w-full py-3 rounded-xl font-bold text-sm transition-all mt-4
              ${step !== 'idle'
                ? 'bg-carbon-800 text-gray-500 cursor-not-allowed'
                : 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20'}
            `}
          >
            {step === 'idle' ? `Launch Campaign (${filteredLeads.filter(l => l.inviteStatus === 'pending').length} leads)` : 'Campaign Running...'}
          </button>
        </div>

        {/* Leads Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Lead Queue ({filteredLeads.length})</h3>
          
          <div className="bg-carbon-800 rounded-xl border border-carbon-700 overflow-hidden max-h-80 overflow-y-auto">
            {filteredLeads.slice(0, 10).map((lead) => (
              <div 
                key={lead.id}
                className="p-3 border-b border-carbon-700/50 hover:bg-carbon-700/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{lead.name}</div>
                    <div className="text-xs text-gray-500">{lead.industry} • {lead.city}, {lead.state}</div>
                  </div>
                  <span className={`
                    text-[10px] px-2 py-1 rounded-full uppercase font-bold
                    ${lead.inviteStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      lead.inviteStatus === 'invited' ? 'bg-blue-500/20 text-blue-400' :
                      lead.inviteStatus === 'joined' ? 'bg-green-500/20 text-green-400' :
                      lead.inviteStatus === 'bounced' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'}
                  `}>
                    {lead.inviteStatus}
                  </span>
                </div>
                {lead.email && (
                  <div className="text-[10px] text-gray-600 mt-1 font-mono">{lead.email}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Logs */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Pipeline Logs</h3>
          
          <div className="bg-carbon-950 rounded-xl border border-carbon-700 p-3 h-80 overflow-y-auto font-mono text-[11px]">
            <AnimatePresence mode="popLayout">
              {logs.length === 0 ? (
                <div className="text-gray-600">Waiting for campaign start...</div>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className={`py-1 ${
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('✅') || log.includes('🎉') ? 'text-green-400' :
                      log.includes('📧') || log.includes('📤') ? 'text-purple-400' :
                      log.includes('📝') ? 'text-blue-400' :
                      log.includes('🚀') ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}
                  >
                    {log}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Recent Campaigns */}
      {campaigns.length > 0 && (
        <div className="p-6 border-t border-carbon-700">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Recent Campaigns</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.slice(0, 3).map((campaign) => (
              <div key={campaign.id} className="bg-carbon-800 rounded-xl p-4 border border-carbon-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {campaign.industry === 'all' ? 'All Industries' : campaign.industry}
                    </div>
                    <div className="text-xs text-gray-500">
                      {campaign.city === 'all' ? 'All Cities' : campaign.city}
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded bg-green-500/20 text-green-400 uppercase font-bold">
                    {campaign.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{campaign.invitesSent}</div>
                    <div className="text-[9px] text-gray-500 uppercase">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">{campaign.clicks}</div>
                    <div className="text-[9px] text-gray-500 uppercase">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{campaign.conversions}</div>
                    <div className="text-[9px] text-gray-500 uppercase">Joins</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoInviteSystem;
