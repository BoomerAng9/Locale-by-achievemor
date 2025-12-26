/**
 * OpenRouter Gateway - Universal LLM Adapter
 * 
 * THE POLICY:
 * - Primary Route: OpenRouter API (for DeepSeek, GLM, Claude, Llama, etc.)
 * - Default Behavior: All "exotic" models route through OpenRouter
 * - Exception: Keep Google Vertex AI (Gemini 3) direct for Cloud Run integration
 * 
 * Why OpenRouter?
 * 1. Unified API: ONE endpoint for all exotic models
 * 2. Cost Transparency: Standardized token pricing for Token Wallet
 * 3. Fallback Redundancy: Backup routes if direct APIs fail
 * 
 * Configuration: Uses openai node library with OpenRouter baseURL
 */

// ============================================
// OPENROUTER MODEL MAPPING
// ============================================

/**
 * Maps internal model IDs to OpenRouter model identifiers
 */
export const OPENROUTER_MODEL_MAP: Record<string, string> = {
  // DeepSeek Models
  'deepseek-v3': 'deepseek/deepseek-chat',
  'deepseek-r1': 'deepseek/deepseek-r1',
  
  // ZhipuAI Models  
  'glm-4.7': 'zhipu/glm-4-plus',
  
  // Anthropic Models
  'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
  'claude-3-opus': 'anthropic/claude-3-opus',
  
  // Meta Models
  'llama-3.1-405b': 'meta-llama/llama-3.1-405b-instruct',
  'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct',
  
  // OpenAI Models (via OpenRouter as fallback)
  'gpt-4o': 'openai/gpt-4o',
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  
  // Mistral Models
  'mistral-large': 'mistralai/mistral-large-2411',
  'mixtral-8x22b': 'mistralai/mixtral-8x22b-instruct',
  
  // Google (only as fallback - prefer direct Vertex AI)
  'gemini-2.5-flash': 'google/gemini-flash-1.5',
  'gemini-2.5-pro': 'google/gemini-pro-1.5',
};

/**
 * OpenRouter Cost Per Million Tokens (approximate, varies by model)
 * These match what OpenRouter charges for input/output
 */
export const OPENROUTER_COSTS: Record<string, { input: number; output: number }> = {
  'deepseek/deepseek-chat': { input: 0.14, output: 0.28 },
  'deepseek/deepseek-r1': { input: 0.55, output: 2.19 },
  'zhipu/glm-4-plus': { input: 0.10, output: 0.10 },
  'anthropic/claude-3.5-sonnet': { input: 3.0, output: 15.0 },
  'anthropic/claude-3-opus': { input: 15.0, output: 75.0 },
  'meta-llama/llama-3.1-405b-instruct': { input: 3.0, output: 3.0 },
  'meta-llama/llama-3.3-70b-instruct': { input: 0.3, output: 0.3 },
  'openai/gpt-4o': { input: 2.5, output: 10.0 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
  'mistralai/mistral-large-2411': { input: 2.0, output: 6.0 },
};

// ============================================
// TYPES
// ============================================

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  // OpenRouter provides cost in response headers
}

export interface OpenRouterChatOptions {
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

export interface OpenRouterResult {
  content: string;
  model: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  rawResponse?: OpenRouterResponse;
}

// ============================================
// OPENROUTER CLIENT CLASS
// ============================================

export class OpenRouterClient {
  private baseURL = 'https://openrouter.ai/api/v1';
  private apiKey: string;
  private siteUrl: string;
  private siteName: string;

  constructor(options?: {
    apiKey?: string;
    siteUrl?: string;
    siteName?: string;
  }) {
    this.apiKey = options?.apiKey || this.getApiKey();
    this.siteUrl = options?.siteUrl || 'https://locale.achievemor.com';
    this.siteName = options?.siteName || 'Locale by ACHIEVEMOR';
  }

  private getApiKey(): string {
    // Try multiple sources for API key
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OPENROUTER_API_KEY) {
      return (import.meta as any).env.VITE_OPENROUTER_API_KEY;
    }
    if (typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY) {
      return process.env.OPENROUTER_API_KEY;
    }
    return '';
  }

  /**
   * Check if a model should be routed through OpenRouter
   */
  static isOpenRouterModel(modelId: string): boolean {
    // Gemini models go direct to Vertex AI
    if (modelId.startsWith('gemini-3') || modelId === 'gemini-pro') {
      return false;
    }
    // Everything else routes through OpenRouter
    return modelId in OPENROUTER_MODEL_MAP || !modelId.startsWith('gemini');
  }

  /**
   * Get the OpenRouter model ID for a given internal model ID
   */
  static getOpenRouterModelId(internalId: string): string {
    return OPENROUTER_MODEL_MAP[internalId] || internalId;
  }

  /**
   * Calculate cost from token counts
   */
  static calculateCost(modelId: string, inputTokens: number, outputTokens: number): number {
    const costs = OPENROUTER_COSTS[modelId] || { input: 0.5, output: 1.0 }; // Default fallback
    const inputCost = (inputTokens / 1_000_000) * costs.input;
    const outputCost = (outputTokens / 1_000_000) * costs.output;
    return inputCost + outputCost;
  }

  /**
   * Send a chat completion request to OpenRouter
   */
  async chat(
    messages: OpenRouterMessage[],
    options: OpenRouterChatOptions
  ): Promise<OpenRouterResult> {
    if (!this.apiKey) {
      console.warn('[OpenRouter] No API key configured. Returning mock response.');
      return this.getMockResponse(messages, options.model);
    }

    const openRouterModel = OpenRouterClient.getOpenRouterModelId(options.model);

    // Prepare messages with system prompt
    const fullMessages: OpenRouterMessage[] = options.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }, ...messages]
      : messages;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl, // Required by OpenRouter
          'X-Title': this.siteName,      // Optional but recommended
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: fullMessages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 4096,
          stream: options.stream ?? false,
        }),
        signal: options.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();

      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;
      const totalTokens = data.usage?.total_tokens || inputTokens + outputTokens;

      const cost = OpenRouterClient.calculateCost(openRouterModel, inputTokens, outputTokens);

      return {
        content: data.choices[0]?.message?.content || '',
        model: openRouterModel,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: totalTokens,
        },
        cost,
        rawResponse: data,
      };

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request aborted');
      }
      console.error('[OpenRouter] Request failed:', error);
      throw error;
    }
  }

  /**
   * Stream a chat completion (returns async iterator)
   */
  async *chatStream(
    messages: OpenRouterMessage[],
    options: OpenRouterChatOptions
  ): AsyncGenerator<{ type: 'content' | 'done'; text: string }> {
    if (!this.apiKey) {
      yield { type: 'content', text: '[OpenRouter] No API key configured.' };
      yield { type: 'done', text: '' };
      return;
    }

    const openRouterModel = OpenRouterClient.getOpenRouterModelId(options.model);

    const fullMessages: OpenRouterMessage[] = options.systemPrompt
      ? [{ role: 'system', content: options.systemPrompt }, ...messages]
      : messages;

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.siteName,
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: fullMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 4096,
        stream: true,
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(`OpenRouter stream error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { type: 'done', text: '' };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield { type: 'content', text: content };
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    yield { type: 'done', text: '' };
  }

  /**
   * Mock response for development without API key
   */
  private getMockResponse(messages: OpenRouterMessage[], model: string): OpenRouterResult {
    const lastMessage = messages[messages.length - 1];
    const inputTokens = Math.ceil(lastMessage.content.length / 4);
    const outputTokens = 150;

    return {
      content: `[OpenRouter Mock - ${model}] This is a simulated response. Configure VITE_OPENROUTER_API_KEY for real API calls.\n\nYour message: "${lastMessage.content.slice(0, 100)}..."`,
      model,
      tokens: {
        input: inputTokens,
        output: outputTokens,
        total: inputTokens + outputTokens,
      },
      cost: OpenRouterClient.calculateCost(model, inputTokens, outputTokens),
    };
  }

  /**
   * List available models from OpenRouter
   */
  async listModels(): Promise<Array<{ id: string; name: string; pricing: any }>> {
    try {
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('[OpenRouter] Failed to list models:', error);
      return [];
    }
  }

  /**
   * Check API key validity
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const models = await this.listModels();
      return models.length > 0;
    } catch {
      return false;
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

/**
 * Global OpenRouter client instance
 * 
 * Usage:
 * ```ts
 * import { openRouter, OpenRouterClient } from './openRouter';
 * 
 * // Check if model should route through OpenRouter
 * if (OpenRouterClient.isOpenRouterModel('deepseek-v3')) {
 *   const result = await openRouter.chat(messages, { model: 'deepseek-v3' });
 * }
 * ```
 */
export const openRouter = new OpenRouterClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a model is a Vertex/Gemini model (direct connection)
 */
export function isVertexModel(modelId: string): boolean {
  return modelId.startsWith('gemini-3') || modelId === 'gemini-pro';
}

/**
 * Determine the best route for a model
 */
export function getModelRoute(modelId: string): 'vertex' | 'openrouter' {
  return isVertexModel(modelId) ? 'vertex' : 'openrouter';
}

/**
 * Unified chat function that routes to the correct provider
 */
export async function routedChat(
  messages: OpenRouterMessage[],
  options: OpenRouterChatOptions & { 
    onVertexFallback?: () => Promise<OpenRouterResult>;
  }
): Promise<OpenRouterResult> {
  const route = getModelRoute(options.model);

  if (route === 'vertex' && options.onVertexFallback) {
    // Delegate to Vertex AI handler
    return options.onVertexFallback();
  }

  // Route through OpenRouter for all "exotic" models
  return openRouter.chat(messages, options);
}
