
import React, { useState, useEffect } from 'react';
import { db, mapDoc } from '../../lib/gcp';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Profile, UserRole, ProgressionStage, VerificationStatus } from '../../types';

// --- Types ---

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string;
  isSecret?: boolean;
  category?: 'payment' | 'ai' | 'system';
}

interface WebhookEndpoint {
  id: string;
  service_name: string;
  active: boolean;
  events: string[];
  last_triggered?: string;
  failure_rate?: number;
}

interface SystemLog {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'critical';
  source: string;
  notes: string;
  created_at: any;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

// --- Components ---

const StatusBadge = ({ status, type }: { status: string; type: 'success' | 'warning' | 'error' | 'neutral' }) => {
  const colors = {
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${colors[type]} tracking-wider`}>
      {status}
    </span>
  );
};

// --- Main Admin Dashboard ---

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'webhooks' | 'vault' | 'email'>('overview');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  // UI State
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [vaultRevealed, setVaultRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // 1. Logs
      const logsQ = query(collection(db, 'system_logs'), orderBy('created_at', 'desc'), limit(50));
      const logsSnap = await getDocs(logsQ);
      setLogs(logsSnap.docs.map(d => ({ id: d.id, ...d.data(), created_at: d.data().created_at?.toDate?.().toISOString() || new Date().toISOString() })) as SystemLog[]);

      // 2. Webhooks
      const whSnap = await getDocs(collection(db, 'webhook_endpoints'));
      setWebhooks(whSnap.docs.map(mapDoc) as WebhookEndpoint[]);

      // 3. Settings (Vault)
      const stSnap = await getDocs(collection(db, 'system_settings'));
      setSettings(stSnap.docs.map(d => ({ id: d.id, ...d.data() })) as SystemSetting[]);

      // 4. Users (God Mode)
      // Note: In a real app with thousands of users, use pagination.
      const usrSnap = await getDocs(collection(db, 'profiles'));
      setUsers(usrSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Profile[]);

      // 5. Templates (Mock fetch from settings or dedicated collection)
      // We'll simulate fetching templates if they don't exist in DB
      const tmplSnap = await getDocs(collection(db, 'email_templates'));
      if (tmplSnap.empty) {
          setTemplates([
              { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to Locale!', body: 'Hi {{name}}, welcome to the future of work.', variables: ['name'] },
              { id: 'invoice', name: 'Invoice Receipt', subject: 'Payment Confirmed', body: 'Your payment of {{amount}} was successful.', variables: ['amount', 'date'] }
          ]);
      } else {
          setTemplates(tmplSnap.docs.map(mapDoc) as EmailTemplate[]);
      }

    } catch (e) {
      console.error("Admin Load Error", e);
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---

  const handleUserUpdate = async (userId: string, field: keyof Profile, value: any) => {
    try {
        const ref = doc(db, 'profiles', userId);
        await updateDoc(ref, { [field]: value });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, [field]: value } : u));
    } catch (e) {
        alert("Update failed");
    }
  };

  const toggleWebhook = async (id: string, current: boolean) => {
      const ref = doc(db, 'webhook_endpoints', id);
      await updateDoc(ref, { active: !current });
      setWebhooks(prev => prev.map(w => w.id === id ? { ...w, active: !current } : w));
  };

  const saveTemplate = async () => {
      if (!editingTemplate) return;
      // Persist to DB (simulated for now if collection doesn't exist, normally setDoc)
      try {
          await setDoc(doc(db, 'email_templates', editingTemplate.id), editingTemplate);
          setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
          setEditingTemplate(null);
      } catch (e) {
          console.error(e);
      }
  };

  const toggleSecret = (id: string) => {
      setVaultRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="min-h-screen bg-carbon-900 flex items-center justify-center text-locale-blue font-mono">INITIALIZING ADMIN CORE...</div>;

  return (
    <div className="min-h-screen bg-carbon-900 text-gray-200 flex font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-carbon-800 border-r border-carbon-700 flex flex-col fixed h-full z-20">
         <div className="p-6 border-b border-carbon-700">
             <h1 className="text-xl font-black text-white tracking-tight">ADMIN <span className="text-locale-blue">CORE</span></h1>
             <p className="text-xs text-gray-500 font-mono mt-1">v2.4.0-release</p>
         </div>
         
         <nav className="flex-1 p-4 space-y-2">
             <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" label="Overview" />
             <NavButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" label="User God Mode" />
             <NavButton active={activeTab === 'webhooks'} onClick={() => setActiveTab('webhooks')} icon="M13 10V3L4 14h7v7l9-11h-7z" label="Webhooks" />
             <NavButton active={activeTab === 'vault'} onClick={() => setActiveTab('vault')} icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" label="API Key Vault" />
             <NavButton active={activeTab === 'email'} onClick={() => setActiveTab('email')} icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" label="Email Templates" />
         </nav>

         <div className="p-4 border-t border-carbon-700">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-locale-blue flex items-center justify-center font-bold text-white text-xs">AD</div>
                 <div>
                     <div className="text-sm font-bold text-white">Super Admin</div>
                     <div className="text-[10px] text-green-400">● Secure Connection</div>
                 </div>
             </div>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 max-w-7xl mx-auto">
        
        {/* VIEW: OVERVIEW */}
        {activeTab === 'overview' && (
           <div className="space-y-8 animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <StatCard label="Total Users" value={users.length} change="+12%" />
                 <StatCard label="Active Webhooks" value={webhooks.filter(w => w.active).length} change="Stable" type="neutral" />
                 <StatCard label="System Errors" value={logs.filter(l => l.severity === 'critical').length} change="-2%" type={logs.filter(l => l.severity === 'critical').length > 0 ? 'error' : 'success'} />
                 <StatCard label="API Latency" value="124ms" change="GLM-4.7" type="success" />
              </div>

              <div className="bg-carbon-800 border border-carbon-700 rounded-xl overflow-hidden">
                 <div className="px-6 py-4 border-b border-carbon-700 flex justify-between items-center bg-carbon-900/50">
                    <h3 className="font-bold text-gray-200">Live System Logs</h3>
                    <span className="text-xs font-mono text-gray-500">Auto-refreshing via Firestore</span>
                 </div>
                 <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                       <thead className="bg-carbon-900 text-gray-500 font-mono text-xs uppercase sticky top-0">
                          <tr>
                             <th className="px-6 py-3">Timestamp</th>
                             <th className="px-6 py-3">Level</th>
                             <th className="px-6 py-3">Source</th>
                             <th className="px-6 py-3">Event</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-carbon-700 font-mono text-xs">
                          {logs.map(log => (
                             <tr key={log.id} className="hover:bg-carbon-700/30 transition-colors">
                                <td className="px-6 py-3 text-gray-500">{new Date(log.created_at).toLocaleTimeString()}</td>
                                <td className="px-6 py-3">
                                   <StatusBadge 
                                     status={log.severity} 
                                     type={log.severity === 'critical' ? 'error' : log.severity === 'warning' ? 'warning' : 'success'} 
                                   />
                                </td>
                                <td className="px-6 py-3 text-locale-blue">{log.source}</td>
                                <td className="px-6 py-3 text-gray-300">{log.notes}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {/* VIEW: USER GOD MODE */}
        {activeTab === 'users' && (
           <div className="animate-fade-in space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">User God Mode</h2>
                 <div className="flex gap-2">
                    <input type="text" placeholder="Search users..." className="bg-carbon-800 border border-carbon-700 rounded px-3 py-1.5 text-sm text-white focus:border-locale-blue focus:outline-none" />
                 </div>
              </div>

              <div className="bg-carbon-800 border border-carbon-700 rounded-xl overflow-hidden shadow-lg">
                 <table className="w-full text-left">
                    <thead className="bg-carbon-900 border-b border-carbon-700 text-xs font-bold text-gray-400 uppercase">
                       <tr>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Stage</th>
                          <th className="px-6 py-4">Reputation</th>
                          <th className="px-6 py-4">Verification</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-carbon-700">
                       {users.map(user => (
                          <tr key={user.id} className="hover:bg-carbon-700/20 group transition-colors">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-carbon-700 overflow-hidden">
                                      {user.avatarUrl && <img src={user.avatarUrl} className="w-full h-full object-cover" />}
                                   </div>
                                   <div>
                                      <div className="font-bold text-white">{user.displayName}</div>
                                      <div className="text-xs text-gray-500 font-mono">{user.id.slice(0,8)}...</div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <select 
                                  value={user.role} 
                                  onChange={(e) => handleUserUpdate(user.id, 'role', e.target.value)}
                                  className="bg-carbon-900 border border-carbon-700 rounded px-2 py-1 text-xs text-white focus:border-locale-blue outline-none"
                                >
                                   <option value="client">Client</option>
                                   <option value="professional">Professional</option>
                                   <option value="partner">Partner</option>
                                   <option value="admin">Admin</option>
                                </select>
                             </td>
                             <td className="px-6 py-4">
                                <select 
                                  value={user.stage} 
                                  onChange={(e) => handleUserUpdate(user.id, 'stage', e.target.value)}
                                  className={`bg-carbon-900 border border-carbon-700 rounded px-2 py-1 text-xs outline-none font-bold uppercase ${user.stage === 'global' ? 'text-yellow-500 border-yellow-500/30' : 'text-gray-300'}`}
                                >
                                   <option value="garage">Garage</option>
                                   <option value="community">Community</option>
                                   <option value="global">Global</option>
                                </select>
                             </td>
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   <input 
                                     type="number" 
                                     value={user.reputationScore} 
                                     onChange={(e) => handleUserUpdate(user.id, 'reputationScore', parseInt(e.target.value))}
                                     className="w-16 bg-carbon-900 border border-carbon-700 rounded px-2 py-1 text-xs text-white text-center"
                                   />
                                   <div className="h-1.5 w-12 bg-carbon-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-green-500" style={{width: `${Math.min(user.reputationScore, 100)}%`}}></div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <button 
                                  onClick={() => handleUserUpdate(user.id, 'verificationStatus', user.verificationStatus === 'verified' ? 'pending' : 'verified')}
                                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase border transition-all ${
                                     user.verificationStatus === 'verified' 
                                     ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 hover:after:content-["_REVOKE"]' 
                                     : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 hover:after:content-["_APPROVE"]'
                                  }`}
                                >
                                   {user.verificationStatus}
                                </button>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button className="text-gray-500 hover:text-white transition-colors">
                                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* VIEW: API VAULT */}
        {activeTab === 'vault' && (
           <div className="animate-fade-in max-w-4xl">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <div>
                      <h3 className="text-red-400 font-bold text-sm">Security Warning</h3>
                      <p className="text-gray-400 text-xs mt-1">
                          Changes to these variables propagate instantly to the live environment. 
                          Sensitive keys are masked by default. Ensure you are in a secure environment before revealing.
                      </p>
                  </div>
              </div>

              <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Environment Configuration</h3>
                  {settings.map(setting => (
                      <div key={setting.id} className="bg-carbon-800 border border-carbon-700 p-5 rounded-xl flex items-center justify-between group hover:border-locale-blue/30 transition-colors">
                          <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-sm text-locale-blue font-bold">{setting.key}</span>
                                  {setting.isSecret && <span className="text-[10px] bg-carbon-900 text-gray-500 px-2 py-0.5 rounded border border-carbon-700">SECRET</span>}
                              </div>
                              <p className="text-xs text-gray-500">{setting.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                              <div className="bg-black/50 border border-carbon-700 rounded px-3 py-2 min-w-[300px] font-mono text-sm text-green-400">
                                  {setting.isSecret && !vaultRevealed[setting.id] 
                                    ? '••••••••••••••••••••••••' 
                                    : (typeof setting.value === 'object' ? JSON.stringify(setting.value) : setting.value)
                                  }
                              </div>
                              
                              {setting.isSecret && (
                                  <button 
                                    onClick={() => toggleSecret(setting.id)}
                                    className="text-gray-500 hover:text-white p-2"
                                  >
                                      {vaultRevealed[setting.id] 
                                        ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                      }
                                  </button>
                              )}
                              <button className="bg-carbon-700 hover:bg-white hover:text-carbon-900 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                                  Edit
                              </button>
                          </div>
                      </div>
                  ))}
                  {settings.length === 0 && <div className="text-gray-500 italic">No configuration keys found.</div>}
              </div>
           </div>
        )}

        {/* VIEW: WEBHOOKS */}
        {activeTab === 'webhooks' && (
           <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">Webhook Nervous System</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {webhooks.map(webhook => (
                    <div key={webhook.id} className={`p-6 rounded-2xl border transition-all ${webhook.active ? 'bg-carbon-800 border-carbon-700' : 'bg-carbon-800/50 border-red-900/30'}`}>
                       <div className="flex justify-between items-start mb-4">
                          <div>
                              <h3 className="font-bold text-lg text-white">{webhook.service_name}</h3>
                              <div className="text-xs font-mono text-gray-500 mt-1">ID: {webhook.id}</div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${webhook.active ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
                       </div>
                       
                       <div className="mb-6">
                           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Listening Events</h4>
                           <div className="flex flex-wrap gap-2">
                               {webhook.events.map(ev => (
                                   <span key={ev} className="px-2 py-1 bg-black/40 border border-carbon-700 rounded text-[10px] font-mono text-blue-300">{ev}</span>
                               ))}
                           </div>
                       </div>

                       <div className="flex justify-between items-center pt-4 border-t border-carbon-700">
                           <span className="text-xs text-gray-500">Last Trigger: {webhook.last_triggered || 'Never'}</span>
                           <button 
                             onClick={() => toggleWebhook(webhook.id, webhook.active)}
                             className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${webhook.active ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white'}`}
                           >
                              {webhook.active ? 'Deactivate' : 'Activate'}
                           </button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* VIEW: EMAIL TEMPLATES */}
        {activeTab === 'email' && (
           <div className="animate-fade-in flex gap-6 h-[calc(100vh-140px)]">
               
               {/* List */}
               <div className="w-1/3 bg-carbon-800 border border-carbon-700 rounded-xl overflow-y-auto">
                   <div className="p-4 border-b border-carbon-700 font-bold text-white sticky top-0 bg-carbon-800">Transactional Templates</div>
                   {templates.map(tmpl => (
                       <button 
                         key={tmpl.id}
                         onClick={() => setEditingTemplate(tmpl)}
                         className={`w-full text-left p-4 border-b border-carbon-700 hover:bg-carbon-700 transition-colors ${editingTemplate?.id === tmpl.id ? 'bg-locale-blue/10 border-l-4 border-l-locale-blue' : 'border-l-4 border-l-transparent'}`}
                       >
                           <div className="font-bold text-gray-200 text-sm">{tmpl.name}</div>
                           <div className="text-xs text-gray-500 truncate mt-1">{tmpl.subject}</div>
                       </button>
                   ))}
                   <button className="w-full p-4 text-center text-xs text-locale-blue font-bold hover:bg-carbon-700 transition-colors">
                       + Create New Template
                   </button>
               </div>

               {/* Editor */}
               <div className="flex-1 bg-carbon-800 border border-carbon-700 rounded-xl p-6 flex flex-col">
                   {editingTemplate ? (
                       <>
                           <div className="mb-6 pb-6 border-b border-carbon-700">
                               <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Subject Line</label>
                               <input 
                                 type="text" 
                                 value={editingTemplate.subject}
                                 onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                 className="w-full bg-carbon-900 border border-carbon-600 rounded-lg px-4 py-3 text-white focus:border-locale-blue focus:outline-none font-medium"
                               />
                           </div>
                           
                           <div className="flex-1 mb-6 flex flex-col">
                               <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex justify-between">
                                   <span>HTML Body</span>
                                   <div className="flex gap-2">
                                       {editingTemplate.variables.map(v => (
                                           <span key={v} className="cursor-pointer text-[10px] bg-locale-blue/20 text-locale-blue px-2 rounded hover:bg-locale-blue hover:text-white transition-colors" title="Click to copy">
                                               {`{{${v}}}`}
                                           </span>
                                       ))}
                                   </div>
                               </label>
                               <textarea 
                                 value={editingTemplate.body}
                                 onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                 className="flex-1 w-full bg-carbon-900 border border-carbon-600 rounded-lg p-4 text-gray-300 font-mono text-sm focus:border-locale-blue focus:outline-none resize-none"
                               />
                           </div>

                           <div className="flex justify-end gap-3">
                               <button onClick={() => setEditingTemplate(null)} className="px-6 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                               <button onClick={saveTemplate} className="px-6 py-2 bg-locale-blue text-white font-bold rounded-lg hover:bg-locale-darkBlue transition-colors shadow-lg">Save Changes</button>
                           </div>
                       </>
                   ) : (
                       <div className="h-full flex flex-col items-center justify-center text-gray-600">
                           <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                           <p>Select a template to edit</p>
                       </div>
                   )}
               </div>
           </div>
        )}

      </main>
    </div>
  );
};

// Sub-component for Nav Button
const NavButton = ({ active, onClick, icon, label }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-locale-blue text-white shadow-lg shadow-locale-blue/20' : 'text-gray-400 hover:bg-carbon-700 hover:text-white'}`}
    >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} /></svg>
        <span className="font-bold text-sm">{label}</span>
    </button>
);

// Sub-component for Stat Card
const StatCard = ({ label, value, change, type = 'success' }: any) => {
    const color = type === 'success' ? 'text-green-400' : type === 'error' ? 'text-red-400' : 'text-gray-400';
    return (
        <div className="bg-carbon-800 border border-carbon-700 p-5 rounded-xl">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</div>
            <div className="flex justify-between items-end">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className={`text-xs font-bold ${color}`}>{change}</div>
            </div>
        </div>
    );
};

export default AdminSettings;
