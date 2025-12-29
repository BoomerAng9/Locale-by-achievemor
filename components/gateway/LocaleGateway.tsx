import React from 'react';
import { Link } from 'react-router-dom';
import { LocaleLogo } from '../Brand/Logo';

interface GatewayCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  accentColor: 'blue' | 'purple';
}

const GatewayCard: React.FC<GatewayCardProps> = ({ 
  title, 
  subtitle, 
  description, 
  icon, 
  href, 
  accentColor 
}) => {
  const colorClasses = {
    blue: {
      border: 'hover:border-locale-blue/50',
      glow: 'group-hover:shadow-locale-blue/20',
      icon: 'bg-locale-blue/10 text-locale-blue group-hover:bg-locale-blue group-hover:text-white',
      button: 'bg-locale-blue hover:bg-locale-darkBlue'
    },
    purple: {
      border: 'hover:border-purple-500/50',
      glow: 'group-hover:shadow-purple-500/20',
      icon: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
      button: 'bg-purple-600 hover:bg-purple-700'
    }
  };

  const colors = colorClasses[accentColor];

  return (
    <Link 
      to={href}
      className={`group relative flex flex-col p-10 rounded-3xl border border-carbon-700 bg-carbon-800/50 backdrop-blur-xl transition-all duration-500 ${colors.border} ${colors.glow} hover:shadow-2xl hover:-translate-y-1`}
    >
      {/* Icon */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-300 ${colors.icon}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="mb-8">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">{subtitle}</p>
        <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-400 text-lg leading-relaxed">{description}</p>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        <span className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all ${colors.button}`}>
          Enter Gateway
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`absolute inset-0 rounded-bl-[100px] ${accentColor === 'blue' ? 'bg-locale-blue' : 'bg-purple-500'}`}></div>
      </div>
    </Link>
  );
};

/**
 * LocaleGateway - The dual-entry system for Locale by ACHIEVEMOR
 * 
 * Binge Code Phase: DEVELOP (Cycle 1)
 * Agent: CodeAng
 * 
 * This is the fortress entry point where users choose their path:
 * - Client Gateway: For users hiring talent or using AI tools
 * - Partner Gateway: For service providers delivering work
 */
const LocaleGateway: React.FC = () => {
  return (
    <div className="min-h-screen bg-carbon-900 flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b border-carbon-800">
        <Link to="/" className="inline-flex items-center gap-3">
          <LocaleLogo />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          {/* Title Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
              LOCALE GATEWAY
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose your path. Build your infrastructure.
            </p>
          </div>

          {/* Gateway Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            <GatewayCard
              title="Client Access"
              subtitle="I need services"
              description="Hire verified professionals, access AI-powered tools, and manage projects with escrow protection."
              accentColor="blue"
              href="/workspace/client"
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <GatewayCard
              title="Partner Access"
              subtitle="I offer services"
              description="Deliver work to clients, leverage AI capabilities in your workspace, and grow from garage to global."
              accentColor="purple"
              href="/workspace/partner"
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Escrow Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-locale-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Verified Partners</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Refund Guarantee</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-carbon-800 text-center text-sm text-gray-500">
        <p>© 2025 ACHIEVEMOR. Think It. Prompt It. Binge It.</p>
      </footer>
    </div>
  );
};

export default LocaleGateway;
