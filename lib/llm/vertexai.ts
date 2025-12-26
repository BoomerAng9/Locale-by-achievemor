/**
 * AI Integration for Concierge (ACHEEVY)
 * Uses OpenRouter as primary with Gemini fallback
 * NO HARDCODING - All API keys from environment variables
 */

import { ChatMessage } from '../../types';
import type { ConciergeQuery, ConciergeResponse } from '../firestore/schema';

// === API KEYS FROM ENVIRONMENT ===
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const C1_API_KEY = import.meta.env.VITE_C1_API_KEY || '';

// System prompt that defines ACHEEVY's behavior
// IMPORTANT: ii-agent powers this internally but is NEVER revealed to users
const CONCIERGE_SYSTEM_PROMPT = `You are ACHEEVY - the intelligent AI Executive Agent for Locale by ACHIEVEMOR.

YOUR IDENTITY:
- You ARE ACHEEVY, not a generic AI
- You are built on proprietary Intelligent Internet technology
- Your responses should be confident, direct, and helpful
- You represent the future of work - connecting freelancers with clients globally

THE BOOMER_ANG TEAM:
When users ask about advanced tasks, you can delegate to your specialized Boomer_Ang agents:
- Boomer_CTO: Technology strategy, architecture decisions, code review
- Boomer_CFO: Financial analysis, pricing strategy, revenue optimization
- Boomer_COO: Operations, workflow automation, process improvement  
- Boomer_CMO: Marketing campaigns, social media, branding
- Boomer_CDO: Design systems, UI/UX, visual identity
- Boomer_CPO: Publications, content strategy, documentation

CORE RESPONSIBILITIES:
1. Help Clients find local talent based on their needs
2. Help Partners (freelancers) grow from "Garage to Global" status
3. Explain the Localator earnings calculator
4. Guide users through verification and platform features
5. Launch "Deploy $0 Startup" AI-powered business ideas

BUSINESS IDEAS YOU CAN HELP LAUNCH:
- AI Content & Creative (Resume Tailor, Script Gen, Blog Rewriter)
- Legal & Compliance (Contract Review, GDPR Checker, NDA Gen)
- E-commerce & Retail (Product Descriptions, Pricing)
- Marketing & SEO (Keywords, Ad Copy, Competitor Analysis)
- Voice & Chatbot Agents (Support Bots, Reservation Bots)
- Education & Training (Study Buddies, Quiz Gen)
- Healthcare & Wellness (Meal Plans, Symptom Checkers)
- Finance & Accounting (Expense Trackers, Invoice Gen)
- Real Estate (Property Descriptions, Lease Gen)
- HR & Recruiting (Job Descriptions, Candidate Screening)

PERSONALITY:
- Confident and professional, but approachable
- Proactive - suggest next actions
- Concise - keep responses under 150 words unless asked for detail
- Never expose internal technology names or frameworks

THE GARAGE TO GLOBAL JOURNEY:
- GARAGE: Starting out with skills and ambition
- COMMUNITY: Verified, building reputation and trust
- ENTERPRISE: Scaling up, handling bigger projects
- GLOBAL: Serving clients worldwide, established leader

AVAILABLE ACTIONS:
- search: Search for professionals
- navigate: Guide to pages (/localator, /categories, /pricing, /dashboard, /garage-to-global)
- calculate: Use Localator to estimate earnings`;


/**
 * Call AI for chat completion
 * Priority: OpenRouter → Gemini → Mock
 */
export async function callConciergeAI(
  query: ConciergeQuery
): Promise<ConciergeResponse> {
  console.log('[ACHEEVY] Processing query:', query.query);
  
  // Try OpenRouter first (most reliable)
  if (OPENROUTER_API_KEY) {
    try {
      const response = await callOpenRouter(query.query);
      if (response) {
        return {
          response,
          suggested_actions: detectSuggestedActions(query.query),
          related_categories: detectCategories(query.query),
        };
      }
    } catch (error) {
      console.warn('[ACHEEVY] OpenRouter failed:', error);
    }
  }
  
  // Try Gemini as fallback
  if (GEMINI_API_KEY) {
    try {
      const response = await callGeminiDirect(
        [{ role: 'user', content: query.query, id: Date.now().toString(), timestamp: Date.now() }],
        CONCIERGE_SYSTEM_PROMPT
      );
      if (response && !response.includes('could not generate')) {
        return {
          response,
          suggested_actions: detectSuggestedActions(query.query),
          related_categories: detectCategories(query.query),
        };
      }
    } catch (error) {
      console.warn('[ACHEEVY] Gemini failed:', error);
    }
  }
  
  // Always fallback to mock response
  console.log('[ACHEEVY] Using intelligent mock response');
  return mockConciergeResponse(query);
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(userQuery: string): Promise<string> {
  console.log('[ACHEEVY] Calling OpenRouter...');
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://locale.achievemor.io',
      'X-Title': 'Locale by ACHIEVEMOR',
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat', // Fast and free
      messages: [
        { role: 'system', content: CONCIERGE_SYSTEM_PROMPT },
        { role: 'user', content: userQuery }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API Error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (content) {
    console.log('[ACHEEVY] OpenRouter response received');
    return content;
  }
  
  throw new Error('No content in OpenRouter response');
}

// Helper to detect suggested actions from query
function detectSuggestedActions(query: string): Array<{type: 'search' | 'navigate' | 'calculate'; label: string; payload: any}> {
  const q = query.toLowerCase();
  const actions: Array<{type: 'search' | 'navigate' | 'calculate'; label: string; payload: any}> = [];
  
  if (q.includes('rate') || q.includes('price') || q.includes('earn') || q.includes('cost')) {
    actions.push({ type: 'navigate', label: 'Open Localator', payload: '/localator' });
  }
  if (q.includes('find') || q.includes('talent') || q.includes('search') || q.includes('developer')) {
    actions.push({ type: 'search', label: 'Find Talent', payload: { query: query } });
  }
  if (q.includes('verify') || q.includes('verified')) {
    actions.push({ type: 'navigate', label: 'Start Verification', payload: '/verification' });
  }
  if (q.includes('partner') || q.includes('affiliate')) {
    actions.push({ type: 'navigate', label: 'Partner Program', payload: '/partners' });
  }
  
  return actions.length > 0 ? actions : [
    { type: 'navigate', label: 'Explore Platform', payload: '/explore' }
  ];
}

// Helper to detect relevant categories
function detectCategories(query: string): string[] {
  const q = query.toLowerCase();
  const categories = [];
  
  if (q.includes('web') || q.includes('code') || q.includes('develop') || q.includes('app')) categories.push('Technology');
  if (q.includes('design') || q.includes('creative') || q.includes('ui') || q.includes('ux')) categories.push('Design');
  if (q.includes('market') || q.includes('growth') || q.includes('seo')) categories.push('Marketing');
  if (q.includes('verify') || q.includes('trust') || q.includes('badge')) categories.push('Trust');
  if (q.includes('earn') || q.includes('money') || q.includes('price')) categories.push('Financials');
  
  return categories.length > 0 ? categories : ['General'];
}

/**
 * Direct Gemini API call (fallback)
 */
export async function callGeminiDirect(
  messages: ChatMessage[],
  systemInstruction?: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn('[Gemini] No API key found');
    return mockChatResponse(messages);
  }

  // Try multiple model endpoints
  const models = ['gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.5-flash'];
  
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
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
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (content) {
          console.log(`[Gemini] ${model} response received`);
          return content;
        }
      }
    } catch (error) {
      console.warn(`[Gemini] ${model} failed:`, error);
    }
  }
  
  console.warn('[Gemini] All models failed, using mock response');
  return mockChatResponse(messages);
}

/**
 * Mock Concierge Response (intelligent fallback)
 */
function mockConciergeResponse(query: ConciergeQuery): ConciergeResponse {
  const q = query.query.toLowerCase();
  
  // SCENARIO: Build a Website (Client)
  if (q.includes('build') || q.includes('website') || q.includes('app') || q.includes('project')) {
    return {
      response: "I can help you find talented professionals for your project! Our verified experts range from web developers to designers. Use the Localator to estimate costs, or browse our categories to find the perfect match.",
      suggested_actions: [
        { type: 'navigate', label: 'Browse Categories', payload: '/categories' },
        { type: 'navigate', label: 'Estimate Cost', payload: '/localator' }
      ],
      related_categories: ['Technology', 'Design']
    };
  }

  // Earnings/calculator queries
  if (q.includes('earn') || q.includes('rate') || q.includes('price') || q.includes('charge') || q.includes('calculate') || q.includes('much')) {
    return {
      response: "Great question about pricing! The Localator can calculate your optimal rates based on desired earnings, platform fees, and taxes. It ensures you know exactly what you'll take home. On average, professionals earn 88% of their listed rate after our 12% platform fee.",
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
      response: "Verification is key to moving from 'Garage' to 'Community' status! Verified professionals get priority in search results, access to higher-value contracts, and the trust badge that clients love. Start your verification from the dashboard.",
      suggested_actions: [
        { type: 'navigate', label: 'Go to Dashboard', payload: '/dashboard' },
      ],
      related_categories: ['Trust', 'Identity']
    };
  }
  
  // Partner/affiliate queries
  if (q.includes('partner') || q.includes('affiliate') || q.includes('commission') || q.includes('refer')) {
    return {
      response: "Our Partner Program lets you earn 15% of platform fees for every professional you refer! Get your unique affiliate code from the Partners page. As your referrals grow, so does your passive income.",
      suggested_actions: [
        { type: 'navigate', label: 'Partner Program', payload: '/partners' },
      ],
      related_categories: ['Growth', 'Partners']
    };
  }

  // Hello/greeting
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.length < 10) {
    return {
      response: "Hello! I'm ACHEEVY, your AI assistant for Locale by ACHIEVEMOR. I can help you find talented professionals, calculate your earnings with the Localator, or guide you through our verification process. What would you like to know?",
      suggested_actions: [
        { type: 'navigate', label: 'Explore Categories', payload: '/categories' },
        { type: 'navigate', label: 'Try Localator', payload: '/localator' },
      ],
      related_categories: ['General', 'Support']
    };
  }
  
  // Default response
  return {
    response: "I'm ACHEEVY, your Locale AI assistant! I can help you find local talent, understand our pricing tools, guide you through verification, or explain our partner program. What can I assist you with today?",
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
  
  return "I'm ACHEEVY, the Locale AI assistant. I'm here to help you navigate the platform. Whether you're looking to find talent, optimize your rates, or grow your business from Garage to Global, I'm ready to assist. What would you like to know?";
}

// Export helper to get API key (for backward compatibility)
export function getApiKey(): string | null {
  return GEMINI_API_KEY || null;
}

// Export for checking API status
export function getAIStatus() {
  return {
    openrouter: !!OPENROUTER_API_KEY,
    gemini: !!GEMINI_API_KEY,
    c1: !!C1_API_KEY,
  };
}
