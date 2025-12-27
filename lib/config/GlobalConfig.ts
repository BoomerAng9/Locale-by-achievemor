/**
 * Global Configuration Manager (The Wiring Box)
 * 
 * Manages the persistence of KingMode settings, Provider configs, and Feature toggles.
 * Serves as the synchronization layer between the UI (CircuitBox) and the Libraries (Clients).
 * 
 * HOTWIRE STATUS: ACTIVE
 * STORAGE: LocalStorage (Browser Persistence)
 */

export interface ProviderSettings {
    [capabilityId: string]: string; // e.g. "speech_to_text": "groq_whisper"
}

// Defaults
const STORAGE_KEY_PROVIDERS = 'strata_provider_config_v1';
const STORAGE_KEY_KINGMODE = 'kingmode_config_v1';

const DEFAULT_PROVIDERS: ProviderSettings = {
    'speech_to_text': 'groq_whisper',
    'research': 'perplexity_sonar',
    'llm_inference': 'openrouter_routing',
    'video_generation': 'vertex_imagen',
};

export interface KingModeSettings {
    enabled: boolean;
    defaultMode: 'architect' | 'builder' | 'designer' | 'shipper' | 'auto';
    customOverrides: string;
    enforceProofBundle: boolean;
    enableAdaptationLoop: boolean;
}

const DEFAULT_KINGMODE: KingModeSettings = {
    enabled: true,
    defaultMode: 'auto',
    customOverrides: '',
    enforceProofBundle: true,
    enableAdaptationLoop: true,
};

class GlobalConfigManager {
    // --- PROVIDERS ---
    getProviderConfig(): ProviderSettings {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_PROVIDERS);
            return stored ? { ...DEFAULT_PROVIDERS, ...JSON.parse(stored) } : DEFAULT_PROVIDERS;
        } catch (e) {
            return DEFAULT_PROVIDERS;
        }
    }

    setProvider(capabilityId: string, implementationId: string) {
        const current = this.getProviderConfig();
        const updated = { ...current, [capabilityId]: implementationId };
        localStorage.setItem(STORAGE_KEY_PROVIDERS, JSON.stringify(updated));
        // Dispatch event for reactive UI updates
        window.dispatchEvent(new Event('strata-config-changed'));
    }

    // --- KINGMODE ---
    getKingModeConfig(): KingModeSettings {
        try {
            const stored = localStorage.getItem(STORAGE_KEY_KINGMODE);
            return stored ? { ...DEFAULT_KINGMODE, ...JSON.parse(stored) } : DEFAULT_KINGMODE;
        } catch (e) {
            return DEFAULT_KINGMODE;
        }
    }

    updateKingMode(updates: Partial<KingModeSettings>) {
        const current = this.getKingModeConfig();
        const updated = { ...current, ...updates };
        localStorage.setItem(STORAGE_KEY_KINGMODE, JSON.stringify(updated));
        window.dispatchEvent(new Event('kingmode-config-changed'));
    }

    // --- RESET ---
    hardReset() {
        localStorage.removeItem(STORAGE_KEY_PROVIDERS);
        localStorage.removeItem(STORAGE_KEY_KINGMODE);
        window.location.reload();
    }
}

export const GlobalConfig = new GlobalConfigManager();
