/**
 * Admin Control Panel - Circuit Box Dashboard
 * Complete control for APIs, Settings, Integrations, Theming, and White-Labeling
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Types for settings
interface APISettings {
    elevenlabs: string;
    openrouter: string;
    stripe: string;
    kieai: string;
    manus: string;
}

interface ThemeSettings {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    brandName: string;
    logoUrl: string;
}

interface IntegrationStatus {
    name: string;
    connected: boolean;
    lastSync?: string;
}

const AdminControlPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'apis' | 'theme' | 'integrations' | 'whitelabel' | 'users'>('apis');
    const [apiSettings, setApiSettings] = useState<APISettings>({
        elevenlabs: '••••••••••••',
        openrouter: '••••••••••••',
        stripe: '••••••••••••',
        kieai: '••••••••••••',
        manus: '••••••••••••',
    });
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
        primaryColor: '#3B82F6',
        accentColor: '#8B5CF6',
        backgroundColor: '#0a0a0a',
        textColor: '#ffffff',
        brandName: 'Locale by: ACHIEVEMOR',
        logoUrl: ''
    });
    const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
        { name: 'ElevenLabs TTS', connected: true, lastSync: '2024-12-23' },
        { name: 'OpenRouter LLM', connected: true, lastSync: '2024-12-23' },
        { name: 'Stripe Payments', connected: true, lastSync: '2024-12-22' },
        { name: 'Kie AI Video', connected: false },
        { name: 'Manus Orchestrator', connected: true, lastSync: '2024-12-23' },
        { name: 'Firebase/Firestore', connected: true, lastSync: '2024-12-23' },
    ]);
    const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleSave = async () => {
        setSaveStatus('saving');
        // In production, this would save to backend/Firestore
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const toggleApiVisibility = (key: string) => {
        setShowApiKey(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen bg-carbon-900">
            {/* Header */}
            <div className="bg-carbon-800 border-b border-carbon-700 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <Link to="/" className="text-gray-500 hover:text-white text-xs mb-2 inline-block">← Back to Home</Link>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-3xl">⚡</span>
                            Admin Control Panel
                            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30">ADMIN ONLY</span>
                        </h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${
                            saveStatus === 'saved' 
                                ? 'bg-green-600 text-white' 
                                : saveStatus === 'saving'
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-locale-blue hover:bg-locale-darkBlue text-white'
                        }`}
                    >
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {[
                        { id: 'apis', label: '🔑 API Keys', icon: '🔑' },
                        { id: 'theme', label: '🎨 Theme & Colors', icon: '🎨' },
                        { id: 'integrations', label: '🔗 Integrations', icon: '🔗' },
                        { id: 'whitelabel', label: '🏷️ White-Label', icon: '🏷️' },
                        { id: 'users', label: '👥 User Settings', icon: '👥' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                                activeTab === tab.id
                                    ? 'bg-locale-blue text-white'
                                    : 'bg-carbon-800 text-gray-400 hover:text-white hover:bg-carbon-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* API Keys Tab */}
                {activeTab === 'apis' && (
                    <div className="space-y-6">
                        <div className="bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">API Key Management</h2>
                            <div className="space-y-4">
                                {Object.entries(apiSettings).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-4">
                                        <label className="w-40 text-gray-400 capitalize font-medium">{key}</label>
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type={showApiKey[key] ? 'text' : 'password'}
                                                value={value}
                                                onChange={(e) => setApiSettings(prev => ({ ...prev, [key]: e.target.value }))}
                                                className="flex-1 bg-black/50 border border-carbon-600 rounded-lg px-4 py-2 text-white font-mono text-sm"
                                                title={`Enter ${key} API key`}
                                                placeholder={`Enter ${key} API key`}
                                            />
                                            <button
                                                onClick={() => toggleApiVisibility(key)}
                                                className="px-3 py-2 bg-carbon-700 hover:bg-carbon-600 text-gray-400 rounded-lg"
                                            >
                                                {showApiKey[key] ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Default Voice Setting */}
                        <div className="bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Default ACHEEVY Voice</h2>
                            <select 
                                className="w-full bg-black/50 border border-carbon-600 rounded-lg px-4 py-3 text-white"
                                title="Select default voice"
                                aria-label="Default ACHEEVY Voice"
                            >
                                <option value="drew">Drew (Confident & Clear)</option>
                                <option value="rachel">Rachel (Warm & Professional)</option>
                                <option value="bella">Bella (Soft & Expressive)</option>
                                <option value="josh">Josh (Deep & Young)</option>
                            </select>
                            <p className="text-gray-500 text-xs mt-2">This voice will be used as the default for all new users.</p>
                        </div>
                    </div>
                )}

                {/* Theme Tab */}
                {activeTab === 'theme' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Color Palette</h2>
                            <div className="space-y-4">
                                {[
                                    { key: 'primaryColor', label: 'Primary Color' },
                                    { key: 'accentColor', label: 'Accent Color' },
                                    { key: 'backgroundColor', label: 'Background' },
                                    { key: 'textColor', label: 'Text Color' },
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center gap-4">
                                        <label className="w-32 text-gray-400">{label}</label>
                                        <input
                                            type="color"
                                            value={themeSettings[key as keyof ThemeSettings] as string}
                                            onChange={(e) => setThemeSettings(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="w-12 h-10 rounded cursor-pointer"
                                            title={`Select ${label}`}
                                            aria-label={label}
                                        />
                                        <input
                                            type="text"
                                            value={themeSettings[key as keyof ThemeSettings] as string}
                                            onChange={(e) => setThemeSettings(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="flex-1 bg-black/50 border border-carbon-600 rounded-lg px-4 py-2 text-white font-mono text-sm"
                                            title={`${label} hex value`}
                                            placeholder="#000000"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Preview</h2>
                            <div 
                                className="rounded-xl p-6 border" 
                                style={{ 
                                    backgroundColor: themeSettings.backgroundColor,
                                    borderColor: themeSettings.primaryColor + '50'
                                }}
                            >
                                <h3 style={{ color: themeSettings.primaryColor }} className="text-2xl font-bold mb-2">
                                    {themeSettings.brandName}
                                </h3>
                                <p style={{ color: themeSettings.textColor + 'cc' }} className="text-sm mb-4">
                                    Think It. Prompt It. Let Us Manage It.
                                </p>
                                <button 
                                    style={{ backgroundColor: themeSettings.accentColor }}
                                    className="px-4 py-2 rounded-lg text-white text-sm font-bold"
                                >
                                    Sample Button
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Integrations Tab */}
                {activeTab === 'integrations' && (
                    <div className="bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Connected Services</h2>
                        <div className="space-y-3">
                            {integrations.map((integration, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-carbon-900 rounded-xl border border-carbon-700">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${integration.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div>
                                            <div className="text-white font-medium">{integration.name}</div>
                                            <div className="text-gray-500 text-xs">
                                                {integration.connected 
                                                    ? `Last synced: ${integration.lastSync}` 
                                                    : 'Not connected'}
                                            </div>
                                        </div>
                                    </div>
                                    <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        integration.connected 
                                            ? 'bg-carbon-700 text-gray-400 hover:text-white' 
                                            : 'bg-locale-blue text-white'
                                    }`}>
                                        {integration.connected ? 'Configure' : 'Connect'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* White-Label Tab */}
                {activeTab === 'whitelabel' && (
                    <div className="space-y-6">
                        <div className="bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Brand Identity</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-2">Brand Name</label>
                                    <input
                                        type="text"
                                        value={themeSettings.brandName}
                                        onChange={(e) => setThemeSettings(prev => ({ ...prev, brandName: e.target.value }))}
                                        className="w-full bg-black/50 border border-carbon-600 rounded-lg px-4 py-3 text-white"
                                        title="Brand Name"
                                        placeholder="Enter your brand name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Logo URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com/logo.png"
                                        value={themeSettings.logoUrl}
                                        onChange={(e) => setThemeSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                                        className="w-full bg-black/50 border border-carbon-600 rounded-lg px-4 py-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Favicon</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="flex-1 bg-black/50 border border-carbon-600 rounded-lg px-4 py-3 text-white"
                                            title="Upload favicon image"
                                            aria-label="Favicon upload"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Custom Domain</h2>
                            <input
                                type="text"
                                placeholder="app.yourbrand.com"
                                className="w-full bg-black/50 border border-carbon-600 rounded-lg px-4 py-3 text-white mb-4"
                                title="Custom domain"
                                aria-label="Custom domain"
                            />
                            <button className="bg-locale-blue hover:bg-locale-darkBlue text-white px-6 py-2 rounded-lg font-bold">
                                Configure DNS
                            </button>
                        </div>
                    </div>
                )}

                {/* User Settings Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">User Customization Permissions</h2>
                            <div className="space-y-4">
                                {[
                                    { id: 'profile_image', label: 'Custom Profile Image', price: '$3', enabled: true },
                                    { id: 'profile_bio', label: 'Custom Bio & Description', price: 'Free', enabled: true },
                                    { id: 'profile_links', label: 'Social Links', price: 'Free', enabled: true },
                                    { id: 'voice_clone', label: 'Custom Voice Clone', price: '$10', enabled: false },
                                    { id: 'profile_card', label: 'Premium Profile Card Design', price: '$5', enabled: false },
                                ].map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-carbon-900 rounded-xl">
                                        <div>
                                            <div className="text-white font-medium">{item.label}</div>
                                            <div className="text-gray-500 text-xs">{item.price}</div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                defaultChecked={item.enabled}
                                                className="sr-only peer"
                                                title={`Toggle ${item.label}`}
                                                aria-label={`Enable or disable ${item.label}`}
                                            />
                                            <div className="w-11 h-6 bg-carbon-600 peer-focus:ring-2 peer-focus:ring-locale-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-locale-blue"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-carbon-800 border border-carbon-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Profile Card Template</h2>
                            <p className="text-gray-400 text-sm mb-4">
                                C1 Thesys uses this template to generate user profile cards. Users can customize their image for $3.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-32 h-48 bg-carbon-900 rounded-xl border border-carbon-700 flex items-center justify-center text-gray-600">
                                    Template Preview
                                </div>
                                <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold">
                                    Edit Template
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminControlPanel;
