/**
 * AcheevyChat - The branded chat interface
 * 
 * Binge Code Phase: DEVELOP (Cycle 2)
 * Agent: CodeAng
 * 
 * Features:
 * - Brushed metal/glass bezel with "chat w/ ACHEEVY" branding
 * - Real-time agent health indicator
 * - Tap-out/Tag-in visual feedback
 * - Message history with role indicators
 */

import React, { useState, useRef, useEffect } from 'react';
import { AgentHealthScore } from '../../types';
import { getHealthStatusLabel } from '../../lib/agent-health';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  healthScore?: number;
}

interface AcheevyChatProps {
  onSendMessage?: (message: string) => Promise<string>;
  initialMessages?: ChatMessage[];
  currentModel?: string;
  healthScore?: AgentHealthScore;
  isTaggingOut?: boolean;
  embedded?: boolean;
  onClose?: () => void;
}

/**
 * The Chat Bezel - Branded header for all chat interfaces
 */
const ChatBezel: React.FC<{ 
  model?: string; 
  healthScore?: AgentHealthScore;
  isTaggingOut?: boolean;
}> = ({ model = 'ACHEEVY', healthScore, isTaggingOut }) => {
  const status = healthScore ? getHealthStatusLabel(healthScore.overall) : null;
  
  return (
    <div className="relative overflow-hidden">
      {/* Brushed Metal Background */}
      <div 
        className="absolute inset-0 opacity-30 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#2a2a2a]"
      />
      
      {/* Glass Overlay */}
      <div className="relative px-6 py-4 backdrop-blur-xl border-b border-carbon-700/50 bg-carbon-800/30">
        <div className="flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-sans">chat w/</span>
            <span className="text-xl font-bold tracking-[0.2em] text-white font-doto">
              ACHEEVY
            </span>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            {/* Model Tag */}
            <div className="px-3 py-1 rounded-full bg-carbon-900/50 border border-carbon-700">
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                {model}
              </span>
            </div>

            {/* Health Indicator */}
            {status && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  status.color === 'green' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                  status.color === 'yellow' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' :
                  'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse'
                }`} />
                <span className="text-[10px] text-gray-500 font-mono">{status.label}</span>
              </div>
            )}

            {/* Tagging Out Indicator */}
            {isTaggingOut && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 animate-pulse">
                <span className="text-xs text-yellow-400 font-bold">TAPPING OUT...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Chat Message Component
 */
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 rounded-full bg-carbon-800/50 border border-carbon-700">
          <span className="text-xs text-gray-500">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-locale-blue flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {message.model || 'ACHEEVY'}
            </span>
            {message.healthScore && (
              <span className="text-[10px] text-gray-600">
                ({Math.round(message.healthScore * 100)}% health)
              </span>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-locale-blue text-white rounded-br-md' 
            : 'bg-carbon-800 text-gray-200 rounded-bl-md border border-carbon-700'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <div className={`mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <span className="text-[10px] text-gray-600 font-mono">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Chat Component
 */
const AcheevyChat: React.FC<AcheevyChatProps> = ({
  onSendMessage,
  initialMessages = [],
  currentModel = 'gemini-2.0-flash',
  healthScore,
  isTaggingOut = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Simulate API call or use provided handler
      const response = onSendMessage 
        ? await onSendMessage(userMessage.content)
        : await simulateResponse(userMessage.content);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        model: currentModel,
        healthScore: healthScore?.overall,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateResponse = async (prompt: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `I received your message: "${prompt}". This is a simulated response from ACHEEVY. In production, this would connect to the Gemini/OpenRouter backend.`;
  };

  return (
    <div className="flex flex-col h-full bg-carbon-900 rounded-2xl border border-carbon-700 overflow-hidden">
      {/* Bezel Header */}
      <ChatBezel 
        model={currentModel} 
        healthScore={healthScore}
        isTaggingOut={isTaggingOut}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-carbon-800 border border-carbon-700 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-white font-bold mb-2">Start a conversation</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Ask ACHEEVY anything. I can help with research, analysis, content, and more.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-carbon-800 border border-carbon-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:300ms]" />
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
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type your message..."
            disabled={isLoading || isTaggingOut}
            className="flex-1 bg-carbon-900 border border-carbon-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-locale-blue transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isTaggingOut || !input.trim()}
            className="px-6 py-3 bg-locale-blue hover:bg-locale-darkBlue text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcheevyChat;
