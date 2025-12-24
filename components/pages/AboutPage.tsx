/**
 * About Us Page
 * Company information, mission, and team
 */

import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-carbon-900">
            {/* Hero Section */}
            <div className="relative bg-carbon-800 border-b border-carbon-700 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                
                <div className="max-w-5xl mx-auto px-6 py-24 relative z-10">
                    <Link to="/" className="text-gray-500 hover:text-white text-sm mb-6 inline-block">← Back to Home</Link>
                    
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
                        About <span className="text-locale-blue">Us</span>
                    </h1>
                    
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        We're building the future of work — where local meets global, 
                        and AI empowers every professional to reach their potential.
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-5xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Locale by ACHIEVEMOR exists to connect communities through technology. 
                            We believe that talent is everywhere, but opportunity isn't — until now.
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Our platform bridges the gap between skilled professionals and the clients 
                            who need them, whether they're across the street or across the world.
                        </p>
                        <p className="text-gray-400 leading-relaxed">
                            Powered by AI, secured by verification, and built on trust — 
                            we're the <Link to="/explore/garage-to-global" className="text-locale-blue hover:underline">Garage to Global</Link> platform.
                        </p>
                    </div>
                    
                    <div className="bg-carbon-800 rounded-2xl p-8 border border-carbon-700">
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: 'Founded', value: '2024' },
                                { label: 'Headquarters', value: 'PLR' },
                                { label: 'Partners', value: '50K+' },
                                { label: 'Markets', value: '15+' },
                            ].map((item, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-2xl font-bold text-locale-blue">{item.value}</div>
                                    <div className="text-gray-500 text-sm">{item.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* What Makes Us Different */}
            <div className="bg-carbon-800 border-y border-carbon-700">
                <div className="max-w-5xl mx-auto px-6 py-24">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">What Makes Us Different</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🤖',
                                title: 'AI-First Platform',
                                desc: 'ACHEEVY, our AI assistant, helps partners and clients get more done. Voice commands, intelligent matching, and automated workflows.'
                            },
                            {
                                icon: '📍',
                                title: 'Local + Remote',
                                desc: 'Find talent for in-person tasks in your area, or connect remotely for work that doesn\'t require physical presence. The choice is yours.'
                            },
                            {
                                icon: '🔒',
                                title: 'Trust & Verification',
                                desc: 'Every partner goes through our verification process. Background checks, skill validation, and community reviews build real trust.'
                            },
                            {
                                icon: '💰',
                                title: 'Fair Economics',
                                desc: 'Our Localator calculator ensures partners know their true earnings. No hidden fees, no surprises — just transparent pricing.'
                            },
                            {
                                icon: '🚀',
                                title: 'Garage to Global',
                                desc: 'Start wherever you are. Our platform grows with you — from your first gig to running a global operation.'
                            },
                            {
                                icon: '🎙️',
                                title: 'Your Voice, Your Way',
                                desc: 'Customize how you interact with the platform. Voice commands, preferred AI voices, and personalized experiences.'
                            },
                        ].map((item, i) => (
                            <div key={i} className="bg-carbon-900 rounded-xl p-6 border border-carbon-700">
                                <div className="text-3xl mb-4">{item.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation Subpages */}
            <div className="max-w-5xl mx-auto px-6 py-24">
                <h2 className="text-3xl font-bold text-white mb-12 text-center">Learn More</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link to="/about/ai" className="group bg-carbon-800 border border-carbon-700 hover:border-purple-500/50 rounded-2xl p-8 transition-all">
                        <div className="text-4xl mb-4">🧠</div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400">Meet ACHEEVY</h3>
                        <p className="text-gray-500 text-sm">Our AI assistant powering the future of work.</p>
                        <span className="text-purple-400 text-sm mt-4 inline-block">Explore →</span>
                    </Link>
                    
                    <Link to="/explore/garage-to-global" className="group bg-carbon-800 border border-carbon-700 hover:border-locale-blue/50 rounded-2xl p-8 transition-all">
                        <div className="text-4xl mb-4">🚀</div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-locale-blue">Garage to Global</h3>
                        <p className="text-gray-500 text-sm">Our philosophy and your journey with us.</p>
                        <span className="text-locale-blue text-sm mt-4 inline-block">Learn More →</span>
                    </Link>
                    
                    <Link to="/partners" className="group bg-carbon-800 border border-carbon-700 hover:border-green-500/50 rounded-2xl p-8 transition-all">
                        <div className="text-4xl mb-4">🤝</div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400">Partner Program</h3>
                        <p className="text-gray-500 text-sm">Join our network of verified professionals.</p>
                        <span className="text-green-400 text-sm mt-4 inline-block">Apply Now →</span>
                    </Link>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-locale-blue/10 to-purple-500/10 border-t border-carbon-700">
                <div className="max-w-5xl mx-auto px-6 py-16 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
                    <p className="text-gray-400 mb-8">Join thousands of partners and clients building the future of work.</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register" className="bg-locale-blue hover:bg-locale-darkBlue text-white font-bold py-3 px-8 rounded-xl transition-colors">
                            Create Account
                        </Link>
                        <Link to="/explore" className="bg-carbon-700 hover:bg-carbon-600 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                            Explore
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
