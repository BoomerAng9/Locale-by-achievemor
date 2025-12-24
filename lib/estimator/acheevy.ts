/**
 * ACHEEVY Real-Time Token Estimator v5.0
 * 
 * Core Logic:
 * - No set prices. Tokens determine job length.
 * - Free-Tier Routing: Analysis/Chat → GLM-4.7, DeepSeek V3 (0 tokens)
 * - Premier-Tier Routing: Builds → GPT-5, Gemini 3, Grok 4 (deducts from plan)
 * - FDH Runtime: Instant → TBD (based on token output speed)
 */

// === MODEL TIERS ===
export const FREE_TIER_MODELS = [
    { model: 'deepseek/deepseek-v3', provider: 'OpenRouter', cost: 0 },
    { model: 'glm-4.7', provider: 'OpenRouter', cost: 0 },
    { model: 'qwen/qwen3-coder', provider: 'OpenRouter', cost: 0 },
    { model: 'meta-llama/llama-4-maverick', provider: 'OpenRouter', cost: 0 },
];

export const PREMIER_TIER_MODELS = [
    { model: 'openai/gpt-5', provider: 'OpenAI', inputCost: 1.25, outputCost: 10.0, unit: 'per 1M tokens' },
    { model: 'openai/gpt-5-mini', provider: 'OpenAI', inputCost: 0.25, outputCost: 1.0, unit: 'per 1M tokens' },
    { model: 'google/gemini-3-pro', provider: 'Google', inputCost: 2.0, outputCost: 12.0, unit: 'per 1M tokens' },
    { model: 'google/gemini-3-flash', provider: 'Google', inputCost: 0.5, outputCost: 3.0, unit: 'per 1M tokens' },
    { model: 'xai/grok-4', provider: 'xAI', inputCost: 3.0, outputCost: 15.0, unit: 'per 1M tokens' },
];

// === PLAN TIERS ===
export const PLAN_TIERS = {
    'buy-me-coffee': { name: 'Buy Me a Coffee', tokens: 50000, price: 5 },
    'lite': { name: 'Lite', tokens: 250000, price: 19 },
    'medium': { name: 'Medium', tokens: 750000, price: 49 },
    'heavy': { name: 'Heavy', tokens: 2000000, price: 99 },
    'superior': { name: 'Superior', tokens: 10000000, price: 299 },
};

// === COMPLEXITY MULTIPLIERS ===
export const BASE_TOKENS = {
    simple_plug: 25000,
    standard_workflow: 75000,
    complex_enterprise: 250000,
};

export const SECURITY_MULTIPLIERS = {
    light: 1.0,
    medium: 1.1,
    heavy: 1.25,
    'defense-grade': 1.5,
};

// === INTENT CLASSIFICATION ===
export type IntentType = 'analysis' | 'build';

export const classifyIntent = (prompt: string): IntentType => {
    const buildKeywords = ['build', 'create', 'make', 'deploy', 'forge', 'execute', 'implement', 'develop'];
    const lowerPrompt = prompt.toLowerCase();
    
    for (const keyword of buildKeywords) {
        if (lowerPrompt.includes(keyword)) {
            return 'build';
        }
    }
    return 'analysis';
};

// === COMPLEXITY ANALYSIS ===
export type ComplexityLevel = 'simple_plug' | 'standard_workflow' | 'complex_enterprise';

export const analyzeComplexity = (prompt: string, integrations: number): ComplexityLevel => {
    const wordCount = prompt.split(/\s+/).length;
    const hasAPI = /api|integration|connect|webhook/i.test(prompt);
    const hasAuth = /auth|login|oauth|jwt/i.test(prompt);
    const hasDB = /database|firestore|supabase|postgres/i.test(prompt);
    
    let score = 0;
    if (wordCount > 100) score += 2;
    if (hasAPI) score += 1;
    if (hasAuth) score += 1;
    if (hasDB) score += 1;
    if (integrations > 2) score += 2;
    
    if (score >= 4) return 'complex_enterprise';
    if (score >= 2) return 'standard_workflow';
    return 'simple_plug';
};

// === TOKEN ESTIMATION ===
export interface TokenEstimate {
    intent: IntentType;
    routing: 'free' | 'premier';
    model: string;
    estimatedTokens: number;
    planImpact: number;
    remainingBalance: number;
    runtimeEstimate: string;
}

export const estimateTokens = (
    prompt: string,
    userPlanTier: keyof typeof PLAN_TIERS,
    currentBalance: number,
    integrations: number = 0,
    securityLevel: keyof typeof SECURITY_MULTIPLIERS = 'medium'
): TokenEstimate => {
    const intent = classifyIntent(prompt);
    const complexity = analyzeComplexity(prompt, integrations);
    
    // Free routing for analysis
    if (intent === 'analysis') {
        return {
            intent,
            routing: 'free',
            model: 'deepseek/deepseek-v3',
            estimatedTokens: 0,
            planImpact: 0,
            remainingBalance: currentBalance,
            runtimeEstimate: 'Instant'
        };
    }
    
    // Premier routing for builds
    const baseTokens = BASE_TOKENS[complexity];
    const securityMultiplier = SECURITY_MULTIPLIERS[securityLevel];
    const integrationMultiplier = 1 + (integrations * 0.2); // 1.2x per integration
    
    const estimatedTokens = Math.ceil(baseTokens * securityMultiplier * integrationMultiplier);
    const planImpact = -estimatedTokens;
    const remainingBalance = Math.max(0, currentBalance - estimatedTokens);
    
    // Runtime estimate (based on ~100 tokens/second average for premier models)
    const estimatedSeconds = estimatedTokens / 100;
    const runtimeEstimate = estimatedSeconds > 60 
        ? `~${Math.ceil(estimatedSeconds / 60)} minutes`
        : `~${Math.ceil(estimatedSeconds)} seconds`;
    
    return {
        intent,
        routing: 'premier',
        model: 'openai/gpt-5', // Default premier model
        estimatedTokens,
        planImpact,
        remainingBalance,
        runtimeEstimate: `Instant → ${runtimeEstimate} (TBD)`
    };
};

// === OPENROUTER ROUTING ===
const OPENROUTER_API_KEY = (import.meta as any).env?.VITE_OPENROUTER_API_KEY;

export const routeToModel = async (
    prompt: string,
    intent: IntentType,
    preferredModel?: string
): Promise<string> => {
    const model = intent === 'analysis' 
        ? 'deepseek/deepseek-v3'
        : (preferredModel || 'openai/gpt-5');
    
    if (!OPENROUTER_API_KEY) {
        console.warn('[TokenEstimator] No OpenRouter key, using mock response');
        return intent === 'analysis'
            ? `[Free Analysis] Estimated complexity: Standard. No tokens deducted.`
            : `[Premier Build] Task queued. Token deduction will be calculated on completion.`;
    }
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://locale.achievemor.com',
                'X-Title': 'ACHEEVY Token Estimator'
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: 'You are ACHEEVY, the AI estimator for Deploy by ACHIEVEMOR.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: intent === 'analysis' ? 500 : 2000
            })
        });
        
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'No response generated.';
    } catch (error) {
        console.error('[TokenEstimator] Routing failed:', error);
        return 'Error processing request.';
    }
};

export default {
    estimateTokens,
    classifyIntent,
    analyzeComplexity,
    routeToModel,
    PLAN_TIERS,
    FREE_TIER_MODELS,
    PREMIER_TIER_MODELS
};
