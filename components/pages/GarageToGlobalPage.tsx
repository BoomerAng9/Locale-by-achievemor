/**
 * Garage to Global Philosophy Page
 * Explains the G2G journey and Locale's mission
 */

import React from 'react';
import { Link } from 'react-router-dom';

const GarageToGlobalPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-carbon-900">
            {/* Hero Section */}
            <div className="relative bg-carbon-800 border-b border-carbon-700 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-locale-blue/20 via-transparent to-purple-500/10" />
                
                <div className="max-w-5xl mx-auto px-6 py-24 relative z-10 text-center">
                    <Link to="/explore" className="text-gray-500 hover:text-white text-sm mb-6 inline-block">← Back to Explore</Link>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-locale-blue/10 border border-locale-blue/30 text-locale-blue text-xs font-bold tracking-widest mb-8 uppercase">
                        Our Philosophy
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
                        Garage to <span className="text-locale-blue">Global</span>
                    </h1>
                    
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        The journey from where you are to where you want to be. 
                        Locale is the bridge that connects local talent with global opportunity.
                    </p>
                </div>
            </div>

            {/* The Journey */}
            <div className="max-w-5xl mx-auto px-6 py-24">
                <h2 className="text-3xl font-bold text-white mb-12 text-center">The Journey</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { 
                            stage: '01', 
                            title: 'GARAGE', 
                            color: 'text-gray-400',
                            desc: 'Starting out. You have skills, ideas, and ambition. What you need is a platform to showcase your talent and connect with your first clients.',
                            icon: '🏠'
                        },
                        { 
                            stage: '02', 
                            title: 'COMMUNITY', 
                            color: 'text-blue-400',
                            desc: 'Establishing trust. Get verified, build your reputation, and become part of a network of professionals who vouch for each other.',
                            icon: '👥'
                        },
                        { 
                            stage: '03', 
                            title: 'ENTERPRISE', 
                            color: 'text-purple-400',
                            desc: 'Scaling up. With a track record of success, youre ready for bigger contracts, team collaborations, and enterprise clients.',
                            icon: '🏢'
                        },
                        { 
                            stage: '04', 
                            title: 'GLOBAL', 
                            color: 'text-green-400',
                            desc: 'No boundaries. Serve clients anywhere, hire talent from everywhere, and operate as a truly global professional.',
                            icon: '🌍'
                        },
                    ].map((item, i) => (
                        <div key={i} className="bg-carbon-800 border border-carbon-700 rounded-2xl p-6 hover:border-locale-blue/50 transition-colors">
                            <div className="text-4xl mb-4">{item.icon}</div>
                            <div className="text-xs text-gray-600 font-mono mb-2">{item.stage}</div>
                            <h3 className={`text-xl font-bold ${item.color} mb-3`}>{item.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* What We Do */}
            <div className="bg-carbon-800 border-y border-carbon-700">
                <div className="max-w-5xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">What Locale Provides</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            We're building the infrastructure for the next generation of work — connecting service providers (Partners) 
                            with customers (Clients) in a secure, AI-powered platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* For Partners */}
                        <div className="bg-carbon-900 rounded-2xl p-8 border border-carbon-700">
                            <div className="w-12 h-12 bg-locale-blue/20 rounded-xl flex items-center justify-center text-2xl mb-6">🤝</div>
                            <h3 className="text-2xl font-bold text-white mb-4">For Partners (Providers)</h3>
                            <ul className="space-y-3">
                                {[
                                    'Transition from employee to freelancer seamlessly',
                                    'Access an AI Gateway powered by ACHEEVY to service clients',
                                    'Find customers locally OR bring your existing clients here',
                                    'All-in-one platform to manage work, invoices, and communication',
                                    'Build reputation through verified reviews and credentials',
                                    'Scale from solo to team with our collaboration tools',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* For Clients */}
                        <div className="bg-carbon-900 rounded-2xl p-8 border border-carbon-700">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl mb-6">🎯</div>
                            <h3 className="text-2xl font-bold text-white mb-4">For Clients (Customers)</h3>
                            <ul className="space-y-3">
                                {[
                                    'Find verified, trusted local talent for in-person tasks',
                                    'Access remote professionals for tasks that dont require physical presence',
                                    'Secure escrow payments protect both parties',
                                    'AI-powered matching finds the right partner for your needs',
                                    'Track progress, communicate, and manage everything in one place',
                                    'Enterprise solutions for businesses with ongoing needs',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                                        <span className="text-purple-500 mt-0.5">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* The Promise */}
            <div className="max-w-5xl mx-auto px-6 py-24">
                <div className="bg-gradient-to-br from-locale-blue/10 to-purple-500/10 border border-locale-blue/30 rounded-3xl p-12 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Our Promise</h2>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                        Whether you're in your garage with a laptop and a dream, or you're a global enterprise 
                        looking for the best talent — Locale is your platform. We handle the infrastructure, 
                        the verification, the payments, and the AI tools. You focus on doing great work.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-locale-blue hover:bg-locale-darkBlue text-white font-bold py-4 px-8 rounded-xl transition-colors">
                            Start as a Partner
                        </Link>
                        <Link to="/explore" className="bg-carbon-700 hover:bg-carbon-600 text-white font-bold py-4 px-8 rounded-xl transition-colors">
                            Find Talent
                        </Link>
                    </div>
                </div>
            </div>

            {/* Key Stats */}
            <div className="bg-carbon-800 border-t border-carbon-700">
                <div className="max-w-5xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '50K+', label: 'Partners' },
                            { value: '100K+', label: 'Tasks Completed' },
                            { value: '95%', label: 'Satisfaction Rate' },
                            { value: '24/7', label: 'AI Support' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-3xl font-bold text-locale-blue mb-2">{stat.value}</div>
                                <div className="text-gray-500 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GarageToGlobalPage;
