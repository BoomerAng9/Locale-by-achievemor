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
  icon: string;
  path: string;
  children?: { label: string; path: string; icon?: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/' },
  { 
    id: 'explore', 
    label: 'Explore', 
    icon: '🔍', 
    path: '/explore',
    children: [
      { label: 'All Categories', path: '/categories', icon: '📂' },
      { label: 'Garage to Global', path: '/garage-to-global', icon: '🚀' },
    ]
  },
  { 
    id: 'tools', 
    label: 'Tools', 
    icon: '🛠️', 
    path: '/tools',
    children: [
      { label: 'Localator', path: '/localator', icon: '📍' },
      { label: 'Token Estimator', path: '/estimator', icon: '🔢' },
      { label: 'Video Generator', path: '/video', icon: '🎬' },
      { label: 'Voice Setup', path: '/voice', icon: '🎤' },
      { label: 'AI Chat', path: '/chat', icon: '💬' },
      { label: 'BARS Composer', path: '/bars', icon: '🎵' },
      { label: 'Pipeline', path: '/pipeline', icon: '⚡' },
      { label: 'Playground', path: '/playground', icon: '🧪' },
    ]
  },
  { 
    id: 'partners', 
    label: 'For Partners', 
    icon: '🤝', 
    path: '/register',
    children: [
      { label: 'Partner Program', path: '/partner-program', icon: '📋' },
      { label: 'Register', path: '/register', icon: '✍️' },
    ]
  },
  { 
    id: 'pro', 
    label: 'Pro Access', 
    icon: '⭐', 
    path: '/pricing',
    children: [
      { label: 'Pricing', path: '/pricing', icon: '💰' },
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Profile', path: '/profile/customize', icon: '👤' },
    ]
  },
  { 
    id: 'about', 
    label: 'About', 
    icon: 'ℹ️', 
    path: '/about',
    children: [
      { label: 'Overview', path: '/about', icon: '📄' },
      { label: 'AI Technology', path: '/about/ai-intro', icon: '🤖' },
    ]
  },
];

const ADMIN_ITEMS: NavItem[] = [
  { 
    id: 'admin', 
    label: 'Admin', 
    icon: '⚙️', 
    path: '/admin',
    children: [
      { label: 'Control Panel', path: '/admin/control-panel', icon: '🎛️' },
      { label: 'Circuit Box', path: '/admin/circuit-box', icon: '🔌' },
      { label: 'System Logs', path: '/admin/logs', icon: '📜' },
      { label: 'Settings', path: '/admin/settings', icon: '⚙️' },
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
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-carbon-900 border-r border-carbon-700 z-50 transition-all duration-300 flex flex-col ${
          isOpen ? 'w-64' : 'w-0 lg:w-16'
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
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {allItems.map((item) => (
              <div key={item.id}>
                {/* Main Item */}
                <div className="flex items-center">
                  <Link
                    to={item.path}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                      isParentActive(item)
                        ? 'bg-locale-blue/10 text-white border-l-2 border-locale-blue'
                        : 'text-gray-400 hover:text-white hover:bg-carbon-800'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{item.icon}</span>
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
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-carbon-700 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                          location.pathname === child.path
                            ? 'text-locale-blue bg-locale-blue/5 font-medium'
                            : 'text-gray-500 hover:text-white hover:bg-carbon-800'
                        }`}
                      >
                        {child.icon && <span className="text-sm">{child.icon}</span>}
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
