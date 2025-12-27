/**
 * AIChatPage - Full Page Chat with ACHEEVY
 * The primary AI interaction interface
 */

import React, { useState, useRef, useEffect } from 'react';
import { callConciergeAI } from '../../lib/llm/vertexai';
import { speakText, getSelectedVoice, VOICE_LIBRARY, setSelectedVoice } from '../../lib/voice';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Think It. Prompt It. Let Me Manage It.\n\nI'm ACHEEVY, your AI Executive Agent. How can I help you build your infrastructure today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setVoice] = useState(getSelectedVoice());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await callConciergeAI({
        query: input.trim(),
        context: { current_page: '/chat' }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      try {
        speakText(response.response, selectedVoice);
      } catch (e) {
        console.warn('TTS failed:', e);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your API configuration in Circuit Box.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setVoice(voiceId);
    setSelectedVoice(voiceId);
  };

  return (
    <div className="min-h-screen bg-carbon-900 flex flex-col">
      {/* Header */}
      <div className="bg-carbon-800 border-b border-carbon-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-400/50">
              <img 
                src="/assets/acheevy-robot.jpg" 
                alt="ACHEEVY" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Chat w/ACHEEVY</h1>
              <p className="text-xs text-green-400">Think It. Prompt It. Let Me Manage It.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Voice Selector */}
            <select
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="bg-carbon-900 text-white text-sm px-3 py-2 rounded-lg border border-carbon-600 focus:border-green-400 outline-none"
            >
              {Object.entries(VOICE_LIBRARY).map(([key, voice]) => (
                <option key={key} value={key}>{voice.name}</option>
              ))}
            </select>
            
            {/* Status */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex-shrink-0 overflow-hidden ${
                msg.role === 'assistant' 
                  ? 'border-2 border-green-400/50' 
                  : 'bg-locale-blue'
              }`}>
                {msg.role === 'assistant' ? (
                  <img src="/assets/acheevy-robot.jpg" alt="ACHEEVY" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">U</div>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[70%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-locale-blue text-white rounded-tr-none'
                  : 'bg-carbon-800 text-gray-200 border border-carbon-700 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className="text-xs opacity-50 mt-2 block">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-400/50 flex-shrink-0">
                <img src="/assets/acheevy-robot.jpg" alt="ACHEEVY" className="w-full h-full object-cover" />
              </div>
              <div className="bg-carbon-800 border border-carbon-700 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-carbon-800/95 backdrop-blur-xl border-t border-carbon-700 px-6 py-6 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 bg-carbon-900 rounded-2xl px-6 py-4 border border-carbon-600 focus-within:border-green-400 focus-within:shadow-lg focus-within:shadow-green-500/10 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Think it. Prompt it..."
              className="flex-1 bg-transparent text-white text-lg outline-none placeholder-gray-500 font-medium"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
                input.trim() && !isLoading
                  ? 'bg-green-500 text-black hover:bg-green-400 shadow-lg shadow-green-500/20'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              SEND
            </button>
          </div>
          
          {/* Quick Actions (Centered) */}
          <div className="flex justify-center gap-2 mt-4">
            {['Find Talent', 'Estimate Tokens', 'Get Verified', 'AI Assist'].map((action) => (
              <button
                key={action}
                onClick={() => setInput(action)}
                className="px-4 py-2 bg-carbon-700/50 hover:bg-carbon-600 text-gray-400 hover:text-white text-xs font-medium rounded-full border border-carbon-600/50 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Spacer for fixed bottom input */}
      <div className="h-48" />
    </div>
  );
};

export default AIChatPage;
