/**
 * KingMode Configuration Panel
 * 
 * Admin UI for configuring KingMode-OPS settings in Circuit Box.
 * Allows customization of execution modes and proof requirements.
 */

import React, { useState, useEffect } from 'react';
import { 
  KingModeSettings, 
  KingModeType,
  getKingModeSettings, 
  saveKingModeSettings,
  KINGMODE_CORE,
  KINGMODE_ARCHITECT,
  KINGMODE_BUILDER,
  KINGMODE_DESIGNER,
  KINGMODE_SHIPPER
} from '../../lib/kingmode/KingModePrompts';

interface KingModeConfigProps {
  onSave?: (settings: KingModeSettings) => void;
}

const MODES: { id: KingModeType; name: string; icon: string; description: string }[] = [
  { id: 'auto', name: 'Auto-Detect', icon: '🎯', description: 'Automatically select mode based on task' },
  { id: 'architect', name: 'Architect', icon: '🏗️', description: 'Deep planning and system design' },
  { id: 'builder', name: 'Builder', icon: '⚙️', description: 'Production-ready code generation' },
  { id: 'designer', name: 'Designer', icon: '🎨', description: 'Brutalist UI with editorial rigor' },
  { id: 'shipper', name: 'Shipper', icon: '🚀', description: 'Validation and proof bundles' },
];

const KingModeConfig: React.FC<KingModeConfigProps> = ({ onSave }) => {
  const [settings, setSettings] = useState<KingModeSettings>(getKingModeSettings());
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<KingModeType>('architect');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveKingModeSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSave?.(settings);
  };

  const getPromptPreview = (mode: KingModeType): string => {
    switch (mode) {
      case 'architect': return KINGMODE_ARCHITECT;
      case 'builder': return KINGMODE_BUILDER;
      case 'designer': return KINGMODE_DESIGNER;
      case 'shipper': return KINGMODE_SHIPPER;
      default: return KINGMODE_CORE;
    }
  };

  return (
    <div className="bg-carbon-800 rounded-2xl border border-carbon-700 overflow-hidden">
      {/* Header */}
      <div className="bg-carbon-900 px-6 py-4 border-b border-carbon-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
              👑
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">KingMode-OPS</h2>
              <p className="text-xs text-gray-500">Universal LLM Operating Standard</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            settings.enabled 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-700 text-gray-400'
          }`}>
            {settings.enabled ? 'ACTIVE' : 'DISABLED'}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-carbon-900 rounded-xl border border-carbon-700">
          <div>
            <h3 className="text-white font-medium">Enable KingMode Protocol</h3>
            <p className="text-xs text-gray-500 mt-1">Force architectural discipline on all AI responses</p>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            title="Enable KingMode"
            className={`w-14 h-7 rounded-full transition-colors relative ${
              settings.enabled ? 'bg-green-500' : 'bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
              settings.enabled ? 'translate-x-8' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Default Mode Selection */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Default Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setSettings(prev => ({ ...prev, defaultMode: mode.id }))}
                title={`Select ${mode.name} Mode`}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.defaultMode === mode.id
                    ? 'bg-purple-500/20 border-purple-500/50'
                    : 'bg-carbon-900 border-carbon-700 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mode.icon}</span>
                  <div>
                    <div className={`font-medium ${
                      settings.defaultMode === mode.id ? 'text-purple-400' : 'text-white'
                    }`}>
                      {mode.name}
                    </div>
                    <div className="text-xs text-gray-500">{mode.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Proof Bundle Setting */}
        <div className="flex items-center justify-between p-4 bg-carbon-900 rounded-xl border border-carbon-700">
          <div>
            <h3 className="text-white font-medium">Enforce Proof Bundles</h3>
            <p className="text-xs text-gray-500 mt-1">Require evidence before marking tasks as "done"</p>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, enforceProofBundle: !prev.enforceProofBundle }))}
            title="Enforce Proof Bundles"
            className={`w-14 h-7 rounded-full transition-colors relative ${
              settings.enforceProofBundle ? 'bg-green-500' : 'bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
              settings.enforceProofBundle ? 'translate-x-8' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Adaptation Loop */}
        <div className="flex items-center justify-between p-4 bg-carbon-900 rounded-xl border border-carbon-700">
          <div>
            <h3 className="text-white font-medium">Enable Adaptation Loop</h3>
            <p className="text-xs text-gray-500 mt-1">Learn from failures and auto-correct</p>
          </div>
          <button
            onClick={() => setSettings(prev => ({ ...prev, enableAdaptationLoop: !prev.enableAdaptationLoop }))}
            className={`w-14 h-7 rounded-full transition-colors relative ${
              settings.enableAdaptationLoop ? 'bg-green-500' : 'bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
              settings.enableAdaptationLoop ? 'translate-x-8' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Custom Overrides */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Custom Overrides</h3>
          <textarea
            value={settings.customOverrides}
            onChange={(e) => setSettings(prev => ({ ...prev, customOverrides: e.target.value }))}
            placeholder="Add custom instructions that will be appended to all KingMode prompts..."
            className="w-full h-32 bg-carbon-900 border border-carbon-700 rounded-xl p-4 text-white text-sm font-mono placeholder-gray-600 focus:border-purple-500 outline-none resize-none"
          />
        </div>

        {/* Preview Prompt Button */}
        <button
          onClick={() => setShowPromptPreview(!showPromptPreview)}
          className="w-full py-3 bg-carbon-900 hover:bg-carbon-700 border border-carbon-700 text-gray-400 hover:text-white rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {showPromptPreview ? 'Hide' : 'Preview'} System Prompts
        </button>

        {/* Prompt Preview */}
        {showPromptPreview && (
          <div className="bg-carbon-900 rounded-xl border border-carbon-700 overflow-hidden">
            <div className="flex border-b border-carbon-700">
              {MODES.filter(m => m.id !== 'auto').map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setPreviewMode(mode.id)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    previewMode === mode.id
                      ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {mode.icon} {mode.name}
                </button>
              ))}
            </div>
            <pre className="p-4 text-xs text-gray-400 overflow-auto max-h-64 font-mono leading-relaxed">
              {getPromptPreview(previewMode)}
            </pre>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-xl font-bold transition-all ${
            saved
              ? 'bg-green-500 text-black'
              : 'bg-purple-500 hover:bg-purple-400 text-white'
          }`}
        >
          {saved ? '✓ Saved!' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default KingModeConfig;
