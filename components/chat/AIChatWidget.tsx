
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dispatchTask, subscribeToTaskQueue } from '../../lib/agents/manager';
import { generateWithOpenRouter } from '../../lib/ai/openrouter';
import { VOICE_LIBRARY, setSelectedVoice, speakText, getSelectedVoice } from '../../lib/voice';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status?: 'sending' | 'thinking' | 'sent' | 'error';
}

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Start closed
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Systems Online. I am ACHEEVY, your Agentic Operating System. \n\nHow can I assist with your infrastructure or deployment today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(getSelectedVoice());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll logic
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if(isOpen) scrollToBottom(); }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!isOpen) setIsOpen(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. GENERATE RESPONSE (OpenRouter)
      const responseText = await generateWithOpenRouter(
        [
            { 
                role: 'system', 
                content: `You are ACHEEVY, the Intelligent Internet Agent for Locale. 
                Your capabilities: Research, Content Gen, Data Analysis, Software Dev, Workflow Automation.
                You act as a "Sentient OS". Be concise, agentic, and professional.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
        ],
        { tier: 'free', taskType: 'reasoning' }
      );

      // 2. DISPATCH TASK (Nervous System)
      dispatchTask('chat_interaction', { prompt: input }, 'acheevy-core');

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMsg]);
      
      // 3. VOCALIZE
      speakText(responseText, selectedVoiceId);

    } catch (error) {
      console.error("Agent Error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Err: Neural Link Unstable. Unable to route request.",
        timestamp: new Date().toISOString(),
        status: 'error'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoice = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const voice = e.target.value;
      setSelectedVoiceId(voice);
      setSelectedVoice(voice);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-in-out ${isOpen ? 'w-[450px] h-[600px]' : 'w-16 h-16'}`}>
      <AnimatePresence>
        {!isOpen && (
           <motion.button
             initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
             onClick={() => setIsOpen(true)}
             className="w-16 h-16 rounded-full bg-black border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center hover:scale-110 transition-transform group"
           >
             <div className="w-10 h-10 rounded-full bg-linear-to-tr from-purple-600 to-blue-600 animate-pulse group-hover:animate-none">
                <svg className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
             </div>
           </motion.button>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="w-full h-full bg-black/95 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* HEADER */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <div className="flex items-center gap-3">
                 {/* ACHEEVY AVATAR */}
                 <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-800 to-black border border-purple-500/50 flex items-center justify-center shadow-lg relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-full"></div>
                    <span className="text-purple-400 text-[10px] font-black tracking-tighter relative z-10">CORE</span>
                 </div>
                 <div>
                    <h3 className="text-white font-bold text-sm tracking-wider">ACHEEVY OS</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Connected</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-3">
                 {/* VOICE SWITCHER */}
                 <div className="relative group">
                    <select 
                        value={selectedVoiceId} 
                        onChange={toggleVoice}
                        className="appearance-none bg-gray-900 text-[10px] text-gray-300 py-1.5 pl-3 pr-7 rounded border border-gray-700 hover:border-purple-500 focus:outline-none uppercase font-mono cursor-pointer transition-colors"
                    >
                        {Object.entries(VOICE_LIBRARY).map(([key, voice]) => (
                            <option key={key} value={key}>{voice.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-2 pointer-events-none text-gray-500 text-[8px] group-hover:text-purple-400">▼</div>
                 </div>

                 {/* CLOSE BUTTON */}
                 <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                     <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mr-2 shrink-0 mt-1">
                        <span className="text-[8px] text-purple-400">AI</span>
                     </div>
                  )}
                  <div 
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-br-none shadow-purple-900/20' 
                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                  <div className="flex justify-start items-center">
                     <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mr-2 shrink-0">
                        <span className="text-[8px] text-purple-400 animate-pulse">AI</span>
                     </div>
                     <div className="bg-gray-800/50 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-700/50">
                        <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                     </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 bg-gray-900/80 border-t border-gray-800 backdrop-blur">
               <div className="relative group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Command the Intelligent Internet..."
                    className="w-full bg-black border border-gray-700 rounded-xl py-3.5 pl-4 pr-12 text-sm text-white focus:border-purple-500 focus:outline-none placeholder-gray-600 transition-all font-mono shadow-inner"
                  />
                  <div className="absolute right-2 top-2">
                      <button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            input.trim() 
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                            : 'bg-gray-800 text-gray-500'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </button>
                  </div>
               </div>
               <div className="text-[9px] text-center text-gray-600 mt-2 font-mono uppercase tracking-widest">
                  Powered by OpenRouter V3 • Secured by ACHEEVY
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatWidget;
