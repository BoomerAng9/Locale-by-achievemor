import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listManusProjects } from '../../../lib/manus';
import { Link } from 'react-router-dom';

const AiIntroPage: React.FC = () => {
    const [isChestOpen, setIsChestOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
            {/* Simple Back Navigation */}
            <div className="absolute top-6 left-6 z-20">
                <Link to="/" className="text-gray-400 hover:text-white text-sm flex items-center gap-2 font-mono">
                    ← Back to Home
                </Link>
            </div>
            
            {/* Carbon Fiber Background Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(#333 1px, transparent 1px)`, backgroundSize: '16px 16px' }} 
            />
            
            <main className="relative z-10 container mx-auto px-6 pt-32 pb-20">
                
                {/* HERO SECTION */}
                <div className="text-center mb-24">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter"
                    >
                        THINK IT. <span className="text-locale-blue">PROMPT IT.</span>
                        <br />
                        LET US <span className="text-green-400">MANAGE IT.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto"
                    >
                        Welcome to the new era of work. Where your office assistant is infinite, 
                        and your workforce scales on demand.
                    </motion.p>
                </div>

                {/* THE VAULT OPENING ANIMATION */}
                <div className="flex flex-col items-center justify-center mb-32 h-[500px]">
                    {!isChestOpen ? (
                        <motion.div 
                            className="cursor-pointer group relative"
                            onClick={() => setIsChestOpen(true)}
                            whileHover={{ scale: 1.05 }}
                        >   
                            <div className="w-64 h-48 bg-linear-to-b from-carbon-700 to-black rounded-xl border border-carbon-600 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center relative overflow-hidden">
                                {/* Carbon Fiber Texture */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                <div className="text-center z-10">
                                    <div className="text-4xl mb-2">🔒</div>
                                    <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest">Access Neural Core</h3>
                                    <p className="text-[10px] text-gray-600 mt-2">Click to Decrypt</p>
                                </div>
                                <div className="absolute inset-0 bg-locale-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl"
                        >
                            {/* ACHEEVY CARD */}
                            <div className="bg-carbon-800/80 backdrop-blur-xl border border-locale-blue/30 rounded-3xl p-8 hover:border-locale-blue transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-3xl font-bold text-white font-tech">ACHEEVY</h2>
                                    <span className="px-3 py-1 bg-locale-blue/20 text-locale-blue text-xs font-mono rounded uppercase">Concierge Class</span>
                                </div>
                                <div className="h-64 mb-6 rounded-2xl overflow-hidden border border-carbon-600 relative">
                                    <img src="/assets/branding/acheevy_helmet.png" alt="Acheevy" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 text-white/90 font-mono text-sm max-w-[80%]">
                                        "I orchestrate the system. You set the vision."
                                    </div>
                                </div>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Your personal AI office manager. Integrated with Gemini, Claude, and Manus. Acheevy handles task delegation, scheduling, and project scoping so you can focus on strategy.
                                </p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-black rounded text-xs text-gray-500 border border-gray-800">Voice Enabled</span>
                                    <span className="px-2 py-1 bg-black rounded text-xs text-gray-500 border border-gray-800">Multi-Model</span>
                                </div>
                            </div>

                            {/* BOOMER_ANG CARD */}
                            <div className="bg-carbon-800/80 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 hover:border-green-500 transition-all group">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-3xl font-bold text-white font-tech">BOOMER_ANGS</h2>
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded uppercase">Field Agents</span>
                                </div>
                                <div className="h-64 mb-6 rounded-2xl overflow-hidden border border-carbon-600 relative">
                                    <img src="/assets/branding/ang_device.jpg" alt="Boomer_Ang" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 text-white/90 font-mono text-sm">
                                        Status: Deployed
                                    </div>
                                </div>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    Specialized autonomous agents dispatched by Acheevy. From web researchers (Finder_Ang) to code architects (Thesys_Ang), they execute complex tasks in the background.
                                </p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-black rounded text-xs text-gray-500 border border-gray-800">Autonomous</span>
                                    <span className="px-2 py-1 bg-black rounded text-xs text-gray-500 border border-gray-800">Task Specific</span>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </div>

                {/* MANUS POWER SECTION */}
                <div className="max-w-4xl mx-auto bg-linear-to-r from-carbon-900 to-black rounded-3xl border border-carbon-700 p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                    
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-purple-400">POWERED BY MANUS</span>
                        <div className="h-px bg-purple-500/30 flex-1"></div>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-gray-400 text-lg mb-6">
                                We've integrated the <strong className="text-white">Manus "Power Local" Engine</strong> directly into Locale.
                                This allows Clients and Partners to instantiate persistent projects that live beyond a single chat session.
                            </p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-gray-300">
                                    <span className="text-purple-400">✓</span> Open-Ended Research
                                </li>
                                <li className="flex items-center gap-2 text-gray-300">
                                    <span className="text-purple-400">✓</span> Document Drafting
                                </li>
                                <li className="flex items-center gap-2 text-gray-300">
                                    <span className="text-purple-400">✓</span> Complex execution plans
                                </li>
                            </ul>
                            <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]">
                                Initialize Agent
                            </button>
                        </div>
                        
                        {/* Simulated Terminal / Code Block */}
                        <div className="bg-black/50 rounded-xl p-4 font-mono text-xs text-gray-400 border border-carbon-700">
                            <div className="flex gap-1.5 mb-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                            </div>
                            <div className="space-y-1">
                                <p><span className="text-blue-400">➜</span> <span className="text-purple-400">manus</span> init --project "Market Analysis"</p>
                                <p className="text-gray-500">[INFO] Connecting to neural grid...</p>
                                <p className="text-gray-500">[INFO] Agent profile: manus-1.6</p>
                                <p className="text-green-400">[SUCCESS] Project #proj_8x92 created.</p>
                                <p className="animate-pulse">_</p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AiIntroPage;
