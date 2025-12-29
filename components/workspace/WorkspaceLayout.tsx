import React from 'react';
import { Link } from 'react-router-dom';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  role: 'client' | 'partner';
  userName?: string;
}

/**
 * WorkspaceLayout - Shared layout for Client and Partner workspaces
 * 
 * Binge Code Phase: DEVELOP (Cycle 1)
 * Agent: CodeAng
 * 
 * Features:
 * - Glassmorphism sidebar (Apple Glass aesthetic)
 * - Role-based navigation
 * - Circuit Box access (settings)
 */
const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({ 
  children, 
  role, 
  userName = 'User' 
}) => {
  const navItems = role === 'partner' ? [
    { label: 'Dashboard', href: '/workspace/partner', icon: '📊' },
    { label: 'Jobs', href: '/workspace/partner/jobs', icon: '💼' },
    { label: 'Earnings', href: '/workspace/partner/earnings', icon: '💰' },
    { label: 'Capabilities', href: '/workspace/partner/capabilities', icon: '⚡' },
    { label: 'Circuit Box', href: '/circuit-box', icon: '⚙️' },
  ] : [
    { label: 'Dashboard', href: '/workspace/client', icon: '📊' },
    { label: 'Find Talent', href: '/explore', icon: '🔍' },
    { label: 'My Projects', href: '/workspace/client/projects', icon: '📁' },
    { label: 'AI Tools', href: '/workspace/client/tools', icon: '🤖' },
    { label: 'Settings', href: '/circuit-box', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-carbon-900 flex">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-72 fixed inset-y-0 left-0 bg-carbon-800/50 backdrop-blur-2xl border-r border-carbon-700/50 flex flex-col z-50">
        {/* Logo Area */}
        <div className="p-6 border-b border-carbon-700/50">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-locale-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <p className="text-white font-bold tracking-tight">LOCALE</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                {role === 'partner' ? 'Partner Portal' : 'Client Portal'}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-carbon-700/50 transition-all group"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-carbon-700/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-carbon-700 flex items-center justify-center">
              <span className="text-white font-bold">{userName.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 bg-carbon-900/80 backdrop-blur-xl border-b border-carbon-800 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-white">
              {role === 'partner' ? 'Partner Workspace' : 'Client Workspace'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Health Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-carbon-800 border border-carbon-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-400 font-mono">SYSTEM HEALTHY</span>
            </div>

            {/* Notifications */}
            <button 
              title="Notifications"
              className="w-10 h-10 rounded-xl bg-carbon-800 border border-carbon-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-carbon-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default WorkspaceLayout;
