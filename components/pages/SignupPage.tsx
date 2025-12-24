
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../lib/gcp';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { logAuthEvent } from '../../lib/firestore/logger';
import { DEFAULT_PARTNER_FIELDS } from '../../lib/firestore/schema';

const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get('role') || 'client';
  const refCode = searchParams.get('ref') || ''; // Affiliate code from URL
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [affiliateCode, setAffiliateCode] = useState(refCode);
  const [affiliateValid, setAffiliateValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validate affiliate code on change
  useEffect(() => {
    if (!affiliateCode.trim()) {
      setAffiliateValid(null);
      return;
    }

    const validateCode = async () => {
      try {
        const q = query(
          collection(db, 'profiles'),
          where('affiliate_code', '==', affiliateCode.trim())
        );
        const snapshot = await getDocs(q);
        setAffiliateValid(!snapshot.empty);
      } catch {
        setAffiliateValid(null);
      }
    };

    const timer = setTimeout(validateCode, 500);
    return () => clearTimeout(timer);
  }, [affiliateCode]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Auth User in GCP Identity Platform
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update Display Name
      await updateProfile(user, { displayName: name });

      // 3. Find parent partner if affiliate code provided
      let parentPartnerId: string | null = null;
      if (affiliateCode.trim() && affiliateValid) {
        const q = query(
          collection(db, 'profiles'),
          where('affiliate_code', '==', affiliateCode.trim())
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          parentPartnerId = snapshot.docs[0].id;
        }
      }

      // 4. Create User Profile Document in Firestore with Partner fields
      await setDoc(doc(db, 'profiles', user.uid), {
        id: user.uid,
        email: user.email,
        displayName: name,
        role: role === 'partner_setup' ? 'professional' : 'client',
        createdAt: serverTimestamp(),
        verificationStatus: 'pending',
        stage: role === 'partner_setup' ? 'garage' : 'community',
        reputationScore: 0,
        jobsCompleted: 0,
        // Partner architecture fields
        ...DEFAULT_PARTNER_FIELDS,
        parent_partner_id: parentPartnerId,
      });

      // 5. Log the auth event
      await logAuthEvent('register', user.uid, {
        role: role,
        has_referrer: !!parentPartnerId,
        referrer_code: affiliateCode || null,
      });

      // 6. Redirect
      navigate(`/dashboard?role=${role}&new_user=true`);

    } catch (err: any) {
      console.error("GCP Auth Error:", err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-900 flex items-center justify-center px-4 relative">
       {/* Background */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[20%] w-[50%] h-[50%] bg-locale-blue/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-carbon-700 to-transparent"></div>
       </div>

       <div className="w-full max-w-md bg-carbon-800 border border-carbon-700 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
             <div className="inline-block p-3 rounded-full bg-carbon-900 border border-carbon-700 mb-4 shadow-inner">
                {role === 'partner_setup' ? (
                   <span className="text-2xl">⚡</span>
                ) : role === 'client' ? (
                   <span className="text-2xl">💼</span>
                ) : (
                   <span className="text-2xl">👋</span>
                )}
             </div>
             <h1 className="text-2xl font-bold text-white mb-2">Create {role === 'partner_setup' ? 'Partner' : 'Client'} Account</h1>
             <p className="text-gray-400 text-sm">
                Securely hosted on Google Cloud Platform.
             </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
             {error && (
                 <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-200 text-xs rounded-lg">
                     {error}
                 </div>
             )}

             <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-carbon-900 border border-carbon-600 rounded-xl px-4 py-3 text-white focus:border-locale-blue focus:outline-none transition-colors"
                  placeholder="Jane Doe"
                />
             </div>
             
             <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Work Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-carbon-900 border border-carbon-600 rounded-xl px-4 py-3 text-white focus:border-locale-blue focus:outline-none transition-colors"
                  placeholder="name@company.com"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-carbon-900 border border-carbon-600 rounded-xl px-4 py-3 text-white focus:border-locale-blue focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
             </div>

             {/* Affiliate Code Input */}
             <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">
                  Referral Code <span className="text-gray-500 font-normal normal-case">(optional)</span>
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={affiliateCode}
                    onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                    className={`w-full bg-carbon-900 border rounded-xl px-4 py-3 text-white focus:outline-none transition-colors ${
                      affiliateValid === true 
                        ? 'border-green-500' 
                        : affiliateValid === false 
                          ? 'border-red-500' 
                          : 'border-carbon-600 focus:border-locale-blue'
                    }`}
                    placeholder="ABC123"
                  />
                  {affiliateCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {affiliateValid === true && (
                        <span className="text-green-500 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Valid
                        </span>
                      )}
                      {affiliateValid === false && (
                        <span className="text-red-500 text-sm">Invalid</span>
                      )}
                    </div>
                  )}
                </div>
                {affiliateValid && (
                  <p className="text-xs text-green-400 mt-1">
                    🎉 You'll be connected to your referrer and they'll earn commission on your activity!
                  </p>
                )}
             </div>
             
             <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-locale-blue hover:bg-locale-darkBlue text-white font-bold rounded-xl shadow-lg shadow-locale-blue/20 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2"
             >
                {loading ? (
                    <>
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       Creating GCP Account...
                    </>
                ) : (
                    'Create Account'
                )}
             </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
             By joining, you agree to our <Link to="/legal/terms" className="text-gray-400 hover:text-white underline">Terms</Link> and <Link to="/legal/privacy" className="text-gray-400 hover:text-white underline">Privacy Policy</Link>.
          </p>
       </div>
    </div>
  );
};

export default SignupPage;

