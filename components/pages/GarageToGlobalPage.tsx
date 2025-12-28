/**
 * Garage to Global Philosophy Page
 * Enhanced landing page explaining the G2G journey and Locale's mission
 */

import React from 'react';
import { Link } from 'react-router-dom';

const GarageToGlobalPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-carbon-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
                <div className="absolute inset-0 bg-linear-to-br from-blue-900/30 via-carbon-900 to-purple-900/20" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-locale-blue/10 rounded-full blur-[150px]" />
                
                <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        {/* Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-locale-blue/10 border border-locale-blue/30 text-locale-blue text-xs font-bold tracking-widest mb-8">
                                <span className="w-2 h-2 rounded-full bg-locale-blue animate-pulse" />
                                OUR PHILOSOPHY
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[0.95]">
                                From{' '}
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-gray-400 to-gray-600">
                                    Garage
                                </span>
                                <br />
                                to{' '}
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-locale-blue via-purple-500 to-pink-500">
                                    Global
                                </span>
                            </h1>
                            
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                Every world-changing company started somewhere small. Apple in a garage. 
                                Amazon in a basement. <strong className="text-white">Your success story starts here.</strong>
                            </p>
                            
                            <p className="text-gray-500 mb-10">
                                Locale by ACHIEVEMOR isn't just a platform—it's the infrastructure 
                                for your journey from local freelancer to global professional.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    to="/register"
                                    className="px-8 py-4 bg-locale-blue hover:bg-locale-darkBlue text-white font-bold rounded-xl transition-all shadow-lg shadow-locale-blue/20 hover:shadow-locale-blue/40"
                                >
                                    Start Your Journey
                                </Link>
                                <Link 
                                    to="/explore"
                                    className="px-8 py-4 bg-carbon-800 text-white font-bold rounded-xl border border-carbon-600 hover:bg-carbon-700 transition-all"
                                >
                                    Explore Talent
                                </Link>
                            </div>
                        </div>

                        {/* Visual - Book/Concept */}
                        <div className="relative hidden md:block">
                            <div className="relative">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-linear-to-br from-locale-blue/20 via-purple-500/10 to-pink-500/20 rounded-3xl blur-3xl" />
                                
                                {/* Book Visual */}
                                <div className="relative bg-linear-to-br from-carbon-800 to-carbon-900 rounded-3xl border border-carbon-700 p-10 shadow-2xl">
                                    <div className="aspect-[3/4] bg-linear-to-br from-locale-blue via-purple-600 to-pink-600 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-xl">
                                        <div className="text-6xl mb-4">🚀</div>
                                        <h3 className="text-2xl font-black text-white mb-1">GARAGE</h3>
                                        <span className="text-white/60 text-sm">TO</span>
                                        <h3 className="text-2xl font-black text-white">GLOBAL</h3>
                                        <div className="mt-6 pt-4 border-t border-white/20">
                                            <p className="text-white/70 text-sm">The Modern Playbook</p>
                                            <p className="text-white/50 text-xs mt-1">by ACHIEVEMOR</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Stats */}
                                <div className="absolute -bottom-6 -right-6 bg-carbon-800 border border-carbon-700 rounded-xl p-4 shadow-xl">
                                    <div className="text-2xl font-bold text-locale-blue">50K+</div>
                                    <div className="text-xs text-gray-500">Partners Worldwide</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Journey Stages */}
            <section className="py-24 bg-carbon-800/50 border-y border-carbon-700">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">The Journey</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Your path from local service provider to global professional, powered by Locale.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { 
                                stage: '01', 
                                title: 'GARAGE', 
                                color: 'text-gray-400',
                                borderColor: 'border-gray-600',
                                desc: 'You have the skills. Create your profile, set your rates, and join the network.',
                                icon: '🏠'
                            },
                            { 
                                stage: '02', 
                                title: 'COMMUNITY', 
                                color: 'text-locale-blue',
                                borderColor: 'border-locale-blue/50',
                                desc: 'Get verified. Build your reputation with reviews. Unlock higher-value contracts.',
                                icon: '👥'
                            },
                            { 
                                stage: '03', 
                                title: 'ENTERPRISE', 
                                color: 'text-purple-400',
                                borderColor: 'border-purple-500/50',
                                desc: 'Scale your operation. Handle team projects and serve enterprise clients.',
                                icon: '🏢'
                            },
                            { 
                                stage: '04', 
                                title: 'GLOBAL', 
                                color: 'text-green-400',
                                borderColor: 'border-green-500/50',
                                desc: 'No boundaries. Serve clients anywhere in the world. Your garage is now HQ.',
                                icon: '🌍'
                            },
                        ].map((item, i) => (
                            <div 
                                key={i} 
                                className={`bg-carbon-800 border-2 ${item.borderColor} rounded-2xl p-6 hover:scale-[1.02] transition-all group`}
                            >
                                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                                <div className="text-xs text-gray-600 font-mono mb-2">{item.stage}</div>
                                <h3 className={`text-xl font-bold ${item.color} mb-3`}>{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Partners & Clients */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* For Partners */}
                        <div className="bg-carbon-800 rounded-3xl p-10 border border-carbon-700 hover:border-locale-blue/30 transition-colors">
                            <div className="w-14 h-14 bg-locale-blue/20 rounded-2xl flex items-center justify-center text-3xl mb-6">🤝</div>
                            <h3 className="text-3xl font-bold text-white mb-4">For Partners</h3>
                            <p className="text-gray-400 mb-8">
                                Whether you're a developer, designer, consultant, or creative—turn your skills into a thriving business.
                            </p>
                            <ul className="space-y-4 mb-10">
                                {[
                                    'Create a professional profile in minutes',
                                    'Get discovered by local and global clients',
                                    'Secure payments with built-in escrow',
                                    'Build reputation with verified reviews',
                                    'Access AI tools to boost productivity',
                                    'Scale from solo to team seamlessly',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                        <span className="text-locale-blue mt-0.5">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link 
                                to="/register" 
                                className="inline-flex items-center gap-2 text-locale-blue hover:text-white font-bold transition-colors"
                            >
                                Join as Partner <span>→</span>
                            </Link>
                        </div>

                        {/* For Clients */}
                        <div className="bg-carbon-800 rounded-3xl p-10 border border-carbon-700 hover:border-purple-500/30 transition-colors">
                            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center text-3xl mb-6">🎯</div>
                            <h3 className="text-3xl font-bold text-white mb-4">For Clients</h3>
                            <p className="text-gray-400 mb-8">
                                Find verified, trusted professionals for any project. From quick tasks to long-term partnerships.
                            </p>
                            <ul className="space-y-4 mb-10">
                                {[
                                    'Browse verified local and remote talent',
                                    'AI-powered matching for your needs',
                                    'Protected escrow payments',
                                    'Transparent reviews from past clients',
                                    'Enterprise solutions for teams',
                                    'Concierge support for complex projects',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                        <span className="text-purple-400 mt-0.5">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link 
                                to="/explore" 
                                className="inline-flex items-center gap-2 text-purple-400 hover:text-white font-bold transition-colors"
                            >
                                Find Talent <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Locale */}
            <section className="py-24 bg-carbon-800/30">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-white mb-4">Why Locale?</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            The infrastructure you need to succeed, without the complexity.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🔒',
                                title: 'Verified Trust',
                                desc: 'Every partner goes through identity verification. Every payment is protected by escrow. No exceptions.',
                            },
                            {
                                icon: '🤖',
                                title: 'AI-Powered',
                                desc: 'ACHEEVY, our AI concierge, helps match clients with partners and streamlines every interaction.',
                            },
                            {
                                icon: '🌐',
                                title: 'Local + Global',
                                desc: 'Find talent in your neighborhood or across the world. The choice is yours.',
                            },
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="text-5xl mb-6">{item.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 border-t border-carbon-700">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '50K+', label: 'Partners Worldwide' },
                            { value: '100K+', label: 'Tasks Completed' },
                            { value: '95%', label: 'Satisfaction Rate' },
                            { value: '24/7', label: 'AI Support' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-4xl font-black text-locale-blue mb-2">{stat.value}</div>
                                <div className="text-gray-500 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-linear-to-br from-locale-blue/10 via-purple-500/5 to-pink-500/10">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Go Global?
                    </h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Your journey starts with a single step. Join thousands already building their future on Locale.
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link 
                            to="/register"
                            className="px-10 py-5 bg-white text-carbon-900 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all shadow-xl"
                        >
                            Get Started Free
                        </Link>
                        <Link 
                            to="/explore"
                            className="px-10 py-5 bg-carbon-800 text-white font-bold text-lg rounded-xl border border-carbon-600 hover:bg-carbon-700 transition-all"
                        >
                            Browse Talent
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GarageToGlobalPage;
