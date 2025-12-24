
import React from 'react';
import { Link } from 'react-router-dom';
import { LocaleLogo } from '../Brand/Logo';

export const Footer = () => (
  <footer className="bg-carbon-900 border-t border-carbon-800 pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      <div className="space-y-4">
        <LocaleLogo />
        <p className="text-gray-500 text-sm leading-relaxed">
          Empowering communities through technology. From Garage to Global, we provide the infrastructure for the next generation of workforce networking.
        </p>
        {/* Made in PLR Badge */}
        <div className="pt-4 flex items-center gap-2">
          <img src="/assets/locale-icon.png" alt="Locale" className="h-8 w-8 opacity-80" />
          <span className="text-gray-500 text-xs">Made in PLR</span>
        </div>
      </div>
      
      <div>
        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Platform</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><Link to="/explore" className="hover:text-locale-blue transition-colors">Find Talent</Link></li>
          <li><Link to="/localator" className="hover:text-locale-blue transition-colors">Localator Calculator</Link></li>
          <li><Link to="/pricing" className="hover:text-locale-blue transition-colors">Pro Access <span className="text-[10px] bg-locale-blue text-white px-1 rounded ml-1">NEW</span></Link></li>
          <li><Link to="/enterprise" className="hover:text-locale-blue transition-colors">Enterprise</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal & Trust</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><Link to="/legal/privacy" className="hover:text-locale-blue transition-colors">Privacy Policy</Link></li>
          <li><Link to="/legal/terms" className="hover:text-locale-blue transition-colors">Terms of Service</Link></li>
          <li><Link to="/legal/safety" className="hover:text-locale-blue transition-colors">Community Safety</Link></li>
          <li><Link to="/verification" className="hover:text-locale-blue transition-colors">Verification Standards</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Connect</h4>
        <div className="flex gap-4 mb-4">
          {/* Social Links */}
          <a href="https://x.com/achievemor" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-carbon-800 rounded flex items-center justify-center text-gray-400 hover:bg-locale-blue hover:text-white transition-colors cursor-pointer" aria-label="X/Twitter">
            X
          </a>
          <a href="https://linkedin.com/company/achievemor" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-carbon-800 rounded flex items-center justify-center text-gray-400 hover:bg-locale-blue hover:text-white transition-colors cursor-pointer" aria-label="LinkedIn">
            In
          </a>
          <a href="https://instagram.com/achievemor" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-carbon-800 rounded flex items-center justify-center text-gray-400 hover:bg-locale-blue hover:text-white transition-colors cursor-pointer" aria-label="Instagram">
            Ig
          </a>
        </div>
        <p className="text-xs text-gray-600 mb-2">
          Available on iOS and Android.
        </p>
        <div className="flex gap-2">
          <a href="#" className="text-xs text-gray-500 hover:text-white">App Store</a>
          <span className="text-gray-700">|</span>
          <a href="#" className="text-xs text-gray-500 hover:text-white">Google Play</a>
        </div>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-carbon-800 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-xs text-gray-600">Locale by: ACHIEVEMOR &copy; 2025. All rights reserved.</p>
      <div className="flex gap-4 text-xs text-gray-600">
        <span>Made in PLR</span>
        <span>•</span>
        <Link to="/explore/garage-to-global" className="hover:text-locale-blue transition-colors underline">Garage to Global</Link>
      </div>
    </div>
  </footer>
);
