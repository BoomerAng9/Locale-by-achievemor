/**
 * ConciergeBot - The Platform's Intelligent Assistant UI
 * Fixed floating interface powered by Vertex AI (Gemini)
 * Features: Voice selection, human-sounding TTS, Voice Panel
 */

import React, { useState, useRef, useEffect } from 'react';
import { callConciergeAI } from '../../lib/llm/vertexai';
import { listenToSpeech, speakText, getSelectedVoice, VOICE_LIBRARY } from '../../lib/voice';
import { AI_PLUG_REGISTRY, searchPlugs } from '../../lib/ai-plugs/registry';
import { aiPlugEngine } from '../../lib/ai-plugs/engine';
import type { ConciergeResponse } from '../../lib/firestore/schema';
import { useLocation, useNavigate } from 'react-router-dom';
import VoiceSelector from '../voice/VoiceSelector';

interface SuggestedAction {
  type: 'search' | 'navigate' | 'calculate' | 'ai-plug';
  label: string;
  payload: any;
}

const ConciergeBot: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [currentVoice, setCurrentVoice] = useState(getSelectedVoice());
  const [response, setResponse] = useState<ConciergeResponse | null>(null);
  const [showAIPlugs, setShowAIPlugs] = useState(false);
  const [aiPlugSearch, setAiPlugSearch] = useState('');
  const [executingPlug, setExecutingPlug] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleVoiceInput = async () => {
      setIsListening(true);
      await listenToSpeech((transcript) => {
          setQuery(transcript);
          setIsListening(false);
          setTimeout(() => handleSubmit(new Event('submit') as any, transcript), 500);
      });
  };

  const enhanceWithAIPlugs = async (result: ConciergeResponse, query: string): Promise<ConciergeResponse> => {
    // Find relevant AI Plugs based on the query
    const relevantPlugs = findRelevantAIPlugs(query);

    if (relevantPlugs.length > 0) {
      const aiPlugActions: SuggestedAction[] = relevantPlugs.slice(0, 3).map(plug => ({
        type: 'ai-plug' as const,
        label: `Execute: ${plug.name}`,
        payload: { plugId: plug.id, plugName: plug.name }
      }));

      return {
        ...result,
        suggested_actions: [
          ...result.suggested_actions,
          ...aiPlugActions
        ]
      };
    }

    return result;
  };

  const findRelevantAIPlugs = (query: string): typeof AI_PLUG_REGISTRY => {
    const queryLower = query.toLowerCase();

    // Keyword mapping for better matching
    const keywordMap: Record<string, string[]> = {
      'content': ['content-creation'],
      'blog': ['content-blog-generator'],
      'social': ['social-media-manager'],
      'video': ['video-script-writer'],
      'email': ['email-copy-generator'],
      'product': ['product-description-writer'],
      'ad': ['ad-copy-generator'],
      'legal': ['legal-compliance'],
      'contract': ['contract-generator'],
      'compliance': ['compliance-checker'],
      'ecommerce': ['ecommerce-retail'],
      'shop': ['ecommerce-retail'],
      'retail': ['ecommerce-retail'],
      'marketing': ['marketing-seo'],
      'seo': ['seo-optimizer'],
      'ads': ['google-ads-manager'],
      'chatbot': ['voice-chatbots'],
      'voice': ['voice-chatbots'],
      'education': ['education-training'],
      'training': ['education-training'],
      'health': ['healthcare-wellness'],
      'finance': ['finance-accounting'],
      'accounting': ['finance-accounting'],
      'real estate': ['real-estate'],
      'property': ['real-estate'],
      'hr': ['hr-recruiting'],
      'recruiting': ['hr-recruiting'],
      'creative': ['creative-media'],
      'media': ['creative-media'],
      'operations': ['operations-workflow'],
      'workflow': ['operations-workflow']
    };

    // Find matching categories and specific plugs
    const matchingPlugs: typeof AI_PLUG_REGISTRY = [];

    for (const [keyword, targets] of Object.entries(keywordMap)) {
      if (queryLower.includes(keyword)) {
        targets.forEach(target => {
          if (target.includes('-')) {
            // It's a category
            const categoryPlugs = AI_PLUG_REGISTRY.filter(p => p.category === target);
            matchingPlugs.push(...categoryPlugs);
          } else {
            // It's a specific plug ID
            const plug = AI_PLUG_REGISTRY.find(p => p.id === target);
            if (plug) matchingPlugs.push(plug);
          }
        });
      }
    }

    // Remove duplicates and return top matches
    return [...new Set(matchingPlugs)].slice(0, 5);
  };

  const handleSubmit = async (e: React.FormEvent, overrideQuery?: string) => {
    e.preventDefault();
    const activeQuery = overrideQuery || query;
    if (!activeQuery.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const result = await callConciergeAI({
        query: activeQuery.trim(),
        context: {
          current_page: location.pathname,
        },
      });

      // Enhance response with AI Plug suggestions
      const enhancedResult = await enhanceWithAIPlugs(result, activeQuery.trim());

      setResponse(enhancedResult);

      // Auto-Speak Response with selected voice
      if (enhancedResult.response) {
          speakText(enhancedResult.response);
      }

    } catch (error) {
      console.error('[Concierge] Error:', error);
      setResponse({
        response: "I'm having trouble connecting right now. Please try again in a moment.",
        suggested_actions: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: SuggestedAction) => {
    switch (action.type) {
      case 'navigate':
        navigate(action.payload);
        setIsExpanded(false);
        setResponse(null);
        break;
      case 'search':
        navigate(`/explore?q=${encodeURIComponent(action.payload.query || '')}`);
        setIsExpanded(false);
        setResponse(null);
        break;
      case 'calculate':
        navigate('/localator');
        setIsExpanded(false);
        setResponse(null);
        break;
    }
    setQuery('');
  };

  const handleClose = () => {
    setIsExpanded(false);
    setResponse(null);
    setQuery('');
    setShowVoicePanel(false);
  };

  const selectedVoiceInfo = VOICE_LIBRARY[currentVoice as keyof typeof VOICE_LIBRARY];

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      {/* Concierge Widget - STICKY BOTTOM BAR */}
      <div className={`fixed z-50 transition-all duration-300 ${
        isExpanded 
          ? 'bottom-0 left-0 right-0 w-full' 
          : 'bottom-6 left-1/2 -translate-x-1/2'
      }`}>
        
        {/* Collapsed State - Floating Button */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            aria-label="Open ACHEEVY AI Assistant"
            className="group flex items-center gap-3 bg-carbon-800 hover:bg-carbon-700 border-2 border-locale-blue/50 hover:border-locale-blue shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] rounded-full px-5 py-3 transition-all"
          >
            {/* ACHEEVY Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-locale-blue/50 group-hover:border-locale-blue">
              <img src="/assets/ai-concierge.jpg" alt="ACHEEVY AI" className="w-full h-full object-cover" />
            </div>
            <span className="text-white font-medium hidden md:block">Ask ACHEEVY</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse absolute top-2 right-2" />
          </button>
        )}

        {/* Expanded State - Full Width Sticky Bar */}
        {isExpanded && (
          <div className="bg-carbon-900/98 backdrop-blur-xl border-t border-carbon-600 shadow-2xl shadow-black/50 relative">
            
            {/* Voice Selector Panel - Overlay */}
            {showVoicePanel && (
              <div className="absolute bottom-full left-0 right-0 max-w-3xl mx-auto mb-2 px-4">
                <VoiceSelector 
                  onClose={() => setShowVoicePanel(false)}
                  onVoiceChange={(voiceKey) => setCurrentVoice(voiceKey)}
                />
              </div>
            )}

            {/* Response Area - Shows above input when there's a response */}
            {response && (
              <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 border-b border-carbon-700">
                <div className="bg-carbon-800/80 rounded-xl p-4 max-h-60 overflow-y-auto">
                  <p className="text-white text-sm leading-relaxed">{response.response}</p>
                  
                  {/* Suggested Actions */}
                  {response.suggested_actions && response.suggested_actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {response.suggested_actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleAction(action)}
                          className="px-3 py-1.5 bg-locale-blue/10 hover:bg-locale-blue/20 border border-locale-blue/30 text-locale-blue text-xs rounded-lg transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Input Area - Full Width */}
            <div className="px-4 md:px-8 py-4">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                  {/* ACHEEVY Avatar */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-locale-blue/30">
                      <img src="/assets/ai-concierge.jpg" alt="ACHEEVY" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  
                  {/* Input Field - Full Width */}
                  <div className="flex-1 relative group">
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask ACHEEVY anything... (services, estimates, verification)"
                      className="w-full bg-carbon-800 border border-carbon-600 focus:border-locale-blue rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none transition-all focus:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                      disabled={isLoading}
                    />
                  </div>
                  
                  {/* Voice Button */}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`flex-shrink-0 p-3 rounded-xl transition-colors ${
                      isListening 
                        ? 'bg-red-500/20 text-red-500 animate-pulse' 
                        : 'bg-carbon-800 text-gray-400 hover:text-white hover:bg-carbon-700'
                    }`}
                    title="Voice Input"
                    aria-label="Voice input"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  
                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="flex-shrink-0 px-5 py-3 bg-locale-blue hover:bg-locale-darkBlue disabled:bg-carbon-600 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors"
                  >
                    {isLoading ? '...' : 'ASK'}
                  </button>
                  
                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-shrink-0 p-3 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
                
                {/* Quick Actions Row */}
                <div className="flex items-center gap-3 mt-3 overflow-x-auto pb-1">
                  <span className="text-xs text-gray-500 flex-shrink-0">Quick:</span>
                  {[
                    { label: '🔍 Find Talent', query: 'Find me a web developer' },
                    { label: '💰 Estimate', query: 'How much for a mobile app?' },
                    { label: '✅ Verify', query: 'How do I get verified?' },
                    { label: '🎙️ Voice', query: 'Set up my voice preferences' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setQuery(item.query);
                        inputRef.current?.focus();
                      }}
                      className="flex-shrink-0 px-3 py-1.5 bg-carbon-800 hover:bg-carbon-700 text-gray-400 hover:text-white text-xs rounded-lg border border-carbon-700 hover:border-carbon-600 transition-all whitespace-nowrap"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                
                {/* Footer */}
                <p className="text-center text-[10px] text-gray-600 mt-3">
                  Powered by AVVA NOON • <span className="text-locale-blue">Think It. Prompt It. Let ACHEEVY Manage It.</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConciergeBot;
