/**
 * Chat SDK Modal
 * The main chat interface that opens when "Consult Locally" is clicked
 * 
 * Features:
 * - Voice input with Groq Whisper
 * - Message persistence for RAG
 * - Industry-aware context
 * - Tagline: "Think It. Prompt It. Let Us Manage It."
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';
import { useMicrophone } from '../../../lib/hooks/useMicrophone';
import { speak } from '../../../lib/voice/providerSwitch';

// ==========================================
// CHAT SDK MODAL COMPONENT
// ==========================================

export const ChatSDKModal: React.FC = () => {
  const {
    messages,
    isLoading,
    isOpen,
    closeChat,
    sendMessage,
    currentIndustry,
    isListening,
    setIsListening,
  } = useChat();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice input hook
  const {
    isRecording,
    isProcessing,
    audioLevel,
    waveformData,
    toggleRecording,
    transcript,
  } = useMicrophone({
    onTranscript: (text) => {
      setInputValue(text);
      // Auto-send after voice input
      if (text.trim()) {
        sendMessage(text);
        setInputValue('');
      }
    },
    onStart: () => setIsListening(true),
    onStop: () => setIsListening(false),
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle send
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && closeChat()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl h-[80vh] bg-gradient-to-b from-carbon-800 to-carbon-900 rounded-3xl border border-carbon-700 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-carbon-700 bg-carbon-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-locale-blue to-purple-600 flex items-center justify-center shadow-lg shadow-locale-blue/20">
                  <img 
                    src="/assets/ai-concierge.jpg" 
                    alt="AI Concierge"
                    className="w-10 h-10 rounded-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {currentIndustry ? `${currentIndustry} Consultant` : 'ACHEEVY Concierge'}
                  </h2>
                  <p className="text-sm text-gray-400 font-medium tracking-wide">
                    Think It. Prompt It. Let Us Manage It.
                  </p>
                </div>
              </div>
              
              <button
                onClick={closeChat}
                className="p-2 rounded-xl hover:bg-carbon-700 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Industry Badge */}
            {currentIndustry && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-locale-blue/10 border border-locale-blue/30 text-locale-blue text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-locale-blue animate-pulse"></span>
                {currentIndustry} Mode Active
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-locale-blue/20 to-purple-600/20 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-locale-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">How can I help you today?</h3>
                <p className="text-gray-400 max-w-sm">
                  Ask me anything about finding local professionals, estimating projects, or navigating the Locale platform.
                </p>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {[
                    { label: '🔍 Find Talent', query: 'Help me find a local professional' },
                    { label: '💰 Get Estimate', query: 'How much would it cost to...' },
                    { label: '✅ Get Verified', query: 'How do I become a verified partner?' },
                    { label: '📈 Scale Up', query: 'How do I grow from Garage to Global?' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(item.query)}
                      className="px-4 py-3 rounded-xl bg-carbon-700/50 hover:bg-carbon-700 border border-carbon-600 hover:border-locale-blue/50 text-sm text-gray-300 hover:text-white transition-all text-left"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-locale-blue text-white'
                          : 'bg-carbon-700 text-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.error && (
                        <p className="text-xs text-red-400 mt-2">Error: {message.error}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-carbon-700 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-locale-blue rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-locale-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-locale-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-carbon-700 bg-carbon-800/50">
            {/* Voice Waveform */}
            {isRecording && (
              <div className="mb-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <div className="flex-1 flex items-center gap-0.5 h-8">
                  {waveformData.map((level, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-red-500/50 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, level * 0.6)}%` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-red-400 font-mono">Recording...</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Voice Button */}
              <button
                onClick={toggleRecording}
                disabled={isProcessing}
                className={`p-3 rounded-xl transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : isProcessing
                    ? 'bg-carbon-600 text-gray-500 cursor-not-allowed'
                    : 'bg-carbon-700 text-gray-400 hover:text-white hover:bg-carbon-600'
                }`}
              >
                {isProcessing ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or tap mic to speak..."
                className="flex-1 bg-carbon-700 border border-carbon-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-locale-blue transition-colors"
                disabled={isLoading || isRecording}
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 rounded-xl bg-locale-blue hover:bg-locale-darkBlue disabled:bg-carbon-600 disabled:cursor-not-allowed text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-3">
              Powered by ACHEEVY AI • Conversations are saved for a personalized experience
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatSDKModal;
