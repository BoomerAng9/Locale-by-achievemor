/**
 * LeftSidebar - OpenAI-style Left Navigation
 * Fixed sidebar with collapsible design and comprehensive navigation
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LocaleLogo } from '../Brand/Logo';

interface NavItem {
  id: string;
  label: string;
  initials: string;
  path: string;
  children?: { label: string; path: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', initials: 'HM', path: '/' },
  { 
    id: 'explore', 
    label: 'Explore', 
    initials: 'EX',
    path: '/explore',
    children: [
      { label: 'All Categories', path: '/categories' },
      { label: 'Garage to Global', path: '/garage-to-global' },
    ]
  },
  { 
    id: 'tools', 
    label: 'Tools', 
    initials: 'TL',
    path: '/tools',
    children: [
      { label: 'Localator', path: '/localator' },
      { label: 'Token Estimator', path: '/estimator' },
      { label: 'Video Generator', path: '/video' },
      { label: 'Voice Setup', path: '/voice' },
      { label: 'AI Chat', path: '/chat' },
      { label: 'BARS Composer', path: '/bars' },
      { label: 'Pipeline', path: '/pipeline' },
      { label: 'Playground', path: '/playground' },
    ]
  },
  { 
    id: 'partners', 
    label: 'For Partners', 
    initials: 'PT',
    path: '/register',
    children: [
      { label: 'Partner Program', path: '/partner-program' },
      { label: 'Register', path: '/register' },
    ]
  },
  { 
    id: 'pro', 
    label: 'Pro Access', 
    initials: 'PR',
    path: '/pricing',
    children: [
      { label: 'Pricing', path: '/pricing' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Profile', path: '/profile/customize' },
    ]
  },
  { 
    id: 'about', 
    label: 'About', 
    initials: 'AB',
    path: '/about',
    children: [
      { label: 'Overview', path: '/about' },
      { label: 'AI Technology', path: '/about/ai-intro' },
    ]
  },
];

const ADMIN_ITEMS: NavItem[] = [
  { 
    id: 'admin', 
    label: 'Admin', 
    initials: 'AD',
    path: '/admin',
    children: [
      { label: 'Control Panel', path: '/admin/control-panel' },
      { label: 'Circuit Box', path: '/admin/circuit-box' },
      { label: 'System Logs', path: '/admin/logs' },
      { label: 'Settings', path: '/admin/settings' },
    ]
  },
];

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onToggle, isAdmin = true }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['tools']); // Default expand tools

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (item: NavItem) => {
    if (isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return false;
  };

  const allItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;

  return (
    <>
      {/* Mobile Sidebar - Fixed overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onToggle} />
        <aside className={`absolute left-0 top-0 h-full w-64 bg-carbon-900 border-r border-carbon-700 flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Mobile Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-carbon-700">
            <Link to="/" onClick={onToggle}><LocaleLogo className="h-7" /></Link>
            <button onClick={onToggle} className="p-2 text-gray-400 hover:text-white" title="Close menu" aria-label="Close sidebar menu">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {/* Mobile Nav Items */}
          <nav className="flex-1 overflow-y-auto divide-y divide-carbon-700">
            {allItems.map(item => (
              <div key={item.id}>
                <Link to={item.path} onClick={() => !item.children && onToggle()} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-carbon-800">
                  <span className="w-8 h-8 rounded border border-carbon-700 bg-carbon-800 flex items-center justify-center text-xs font-mono font-bold">{item.initials}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
                {item.children && (
                  <div className="bg-carbon-950 border-t border-carbon-800">
                    {item.children.map(child => (
                      <Link key={child.path} to={child.path} onClick={onToggle} className="block px-12 py-2 text-xs text-gray-500 hover:text-white hover:bg-carbon-800">{child.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
      </div>

      {/* Desktop Sidebar - Static, participates in flex layout */}
      <aside 
        className={`hidden lg:flex flex-col bg-carbon-900 border-r border-carbon-700 transition-all duration-300 flex-shrink-0 ${
          isOpen ? 'w-64' : 'w-20'
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-carbon-700 flex-shrink-0">
          {isOpen ? (
            <Link to="/" className="flex items-center group">
              <LocaleLogo className="h-8 transition-transform group-hover:scale-105" />
            </Link>
          ) : (
            <Link to="/" className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-locale-blue to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                L
              </div>
            </Link>
          )}
          
          {/* Collapse Button (Desktop) */}
          <button 
            onClick={onToggle}
            className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-white hover:bg-carbon-800 transition-colors"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg className={`w-5 h-5 transition-transform ${isOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-0 px-0">
          <div className="divide-y divide-carbon-700 border-y border-carbon-700">
            {allItems.map((item) => (
              <div key={item.id} className="bg-carbon-900">
                {/* Main Item */}
                <div className="flex items-center">
                  <Link
                    to={item.path}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 transition-all text-sm ${
                      isParentActive(item)
                        ? 'bg-locale-blue/10 text-white border-l-2 border-locale-blue'
                        : 'text-gray-400 hover:text-white hover:bg-carbon-800'
                    }`}
                  >
                    <span className="w-8 h-8 rounded border border-carbon-700 bg-carbon-800 flex items-center justify-center text-xs font-mono font-bold text-gray-400">{item.initials}</span>
                    {isOpen && (
                      <span className="font-medium truncate">{item.label}</span>
                    )}
                  </Link>
                  
                  {/* Expand Arrow */}
                  {isOpen && item.children && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="p-2 text-gray-500 hover:text-white transition-colors"
                      title={`Expand ${item.label}`}
                      aria-label={`Expand ${item.label} submenu`}
                    >
                      <svg 
                        className={`w-4 h-4 transition-transform ${expandedItems.includes(item.id) ? 'rotate-90' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Children (Subpages) */}
                {isOpen && item.children && expandedItems.includes(item.id) && (
                  <div className="bg-carbon-950 border-t border-carbon-800">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center gap-2 px-6 py-2.5 text-xs transition-all border-b border-carbon-800 last:border-0 ${
                          location.pathname === child.path
                            ? 'text-locale-blue bg-locale-blue/5 font-medium border-l-2 border-l-locale-blue'
                            : 'text-gray-500 hover:text-white hover:bg-carbon-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-carbon-600"></span>
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer - User Section */}
        {isOpen && (
          <div className="p-3 border-t border-carbon-700 flex-shrink-0">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-carbon-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-locale-blue to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                U
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white font-medium truncate">User</div>
                <div className="text-xs text-gray-500">Free Plan</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-6 left-4 z-50 lg:hidden p-2 rounded-lg bg-carbon-800 border border-carbon-700 text-white"
        aria-label="Toggle menu"
        title="Toggle navigation menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </>
  );
};

export default LeftSidebar;
