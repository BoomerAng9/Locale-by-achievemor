
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PROFILES } from '../../lib/constants';
import ProfessionalCard from '../ProfessionalCard';
import { Profile } from '../../types';

// --- TIER DEFINITIONS ---
interface ExporeTier {
  id: 'garage' | 'community' | 'global';
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
}

const EXPLORE_TIERS: ExporeTier[] = [
  {
    id: 'garage',
    name: 'Garage',
    subtitle: 'Starting Out',
    icon: '🏠',
    color: 'orange',
    description: 'Emerging talent building their reputation. Great for budget-friendly projects.',
    features: ['New to platform', 'Competitive rates', 'Building portfolio', 'Eager to prove'],
  },
  {
    id: 'community',
    name: 'Community',
    subtitle: 'Established',
    icon: '🤝',
    color: 'blue',
    description: 'Verified professionals with proven track records and community endorsements.',
    features: ['Verified skills', '10+ completed jobs', 'Community vetted', '4.5+ rating'],
  },
  {
    id: 'global',
    name: 'Global',
    subtitle: 'Elite',
    icon: '🌎',
    color: 'emerald',
    description: 'Top-tier experts recognized globally. Premium quality, premium results.',
    features: ['Top 5% rated', 'Enterprise ready', '50+ projects', 'Priority support'],
  },
];

// --- INDUSTRY CATEGORIES ---
const INDUSTRY_CATEGORIES = [
  { id: 'tech', name: 'Technology & AI', icon: '💻', count: 156 },
  { id: 'real_estate', name: 'Real Estate', icon: '🏢', count: 89 },
  { id: 'legal', name: 'Legal & Pro', icon: '⚖️', count: 67 },
  { id: 'construction', name: 'Construction', icon: '🔧', count: 45 },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', count: 78 },
  { id: 'retail', name: 'Retail & E-Com', icon: '🛒', count: 112 },
  { id: 'media', name: 'Media & Content', icon: '🎬', count: 94 },
  { id: 'education', name: 'Education', icon: '📚', count: 52 },
];

// --- MOCK DATA GENERATOR FOR DEMO ---
const generateMockData = (): Profile[] => {
  const base = [...MOCK_PROFILES];
  const generated: Profile[] = [];
  const TITLES = ['Frontend Dev', 'UX Designer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'Mobile Dev', 'QA Engineer', 'Technical Writer'];
  const LOCATIONS = ['Austin, TX', 'San Francisco, CA', 'New York, NY', 'Remote', 'London, UK', 'Berlin, DE', 'Toronto, CA'];
  const SKILLS_POOL = ['React', 'Node.js', 'Python', 'Figma', 'AWS', 'Docker', 'TypeScript', 'SQL', 'Go', 'Rust', 'Svelte', 'Next.js', 'Tailwind'];

  for (let i = 0; i < 40; i++) {
    const template = base[i % base.length];
    generated.push({
      ...template,
      id: `gen-${i}`,
      displayName: `${template.displayName.split(' ')[0]} ${String.fromCharCode(65 + (i % 26))}.`,
      title: TITLES[i % TITLES.length],
      location: LOCATIONS[i % LOCATIONS.length],
      hourlyRate: 40 + Math.floor(Math.random() * 210), // $40 - $250
      jobsCompleted: Math.floor(Math.random() * 150),
      skills: SKILLS_POOL.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 4)),
      stage: i % 5 === 0 ? 'global' : i % 2 === 0 ? 'community' : 'garage',
      verificationStatus: i % 3 === 0 ? 'verified' : 'pending',
      reputationScore: 70 + Math.floor(Math.random() * 30),
      joinedDate: '2023-01-01',
      customization: {
         theme: i % 4 === 0 ? 'neon' : i % 3 === 0 ? 'royal' : i % 2 === 0 ? 'minimal' : 'carbon',
         featuredSkills: [] 
      }
    });
  }
  return generated;
};

const FULL_DATASET = generateMockData();
const ALL_SKILLS = Array.from(new Set(FULL_DATASET.flatMap(p => p.skills))).sort();

const ExplorePage: React.FC = () => {
  // --- STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [locationType, setLocationType] = useState<'all' | 'local' | 'remote'>('all');
  const [maxRate, setMaxRate] = useState<number>(300);
  const [displayCount, setDisplayCount] = useState(12);
  const [isSignedUp, setIsSignedUp] = useState(false); // Simulates signup status
  const [activeTier, setActiveTier] = useState<ExporeTier['id'] | 'all'>('all');
  const [activeView, setActiveView] = useState<'talent' | 'industries' | 'tiers'>('talent');

  // --- FILTER LOGIC ---
  const filteredProfiles = useMemo(() => {
    return FULL_DATASET.filter(profile => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        profile.displayName.toLowerCase().includes(query) ||
        profile.title.toLowerCase().includes(query) ||
        profile.bio.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;

      // Tier filter
      if (activeTier !== 'all' && profile.stage !== activeTier) return false;

      if (locationType === 'local' && profile.location === 'Remote') return false;
      if (locationType === 'remote' && profile.location !== 'Remote') return false;

      if (profile.hourlyRate > maxRate) return false;

      if (selectedSkills.length > 0) {
        const hasAllSkills = selectedSkills.every(s => profile.skills.includes(s));
        if (!hasAllSkills) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSkills, locationType, maxRate, activeTier]);

  // Pagination Slice
  const visibleProfiles = filteredProfiles.slice(0, displayCount);
  const hasMore = visibleProfiles.length < filteredProfiles.length;

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12);
  };

  return (
    <div className="min-h-screen bg-carbon-900 pt-8 pb-24 relative overflow-hidden">
      
      {/* Background Watermark Overlay (Until Signed Up) */}
      {!isSignedUp && (
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
             <div className="absolute inset-0 bg-carbon-900/10 backdrop-blur-[1px]"></div>
             <img 
               src="https://kiko.io/api/files/WqL/5mN/image.png" 
               alt="Locale Watermark" 
               className="w-[80%] max-w-4xl opacity-[0.05] animate-pulse"
             />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER with View Tabs */}
        <div className="mb-8">
           <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
             <div>
               <h1 className="text-4xl font-black text-white mb-2">Explore</h1>
               <p className="text-gray-400">
                 Discover verified professionals, browse industries, and find the perfect match.
               </p>
             </div>
             
             {/* View Tabs */}
             <div className="flex bg-carbon-800 rounded-xl p-1 border border-carbon-700">
               {[
                 { id: 'talent', label: 'Talent', icon: '👤' },
                 { id: 'industries', label: 'Industries', icon: '🏢' },
                 { id: 'tiers', label: 'Tiers', icon: '⭐' },
               ].map((view) => (
                 <button
                   key={view.id}
                   onClick={() => setActiveView(view.id as typeof activeView)}
                   className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                     activeView === view.id
                       ? 'bg-locale-blue text-white shadow-lg'
                       : 'text-gray-400 hover:text-white'
                   }`}
                 >
                   <span>{view.icon}</span>
                   {view.label}
                 </button>
               ))}
             </div>
           </div>
           
           {/* Tier Filter Pills (when in Talent view) */}
           {activeView === 'talent' && (
             <div className="flex flex-wrap gap-2">
               <button
                 onClick={() => setActiveTier('all')}
                 className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                   activeTier === 'all'
                     ? 'bg-locale-blue text-white'
                     : 'bg-carbon-800 text-gray-400 hover:text-white border border-carbon-700'
                 }`}
               >
                 All Tiers
               </button>
               {EXPLORE_TIERS.map((tier) => (
                 <button
                   key={tier.id}
                   onClick={() => setActiveTier(tier.id)}
                   className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                     activeTier === tier.id
                       ? tier.color === 'orange' ? 'bg-orange-500 text-white' :
                         tier.color === 'blue' ? 'bg-blue-500 text-white' :
                         'bg-emerald-500 text-white'
                       : 'bg-carbon-800 text-gray-400 hover:text-white border border-carbon-700'
                   }`}
                 >
                   <span>{tier.icon}</span>
                   {tier.name}
                   <span className="text-xs opacity-70">
                     ({FULL_DATASET.filter(p => p.stage === tier.id).length})
                   </span>
                 </button>
               ))}
             </div>
           )}
        </div>

        {/* INDUSTRIES VIEW */}
        {activeView === 'industries' && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {INDUSTRY_CATEGORIES.map((industry) => (
                <Link
                  key={industry.id}
                  to={`/categories/${industry.id}`}
                  className="group bg-carbon-800 border border-carbon-700 rounded-2xl p-6 hover:border-locale-blue/50 hover:shadow-lg hover:shadow-locale-blue/10 transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-carbon-900 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {industry.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{industry.name}</h3>
                      <p className="text-sm text-gray-500">{industry.count} professionals</p>
                    </div>
                  </div>
                  <div className="text-locale-blue text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Explore →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* TIERS VIEW */}
        {activeView === 'tiers' && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EXPLORE_TIERS.map((tier) => {
                const tierCount = FULL_DATASET.filter(p => p.stage === tier.id).length;
                const borderColor = tier.color === 'orange' ? 'border-orange-500' :
                                   tier.color === 'blue' ? 'border-blue-500' : 'border-emerald-500';
                const bgGlow = tier.color === 'orange' ? 'shadow-orange-500/20' :
                              tier.color === 'blue' ? 'shadow-blue-500/20' : 'shadow-emerald-500/20';
                
                return (
                  <div 
                    key={tier.id}
                    className={`bg-carbon-800 border-2 ${borderColor} rounded-2xl p-8 shadow-lg ${bgGlow} cursor-pointer hover:scale-105 transition-transform`}
                    onClick={() => {
                      setActiveTier(tier.id);
                      setActiveView('talent');
                    }}
                  >
                    <div className="text-5xl mb-4">{tier.icon}</div>
                    <h3 className="text-2xl font-black text-white mb-1">{tier.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{tier.subtitle}</p>
                    <p className="text-gray-400 text-sm mb-6">{tier.description}</p>
                    
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-4 border-t border-carbon-700">
                      <div className="text-3xl font-black text-white">{tierCount}</div>
                      <div className="text-sm text-gray-500">professionals available</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TALENT VIEW - Show search and profiles */}
        {activeView === 'talent' && (
          <>
            {/* AI-Powered Search Bar */}
        <div className="mb-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center gap-3 bg-carbon-800 border border-carbon-600 rounded-xl p-4 focus-within:border-locale-blue transition-all">
              <img src="/assets/ai-concierge.jpg" alt="AI Search" className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Describe the talent you need... (e.g., 'React developer with Tailwind experience')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white text-lg outline-none placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Powered by ACHEEVY AI • Natural language search</p>
              </div>
              <button className="px-6 py-3 bg-linear-to-r from-locale-blue to-purple-600 hover:from-locale-darkBlue hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-locale-blue/20">
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR FILTERS --- */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* AI Quick Prompts */}
            <div className="bg-linear-to-br from-emerald-500/10 to-blue-500/10 p-4 rounded-xl border border-emerald-500/20">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Suggestions
              </h3>
              <div className="space-y-2">
                {['Find React experts under $80/hr', 'Show me verified designers', 'Remote DevOps engineers'].map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => setSearchQuery(prompt)}
                    className="w-full text-left px-3 py-2 bg-carbon-800/50 hover:bg-carbon-700 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Toggle */}
            <div className="bg-carbon-800 p-5 rounded-xl border border-carbon-700">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Location</h3>
               <div className="flex bg-carbon-900 p-1 rounded-lg">
                  {(['all', 'local', 'remote'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setLocationType(type)}
                      className={`flex-1 py-2 text-xs font-bold rounded-md transition-all uppercase ${
                        locationType === type 
                          ? 'bg-locale-blue text-white shadow-md' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
               </div>
            </div>
            {/* Hourly Rate Slider */}
            <div className="bg-carbon-800 p-5 rounded-xl border border-carbon-700">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max Hourly Rate</h3>
                 <span className="text-locale-blue font-bold font-mono">${maxRate}</span>
               </div>
               <input 
                 type="range" 
                 min="20" 
                 max="300" 
                 step="10" 
                 value={maxRate}
                 onChange={(e) => setMaxRate(parseInt(e.target.value))}
                 className="w-full h-2 bg-carbon-900 rounded-lg appearance-none cursor-pointer accent-locale-blue"
               />
            </div>
            {/* Skills Filter */}
            <div className="bg-carbon-800 p-5 rounded-xl border border-carbon-700">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Skills</h3>
                 {selectedSkills.length > 0 && (
                   <button onClick={() => setSelectedSkills([])} className="text-[10px] text-red-400 hover:text-red-300">Clear</button>
                 )}
               </div>
               <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-carbon-600">
                  {ALL_SKILLS.map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all text-left ${
                        selectedSkills.includes(skill)
                          ? 'bg-locale-blue/20 border-locale-blue text-white'
                          : 'bg-carbon-900 border-carbon-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* --- MAIN GRID --- */}
          <div className="lg:col-span-9">
             <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Showing <span className="text-white font-bold">{visibleProfiles.length}</span> of {filteredProfiles.length} professionals
                </p>
             </div>

             {visibleProfiles.length > 0 ? (
               <>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {visibleProfiles.map((profile) => (
                      <div key={profile.id} className="h-full">
                         <ProfessionalCard profile={profile} />
                      </div>
                    ))}
                 </div>
                 {hasMore && (
                   <div className="flex justify-center">
                     <button 
                       onClick={handleLoadMore}
                       className="px-8 py-4 bg-carbon-800 border border-carbon-600 text-white font-bold rounded-xl hover:bg-carbon-700 hover:border-white transition-all shadow-lg flex items-center gap-2"
                     >
                       Load More Professionals
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                     </button>
                   </div>
                 )}
               </>
             ) : (
               <div className="bg-carbon-800 border-2 border-dashed border-carbon-700 rounded-xl p-16 text-center">
                  <div className="w-16 h-16 bg-carbon-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No professionals found</h3>
                  <button 
                    onClick={() => {
                        setSearchQuery('');
                        setSelectedSkills([]);
                        setMaxRate(300);
                        setLocationType('all');
                        setActiveTier('all');
                    }}
                    className="mt-6 text-locale-blue hover:text-white font-bold text-sm"
                  >
                    Clear all filters
                  </button>
               </div>
             )}
          </div>
        </div>
          </>
        )}
      </div>

      {/* SIGNUP BAR (If not signed up) */}
      {!isSignedUp && (
          <div className="fixed bottom-0 left-0 w-full bg-carbon-900/90 backdrop-blur-xl border-t border-carbon-700 p-4 z-50 animate-slide-up flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl">
              <div className="flex items-center gap-4">
                  <div className="hidden md:flex h-12 w-12 bg-locale-blue/20 rounded-lg items-center justify-center">
                      <img src="https://kiko.io/api/files/WqL/5mN/image.png" alt="Locale Logo" className="h-8 w-auto opacity-80" />
                  </div>
                  <div>
                      <h4 className="text-white font-bold">Locale Free Access</h4>
                      <p className="text-gray-400 text-sm">Sign up to remove watermarks and view full profile details.</p>
                  </div>
              </div>
              <button 
                onClick={() => setIsSignedUp(true)}
                className="px-8 py-3 bg-locale-blue hover:bg-locale-darkBlue text-white font-bold rounded-xl shadow-lg transition-colors whitespace-nowrap"
              >
                Create Free Account
              </button>
          </div>
      )}
    </div>
  );
};

export default ExplorePage;
