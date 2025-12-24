/**
 * ConciergeBot - The Platform's Intelligent Assistant UI
 * Fixed floating interface powered by Vertex AI (Gemini)
 * Features: Voice selection, human-sounding TTS, Voice Panel
 */

import React, { useState, useRef, useEffect } from 'react';
import { callConciergeAI } from '../../lib/llm/vertexai';
import { listenToSpeech, speakText, getSelectedVoice, VOICE_LIBRARY } from '../../lib/voice';
import type { ConciergeResponse } from '../../lib/firestore/schema';
import { useLocation, useNavigate } from 'react-router-dom';
import VoiceSelector from '../voice/VoiceSelector';

interface SuggestedAction {
  type: 'search' | 'navigate' | 'calculate';
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
      setResponse(result);
      
      // Auto-Speak Response with selected voice
      if (result.response) {
          speakText(result.response);
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

      {/* Concierge Widget - FIXED at bottom center */}
      <div className={`fixed z-50 transition-all duration-300 ${
        isExpanded 
          ? 'bottom-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4' 
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-locale-blue to-purple-600 flex items-center justify-center border-2 border-locale-blue/50 group-hover:border-locale-blue">
              <span className="text-xl">🤖</span>
            </div>
            <span className="text-white font-medium hidden md:block">Ask ACHEEVY</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse absolute top-2 right-2" />
          </button>
        )}

        {/* Expanded State - Chat Panel */}
        {isExpanded && (
          <div className="bg-carbon-800/95 backdrop-blur-xl border border-carbon-600 rounded-2xl shadow-2xl shadow-locale-blue/10 overflow-hidden relative">
            
            {/* Voice Selector Panel */}
            {showVoicePanel && (
              <VoiceSelector 
                onClose={() => setShowVoicePanel(false)}
                onVoiceChange={(voiceKey) => setCurrentVoice(voiceKey)}
              />
            )}

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-carbon-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-locale-blue to-purple-600 flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">ACHEEVY</h3>
                  <p className="text-gray-500 text-xs">Think It. Prompt It. Let Me Manage It.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Voice Settings Button */}
                <button 
                  onClick={() => setShowVoicePanel(!showVoicePanel)}
                  aria-label="Voice settings"
                  title={`Voice: ${selectedVoiceInfo?.name || 'Default'}`}
                  className={`p-2 rounded-full transition-colors ${
                    showVoicePanel ? 'bg-locale-blue text-white' : 'text-gray-400 hover:text-white hover:bg-carbon-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                {/* Close Button */}
                <button 
                  onClick={handleClose}
                  aria-label="Close chat"
                  className="text-gray-400 hover:text-white p-1 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Response Area */}
            {(isLoading || response) && (
              <div className="px-4 py-4 border-b border-carbon-700 max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-5 h-5 border-2 border-locale-blue border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm animate-pulse">Thinking...</span>
                  </div>
                ) : response && (
                  <div className="space-y-4">
                    {/* AI Response */}
                    <p className="text-gray-300 text-sm leading-relaxed">{response.response}</p>
                    
                    {/* Suggested Actions */}
                    {response.suggested_actions && response.suggested_actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {response.suggested_actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleAction(action)}
                            className="px-3 py-1.5 bg-locale-blue/20 hover:bg-locale-blue/30 border border-locale-blue/50 text-locale-lightBlue text-xs font-medium rounded-full transition-colors"
                          >
                            {action.label} →
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Voice Control: Replay */}
                    <div className="pt-2 flex items-center gap-4">
                      <button 
                        onClick={() => speakText(response.response)}
                        className="text-xs text-gray-500 hover:text-locale-blue flex items-center gap-1 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        Play Message
                      </button>
                      <span className="text-xs text-gray-600">
                        Voice: {selectedVoiceInfo?.name || 'Default'}
                      </span>
                    </div>

                    {/* Related Categories */}
                    {response.related_categories && response.related_categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-carbon-700">
                        <span className="text-gray-500 text-xs">Related:</span>
                        {response.related_categories.map((cat, i) => (
                          <span 
                            key={i}
                            className="px-2 py-0.5 bg-carbon-700 text-gray-400 text-xs rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4">
              <div className="flex items-center gap-2 bg-carbon-900 rounded-xl pl-4 pr-2 py-2 border border-carbon-700 focus-within:border-locale-blue transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                  disabled={isLoading}
                />
                
                {/* Voice Input Trigger */}
                <button
                   type="button"
                   onClick={handleVoiceInput}
                   className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                   title="Use Voice Input"
                   aria-label="Voice input"
                >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                   </svg>
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="bg-locale-blue hover:bg-locale-darkBlue disabled:bg-carbon-600 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                >
                  {isLoading ? '...' : 'ASK'}
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {[
                  { label: '🔍 Find Talent', query: 'Find me a web developer' },
                  { label: '💰 Estimate Tokens', query: 'How many tokens to build an app?' },
                  { label: '✅ Get Verified', query: 'How do I get verified?' },
                  { label: '🤝 AI Assistant', query: 'Tell me about ACHEEVY' },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setQuery(item.query);
                      inputRef.current?.focus();
                    }}
                    className="flex-shrink-0 px-3 py-1 bg-carbon-700 hover:bg-carbon-600 text-gray-400 hover:text-white text-xs rounded-full transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default ConciergeBot;
