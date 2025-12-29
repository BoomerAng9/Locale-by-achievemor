import React, { useState } from 'react';
import WorkspaceLayout from './WorkspaceLayout';
import AcheevyChat from '../chat/AcheevyChat';

/**
 * ClientWorkspace - Dashboard for Clients (Customers)
 * 
 * Binge Code Phase: DEVELOP (Cycle 1)
 * Agent: CodeAng
 * 
 * Features:
 * - Find and hire talent
 * - Access AI tools (Plugs)
 * - Manage active projects
 * - View transaction history
 */
const ClientWorkspace: React.FC = () => {
  return (
    <WorkspaceLayout role="client" userName="Demo Client">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-locale-blue/20 to-purple-500/20 rounded-2xl p-8 border border-locale-blue/30">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400">Find verified professionals or use AI-powered tools to get work done.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Find Talent"
            description="Browse verified professionals in your area"
            icon="🔍"
            href="/explore"
            color="blue"
          />
          <QuickActionCard
            title="AI Tools"
            description="Access ACHEEVY and other AI capabilities"
            icon="🤖"
            href="/chat"
            color="purple"
          />
          <QuickActionCard
            title="New Project"
            description="Start a new project with escrow protection"
            icon="📁"
            href="/book"
            color="green"
          />
        </div>

        {/* Active Projects */}
        <div className="bg-carbon-800/50 rounded-2xl border border-carbon-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Active Projects</h3>
            <span className="text-sm text-gray-500">3 in progress</span>
          </div>
          
          <div className="space-y-4">
            <ProjectRow 
              title="Website Redesign"
              partner="Alex T."
              status="in-progress"
              amount={450}
            />
            <ProjectRow 
              title="Data Analysis Report"
              partner="ACHEEVY AI"
              status="pending-review"
              amount={75}
            />
            <ProjectRow 
              title="Logo Design"
              partner="Maria S."
              status="in-progress"
              amount={200}
            />
          </div>
        </div>

        {/* Refund Guarantee Banner */}
        <div className="bg-carbon-800/30 rounded-2xl border border-carbon-700/50 p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">💰</span>
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">Refund Guarantee Active</h4>
            <p className="text-gray-400 text-sm">
              1/3 of every AI task is held in reserve. If our AI hallucinates, you get a full refund.
            </p>
          </div>
        </div>

        {/* ACHEEVY Chat Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Chat with ACHEEVY</h3>
            <span className="text-xs text-gray-500">AI-powered assistant with refund guarantee</span>
          </div>
          <AcheevyChat embedded />
        </div>
      </div>
    </WorkspaceLayout>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: 'blue' | 'purple' | 'green';
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon, href, color }) => {
  const colorClasses = {
    blue: 'hover:border-locale-blue/50 hover:shadow-locale-blue/10',
    purple: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
    green: 'hover:border-green-500/50 hover:shadow-green-500/10',
  };

  return (
    <a
      href={`#${href}`}
      className={`block p-6 rounded-2xl bg-carbon-800/50 border border-carbon-700 transition-all hover:shadow-xl ${colorClasses[color]}`}
    >
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="text-white font-bold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </a>
  );
};

interface ProjectRowProps {
  title: string;
  partner: string;
  status: 'in-progress' | 'pending-review' | 'completed';
  amount: number;
}

const ProjectRow: React.FC<ProjectRowProps> = ({ title, partner, status, amount }) => {
  const statusConfig = {
    'in-progress': { label: 'In Progress', color: 'text-locale-blue bg-locale-blue/20' },
    'pending-review': { label: 'Pending Review', color: 'text-yellow-500 bg-yellow-500/20' },
    'completed': { label: 'Completed', color: 'text-green-500 bg-green-500/20' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-carbon-900/50 border border-carbon-700/50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-carbon-700 flex items-center justify-center">
          <span className="text-white font-bold">{partner.charAt(0)}</span>
        </div>
        <div>
          <p className="text-white font-medium">{title}</p>
          <p className="text-gray-500 text-sm">{partner}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
        <span className="text-white font-mono">${amount}</span>
      </div>
    </div>
  );
};

export default ClientWorkspace;
