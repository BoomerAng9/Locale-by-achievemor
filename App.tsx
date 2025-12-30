import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { LocaleLogo } from './components/Brand/Logo';
import ProfessionalCard from './components/ProfessionalCard';
import Localator from './components/Localator';
import VerificationFlow from './components/verification/VerificationFlow';
import ConciergeBot from './components/common/ConciergeBot';
import ScrollToTop from './components/common/ScrollToTop';
import LeftSidebar from './components/Navigation/LeftSidebar';
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
import SystemLogsViewer from './components/admin/SystemLogsViewer';
import AboutPage from './components/pages/AboutPage';
import GarageToGlobalPage from './components/pages/GarageToGlobalPage';
import PlaygroundPage from './components/pages/PlaygroundPage';

// Tool/Feature Components
import VideoGenerator from './components/video/VideoGenerator';
import VoiceOnboarding from './components/voice/VoiceOnboarding';
import AIChatWidget from './components/chat/AIChatWidget';
import AIChatPage from './components/pages/AIChatPage';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import TaskWorkspace from './components/workspace/TaskWorkspace'; 

// Gateway & Workspace Components (Binge Code DEVELOP Phase)
import LocaleGateway from './components/gateway/LocaleGateway';
import ClientWorkspace from './components/workspace/ClientWorkspace';
import PartnerWorkspace from './components/workspace/PartnerWorkspace';

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
  <nav className="sticky top-0 z-40 glass-panel bg-white/80 border-b border-white/20 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-8 font-medium text-sm text-gray-600">
        <Link to="/explore" className="hover:text-accent-primary transition-colors tracking-wide font-medium">Explore</Link>
        <Link to="/categories" className="hover:text-accent-primary transition-colors tracking-wide font-medium">Categories</Link>
        <Link to="/localator" className="hover:text-accent-primary transition-colors tracking-wide font-medium">Localator</Link>
        <Link to="/partners" className="text-accent-primary hover:text-accent-secondary transition-colors tracking-wide font-semibold">For Partners</Link>
        <Link to="/pricing" className="text-accent-primary hover:text-accent-secondary transition-colors tracking-wide font-semibold">Pro Access</Link>
      </div>

      <div className="flex items-center gap-5">
          {/* Location Indicator */}
          <button 
            onClick={requestLocation}
            className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 border border-white/30 text-xs text-gray-700 hover:border-accent-primary transition-all shadow-sm group"
          >
            {locationState.loading ? (
               <div className="w-2 h-2 rounded-full bg-accent-primary animate-ping"></div>
            ) : (
               <svg className="w-4 h-4 text-accent-primary group-hover:text-accent-secondary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
            <span className="font-mono text-gray-700">{locationState.city ? `${locationState.city}, ${locationState.zip || 'Local'}` : 'Set Location'}</span>
          </button>

          <div className="h-6 w-px bg-white/20 hidden md:block"></div>
          
          <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-accent-primary hidden md:block">Log In</Link>
          <Link to="/register" className="btn-primary text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-lg">
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
    <div className="bg-gradient-to-b from-white via-gray-50 to-white min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
        {/* Background Gradient - Light & Professional */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center pt-12">
          
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 text-xs font-bold tracking-[0.2em] mb-10 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              LIVE NETWORK ACTIVE
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9] drop-shadow-sm font-doto">
              BUILD YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600">
                INFRASTRUCTURE
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-16 leading-relaxed font-light">
              The end-to-end networking platform for the modern workforce. 
              Connect locally, scale globally. Secure payments, verified talent, and real growth.
            </p>

            {/* Main Locator Search - Glass Panel */}
            <div className="w-full max-w-5xl mx-auto">
              <div className="glass-panel bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/30 shadow-xl transition-all hover:border-white/50 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
                <div className="flex items-center gap-2">
                  {/* Search Icon */}
                  <div className="pl-4">
                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  
                  {/* Main Input */}
                  <input 
                    type="text" 
                    placeholder="What service do you need?" 
                    className="flex-1 bg-transparent border-none text-gray-900 h-14 px-4 focus:ring-0 focus:outline-none placeholder-gray-400 text-lg" 
                  />
                  
                  {/* Divider */}
                  <div className="w-px h-8 bg-white/30"></div>
                  
                  {/* Location Input */}
                  <div className="flex items-center gap-2 px-4">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <input 
                      type="text" 
                      placeholder="Zip Code" 
                      className="w-28 bg-transparent border-none text-gray-900 h-14 focus:ring-0 focus:outline-none placeholder-gray-400 text-base" 
                    />
                    <button onClick={requestLocation} className="text-[10px] bg-white/60 hover:bg-white/80 px-3 py-1.5 rounded-lg text-gray-700 hover:text-gray-900 transition-colors font-bold tracking-wide">
                      DETECT
                    </button>
                  </div>
                  
                  {/* Search Button */}
                  <Link to="/explore" className="btn-primary text-white font-bold px-8 py-4 rounded-xl transition-all flex items-center justify-center text-base shadow-lg hover:shadow-xl hover:scale-[1.02]">
                    SEARCH
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-32 bg-white/50 backdrop-blur-sm border-y border-white/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-doto">Explore Sectors</h2>
              <p className="text-gray-600 text-lg">Find specialized talent in verified categories.</p>
            </div>
            <Link to="/categories" className="text-accent-primary font-bold text-sm hover:text-accent-secondary transition-colors flex items-center gap-2">
              View All Categories <span className="text-lg">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOME_CATEGORIES.map((cat) => (
              <Link to={`/explore/${cat.id}`} key={cat.id} className="group relative h-96 rounded-3xl overflow-hidden border border-white/30 hover:border-accent-primary/50 transition-all shadow-lg hover:shadow-xl glass-panel">
                <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 p-8">
                   <div className="w-12 h-1 bg-accent-primary mb-4 transform origin-left group-hover:scale-x-150 transition-transform"></div>
                   <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{cat.name}</h3>
                   <p className="text-sm text-gray-300 group-hover:text-accent-primary transition-colors font-mono">{cat.count}+ Professionals</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section className="py-32 bg-white">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
            <div>
               <div className="inline-block px-4 py-1.5 rounded bg-yellow-500/10 text-yellow-600 text-xs font-bold mb-8 tracking-widest border border-yellow-500/30 font-doto">GARAGE TO GLOBAL</div>
               <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight font-doto">A Clear Path to Professional Growth</h2>
               <p className="text-gray-600 text-xl mb-12 leading-relaxed font-light">
                 Locale isn't just a gig app; it's a career engine. We track your reputation, verify your skills, and unlock new opportunities as you level up.
               </p>
               
               <div className="space-y-10">
                  <div className="flex gap-6 group">
                     <div className="w-16 h-16 glass-panel bg-white/60 rounded-2xl flex items-center justify-center border border-white/30 group-hover:border-accent-primary transition-colors shadow-lg">
                        <span className="text-gray-600 font-mono font-bold text-xl group-hover:text-accent-primary">01</span>
                     </div>
                     <div>
                        <h4 className="text-gray-900 font-bold text-xl mb-2">Local Foundation</h4>
                        <p className="text-gray-600">Start in your zip code. Build reviews and trust.</p>
                     </div>
                  </div>
                  <div className="flex gap-6 group">
                     <div className="w-16 h-16 glass-panel bg-blue-500/10 rounded-2xl flex items-center justify-center border border-accent-primary/30 group-hover:bg-accent-primary group-hover:border-accent-primary transition-all shadow-lg">
                        <span className="text-accent-primary font-mono font-bold text-xl group-hover:text-white">02</span>
                     </div>
                     <div>
                        <h4 className="text-gray-900 font-bold text-xl mb-2">Community Verified</h4>
                        <p className="text-gray-600">Pass ID verification. Unlock higher value contracts.</p>
                     </div>
                  </div>
                  <div className="flex gap-6 group">
                     <div className="w-16 h-16 glass-panel bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/30 group-hover:border-yellow-500 transition-colors shadow-lg">
                        <span className="text-yellow-600 font-mono font-bold text-xl">03</span>
                     </div>
                     <div>
                        <h4 className="text-gray-900 font-bold text-xl mb-2">Global Reach</h4>
                        <p className="text-gray-600">Remote opportunities and enterprise consulting.</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="relative pl-10">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[3rem] blur-[100px]"></div>
               <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Team working" className="relative rounded-4xl border border-white/30 shadow-xl z-10 w-full transform hover:scale-[1.02] transition-transform duration-700" />
               
               {/* Floating Glass Card */}
               <div className="absolute -bottom-10 -left-6 glass-panel bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-xl z-20 max-w-sm w-full animate-fade-in-up">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div>
                        <p className="text-gray-900 font-bold text-lg">Verification Complete</p>
                        <p className="text-gray-600 text-sm">Secure ID • Liveness Check</p>
                     </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
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

// --- CATEGORY LANDING PAGE ---
const CategoryLanding = () => {
  const { categoryId } = useParams();
  const category = MOCK_CATEGORIES.find(c => c.slug === categoryId) || MOCK_CATEGORIES[0];
  
  return (
    <div className="min-h-screen bg-white">
       <div className="relative h-[40vh] bg-gradient-to-br from-white to-gray-50 overflow-hidden">
          <img src={category.imageUrl} alt={category.name} className="absolute inset-0 w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 max-w-7xl mx-auto pb-16">
             <Link to="/categories" className="text-sm text-accent-primary mb-4 hover:underline font-bold tracking-wide uppercase">← Back to All Categories</Link>
             <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 flex items-center gap-4 font-doto">
               <span>{category.iconEmoji}</span>
               {category.name}
             </h1>
             <p className="text-gray-700 text-xl max-w-2xl">{category.activeProfessionals.toLocaleString()} Verified Professionals available near you.</p>
             
             {/* Subcategories Pills */}
             <div className="flex flex-wrap gap-2 mt-4">
                {category.subcategories.map((sub, i) => (
                   <span key={i} className="px-3 py-1 rounded-full glass-panel bg-white/80 border border-white/30 text-xs text-gray-800 backdrop-blur-sm">
                      {sub}
                   </span>
                ))}
             </div>
          </div>
       </div>
       <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-wrap gap-4 mb-12">
             <button className="btn-primary text-white rounded-xl text-sm font-bold shadow-lg">All {category.name}</button>
             <button className="btn-ghost rounded-xl text-sm transition-colors font-medium">Local Only</button>
             <button className="btn-ghost rounded-xl text-sm transition-colors font-medium">Remote Ready</button>
             <button className="btn-ghost rounded-xl text-sm transition-colors font-medium">Under $100/hr</button>
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
  <div className="max-w-3xl mx-auto px-6 py-24 bg-white min-h-screen">
    <div className="mb-12 border-b border-white/20 pb-8">
       <div className="text-accent-primary font-bold text-sm tracking-widest mb-2 uppercase font-doto">Legal</div>
       <h1 className="text-4xl font-bold text-gray-900 font-doto">{title}</h1>
    </div>
    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
      {children}
    </div>
  </div>
);

const Terms = () => (
  <LegalLayout title="Terms of Service">
    <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Introduction</h3>
    <p>Welcome to Locale by: ACHIEVEMOR. By accessing our platform, you agree to these terms.</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Garage to Global Progression</h3>
    <p>Our platform uses a tiered system (Garage, Community, Global). Users must meet specific verification criteria to advance tiers.</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Payments & Fees</h3>
    <p>All payments are processed securely via Stripe. Platform fees vary by tier level (15% - 5%).</p>
  </LegalLayout>
);

const Privacy = () => (
  <LegalLayout title="Privacy Policy">
    <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Data Collection</h3>
    <p>We collect location data to power the Localator and GPS features. This data is used solely to match you with local professionals.</p>
    <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Identity Verification</h3>
    <p>Identity documents processed for "Community" status are handled securely and are not stored directly on our servers. Liveness checks are processed ephemerally.</p>
  </LegalLayout>
);

// --- MAIN APP COMPONENT ---
const App = () => {
  const { location, requestLocation } = useGeoLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="flex h-screen bg-white text-gray-900 font-sans selection:bg-accent-primary selection:text-white overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
          isAdmin={true}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navbar */}
          <Navbar locationState={location} requestLocation={requestLocation} />
          
          <main className="flex-1 overflow-y-auto">
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              
              {/* LOCALE GATEWAY SYSTEM */}
              <Route path="/gateway" element={<LocaleGateway />} />
              <Route path="/workspace/client" element={<ClientWorkspace />} />
              <Route path="/workspace/client/*" element={<ClientWorkspace />} />
              <Route path="/workspace/partner" element={<PartnerWorkspace />} />
              <Route path="/workspace/partner/*" element={<PartnerWorkspace />} />
              
              {/* Explore & Discovery */}
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/explore/:categoryId" element={<CategoryLanding />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/book/:serviceId" element={<BookingsPage />} />
              
              {/* Garage to Global */}
              <Route path="/garage-to-global" element={<GarageToGlobalPage />} />
              <Route path="/explore/garage-to-global" element={<GarageToGlobalPage />} />
              
              {/* About Section */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about/ai" element={<AiIntroPage />} />
              <Route path="/about/ai-intro" element={<AiIntroPage />} />
              <Route path="/about/technology" element={<AiIntroPage />} />
              
              {/* Tools */}
              <Route path="/localator" element={<LocalatorPage />} />
              <Route path="/estimator" element={<TokenEstimatorPage />} />
              <Route path="/token-estimator" element={<TokenEstimatorPage />} />
              
              {/* PARTNER ROUTES */}
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/partners" element={<PartnerProgramPage />} />
              <Route path="/partner-program" element={<PartnerProgramPage />} />
              <Route path="/for-partners" element={<PartnerProgramPage />} />
              
              {/* PRO ACCESS / DASHBOARD */}
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/enterprise" element={<DashboardPage />} />
              <Route path="/profile/customize" element={<ProfileCustomizer />} />
              
              {/* AI & CREATIVE TOOLS */}
              <Route path="/tools/video" element={<VideoGenerator />} />
              <Route path="/video" element={<VideoGenerator />} />
              <Route path="/tools/voice" element={<VoiceOnboarding onComplete={() => {}} onSkip={() => {}} />} />
              <Route path="/voice" element={<VoiceOnboarding onComplete={() => {}} onSkip={() => {}} />} />
              <Route path="/tools/chat" element={<AIChatPage />} />
              <Route path="/chat" element={<AIChatPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/workspace" element={<TaskWorkspace />} />
              <Route path="/manus" element={<TaskWorkspace />} />
              
              {/* ADMIN ROUTES */}
              <Route path="/admin" element={<Navigate to="/admin/control-panel" replace />} />
              <Route path="/admin/control-panel" element={<AdminControlPanel />} />
              <Route path="/admin/circuit-box" element={<CircuitBox isAdmin={true} />} />
              <Route path="/circuit-box" element={<CircuitBox isAdmin={false} />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/logs" element={<SystemLogsViewer />} />
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
              
              {/* LEGAL */}
              <Route path="/legal/terms" element={<Terms />} />
              <Route path="/legal/privacy" element={<Privacy />} />
              <Route path="/legal/safety" element={<Privacy />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
        
        {/* Floating ConciergeBot */}
        <ConciergeBot />
      </div>
    </HashRouter>
  );
};

export default App;
