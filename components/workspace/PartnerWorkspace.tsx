import React from 'react';
import WorkspaceLayout from './WorkspaceLayout';
import AcheevyChat from '../chat/AcheevyChat';

/**
 * PartnerWorkspace - Dashboard for Partners (Service Providers)
 * 
 * Binge Code Phase: DEVELOP (Cycle 1)
 * Agent: CodeAng
 * 
 * Features:
 * - View and manage jobs
 * - Access AI capabilities (Intelligent Internet)
 * - Track earnings with profit ledger
 * - Garage to Global progression
 */
const PartnerWorkspace: React.FC = () => {
  return (
    <WorkspaceLayout role="partner" userName="Demo Partner">
      <div className="space-y-8">
        {/* Welcome + Stage Progress */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-8 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Partner Dashboard</h2>
              <p className="text-gray-400">Deliver work, leverage AI capabilities, grow your business.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Stage</p>
              <p className="text-2xl font-bold text-purple-400">COMMUNITY</p>
            </div>
          </div>

          {/* Progression Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Garage</span>
              <span>Community</span>
              <span>Global</span>
            </div>
            <div className="h-2 bg-carbon-900 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard label="This Month" value="$2,340" change="+12%" positive />
          <StatCard label="Active Jobs" value="5" />
          <StatCard label="Completion Rate" value="98%" />
          <StatCard label="Reserve Balance" value="$156" info="Refund protection" />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-carbon-800/50 rounded-2xl border border-carbon-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>⚡</span> AI Capabilities
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Use these tools freely to deliver work faster. Powered by Intelligent Internet.
            </p>
            <div className="space-y-3">
              <CapabilityRow name="Deep Research" description="II-Researcher" status="active" />
              <CapabilityRow name="Automated Filing" description="II-Agent" status="active" />
              <CapabilityRow name="Content Generation" description="ACHEEVY" status="active" />
              <CapabilityRow name="Code Assistance" description="CodeAng" status="active" />
            </div>
          </div>

          <div className="bg-carbon-800/50 rounded-2xl border border-carbon-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>💼</span> Active Jobs
            </h3>
            <div className="space-y-3">
              <JobRow 
                client="Tech Startup Inc."
                task="API Integration"
                deadline="2 days"
                value={800}
              />
              <JobRow 
                client="Local Restaurant"
                task="Website Update"
                deadline="5 days"
                value={350}
              />
              <JobRow 
                client="Consulting Firm"
                task="Data Analysis"
                deadline="Today"
                value={200}
                urgent
              />
            </div>
          </div>
        </div>

        {/* Profit Ledger Preview */}
        <div className="bg-carbon-800/50 rounded-2xl border border-carbon-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Profit Ledger</h3>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-widest border-b border-carbon-700">
                  <th className="pb-3">Task</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Cost</th>
                  <th className="pb-3">Billed</th>
                  <th className="pb-3">Reserve</th>
                  <th className="pb-3">Net</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <LedgerRow task="Research Report" model="Gemini 2.5" cost={0.08} billed={0.24} reserve={0.05} net={0.11} status="success" />
                <LedgerRow task="Content Draft" model="Claude 3.5" cost={0.12} billed={0.36} reserve={0.08} net={0.16} status="success" />
                <LedgerRow task="Data Extraction" model="DeepSeek R1" cost={0.03} billed={0.09} reserve={0.02} net={0.04} status="success" />
              </tbody>
            </table>
          </div>
        </div>

        {/* Partner Chat Access */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">ACHEEVY Assistant</h3>
            <span className="text-xs text-gray-500">Use AI to help deliver work faster</span>
          </div>
          <AcheevyChat embedded />
        </div>
      </div>
    </WorkspaceLayout>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  info?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, positive, info }) => (
  <div className="bg-carbon-800/50 rounded-2xl border border-carbon-700 p-6">
    <p className="text-gray-500 text-sm mb-2">{label}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
    {change && (
      <p className={`text-sm mt-2 ${positive ? 'text-green-500' : 'text-red-500'}`}>
        {change} from last month
      </p>
    )}
    {info && <p className="text-xs text-gray-500 mt-2">{info}</p>}
  </div>
);

interface CapabilityRowProps {
  name: string;
  description: string;
  status: 'active' | 'locked';
}

const CapabilityRow: React.FC<CapabilityRowProps> = ({ name, description, status }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-carbon-900/50 border border-carbon-700/50">
    <div>
      <p className="text-white font-medium">{name}</p>
      <p className="text-gray-500 text-xs">{description}</p>
    </div>
    <div className={`w-3 h-3 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
  </div>
);

interface JobRowProps {
  client: string;
  task: string;
  deadline: string;
  value: number;
  urgent?: boolean;
}

const JobRow: React.FC<JobRowProps> = ({ client, task, deadline, value, urgent }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl border ${urgent ? 'bg-red-500/10 border-red-500/30' : 'bg-carbon-900/50 border-carbon-700/50'}`}>
    <div>
      <p className="text-white font-medium">{task}</p>
      <p className="text-gray-500 text-sm">{client}</p>
    </div>
    <div className="text-right">
      <p className="text-white font-mono">${value}</p>
      <p className={`text-xs ${urgent ? 'text-red-400' : 'text-gray-500'}`}>{deadline}</p>
    </div>
  </div>
);

interface LedgerRowProps {
  task: string;
  model: string;
  cost: number;
  billed: number;
  reserve: number;
  net: number;
  status: 'success' | 'refunded';
}

const LedgerRow: React.FC<LedgerRowProps> = ({ task, model, cost, billed, reserve, net, status }) => (
  <tr className="border-b border-carbon-700/50">
    <td className="py-3 text-white">{task}</td>
    <td className="py-3 text-gray-400 font-mono text-xs">{model}</td>
    <td className="py-3 text-red-400 font-mono">${cost.toFixed(2)}</td>
    <td className="py-3 text-white font-mono">${billed.toFixed(2)}</td>
    <td className="py-3 text-yellow-400 font-mono">${reserve.toFixed(2)}</td>
    <td className="py-3 text-green-400 font-mono">${net.toFixed(2)}</td>
    <td className="py-3">
      <span className={`px-2 py-1 rounded text-xs ${status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {status}
      </span>
    </td>
  </tr>
);

export default PartnerWorkspace;
