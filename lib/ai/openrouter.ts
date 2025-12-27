/**
 * OpenRouter AI Integration
 * Implements "Dual-Model Routing" Strategy:
 * 1. Free-Tier Routing (Analysis/Reporting) -> GLM-4.7, DeepSeek V3
 * 2. Premier-Tier Routing (Production/Builds) -> GPT-5, Gemini 3 Pro, etc.
 */

import OpenAI from 'openai';

// Load API Key from Environment
const OPENROUTER_API_KEY = (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
const SITE_URL = 'https://locale.achievemor.io'; // For OpenRouter headers
const SITE_NAME = 'Locale by ACHIEVEMOR';

// Lazy initialization to prevent crash when API key is missing
let client: OpenAI | null = null;

function getClient(): OpenAI | null {
    if (!OPENROUTER_API_KEY) {
        console.warn("[OpenRouter] Missing API Key. AI features will be limited.");
        return null;
    }
    if (!client) {
        client = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: OPENROUTER_API_KEY,
            dangerouslyAllowBrowser: true, // Allow client-side calls for demo (secure proxy recommended for prod)
            defaultHeaders: {
                "HTTP-Referer": SITE_URL,
                "X-Title": SITE_NAME,
            },
        });
    }
    return client;
}

export type ModelTier = 'free' | 'premier';

// Model Configuration Map
const MODEL_MAP = {
    free: {
        reasoning: 'deepseek/deepseek-chat', // DeepSeek V3 optimized for chat/analysis
        reporting: 'thudm/glm-4-9b-chat',    // GLM 4 optimized for C1 Thesys reports
    },
    premier: {
        production: 'openai/gpt-4o',         // Placeholder for GPT-5/Gemini 3 until available
        coding: 'anthropic/claude-3.5-sonnet',
    }
};

interface CompletionOptions {
    tier: ModelTier;
    taskType?: 'reasoning' | 'reporting' | 'production' | 'coding';
    temperature?: number;
    maxTokens?: number;
}

/**
 * Route request to the appropriate model based on Tier and Task
 */
export async function generateWithOpenRouter(
    messages: any[], 
    options: CompletionOptions
): Promise<string> {
    const openRouterClient = getClient();
    if (!openRouterClient) return "Simulation: OpenRouter API Key Missing.";

    // Select Model
    let model = '';
    if (options.tier === 'free') {
        model = options.taskType === 'reporting' ? MODEL_MAP.free.reporting : MODEL_MAP.free.reasoning;
    } else {
        model = options.taskType === 'coding' ? MODEL_MAP.premier.coding : MODEL_MAP.premier.production;
    }

    console.log(`[OpenRouter] Routing to ${model} (Tier: ${options.tier})`);

    try {
        const completion = await openRouterClient.chat.completions.create({
            model: model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1024,
        });

        return completion.choices[0]?.message?.content || "Error: No response from model.";
    } catch (error) {
        console.error("[OpenRouter] API Error:", error);
        return "System Exception: Failed to negotiate with Neural Network.";
    }
}

/**
 * Specialized: Analyze Token Cost (Free Tier Only)
 * Uses DeepSeek/GLM to estimate tokens for a user request without costing plan tokens.
 */
export async function analyzeTokenCost(userPrompt: string): Promise<{
    estimatedTokens: number;
    complexityScore: number;
    analysis: string;
}> {
    const prompt = `
        Analyze the following build request. 
        Estimate the complexity (1-10) and the projected token usage for a FULL production build (code + config + tests).
        
        Request: "${userPrompt}"
        
        Return JSON ONLY: { "estimatedTokens": number, "complexityScore": number, "analysis": "brief explanation" }
    `;

    const raw = await generateWithOpenRouter(
        [{ role: 'user', content: prompt }], 
        { tier: 'free', taskType: 'reasoning', temperature: 0.1 }
    );

    try {
        // Simple heuristic parsing if JSON fails, but aim for JSON
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid format");
    } catch {
        return {
            estimatedTokens: 5000, // Fallback default
            complexityScore: 5,
            analysis: "Could not precisely analyze. Using rough heuristic."
        };
    }
}
