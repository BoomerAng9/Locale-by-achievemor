
import React, { useState, useMemo } from 'react';
import { MOCK_PROFILES } from '../../lib/constants';
import ProfessionalCard from '../ProfessionalCard';
import { Profile } from '../../types';

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

  // --- FILTER LOGIC ---
  const filteredProfiles = useMemo(() => {
    return FULL_DATASET.filter(profile => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        profile.displayName.toLowerCase().includes(query) ||
        profile.title.toLowerCase().includes(query) ||
        profile.bio.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;

      if (locationType === 'local' && profile.location === 'Remote') return false;
      if (locationType === 'remote' && profile.location !== 'Remote') return false;

      if (profile.hourlyRate > maxRate) return false;

      if (selectedSkills.length > 0) {
        const hasAllSkills = selectedSkills.every(s => profile.skills.includes(s));
        if (!hasAllSkills) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSkills, locationType, maxRate]);

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
               alt="Watermark" 
               className="w-[80%] max-w-4xl opacity-[0.05] animate-pulse"
             />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* HEADER */}
        <div className="mb-10">
           <h1 className="text-4xl font-black text-white mb-4">Explore Talent</h1>
           <p className="text-gray-400 max-w-2xl">
             Connect with verified professionals across the globe. Use the filters to narrow down by skill, rate, and location.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR FILTERS --- */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search Input */}
            <div className="relative">
               <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               <input 
                 type="text" 
                 placeholder="Search name or title..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-carbon-800 border border-carbon-600 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-locale-blue transition-colors shadow-sm"
               />
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
                    }}
                    className="mt-6 text-locale-blue hover:text-white font-bold text-sm"
                  >
                    Clear all filters
                  </button>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* SIGNUP BAR (If not signed up) */}
      {!isSignedUp && (
          <div className="fixed bottom-0 left-0 w-full bg-carbon-900/90 backdrop-blur-xl border-t border-carbon-700 p-4 z-50 animate-slide-up flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl">
              <div className="flex items-center gap-4">
                  <div className="hidden md:flex h-12 w-12 bg-locale-blue/20 rounded-lg items-center justify-center">
                      <img src="https://kiko.io/api/files/WqL/5mN/image.png" className="h-8 w-auto opacity-80" />
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
