import React, { useState, useRef } from 'react';
import { useConsultation } from '../../contexts/ConsultationContext';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { slideUpVariants, springTransition, popHover } from '../../lib/animations';
import { sendToGemini } from '../../../lib/ai/gemini';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Local ChatMessage type (not exported from gemini.ts)
type ChatMessage = { role: 'user' | 'assistant'; content: string };

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any; // For tool outputs
}

export const ConsultationInterface = () => {
  const { activeIndustry, mode, toggleConsultation } = useConsultation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (mode !== 'consultation' || !activeIndustry) return null;

  const IconComponent = (Icons as any)[activeIndustry.icon] as LucideIcon;

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

    // Check for Crawler Command
    // Pattern: "find [industry] in [city], [state]" or "harvest [city]"
    const harvestMatch = input.match(/find (.*) in (.*), (.*)/i) || input.match(/harvest (.*) in (.*)/i);
    
    if (harvestMatch) {
      try {
        const functions = getFunctions();
        const triggerHarvest = httpsCallable(functions, 'triggerBusinessHarvest');
        
        // Parse args (naive parsing)
        let industry = 'General Services';
        let city = '';
        let state = '';

        if (input.includes(',')) {
           const parts = input.split(' in ')[1].split(',');
           city = parts[0].trim();
           state = parts[1].trim();
           industry = input.split(' in ')[0].replace('find ', '').trim();
        } else {
           // Fallback for simple "harvest city"
           city = input.split(' in ')[1] || input.split('harvest ')[1];
           state = 'GA'; // Default or ask user
        }

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Initiating harvest for ${industry} in ${city}, ${state}...`,
          timestamp: new Date()
        }]);

        const result: any = await triggerHarvest({ city, state, industry });
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: `Harvest complete! Found ${result.data.count} leads.`,
          data: result.data.leads,
          timestamp: new Date()
        }]);
        
        setIsLoading(false);
        return;
      } catch (e) {
        console.error("Harvest error", e);
        // Fallthrough to Gemini if harvest fails or wasn't intended
      }
    }

    try {
      // Build context with industry info
      const industryContext = `Industry: ${activeIndustry.name}. Tools available: ${activeIndustry.tools_enabled.join(', ')}. ${activeIndustry.system_prompt}`;
      
      const chatHistory: ChatMessage[] = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      chatHistory.push({ role: 'user', content: input.trim() });

      const response = await sendToGemini(chatHistory, industryContext);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: { label: string; prompt: string }) => {
    setInput(action.prompt);
    inputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      <motion.div 
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col font-sans"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ ...springTransition, delay: 0.2 }}
               className={clsx(
                 "p-2 rounded-lg",
                 `bg-${activeIndustry.theme_color}/20 text-${activeIndustry.theme_color}`
               )}
               style={{ color: `var(--color-${activeIndustry.theme_color})` }}
             >
               {IconComponent && <IconComponent className="w-5 h-5" />}
             </motion.div>
             <div>
               <motion.span 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 }}
                 className="text-white font-bold block leading-tight"
               >
                 {activeIndustry.name} Mode
               </motion.span>
               <motion.span 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.4 }}
                 className="text-xs text-slate-400"
               >
                 AI Context Active
               </motion.span>
             </div>
          </div>
          <motion.button 
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleConsultation} 
            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <Icons.X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {/* Background Effect based on industry */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
             {/* Base Ambient Glow */}
             <motion.div 
               initial={{ scale: 0.5, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 1 }}
               className={clsx(
                 "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] opacity-10",
                 `bg-${activeIndustry.theme_color}/20`
               )} 
             />
             
             {/* Morphing Backgrounds */}
             {activeIndustry.dashboard_layout === 'map_heavy' && (
               <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center grayscale mix-blend-overlay" />
             )}
             
             {activeIndustry.dashboard_layout === 'media_heavy' && (
               <div className="absolute inset-0 flex items-center justify-center opacity-10">
                 <div className="w-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse h-[2px]" />
                 <div className="absolute w-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse delay-75 h-[2px] rotate-45" />
               </div>
             )}

             {activeIndustry.dashboard_layout === 'data_heavy' && (
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[length:20px_20px]" />
             )}

             {activeIndustry.dashboard_layout === 'generative' && (
               <div className="absolute inset-0 opacity-20">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />
               </div>
             )}
          </div>

          {/* Welcome Message from Persona */}
          <div className="max-w-3xl mx-auto relative z-10 mt-10">
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               transition={{ ...springTransition, delay: 0.2 }}
               className="bg-white/5 border border-white/10 p-8 rounded-2xl mb-8 shadow-2xl backdrop-blur-md"
             >
               <div className="flex items-start gap-4">
                 <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-lg">
                   <Icons.Bot className="w-8 h-8 text-white" />
                 </div>
                 <div>
                   <h1 className="text-2xl font-bold text-white mb-2">
                     {activeIndustry.system_prompt.split('.')[0]}
                   </h1>
                   <p className="text-slate-300 leading-relaxed text-lg">
                     I'm initialized and ready. I have access to <span className="text-white font-semibold">{activeIndustry.tools_enabled.length} specialized tools</span> for this session.
                   </p>
                   <div className="mt-4 flex flex-wrap gap-2">
                     {activeIndustry.tools_enabled.map((tool, i) => (
                       <motion.span 
                         key={tool}
                         initial={{ opacity: 0, scale: 0 }}
                         animate={{ opacity: 1, scale: 1 }}
                         transition={{ delay: 0.5 + (i * 0.1) }}
                         className="px-2 py-1 rounded text-xs font-mono bg-black/30 text-slate-400 border border-white/5"
                       >
                         {tool}
                       </motion.span>
                     ))}
                   </div>
                 </div>
               </div>
             </motion.div>

             {/* Chat Messages */}
             {messages.map((message) => (
               <motion.div 
                 key={message.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={clsx(
                   "mb-4 flex",
                   message.role === 'user' ? 'justify-end' : 'justify-start'
                 )}
               >
                 <div className={clsx(
                   "max-w-[80%] p-4 rounded-2xl",
                   message.role === 'user' 
                     ? 'bg-locale-blue text-white rounded-br-sm' 
                     : 'bg-white/10 text-slate-200 rounded-bl-sm'
                 )}>
                   <p className="leading-relaxed">{message.content}</p>
                 </div>
               </motion.div>
             ))}

             {/* Loading Indicator */}
             {isLoading && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex items-center gap-3 text-slate-400"
               >
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                   <Icons.Bot className="w-4 h-4" />
                 </div>
                 <div className="flex gap-1">
                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]"></span>
                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]"></span>
                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]"></span>
                 </div>
               </motion.div>
             )}
          </div>
        </div>

        {/* Input Area with Quick Actions */}
        <div className="p-6 border-t border-white/10 bg-slate-900/50">
          <div className="max-w-3xl mx-auto">
            {/* Quick Actions */}
            <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {activeIndustry.quick_actions.map((action, i) => (
                <motion.button 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  variants={popHover}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleQuickAction(action)}
                  className={clsx(
                    "px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
                    "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20"
                  )}
                >
                  <Icons.Sparkles className="w-3 h-3 opacity-50" />
                  {action.label}
                </motion.button>
              ))}
            </div>
            
            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative group">
              <div className={clsx(
                "absolute -inset-0.5 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur",
                `bg-${activeIndustry.theme_color}`
              )}></div>
              <div className="relative flex items-center bg-slate-950 rounded-2xl border border-white/10 focus-within:border-white/20 transition-colors">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${activeIndustry.name}...`}
                  className="w-full bg-transparent p-4 pr-14 text-white placeholder:text-slate-500 focus:outline-none text-lg"
                  disabled={isLoading}
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send Message"
                  className="absolute right-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                >
                  {isLoading ? (
                    <Icons.Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icons.ArrowUp className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
            <div className="text-center mt-3">
              <p className="text-xs text-slate-500">
                AI Context: <span className="text-slate-400">{activeIndustry.name}</span> • Powered by SmelterOS
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
