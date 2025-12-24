
import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-carbon-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-locale-blue/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-5xl w-full relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Choose Your Path</h1>
          <p className="text-xl text-gray-400">Join the Locale ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Client Path */}
          <div className="group relative bg-carbon-800 border border-carbon-700 hover:border-locale-blue rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
            <div className="w-16 h-16 bg-locale-blue/10 rounded-2xl flex items-center justify-center mb-6 text-locale-blue group-hover:bg-locale-blue group-hover:text-white transition-colors">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">I need a Solution</h2>
            <p className="text-gray-400 mb-8 flex-grow">
              Sign up as a <strong>Client</strong> to post jobs, hire verified talent, and use our AI tools to manage your projects.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-green-500">✓</span> Access to Talent Pool
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-green-500">✓</span> AI Project Management Tools
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-green-500">✓</span> <strong>15% Discount</strong> on Expert Help
              </div>
            </div>

            <Link to="/signup?role=client" className="w-full py-4 bg-carbon-700 hover:bg-locale-blue text-white font-bold rounded-xl text-center transition-colors">
              Join as Client
            </Link>
          </div>

          {/* Partner Path */}
          <div className="group relative bg-carbon-800 border border-carbon-700 hover:border-purple-500 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">I am an Expert</h2>
            <p className="text-gray-400 mb-8 flex-grow">
              Sign up as a <strong>Partner</strong> to offer services, use AI delivery tools, and grow from Garage to Global.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-purple-500">✓</span> Verified "Partner" Badge
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-purple-500">✓</span> Access to AI Solution Suite
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <span className="text-purple-500">✓</span> Lower Platform Fees
              </div>
            </div>

            <Link to="/signup?role=partner_setup" className="w-full py-4 bg-carbon-700 hover:bg-purple-600 text-white font-bold rounded-xl text-center transition-colors">
              Apply as Partner
            </Link>
          </div>

        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          Already have an account? <Link to="/dashboard" className="text-white underline underline-offset-4 hover:text-locale-blue">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
