
import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/gcp';

interface VerificationFlowProps {
  onComplete: () => void;
}

// Ballerine types for runtime loading
declare global {
  interface Window {
    BallerineSDK?: {
      flows: {
        init: (config: any) => Promise<void>;
        mount: (containerId: string) => void;
      };
    };
  }
}

const VerificationFlow: React.FC<VerificationFlowProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadBallerineSDK = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (window.BallerineSDK) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.ballerine.io/js/1.5.119/ballerine-sdk.umd.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Ballerine SDK'));
        document.head.appendChild(script);
      });
    };

    const initFlow = async () => {
      try {
        // Load SDK from CDN
        await loadBallerineSDK();
        
        const user = auth.currentUser;
        if (!user) {
          // For demo purposes, we'll allow proceeding without auth
          console.warn("User not authenticated - using demo mode");
        }

        // 1. Get Session/Token from Backend
        let verificationId;
        try {
            const response = await fetch('/api/verification/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.uid || 'demo-user', email: user?.email || 'demo@locale.app' })
            });
            if (!response.ok) throw new Error("Failed to create verification session");
            const data = await response.json();
            verificationId = data.verificationId;
        } catch (apiErr) {
            console.warn("Backend unavailable. Using Mock Verification Session for Demo.");
            verificationId = `mock_ver_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        if (!mounted) return;

        // Check if SDK loaded properly
        if (!window.BallerineSDK) {
          throw new Error("Ballerine SDK not loaded properly");
        }

        // 2. Initialize Ballerine SDK
        await window.BallerineSDK.flows.init({
            endUserId: user?.uid || 'demo-user',
            flowName: 'my-kyc-flow',
            verificationId: verificationId,
            uiConfig: {
                primaryColor: '#3B82F6',
                fontFamily: 'Inter',
                general: {
                    borderRadius: '12px',
                    colors: {
                        primary: '#3B82F6',
                        secondary: '#1A1D21',
                        text: '#FFFFFF',
                    }
                }
            },
            callbacks: {
                onFlowComplete: (payload: any) => {
                    console.log('Verification Completed', payload);
                    onComplete();
                },
                onFlowExit: () => {
                    console.log('User exited flow');
                },
                onFlowError: (err: any) => {
                    console.error('Flow Error', err);
                    if (mounted) setError("Verification flow encountered an error.");
                }
            }
        });

        // 3. Mount the Flow
        if (mounted) {
            window.BallerineSDK.flows.mount('ballerine-container');
            setLoading(false);
        }

      } catch (e: any) {
        console.error(e);
        if (mounted) {
            setError(e.message || "Failed to initialize verification");
            setLoading(false);
        }
      }
    };

    initFlow();

    return () => {
        mounted = false;
    };
  }, [onComplete]);

  if (error) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-carbon-800 rounded-2xl border border-red-900/50">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div className="text-red-400 font-bold mb-2 text-lg">Verification Error</div>
              <p className="text-gray-400 text-sm mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-carbon-700 hover:bg-carbon-600 text-white rounded-lg transition-colors text-sm font-bold"
              >
                Retry
              </button>
          </div>
      )
  }

  return (
    <div className="w-full h-[600px] bg-white rounded-2xl overflow-hidden relative flex flex-col shadow-2xl">
        {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-carbon-900 z-20">
                <div className="w-12 h-12 border-4 border-locale-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm font-mono animate-pulse">Initializing Secure Environment...</p>
                <div className="mt-8 flex items-center gap-2 text-xs text-gray-600">
                    <span>POWERED BY</span>
                    <span className="font-bold text-gray-500">BALLERINE</span>
                </div>
            </div>
        )}
        {/* The container where Ballerine mounts its iframe/UI */}
        <div id="ballerine-container" className="flex-1 w-full h-full bg-white"></div>
    </div>
  );
};

export default VerificationFlow;

