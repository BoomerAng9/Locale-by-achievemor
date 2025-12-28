/**
 * Playground Page - AI Chat Interface
 * Minimal theme with ACHEEVY messaging, voice, attachments, and model selection
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { speakText, listenToSpeech, VOICE_LIBRARY, getSelectedVoice, setSelectedVoice } from '../../lib/voice';
import { AGENT_REGISTRY, BoomerAng } from '../../lib/agents/registry';
import { sendToGemini } from '../../lib/ai/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

// Local ChatMessage type
type ChatMessage = { role: 'user' | 'assistant'; content: string };

// Available AI models
const AVAILABLE_MODELS = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
    { id: 'gpt-4o', name: 'GPT-4o' }
];

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    attachments?: File[];
    agentId?: string;
}

const PlaygroundPage: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
    
    // Select default agent (ACHEEVY)
    const [selectedAgentId, setSelectedAgentId] = useState<string>(AGENT_REGISTRY[0].id);
    const selectedAgent = AGENT_REGISTRY.find(a => a.id === selectedAgentId) || AGENT_REGISTRY[0];

    const [selectedVoice, setVoice] = useState(getSelectedVoice());
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() && attachments.length === 0) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
            attachments: attachments.length > 0 ? [...attachments] : undefined
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setAttachments([]);
        setIsLoading(true);

        try {
            // Build context based on selected Agent
            const agentContext = `
                You are ${selectedAgent.name} (${selectedAgent.label}).
                Role: ${selectedAgent.role}
                Specialty: ${selectedAgent.specialty}
                Description: ${selectedAgent.description}
                Capabilities: ${selectedAgent.capabilities.join(', ')}
                
                Act as this specific agent within the House of Ang ecosystem.
            `;

            const chatHistory: ChatMessage[] = messages.map(m => ({
                role: m.role,
                content: m.content
            }));
            chatHistory.push({ role: 'user', content: userMessage.content });

            const response = await sendToGemini(chatHistory, agentContext);

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                agentId: selectedAgent.id
            };
            
            setMessages(prev => [...prev, aiResponse]);
            speakText(aiResponse.content);

        } catch (error) {
            console.error("AI Error", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I encountered an error connecting to the Neural Network.",
                timestamp: new Date(),
                agentId: selectedAgent.id
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeploy = () => {
        // Navigate to TaskWorkspace with the selected agent context
        navigate('/workspace', { state: { agentId: selectedAgentId, initialTask: messages[messages.length - 1]?.content } });
    };

    const handleVoiceInput = async () => {
        setIsListening(true);
        await listenToSpeech((transcript) => {
            setInput(transcript);
            setIsListening(false);
        });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleVoiceChange = (voiceKey: string) => {
        setVoice(voiceKey);
        setSelectedVoice(voiceKey);
    };

    return (
        <div className="min-h-screen bg-carbon-900 flex flex-col">
            {/* Header */}
            <header className="bg-carbon-800 border-b border-carbon-700 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-gray-500 hover:text-white text-sm">← Back</Link>
                        <div className="h-6 w-px bg-carbon-600" />
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-2xl">🧪</span>
                            Playground
                        </h1>
                    </div>
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="px-4 py-2 bg-carbon-700 hover:bg-carbon-600 text-gray-400 hover:text-white rounded-lg flex items-center gap-2 text-sm"
                    >
                        ⚙️ Settings
                    </button>
                </div>
            </header>

            {/* Settings Panel */}
            {showSettings && (
                <div className="bg-carbon-800 border-b border-carbon-700 px-6 py-4">
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Agent Selection */}
                        <div>
                            <label htmlFor="agent-select" className="block text-gray-400 text-sm mb-2">Select Ang (Agent)</label>
                            <select
                                id="agent-select"
                                value={selectedAgentId}
                                onChange={(e) => setSelectedAgentId(e.target.value)}
                                title="Select AI Agent"
                                className="w-full bg-carbon-900 border border-carbon-600 rounded-lg px-4 py-3 text-white"
                            >
                                {AGENT_REGISTRY.map(agent => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.icon} {agent.name} - {agent.label}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">{selectedAgent.description}</p>
                        </div>

                        {/* Voice Selection */}
                        <div>
                            <label htmlFor="voice-select" className="block text-gray-400 text-sm mb-2">Voice Interface</label>
                            <select
                                id="voice-select"
                                value={selectedVoice}
                                onChange={(e) => {
                                    setVoice(e.target.value);
                                    setSelectedVoice(e.target.value);
                                }}
                                title="Select voice for responses"
                                className="w-full bg-carbon-900 border border-carbon-600 rounded-lg px-4 py-3 text-white"
                            >
                                {Object.entries(VOICE_LIBRARY).map(([key, voice]) => (
                                    <option key={key} value={key}>
                                        {voice.name} - {voice.style}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center py-24">
                            <div className="w-20 h-20 rounded-full bg-linear-to-br from-locale-blue to-purple-600 flex items-center justify-center mx-auto mb-6 text-4xl">
                                {selectedAgent.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">Chat with {selectedAgent.name}</h2>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                {selectedAgent.description}
                                <br/>
                                <span className="text-xs mt-2 block text-gray-600">Powered by House of Ang Framework</span>
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                {selectedAgent.capabilities.slice(0, 4).map((cap, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(`Help me with ${cap}`)}
                                        className="px-4 py-2 bg-carbon-800 hover:bg-carbon-700 border border-carbon-600 text-gray-400 hover:text-white rounded-full text-sm transition-colors"
                                    >
                                        {cap}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                msg.role === 'user' ? 'bg-locale-blue' : 'bg-linear-to-br from-purple-600 to-locale-blue'
                            }`}>
                                {msg.role === 'user' ? '👤' : (msg.agentId ? AGENT_REGISTRY.find(a => a.id === msg.agentId)?.icon : '🤖')}
                            </div>
                            <div className={`max-w-[70%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`rounded-2xl px-5 py-3 ${
                                    msg.role === 'user' 
                                        ? 'bg-locale-blue text-white' 
                                        : 'bg-carbon-800 border border-carbon-700 text-gray-200'
                                }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    {msg.attachments && msg.attachments.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {msg.attachments.map((file, i) => (
                                                <span key={i} className="text-xs bg-black/30 px-2 py-1 rounded">
                                                    📎 {file.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-gray-600 mt-1 block">
                                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    {msg.role === 'assistant' && msg.agentId && ` • ${AGENT_REGISTRY.find(a => a.id === msg.agentId)?.name}`}
                                </span>
                                
                                {/* Deploy Action for Assistant Messages */}
                                {msg.role === 'assistant' && (
                                    <button 
                                        onClick={handleDeploy}
                                        className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 ml-1"
                                    >
                                        <Icons.Rocket className="w-3 h-3" /> Deploy to Sandbox
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-600 to-locale-blue flex items-center justify-center shrink-0">
                                {selectedAgent.icon}
                            </div>
                            <div className="bg-carbon-800 border border-carbon-700 rounded-2xl px-5 py-4">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-locale-blue rounded-full animate-bounce [animation-delay:0ms]" />
                                    <div className="w-2 h-2 bg-locale-blue rounded-full animate-bounce [animation-delay:150ms]" />
                                    <div className="w-2 h-2 bg-locale-blue rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="px-6 py-2 bg-carbon-800 border-t border-carbon-700">
                    <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
                        {attachments.map((file, i) => (
                            <div key={i} className="flex items-center gap-2 bg-carbon-700 px-3 py-1 rounded-full">
                                <span className="text-xs text-gray-300">📎 {file.name}</span>
                                <button 
                                    onClick={() => removeAttachment(i)}
                                    className="text-gray-400 hover:text-red-400"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-carbon-800 border-t border-carbon-700 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    {/* Bezel with Model & Voice Info */}
                    <div className="flex items-center justify-between mb-3 text-xs">
                        <div className="flex items-center gap-4 text-gray-500">
                            <span>Model: <span className="text-white">{AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name}</span></span>
                            <span>Voice: <span className="text-white">{VOICE_LIBRARY[selectedVoice as keyof typeof VOICE_LIBRARY]?.name || 'Default'}</span></span>
                        </div>
                        <span className="text-gray-600">Powered by ACHEEVY</span>
                    </div>

                    {/* Input Row */}
                    <div className="flex items-end gap-3">
                        {/* Attachment Button */}
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 bg-carbon-700 hover:bg-carbon-600 text-gray-400 hover:text-white rounded-xl transition-colors"
                            title="Attach file"
                        >
                            📎
                        </button>
                        <input 
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            title="Select files to attach"
                            aria-label="File upload"
                        />

                        {/* Text Input */}
                        <div className="flex-1 bg-carbon-900 border border-carbon-600 rounded-xl focus-within:border-locale-blue transition-colors">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Think It. Prompt It. Let Us Manage It..."
                                className="w-full bg-transparent px-4 py-3 text-white text-sm outline-none placeholder-gray-600 resize-none"
                                rows={1}
                            />
                        </div>

                        {/* Voice Button */}
                        <button 
                            onClick={handleVoiceInput}
                            className={`p-3 rounded-xl transition-colors ${
                                isListening 
                                    ? 'bg-red-500/20 text-red-500 animate-pulse' 
                                    : 'bg-carbon-700 hover:bg-carbon-600 text-gray-400 hover:text-white'
                            }`}
                            title="Voice input"
                        >
                            🎤
                        </button>

                        {/* Send Button */}
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || (!input.trim() && attachments.length === 0)}
                            className="bg-locale-blue hover:bg-locale-darkBlue disabled:bg-carbon-600 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundPage;
