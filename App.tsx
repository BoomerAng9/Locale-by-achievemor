
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { LocaleLogo } from './components/Brand/Logo';
import ProfessionalCard from './components/ProfessionalCard';
import Localator from './components/Localator';
import VerificationFlow from './components/verification/VerificationFlow';
import ConciergeBot from './components/common/ConciergeBot';
import { Footer } from './components/Navigation/Footer';
import { useGeoLocation } from './lib/hooks/useGeoLocation';
import { MOCK_PROFILES, MOCK_CATEGORIES } from './lib/constants';
import { Profile } from './types';

// Page Imports
import CategoriesPage from './components/pages/CategoriesPage';
import BookingsPage from './components/pages/BookingsPage';
import ExplorePage from './components/pages/ExplorePage'; 
import AdminSettings from './components/admin/AdminSettings'; 
import ProfileCustomizer from './components/profile/ProfileCustomizer'; 
import PricingPage from './components/pages/PricingPage';
import LocalatorPage from './components/pages/LocalatorPage';
import DashboardPage from './components/pages/DashboardPage';
import RegisterPage from './components/pages/RegisterPage'; 
import SignupPage from './components/pages/SignupPage';
import PartnerProgramPage from './components/pages/PartnerProgramPage';
import AiIntroPage from './components/pages/About/AiIntro';
import TokenEstimatorPage from './components/pages/TokenEstimatorPage';
import CircuitBox from './components/admin/CircuitBox';
import AdminControlPanel from './components/admin/AdminControlPanel';
import AboutPage from './components/pages/AboutPage';
import GarageToGlobalPage from './components/pages/GarageToGlobalPage';
import PlaygroundPage from './components/pages/PlaygroundPage'; 

// --- DATA ENRICHMENT ---
const ENHANCED_PROFILES: Profile[] = MOCK_PROFILES.map((p, i) => ({
  ...p,
  stage: i === 0 ? 'community' : i === 1 ? 'global' : 'garage',
  reputationScore: 85 + i * 2,
  verificationStatus: i < 2 ? 'verified' : 'pending',
  jobsCompleted: 12 + i * 5,
  joinedDate: '2023-01-15'
})) as unknown as Profile[];

const HOME_CATEGORIES = MOCK_CATEGORIES.slice(0, 4).map(c => ({
    id: c.slug,
    name: c.name,
    image: c.imageUrl,
    count: c.activeProfessionals
}));

// --- COMPONENTS ---

const Navbar = ({ locationState, requestLocation }: any) => (
  <nav className="sticky top-0 z-50 glass-panel border-b border-carbon-700 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
      <Link to="/" className="flex items-center group">
        <LocaleLogo className="h-10 transition-transform group-hover:scale-105" />
      </Link>
      
      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-400">
        <Link to="/explore" className="hover:text-white transition-colors tracking-wide">Explore</Link>
        <Link to="/categories" className="hover:text-white transition-colors tracking-wide">Categories</Link>
        <Link to="/localator" className="hover:text-white transition-colors tracking-wide">Localator</Link>
        <Link to="/partners" className="text-purple-400 hover:text-white transition-colors tracking-wide font-semibold">For Partners</Link>
        <Link to="/pricing" className="text-white hover:text-locale-blue transition-colors tracking-wide font-semibold">Pro Access</Link>
      </div>

      <div className="flex items-center gap-5">
          {/* Location Indicator */}
          <button 
            onClick={requestLocation}
            className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-carbon-800 border border-carbon-700 text-xs text-gray-300 hover:border-locale-blue transition-all shadow-sm group"
          >
            {locationState.loading ? (
               <div className="w-2 h-2 rounded-full bg-locale-blue animate-ping"></div>
            ) : (
               <svg className="w-4 h-4 text-locale-blue group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
            <span className="font-mono">{locationState.city ? `${locationState.city}, ${locationState.zip || 'Local'}` : 'Set Location'}</span>
          </button>

          <div className="h-6 w-px bg-carbon-700 hidden md:block"></div>
          
          <Link to="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white hidden md:block">Log In</Link>
          <Link to="/register" className="bg-white hover:bg-gray-100 text-carbon-900 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Join Now
          </Link>
      </div>
    </div>
  </nav>
);

// --- PAGES ---

const Home = () => {
  const { requestLocation } = useGeoLocation();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-carbon-900">
        {/* Background Image overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80" 
            className="w-full h-full object-cover opacity-10 grayscale mix-blend-luminosity"
            alt="City Infrastructure" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-carbon-900 via-carbon-900/80 to-carbon-900"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-locale-blue/10 via-transparent to-transparent opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center pt-12">
          
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-locale-blue/30 bg-locale-blue/10 text-locale-lightBlue text-xs font-bold tracking-[0.2em] mb-10 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
              <span className="w-2 h-2 rounded-full bg-locale-blue animate-pulse"></span>
              LIVE NETWORK ACTIVE
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
              BUILD YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                INFRASTRUCTURE
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed font-light">
              The end-to-end networking platform for the modern workforce. 
              Connect locally, scale globally. Secure payments, verified talent, and real growth.
            </p>

            {/* Main Locator Search */}
            <div className="max-w-4xl mx-auto w-full bg-carbon-800/60 backdrop-blur-xl p-3 rounded-2xl border border-carbon-600/50 flex flex-col md:flex-row gap-3 shadow-2xl transition-all hover:border-carbon-500">
              <div className="flex-1 relative group">
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="What service do you need?" className="w-full bg-carbon-900/50 rounded-xl border-none text-white h-14 pl-14 pr-4 focus:ring-2 focus:ring-locale-blue/50 placeholder-gray-500 text-lg" />
              </div>
              <div className="flex-[0.6] relative group">
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                <input type="text" placeholder="Zip Code" className="w-full bg-carbon-900/50 rounded-xl border-none text-white h-14 pl-14 pr-24 focus:ring-2 focus:ring-locale-blue/50 placeholder-gray-500 text-lg" />
                <button onClick={requestLocation} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-carbon-700 hover:bg-carbon-600 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white transition-colors font-bold tracking-wide">
                  DETECT
                </button>
              </div>
              <Link to="/explore" className="bg-locale-blue hover:bg-locale-darkBlue text-white font-bold px-10 rounded-xl transition-all flex items-center justify-center text-lg shadow-glow hover:scale-[1.02]">
                SEARCH
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid (Preview) */}
      <section className="py-32 bg-carbon-800 border-y border-carbon-700 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-locale-blue/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">Explore Sectors</h2>
              <p className="text-gray-400 text-lg">Find specialized talent in verified categories.</p>
            </div>
            <Link to="/categories" className="text-locale-blue font-bold text-sm hover:text-white transition-colors flex items-center gap-2">
              View All Categories <span className="text-lg">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOME_CATEGORIES.map((cat) => (
              <Link to={`/explore/${cat.id}`} key={cat.id} className="group relative h-96 rounded-3xl overflow-hidden border border-carbon-700 hover:border-locale-blue/50 transition-all shadow-xl">
                <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-carbon-900/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 p-8">
                   <div className="w-12 h-1 bg-locale-blue mb-4 transform origin-left group-hover:scale-x-150 transition-transform"></div>
                   <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{cat.name}</h3>
                   <p className="text-sm text-gray-400 group-hover:text-locale-blue transition-colors font-mono">{cat.count}+ Professionals</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop / States */}
      <section className="py-32 bg-carbon-900">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
            <div>
               <div className="inline-block px-4 py-1.5 rounded bg-yellow-500/10 text-yellow-500 text-xs font-bold mb-8 tracking-widest border border-yellow-500/20">GARAGE TO GLOBAL</div>
               <h2 className="text-5xl font-bold text-white mb-8 leading-tight">A Clear Path to <br/> Professional Growth</h2>
               <p className="text-gray-400 text-xl mb-12 leading-relaxed font-light">
                 Locale isn't just a gig app; it's a career engine. We track your reputation, verify your skills via Ballerine, and unlock new opportunities as you level up.
               </p>
               
               <div className="space-y-10">
                  <div className="flex gap-6 group">
                     <div className="w-16 h-16 bg-carbon-800 rounded-2xl flex items-center justify-center border border-carbon-700 group-hover:border-white transition-colors shadow-lg">
                        <span className="text-gray-400 font-mono font-bold text-xl group-hover:text-white">01</span>
                     </div>
                     <div>
                        <h4 className="text-white font-bold text-xl mb-2">Local Foundation</h4>
                        <p className="text-gray-500">Start in your zip code. Build reviews and trust.</p>
                     </div>
                  </div>
                  <div className="flex gap-6 group">
                     <div className="w-16 h-16 bg-locale-blue/10 rounded-2xl flex items-center justify-center border border-locale-blue/30 group-hover:bg-locale-blue group-hover:border-locale-blue transition-all shadow-lg shadow-locale-blue/10">
                        <span className="text-locale-blue font-mono font-bold text-xl group-hover:text-white">02</span>
                     </div>
                     <div>
                        <h4 className="text-white font-bold text-xl mb-2">Community Verified</h4>
                        <p className="text-gray-500">Pass ID verification. Unlock higher value contracts.</p>
                     </div>
                  </div>
                  <div className="flex gap-6 group">
                     <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/30 group-hover:border-yellow-500 transition-colors shadow-lg">
                        <span className="text-yellow-500 font-mono font-bold text-xl">03</span>
                     </div>
                     <div>
                        <h4 className="text-white font-bold text-xl mb-2">Global Reach</h4>
                        <p className="text-gray-500">Remote opportunities and enterprise consulting.</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="relative pl-10">
               <div className="absolute inset-0 bg-locale-blue/20 rounded-[3rem] blur-[100px]"></div>
               <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Team working" className="relative rounded-[2rem] border border-carbon-600 shadow-2xl z-10 w-full transform hover:scale-[1.02] transition-transform duration-700" />
               
               {/* Floating Card */}
               <div className="absolute -bottom-10 -left-6 bg-carbon-800/95 backdrop-blur-xl p-6 rounded-2xl border border-carbon-600 shadow-2xl z-20 max-w-sm w-full animate-fade-in-up">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div>
                        <p className="text-white font-bold text-lg">Verification Complete</p>
                        <p className="text-gray-400 text-sm">Ballerine Secure ID • Liveness Check</p>
                     </div>
                  </div>
                  <div className="w-full bg-carbon-900 rounded-full h-2 mb-2 overflow-hidden">
                     <div className="w-full h-full bg-green-500 rounded-full animate-slide-right"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 font-mono mt-2">
                     <span>ID: 8492-AX</span>
                     <span>VERIFIED: JUST NOW</span>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

// --- CATEGORY LANDING PAGE (Single) ---
const CategoryLanding = () => {
  const { categoryId } = useParams();
  // Find via slug from Mock Data
  const category = MOCK_CATEGORIES.find(c => c.slug === categoryId) || MOCK_CATEGORIES[0];
  
  return (
    <div className="min-h-screen">
       <div className="relative h-[40vh] bg-carbon-900 overflow-hidden">
          <img src={category.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-carbon-900/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 max-w-7xl mx-auto pb-16">
             <Link to="/categories" className="text-sm text-locale-blue mb-4 hover:underline font-bold tracking-wide uppercase">← Back to All Categories</Link>
             <h1 className="text-5xl md:text-6xl font-black text-white mb-4 flex items-center gap-4">
               <span>{category.iconEmoji}</span>
               {category.name}
             </h1>
             <p className="text-gray-300 text-xl max-w-2xl">{category.activeProfessionals.toLocaleString()} Verified Professionals available near you.</p>
             
             {/* Subcategories Pills */}
             <div className="flex flex-wrap gap-2 mt-4">
                {category.subcategories.map((sub, i) => (
                   <span key={i} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white backdrop-blur-sm">
                      {sub}
                   </span>
                ))}
             </div>
          </div>
       </div>
       <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-wrap gap-4 mb-12">
             <button className="px-6 py-3 bg-locale-blue text-white rounded-xl text-sm font-bold shadow-lg hover:bg-locale-darkBlue transition-colors">All {category.name}</button>
             <button className="px-6 py-3 bg-carbon-800 text-gray-400 border border-carbon-700 hover:border-white hover:text-white rounded-xl text-sm transition-colors font-medium">Local Only</button>
             <button className="px-6 py-3 bg-carbon-800 text-gray-400 border border-carbon-700 hover:border-white hover:text-white rounded-xl text-sm transition-colors font-medium">Remote Ready</button>
             <button className="px-6 py-3 bg-carbon-800 text-gray-400 border border-carbon-700 hover:border-white hover:text-white rounded-xl text-sm transition-colors font-medium">Under $100/hr</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {ENHANCED_PROFILES.map(p => (
               <ProfessionalCard key={p.id} profile={p} />
             ))}
          </div>
       </div>
    </div>
  );
};

// --- LEGAL PAGES ---
const LegalLayout = ({ title, children }: any) => (
  <div className="max-w-3xl mx-auto px-6 py-24">
    <div className="mb-12 border-b border-carbon-700 pb-8">
       <div className="text-locale-blue font-bold text-sm tracking-widest mb-2 uppercase">Legal</div>
       <h1 className="text-4xl font-bold text-white">{title}</h1>
    </div>
    <div className="prose prose-invert prose-lg prose-blue max-w-none text-gray-300">
      {children}
    </div>
  </div>
);

const Terms = () => (
  <LegalLayout title="Terms of Service">
    <h3>1. Introduction</h3>
    <p>Welcome to Locale by: ACHIEVEMOR. By accessing our platform, you agree to these terms.</p>
    <h3>2. Garage to Global Progression</h3>
    <p>Our platform uses a tiered system (Garage, Community, Global). Users must meet specific verification criteria via Ballerine to advance tiers.</p>
    <h3>3. Payments & Fees</h3>
    <p>All payments are processed securely via Stripe. Platform fees vary by tier level (15% - 5%).</p>
  </LegalLayout>
);

const Privacy = () => (
  <LegalLayout title="Privacy Policy">
    <h3>1. Data Collection</h3>
    <p>We collect location data to power the Internal Locator and GPS features. This data is used solely to match you with local professionals.</p>
    <h3>2. Identity Verification</h3>
    <p>Identity documents processed for "Community" status are handled by Ballerine and are not stored directly on our servers. Liveness checks are processed ephemerally.</p>
  </LegalLayout>
);

// --- MAIN APP COMPONENT ---
const App = () => {
  const { location, requestLocation } = useGeoLocation();

  return (
    <HashRouter>
      <div className="min-h-screen bg-carbon-900 text-gray-200 font-sans selection:bg-locale-blue selection:text-white flex flex-col">
        <Navbar locationState={location} requestLocation={requestLocation} />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/about/ai" element={<AiIntroPage />} />
            <Route path="/estimator" element={<TokenEstimatorPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/explore/garage-to-global" element={<GarageToGlobalPage />} />
            <Route path="/explore/:categoryId" element={<CategoryLanding />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/book/:serviceId" element={<BookingsPage />} /> 
            <Route path="/playground" element={<PlaygroundPage />} />
            
            <Route path="/profile/customize" element={<ProfileCustomizer />} />
            <Route path="/admin/settings" element={<AdminSettings />} /> 
            
            {/* UPDATED ROUTES */}
            <Route path="/localator" element={<LocalatorPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/partners" element={<PartnerProgramPage />} />
            <Route path="/enterprise" element={<DashboardPage />} /> {/* Enterprise uses Dashboard for now */}

            {/* Admin / Internal Operations */}
            <Route path="/admin/circuit-box" element={<CircuitBox />} />
            <Route path="/admin/control-panel" element={<AdminControlPanel />} />
            <Route path="/admin" element={<Navigate to="/admin/control-panel" replace />} />

            {/* Legal */}
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<Privacy />} />
            <Route path="/legal/safety" element={<Privacy />} /> {/* Safety uses Privacy as placeholder */}
          </Routes>
        </main>
        
        <ConciergeBot />
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
