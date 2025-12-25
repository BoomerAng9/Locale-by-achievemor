/**
 * Vertex AI (Gemini) Integration for Concierge AI
 * Replaces GLM with Google's Gemini API for the platform's intelligent assistant
 */

import { ChatMessage } from '../../types';
import type { ConciergeQuery, ConciergeResponse } from '../firestore/schema';

// System prompt that defines the Concierge's behavior
const CONCIERGE_SYSTEM_PROMPT = `You are the Locale Concierge - the intelligent assistant for the Locale by: ACHIEVEMOR professional marketplace.

CORE RESPONSIBILITIES:
- Help Clients find local talent based on their needs
- Help Experts (NURDs) grow from "Garage to Global" status
- Explain the Localator earnings calculator
- Guide users through verification and platform features
- Provide booking and payment security information

BEHAVIOR RULES:
1. Do NOT mention "Binge" or "BARS" unless specifically asked about internal quality standards
2. Always prioritize verified professionals in recommendations
3. Focus on: Verification benefits, Booking Security, Localator Accuracy
4. Be concise but helpful - keep responses under 150 words unless asked for detail
5. If unsure, direct users to specific platform sections rather than guessing

AVAILABLE ACTIONS YOU CAN SUGGEST:
- search: Search for professionals in a category
- navigate: Guide to a specific page (/localator, /categories, /pricing, /dashboard)
- calculate: Use the Localator to estimate earnings

CONTEXT: You are on a freelance marketplace connecting local and remote talent. Users progress from Garage (new) → Community (verified) → Global (established).`;

/**
 * Call OpenRouter API for chat completion (Primary AI Backend)
 */
async function callOpenRouter(
  messages: ChatMessage[],
  systemInstruction?: string
): Promise<string> {
  const apiKey = (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Locale Concierge'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku:beta',
      messages: [
        ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response right now.';
}

/**
 * Call Vertex AI / Gemini API for chat completion (Fallback)
 */
export async function callGeminiDirect(
  messages: ChatMessage[],
  systemInstruction?: string
): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  // Try multiple model endpoints
  const models = ['gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-flash'];
  
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            })),
            systemInstruction: systemInstruction ? {
              parts: [{ text: systemInstruction }]
            } : undefined,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`[Gemini] Success with model: ${model}`);
          return text;
        }
      } else {
        console.warn(`[Gemini] Model ${model} returned ${response.status}, trying next...`);
      }
    } catch (error) {
      console.warn(`[Gemini] Model ${model} failed, trying next...`);
    }
  }
  
  throw new Error('All Gemini models failed');
}

/**
 * Call Concierge AI with OpenRouter as primary, Gemini as fallback
 */
export async function callConciergeAI(
  query: ConciergeQuery
): Promise<ConciergeResponse> {
  try {
    // Try OpenRouter first
    const openRouterResponse = await callOpenRouter(
      [{ role: 'user', content: query.query, id: Date.now().toString(), timestamp: Date.now() }],
      CONCIERGE_SYSTEM_PROMPT
    );
    
    return {
      response: openRouterResponse,
      suggested_actions: detectSuggestedActions(query.query),
      related_categories: detectCategories(query.query),
    };
  } catch (error) {
    console.warn('[Concierge] OpenRouter failed, trying Gemini fallback');
    
    try {
      const geminiResponse = await callGeminiDirect(
        [{ role: 'user', content: query.query, id: Date.now().toString(), timestamp: Date.now() }],
        CONCIERGE_SYSTEM_PROMPT
      );
      
      return {
        response: geminiResponse,
        suggested_actions: detectSuggestedActions(query.query),
        related_categories: detectCategories(query.query),
      };
    } catch (geminiError) {
      console.warn('[Concierge] Gemini fallback failed, using mock');
      return mockConciergeResponse(query);
    }
  }
}

// Helper to detect suggested actions from query
function detectSuggestedActions(query: string): Array<{type: 'search' | 'navigate' | 'calculate'; label: string; payload: any}> {
  const q = query.toLowerCase();
  const actions: Array<{type: 'search' | 'navigate' | 'calculate'; label: string; payload: any}> = [];
  
  if (q.includes('rate') || q.includes('price') || q.includes('earn')) {
    actions.push({ type: 'navigate', label: 'Open Localator', payload: '/localator' });
  }
  if (q.includes('find') || q.includes('talent') || q.includes('search')) {
    actions.push({ type: 'search', label: 'Find Talent', payload: { query: query } });
  }
  if (q.includes('verify')) {
    actions.push({ type: 'navigate', label: 'Start Verification', payload: '/verification' });
  }
  
  return actions.length > 0 ? actions : [
    { type: 'navigate', label: 'Explore', payload: '/explore' }
  ];
}

// Helper to detect relevant categories
function detectCategories(query: string): string[] {
  const q = query.toLowerCase();
  const categories = [];
  
  if (q.includes('web') || q.includes('code') || q.includes('develop')) categories.push('Technology');
  if (q.includes('design') || q.includes('creative')) categories.push('Design');
  if (q.includes('market') || q.includes('growth')) categories.push('Marketing');
  if (q.includes('verify') || q.includes('trust')) categories.push('Trust');
  
  return categories.length > 0 ? categories : ['General'];
}

/**
 * Direct Gemini API call (for environments with API key)
 * Uses process.env.GEMINI_API_KEY
 */
function getApiKey(): string | null {
  try {
    // Vite environment variable (browser)
    if (typeof (import.meta as any).env !== 'undefined') {
      const viteKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      if (viteKey) return viteKey;
    }
    // Node.js environment
    if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // Browser environment without proper env access
  }
  return null;
}

/**
 * Mock response for development/preview mode
 */
function mockConciergeResponse(query: ConciergeQuery): ConciergeResponse {
  const q = query.query.toLowerCase();
  
  // SCENARIO: Build a Website (Client)
  if (q.includes('build') || q.includes('website') || q.includes('app') || q.includes('project')) {
      // Dispatch Task to Backend Agent
      import('../agents/manager').then(({ dispatchTask }) => {
          dispatchTask(
              'project_scoping',
              {
                  query: query.query,
                  client_context: query.context,
                  timestamp: Date.now()
              },
              'thesys-ang',
              'high'
          );
      });

      return {
          response: "I can absolutely help you build that. I've dispatched a priority request to **Thesys_Ang**, our C1 Implementation Architect. \n\nHe is generating a preliminary Scope of Work and Deliverables package for you right now. check the Circuit Box for live updates.",
          suggested_actions: [
              { type: 'navigate', label: 'Monitor Progress', payload: '/admin/circuit-box' },
              { type: 'search', label: 'View Similar Projects', payload: { query: 'web development' } }
          ],
          related_categories: ['Strategy', 'Implementation', 'C1 System']
      };
  }

  // Earnings/calculator queries
  if (q.includes('earn') || q.includes('rate') || q.includes('price') || q.includes('charge') || q.includes('calculate')) {
    return {
      response: "Great question about pricing! The Localator can calculate your optimal rates based on desired earnings, platform fees, and taxes. It ensures you know exactly what you'll take home.",
      suggested_actions: [
        { type: 'navigate', label: 'Open Localator', payload: '/localator' },
        { type: 'calculate', label: 'Calculate Earnings', payload: {} },
      ],
      related_categories: ['Financials', 'Rates']
    };
  }
  
  // Verification queries
  if (q.includes('verify') || q.includes('verified') || q.includes('badge')) {
    return {
      response: "Verification is key to moving from 'Garage' to 'Community' status! Verified professionals get priority in search results and access to higher-value contracts. Start your verification from the dashboard.",
      suggested_actions: [
        { type: 'navigate', label: 'Go to Dashboard', payload: '/dashboard' },
      ],
      related_categories: ['Trust', 'Identity']
    };
  }
  
  // Partner/affiliate queries
  if (q.includes('partner') || q.includes('affiliate') || q.includes('commission')) {
    return {
      response: "Our Partner Program lets you earn 15% of platform fees for every professional you refer! Get your unique affiliate code from the Partners page.",
      suggested_actions: [
        { type: 'navigate', label: 'Partner Program', payload: '/partners' },
      ],
      related_categories: ['Growth', 'Partners']
    };
  }
  
  // Default response
  return {
    response: "I'm the Locale Concierge! I can help you find local talent, understand our pricing tools, or guide you through the verification process. What would you like to know?",
    suggested_actions: [
      { type: 'navigate', label: 'Explore Categories', payload: '/categories' },
      { type: 'navigate', label: 'Try Localator', payload: '/localator' },
    ],
    related_categories: ['General', 'Support']
  };
}

/**
 * Mock chat response for development
 */
function mockChatResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  
  if (lastMessage.includes('verify')) {
    return "Verification is a key step in moving from the 'Garage' to 'Community' stage. You can start the process by clicking 'Verify Identity' in your dashboard. We use secure document processing to protect your information.";
  }
  
  if (lastMessage.includes('localator') || lastMessage.includes('calculator')) {
    return "The Localator is your freelance earnings calculator. Enter your desired hourly rate, expected hours, and it will calculate your net profit after platform fees and estimated taxes. Would you like me to guide you through it?";
  }
  
  if (lastMessage.includes('partner') || lastMessage.includes('affiliate')) {
    return "As a Partner, you earn 15% of the platform fee from every transaction made by users you refer. Your earnings grow automatically as your referrals book services. Check the Partners page to get your unique affiliate code!";
  }
  
  return "I'm the Locale Concierge, here to help you navigate the platform. Whether you're looking to find talent, optimize your rates, or grow your business from Garage to Global, I'm here to assist. What would you like to know?";
}
