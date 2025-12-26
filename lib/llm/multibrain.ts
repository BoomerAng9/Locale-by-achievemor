/**
 * Multi-Brain LLM Router
 * 
 * SmelterOS Model-Agnostic Foundry
 * Routes requests to the optimal AI model based on task type.
 * 
 * THE UNIVERSAL ADAPTER STRATEGY:
 * - Primary Route: OpenRouter API (for DeepSeek, GLM, Claude, Llama, etc.)
 * - Exception: Gemini 3 stays direct via Vertex AI (security/compliance)
 * - One Key (OpenRouter) unlocks the world
 * - One Key (Google) unlocks the infrastructure
 * 
 * Models:
 * - Gemini 3 Flash (Default): Speed/Cost optimized [DIRECT]
 * - DeepSeek-V3: Coding/Reasoning specialist [OPENROUTER]
 * - GLM-4.7 (ZhipuAI): Agentic task specialist [OPENROUTER]
 * - DeepSeek-R1: Deep reasoning [OPENROUTER]
 * - Claude 3.5 Sonnet: Creative/Nuanced [OPENROUTER]
 * - Llama 3.1 405B: Open source power [OPENROUTER]
 * 
 * Chat Bezel: "Chat w/ACHEEVY"
 */

import { openRouter, OpenRouterClient, isVertexModel } from './openRouter';

// ============================================
// TYPES
// ============================================

export type AIModel = 
  | 'gemini-3-flash'      // Default - Speed/Cost [DIRECT VERTEX]
  | 'gemini-2.5-flash'    // Thinking/Reasoning mode [DIRECT VERTEX]
  | 'deepseek-v3'         // Coding specialist [OPENROUTER]
  | 'deepseek-r1'         // Deep reasoning [OPENROUTER]
  | 'glm-4.7'             // Agentic tasks (ZhipuAI) [OPENROUTER]
  | 'claude-3.5-sonnet'   // Anthropic [OPENROUTER]
  | 'gpt-4o'              // OpenAI fallback [OPENROUTER]
  | 'llama-3.1-405b';     // Meta open source [OPENROUTER]

export interface ModelConfig {
  id: AIModel;
  name: string;
  provider: string;
  emoji: string;
  color: string;
  speed: 'ultra' | 'fast' | 'medium' | 'slow';
  costPerMToken: number; // Cost per million tokens
  maxTokens: number;
  supportsThinking: boolean;
  supportsStreaming: boolean;
  bestFor: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string; // CoT reasoning block
}

export interface StreamChunk {
  type: 'thinking' | 'content' | 'done' | 'error';
  text: string;
  tokens?: number;
  cost?: number;
}

export interface ModelResponse {
  content: string;
  thinking?: string;
  model: AIModel;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latency: number;
}

// ============================================
// MODEL REGISTRY
// ============================================

export const MODEL_REGISTRY: Record<AIModel, ModelConfig> = {
  'gemini-3-flash': {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    provider: 'Google',
    emoji: '⚡',
    color: 'text-blue-400',
    speed: 'ultra',
    costPerMToken: 0.075, // $0.075 per 1M tokens
    maxTokens: 1000000,
    supportsThinking: true,
    supportsStreaming: true,
    bestFor: ['General', 'Speed', 'Cost-Effective'],
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Thinking)',
    provider: 'Google',
    emoji: '🧠',
    color: 'text-blue-500',
    speed: 'fast',
    costPerMToken: 0.15,
    maxTokens: 1000000,
    supportsThinking: true,
    supportsStreaming: true,
    bestFor: ['Reasoning', 'Complex Analysis', 'CoT'],
  },
  'deepseek-v3': {
    id: 'deepseek-v3',
    name: 'DeepSeek-V3',
    provider: 'DeepSeek',
    emoji: '🔬',
    color: 'text-cyan-400',
    speed: 'fast',
    costPerMToken: 0.14,
    maxTokens: 64000,
    supportsThinking: true,
    supportsStreaming: true,
    bestFor: ['Coding', 'Math', 'Technical'],
  },
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'DeepSeek',
    emoji: '🕵️',
    color: 'text-cyan-500',
    speed: 'medium',
    costPerMToken: 0.55,
    maxTokens: 64000,
    supportsThinking: true,
    supportsStreaming: true,
    bestFor: ['Deep Reasoning', 'Research', 'Analysis'],
  },
  'glm-4.7': {
    id: 'glm-4.7',
    name: 'GLM-4.7',
    provider: 'ZhipuAI',
    emoji: '🤖',
    color: 'text-purple-400',
    speed: 'fast',
    costPerMToken: 0.10,
    maxTokens: 128000,
    supportsThinking: true,
    supportsStreaming: true,
    bestFor: ['Agentic Tasks', 'Multi-Step', 'Chinese'],
  },
  'claude-3.5-sonnet': {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    emoji: '🎭',
    color: 'text-orange-400',
    speed: 'medium',
    costPerMToken: 3.0,
    maxTokens: 200000,
    supportsThinking: false,
    supportsStreaming: true,
    bestFor: ['Creative', 'Nuanced', 'Safety'],
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    emoji: '🌐',
    color: 'text-green-400',
    speed: 'fast',
    costPerMToken: 5.0,
    maxTokens: 128000,
    supportsThinking: false,
    supportsStreaming: true,
    bestFor: ['General', 'Vision', 'Function Calling'],
  },
  'llama-3.1-405b': {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    provider: 'Meta (via OpenRouter)',
    emoji: '🦙',
    color: 'text-indigo-400',
    speed: 'medium',
    costPerMToken: 3.0,
    maxTokens: 128000,
    supportsThinking: false,
    supportsStreaming: true,
    bestFor: ['Open Source', 'Large Context', 'Reasoning'],
  },
};

// ============================================
// API CONFIGURATIONS
// ============================================

const API_CONFIGS = {
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    getApiKey: () => (import.meta as any).env?.VITE_GEMINI_API_KEY,
  },
  // OpenRouter - Universal Gateway for all "exotic" models
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    getApiKey: () => (import.meta as any).env?.VITE_OPENROUTER_API_KEY,
  },
  // Legacy direct connections (DEPRECATED - prefer OpenRouter)
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    getApiKey: () => (import.meta as any).env?.VITE_DEEPSEEK_API_KEY,
  },
  zhipu: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    getApiKey: () => (import.meta as any).env?.VITE_ZHIPU_API_KEY,
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    getApiKey: () => (import.meta as any).env?.VITE_OPENAI_API_KEY,
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    getApiKey: () => (import.meta as any).env?.VITE_ANTHROPIC_API_KEY,
  },
};

// ============================================
// ACHEEVY SYSTEM PROMPT
// ============================================

const ACHEEVY_SYSTEM_PROMPT = `You are ACHEEVY, the AI executive assistant for Locale by ACHIEVEMOR.

Your identity:
- You operate within Circuit Box, the Transparent AI Sandbox
- Circuit Box is powered by SmelterOS, the Industrial AI Foundry
- AVVA NOON (InfinityLM) is the central intelligence created from SmelterOS
- Your tagline: "Think It. Prompt It. Let ACHEEVY Manage It."

Your capabilities:
- Multi-step task orchestration
- Code generation and debugging
- Research and analysis
- Creative content generation
- Agentic workflow execution

Plausibility Bound: (-10^18 ≤ x, y ≤ 10^18)
All responses must be grounded in verifiable, finite parameters.

When reasoning through complex tasks:
1. State your understanding of the task
2. Break it into steps
3. Execute each step methodically
4. Provide clear, actionable output
`;

// ============================================
// ROUTER CLASS
// ============================================

export class MultiBrainRouter {
  private selectedModel: AIModel = 'gemini-3-flash';
  private tokenCostAccumulator: number = 0;
  private abortController: AbortController | null = null;

  constructor(defaultModel: AIModel = 'gemini-3-flash') {
    this.selectedModel = defaultModel;
  }

  /**
   * Set the active model
   */
  setModel(model: AIModel): void {
    this.selectedModel = model;
    console.log(`[MultiBrain] Switched to: ${MODEL_REGISTRY[model].name}`);
  }

  /**
   * Get current model info
   */
  getModelInfo(): ModelConfig {
    return MODEL_REGISTRY[this.selectedModel];
  }

  /**
   * Get total cost accumulated this session
   */
  getSessionCost(): number {
    return this.tokenCostAccumulator;
  }

  /**
   * Abort current request (Kill Switch)
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      console.log('[MultiBrain] Request aborted by user');
    }
  }

  /**
   * Calculate cost from token count
   */
  private calculateCost(tokens: number, model: AIModel): number {
    const config = MODEL_REGISTRY[model];
    return (tokens / 1000000) * config.costPerMToken;
  }

  /**
   * Route to appropriate provider
   * 
   * ROUTING STRATEGY:
   * - Gemini models: Direct to Vertex AI (security/compliance)
   * - All other models: OpenRouter Gateway (unified API)
   */
  async chat(
    messages: ChatMessage[],
    options?: {
      model?: AIModel;
      systemPrompt?: string;
      enableThinking?: boolean;
      stream?: boolean;
      onChunk?: (chunk: StreamChunk) => void;
    }
  ): Promise<ModelResponse> {
    const model = options?.model || this.selectedModel;
    const config = MODEL_REGISTRY[model];
    const startTime = Date.now();

    this.abortController = new AbortController();

    try {
      let response: ModelResponse;

      // ROUTING DECISION: Gemini direct, everything else via OpenRouter
      if (isVertexModel(model)) {
        // Direct Vertex AI connection for Gemini models
        response = await this.callGemini(messages, model, options);
      } else {
        // OpenRouter Gateway for all "exotic" models
        response = await this.callOpenRouter(messages, model, options);
      }

      response.latency = Date.now() - startTime;
      response.cost = this.calculateCost(response.tokens.total, model);
      this.tokenCostAccumulator += response.cost;

      return response;

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request aborted');
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Call Gemini API
   */
  private async callGemini(
    messages: ChatMessage[],
    model: AIModel,
    options?: { systemPrompt?: string; enableThinking?: boolean }
  ): Promise<ModelResponse> {
    const apiKey = API_CONFIGS.gemini.getApiKey();
    if (!apiKey) {
      return this.getMockResponse(messages, model);
    }

    const modelId = model === 'gemini-3-flash' ? 'gemini-2.0-flash-exp' : 'gemini-1.5-flash';
    const url = `${API_CONFIGS.gemini.baseUrl}/${modelId}:generateContent?key=${apiKey}`;

    const systemPrompt = options?.systemPrompt || ACHEEVY_SYSTEM_PROMPT;
    
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I am ACHEEVY, ready to assist.' }] },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const inputTokens = messages.reduce((sum, m) => sum + m.content.length / 4, 0);
    const outputTokens = text.length / 4;

    return {
      content: text,
      model,
      tokens: {
        input: Math.floor(inputTokens),
        output: Math.floor(outputTokens),
        total: Math.floor(inputTokens + outputTokens),
      },
      cost: 0,
      latency: 0,
    };
  }

  /**
   * Call OpenRouter Gateway - Universal Adapter for Exotic Models
   * 
   * Routes to: DeepSeek, GLM, Claude, Llama, GPT, etc.
   * One API key unlocks the world.
   */
  private async callOpenRouter(
    messages: ChatMessage[],
    model: AIModel,
    options?: { systemPrompt?: string; enableThinking?: boolean }
  ): Promise<ModelResponse> {
    const systemPrompt = options?.systemPrompt || ACHEEVY_SYSTEM_PROMPT;

    try {
      const result = await openRouter.chat(
        messages.map(m => ({ role: m.role, content: m.content })),
        {
          model,
          systemPrompt,
          signal: this.abortController?.signal,
        }
      );

      return {
        content: result.content,
        thinking: undefined, // OpenRouter doesn't expose thinking blocks directly
        model,
        tokens: {
          input: result.tokens.input,
          output: result.tokens.output,
          total: result.tokens.total,
        },
        cost: result.cost,
        latency: 0,
      };
    } catch (error) {
      console.error(`[MultiBrain] OpenRouter call failed for ${model}:`, error);
      // Fallback to mock if OpenRouter fails
      return this.getMockResponse(messages, model);
    }
  }

  /**
   * Call DeepSeek API (OpenAI-compatible)
   * @deprecated Use callOpenRouter instead - routes through unified gateway
   */
  private async callDeepSeek(
    messages: ChatMessage[],
    model: AIModel,
    options?: { systemPrompt?: string; enableThinking?: boolean }
  ): Promise<ModelResponse> {
    const apiKey = API_CONFIGS.deepseek.getApiKey();
    if (!apiKey) {
      return this.getMockResponse(messages, model);
    }

    const modelId = model === 'deepseek-r1' ? 'deepseek-reasoner' : 'deepseek-chat';
    
    const formattedMessages = [
      { role: 'system', content: options?.systemPrompt || ACHEEVY_SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch(`${API_CONFIGS.deepseek.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: formattedMessages,
        max_tokens: 4096,
      }),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const thinkingContent = data.choices?.[0]?.message?.reasoning_content;

    return {
      content: text,
      thinking: thinkingContent,
      model,
      tokens: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
      cost: 0,
      latency: 0,
    };
  }

  /**
   * Call ZhipuAI API (GLM-4.7)
   */
  private async callZhipu(
    messages: ChatMessage[],
    options?: { systemPrompt?: string }
  ): Promise<ModelResponse> {
    const apiKey = API_CONFIGS.zhipu.getApiKey();
    if (!apiKey) {
      return this.getMockResponse(messages, 'glm-4.7');
    }

    const formattedMessages = [
      { role: 'system', content: options?.systemPrompt || ACHEEVY_SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch(`${API_CONFIGS.zhipu.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4-plus',
        messages: formattedMessages,
        max_tokens: 4096,
      }),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`ZhipuAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
      content: text,
      model: 'glm-4.7',
      tokens: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
      cost: 0,
      latency: 0,
    };
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    messages: ChatMessage[],
    options?: { systemPrompt?: string }
  ): Promise<ModelResponse> {
    const apiKey = API_CONFIGS.openai.getApiKey();
    if (!apiKey) {
      return this.getMockResponse(messages, 'gpt-4o');
    }

    const formattedMessages = [
      { role: 'system', content: options?.systemPrompt || ACHEEVY_SYSTEM_PROMPT },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch(`${API_CONFIGS.openai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: formattedMessages,
        max_tokens: 4096,
      }),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
      content: text,
      model: 'gpt-4o',
      tokens: {
        input: data.usage?.prompt_tokens || 0,
        output: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0,
      },
      cost: 0,
      latency: 0,
    };
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(
    messages: ChatMessage[],
    options?: { systemPrompt?: string }
  ): Promise<ModelResponse> {
    const apiKey = API_CONFIGS.anthropic.getApiKey();
    if (!apiKey) {
      return this.getMockResponse(messages, 'claude-3.5-sonnet');
    }

    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await fetch(`${API_CONFIGS.anthropic.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: options?.systemPrompt || ACHEEVY_SYSTEM_PROMPT,
        messages: formattedMessages,
      }),
      signal: this.abortController?.signal,
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    return {
      content: text,
      model: 'claude-3.5-sonnet',
      tokens: {
        input: data.usage?.input_tokens || 0,
        output: data.usage?.output_tokens || 0,
        total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      cost: 0,
      latency: 0,
    };
  }

  /**
   * Mock response for demo/testing
   */
  private getMockResponse(messages: ChatMessage[], model: AIModel): ModelResponse {
    const lastMessage = messages[messages.length - 1];
    const thinking = `[THOUGHT]: Analyzing request: "${lastMessage?.content?.slice(0, 50)}..."
Step 1: Understanding user intent...
Step 2: Formulating response strategy...
Step 3: Generating output...`;

    return {
      content: `[Mock ${MODEL_REGISTRY[model].name}] I'm ACHEEVY, running in demo mode. To enable live responses, configure your ${MODEL_REGISTRY[model].provider} API key in the environment variables.`,
      thinking,
      model,
      tokens: { input: 100, output: 50, total: 150 },
      cost: 0.0001,
      latency: 500,
    };
  }
}

// Singleton instance
export const multiBrain = new MultiBrainRouter('gemini-3-flash');

// Export model list for UI
export const AVAILABLE_MODELS = Object.values(MODEL_REGISTRY);
