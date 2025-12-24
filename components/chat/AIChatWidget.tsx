
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { sendMessageToGLM } from '../../lib/llm/glm';
import { LocaleLogo } from '../Brand/Logo';

const AIChatWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'I am your Locale Concierge. How can I assist you today?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, isExpanded]);

  // Handle outside click to collapse
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only collapse if it was expanded and user clicked outside
        if (isExpanded) setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Ensure it's expanded when sending
    if (!isExpanded) setIsExpanded(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await sendMessageToGLM([...messages, userMsg], 'general');
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 transition-all duration-300 ease-in-out ${isExpanded ? 'h-[600px]' : 'h-auto'}`}
    >
      <div className={`flex flex-col bg-carbon-800/90 backdrop-blur-xl border border-carbon-600 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${isExpanded ? 'h-full' : ''}`}>
        
        {/* Chat History Area (Visible only when expanded) */}
        {isExpanded && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-carbon-600">
             <div className="flex justify-between items-center mb-4 border-b border-carbon-700 pb-2">
                <span className="text-xs font-bold text-locale-blue uppercase tracking-widest">AI Command Center</span>
                <button onClick={() => setIsExpanded(false)} className="text-gray-500 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
             </div>
             
             {messages.map(msg => (
               <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 {msg.role === 'assistant' && (
                    <div className="mr-2 h-8 w-8">
                      <LocaleLogo variant="avatar" showText={false} className="h-8 w-8" />
                    </div>
                 )}
                 <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                   msg.role === 'user' 
                     ? 'bg-locale-blue text-white rounded-tr-none' 
                     : 'bg-carbon-900 text-gray-200 border border-carbon-700 rounded-tl-none'
                 }`}>
                   {msg.content}
                 </div>
               </div>
             ))}
             
             {loading && (
               <div className="flex justify-start items-center">
                 <div className="mr-2 h-8 w-8">
                    <LocaleLogo variant="avatar" showText={false} className="h-8 w-8" />
                 </div>
                 <div className="bg-carbon-900 border border-carbon-700 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                   <span className="text-xs text-gray-500 mr-2">Thinking</span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                   <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Bar */}
        <div className="p-2">
          <div className={`relative flex items-center bg-black/40 rounded-full border border-carbon-600 hover:border-locale-blue/50 focus-within:border-locale-blue transition-colors ${isExpanded ? 'bg-black/60' : 'shadow-glow'}`}>
            
            {/* Icon (Concierge Avatar) */}
            <div className="pl-3 flex-shrink-0">
               <LocaleLogo variant="avatar" showText={false} className="h-10 w-10" />
            </div>

            <input
              type="text"
              value={input}
              onFocus={handleInputFocus}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Think It. Prompt It. Let Us Manage it."
              className="w-full bg-transparent border-none text-white px-4 py-4 focus:ring-0 placeholder-gray-400 text-base"
            />
            
            <button 
              onClick={handleSend}
              className={`mr-2 p-2 rounded-full transition-all flex-shrink-0 ${input.trim() ? 'bg-locale-blue text-white hover:bg-locale-darkBlue' : 'bg-carbon-700 text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIChatWidget;
