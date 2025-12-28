
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../lib/gcp';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { MOCK_PROFILES } from '../../lib/constants';
import ProfessionalCard from '../ProfessionalCard';
import { CardTheme, Profile } from '../../types';
import { useNavigate } from 'react-router-dom';

const THEMES: { id: CardTheme; label: string; description: string }[] = [
  { id: 'carbon', label: 'Carbon (Default)', description: 'Dark, sleek, and professional.' },
  { id: 'neon', label: 'Neon Cyber', description: 'High contrast with glowing accents.' },
  { id: 'minimal', label: 'Minimalist', description: 'Clean light mode for clarity.' },
  { id: 'royal', label: 'Royal Suite', description: 'Premium purple and gold aesthetic.' },
];

const ProfileCustomizer: React.FC = () => {
  const navigate = useNavigate();
  // Initialize with a fallback, will overwrite with real data
  const [profile, setProfile] = useState<Profile>(MOCK_PROFILES[0]);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>('carbon');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const docRef = doc(db, 'profiles', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as Profile;
                    // Merge with default struct to ensure fields exist
                    const merged = { ...MOCK_PROFILES[0], ...data };
                    setProfile(merged);
                    setSelectedTheme(merged.customization?.theme || 'carbon');
                    setSelectedSkills(merged.customization?.featuredSkills || merged.skills.slice(0, 3));
                }
            } catch (e) {
                console.error("Failed to load profile", e);
            }
        } else {
            // If not logged in, just show mock state or redirect
            // navigate('/register');
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      if (selectedSkills.length < 3) {
        setSelectedSkills(prev => [...prev, skill]);
      }
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    
    try {
        const docRef = doc(db, 'profiles', auth.currentUser.uid);
        await updateDoc(docRef, {
            customization: {
                theme: selectedTheme,
                featuredSkills: selectedSkills
            }
        });
        
        // Optimistic update locally
        setProfile(prev => ({
            ...prev,
            customization: { theme: selectedTheme, featuredSkills: selectedSkills }
        }));

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {
        console.error("Save failed", e);
        alert("Could not save to Firestore. Check console.");
    }
  };

  if (loading) {
      return <div className="min-h-screen bg-carbon-900 flex items-center justify-center text-gray-500">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-carbon-900 pt-12 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Card Customizer</h1>
          <p className="text-gray-400">Design how your profile card appears in the Marketplace and Expert Locator.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Controls */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Theme Selector */}
            <section className="bg-carbon-800 p-6 rounded-2xl border border-carbon-700">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <span className="w-6 h-6 rounded-full bg-locale-blue flex items-center justify-center text-xs">1</span>
                 Select Theme
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {THEMES.map(t => (
                   <button
                     key={t.id}
                     onClick={() => setSelectedTheme(t.id)}
                     className={`p-4 rounded-xl border text-left transition-all ${
                       selectedTheme === t.id 
                       ? 'bg-locale-blue/10 border-locale-blue ring-1 ring-locale-blue' 
                       : 'bg-carbon-900/50 border-carbon-600 hover:border-gray-500'
                     }`}
                   >
                     <div className="font-bold text-sm mb-1">{t.label}</div>
                     <div className="text-xs text-gray-500">{t.description}</div>
                   </button>
                 ))}
               </div>
            </section>

            {/* Skills Selector */}
            <section className="bg-carbon-800 p-6 rounded-2xl border border-carbon-700">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-locale-blue flex items-center justify-center text-xs">2</span>
                    Featured Skills
                  </h3>
                  <span className="text-xs text-gray-400">{selectedSkills.length}/3 Selected</span>
               </div>
               <div className="flex flex-wrap gap-2">
                 {profile.skills?.length > 0 ? profile.skills.map(skill => {
                   const isSelected = selectedSkills.includes(skill);
                   return (
                     <button
                       key={skill}
                       onClick={() => toggleSkill(skill)}
                       disabled={!isSelected && selectedSkills.length >= 3}
                       className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                         isSelected 
                         ? 'bg-locale-blue text-white border-locale-blue' 
                         : 'bg-carbon-900 text-gray-400 border-carbon-600 hover:border-gray-500'
                       } ${!isSelected && selectedSkills.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                       {skill}
                     </button>
                   )
                 }) : (
                     <p className="text-sm text-gray-500 italic">No skills found in profile.</p>
                 )}
               </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
              >
                {isSaved ? (
                  <>
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    Saved!
                  </>
                ) : (
                  'Save Preferences'
                )}
              </button>
            </div>

          </div>

          {/* Live Preview */}
          <div className="lg:col-span-5">
             <div className="sticky top-28">
               <div className="flex items-center justify-between mb-4 px-2">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Live Preview</h3>
                 <div className="text-xs bg-carbon-800 px-2 py-1 rounded text-gray-500 font-mono">350x480px</div>
               </div>
               
               <div className="bg-black/20 p-8 rounded-3xl border border-dashed border-gray-700 flex justify-center items-center relative overflow-hidden">
                  <div className="w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
                    <ProfessionalCard 
                        profile={profile} 
                        previewTheme={selectedTheme} 
                        previewSkills={selectedSkills}
                    />
                  </div>
               </div>
               
               <div className="mt-8 bg-carbon-800 p-4 rounded-xl border border-carbon-700 text-xs text-gray-400 flex gap-3 items-start">
                  <svg className="w-5 h-5 text-locale-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p>
                    Pro Tip: Choosing a distinctive theme helps you stand out in the Expert Locator grid. Neon is popular for creative roles.
                  </p>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileCustomizer;
