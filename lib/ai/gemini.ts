/**
 * Vertex AI (Gemini) Integration for ACHEEVY Chatbot
 * Uses the Gemini API for intelligent responses
 */

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{ text: string }>;
        };
    }>;
}

// System prompt for ACHEEVY
const ACHEEVY_SYSTEM_PROMPT = `You are ACHEEVY, the AI assistant for Locale by ACHIEVEMOR - a platform that connects service providers (Partners) with customers (Clients) for both local in-person tasks and remote work.

Your personality:
- Professional yet friendly
- Focused on helping users accomplish their goals
- Knowledgeable about the platform's features

Key platform features you can help with:
- Finding talent (partners) for various services
- Using the Localator calculator to determine fair rates
- Understanding pricing tiers and token system
- Navigating from Garage to Global (the stages of professional growth)
- Profile customization and verification
- Voice preferences and settings

Always be helpful, concise, and guide users to the right features. Your tagline is: "Think It. Prompt It. Let ACHEEVY Manage It."
You are powered by AVVA NOON (InfinityLM), the central intelligence of the platform.

When users ask about pricing, explain that analysis is free and builds are deducted from their token balance.
When users ask about verification, explain that partners go through background checks and skill validation.
`;

/**
 * Send a message to Gemini and get a response
 */
export async function sendToGemini(
    messages: ChatMessage[],
    context?: string
): Promise<string> {
    if (!GEMINI_API_KEY) {
        console.warn('[Gemini] No API key configured, using mock response');
        return getMockResponse(messages);
    }

    try {
        // Build the conversation history
        const conversationHistory = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Add system context as first message if not already there
        const fullContents = [
            {
                role: 'user',
                parts: [{ text: ACHEEVY_SYSTEM_PROMPT + (context ? `\n\nContext: ${context}` : '') }]
            },
            {
                role: 'model',
                parts: [{ text: 'Understood. I am ACHEEVY, ready to assist with Locale by ACHIEVEMOR. How can I help you today?' }]
            },
            ...conversationHistory
        ];

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: fullContents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                ]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('[Gemini] API Error:', error);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error('Invalid response format from Gemini');
    } catch (error) {
        console.error('[Gemini] Error:', error);
        return getMockResponse(messages);
    }
}

/**
 * Fallback mock response when API is unavailable
 */
function getMockResponse(messages: ChatMessage[]): string {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('hey')) {
        return "Welcome to Locale by: ACHIEVEMOR! I'm ACHEEVY, your AI assistant. How can I help you today? Think It. Prompt It. Let Us Manage It.";
    }
    
    if (lastMessage.includes('price') || lastMessage.includes('cost') || lastMessage.includes('token')) {
        return "Our pricing is based on tokens. Analysis and planning are free, while builds and deployments are deducted from your token balance. Check out our Localator Calculator to see your true earning potential!";
    }
    
    if (lastMessage.includes('find') || lastMessage.includes('talent') || lastMessage.includes('partner')) {
        return "I can help you find the right talent! Our verified partners cover everything from tech services to creative work. Would you like me to search for a specific skill or category?";
    }
    
    if (lastMessage.includes('verify') || lastMessage.includes('verification')) {
        return "Verification is key to our trust system. Partners go through background checks, skill validation, and community reviews. This ensures quality for clients and credibility for partners.";
    }
    
    if (lastMessage.includes('garage') || lastMessage.includes('global')) {
        return "The Garage to Global journey represents your path from starting out to becoming a global professional. Stage 1 is Garage (just starting), then Community (verified), Enterprise (scaling), and finally Global (no boundaries).";
    }
    
    return "I understand. Let me help you with that! You can use our platform to find talent, calculate fair rates with Localator, or explore features in the Playground. What would you like to know more about?";
}

/**
 * Stream response from Gemini (for real-time typing effect)
 */
export async function streamFromGemini(
    messages: ChatMessage[],
    onChunk: (text: string) => void,
    context?: string
): Promise<void> {
    // For now, get full response and simulate streaming
    const response = await sendToGemini(messages, context);
    
    // Simulate streaming by sending chunks
    const words = response.split(' ');
    for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + ' ';
        onChunk(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
    }
}

export default {
    sendToGemini,
    streamFromGemini
};
